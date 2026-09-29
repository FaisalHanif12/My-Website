import { realpathSync } from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { loadEnv, unconfiguredFeatures } from './config/env.js';
import type { Env } from './config/env.js';
import { createLifecycle } from './lib/lifecycle.js';
import { createLogger } from './lib/logger.js';
import type { Logger } from './lib/logger.js';
import { buildApiModules, loadApiModules } from './routes/index.js';
import type { ApiModule, AppContext } from './routes/types.js';

/** Node server timeouts (keep-alive is longer than nginx's default upstream keep-alive). */
export const SERVER_TIMEOUTS = {
  requestTimeout: 30_000,
  headersTimeout: 15_000,
  keepAliveTimeout: 65_000,
} as const;

/** After this long a shutdown that has not finished exits with code 1. */
export const SHUTDOWN_TIMEOUT_MS = 10_000;

export interface StartServerOptions {
  /** Config to use instead of loadEnv() (tests). */
  env?: Env;
  /** Modules to build with this server's context instead of loading the feature files. */
  modules?: readonly ApiModule[];
  /** Listen for SIGTERM, SIGINT, unhandledRejection and uncaughtException. Default true. */
  installSignalHandlers?: boolean;
  /** Root logger to use instead of createLogger(env) (tests capture it). */
  logger?: Logger;
}

export interface RunningServer {
  server: http.Server;
  ctx: AppContext;
  /**
   * Stops taking connections, waits for open requests, runs the onShutdown hooks in
   * reverse order and exits with `exitCode` (default 0). Exits 1 when it takes longer
   * than SHUTDOWN_TIMEOUT_MS. Runs once; later calls return the same promise.
   */
  shutdown: (reason: string, exitCode?: number) => Promise<void>;
}

function listen(server: http.Server, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (err: Error) => {
      server.off('listening', onListening);
      reject(err);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}

/** While the server closes, idle keep-alive connections are closed this often. */
export const IDLE_SWEEP_MS = 100;

/** A request that arrives on an open connection during shutdown closes it after the response. */
function closeAfterResponse(_req: http.IncomingMessage, res: http.ServerResponse): void {
  res.setHeader('Connection', 'close');
}

/**
 * Stops taking connections and resolves once every open connection has ended.
 * closeIdleConnections() skips a keep-alive connection whose request is still running, and
 * that connection only becomes idle after its response, so idle connections are swept again
 * every IDLE_SWEEP_MS until the server has closed.
 */
function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => {
    if (!server.listening) {
      resolve();
      return;
    }
    // Runs before the app, so the header is set before any response goes out.
    server.prependListener('request', closeAfterResponse);
    const sweep = setInterval(() => server.closeIdleConnections(), IDLE_SWEEP_MS);
    sweep.unref();
    server.close(() => {
      clearInterval(sweep);
      resolve();
    });
    server.closeIdleConnections();
  });
}

type ShutdownFn = RunningServer['shutdown'];

/** Installs the process listeners once and returns a function that removes them. */
function installProcessHandlers(logger: Logger, shutdown: ShutdownFn): () => void {
  const onSigterm = () => void shutdown('SIGTERM');
  const onSigint = () => void shutdown('SIGINT');
  const onRejection = (reason: unknown) => {
    logger.fatal({ err: reason }, 'Unhandled promise rejection');
    void shutdown('unhandledRejection', 1);
  };
  const onException = (err: Error) => {
    logger.fatal({ err }, 'Uncaught exception');
    void shutdown('uncaughtException', 1);
  };

  // A second SIGTERM or SIGINT during shutdown falls back to Node's default (exit now).
  process.once('SIGTERM', onSigterm);
  process.once('SIGINT', onSigint);
  process.on('unhandledRejection', onRejection);
  process.on('uncaughtException', onException);

  return () => {
    process.off('SIGTERM', onSigterm);
    process.off('SIGINT', onSigint);
    process.off('unhandledRejection', onRejection);
    process.off('uncaughtException', onException);
  };
}

function warnAboutConfig(ctx: AppContext): void {
  const { env, logger } = ctx;
  if (env.DEV_FAKE_EXTERNALS) {
    logger.warn('DEV_FAKE_EXTERNALS is on: chat, mail and Google Calendar use local fakes');
  }
  const missing = unconfiguredFeatures(env);
  if (missing.length > 0) {
    logger.warn(
      { features: missing },
      `Not configured: ${missing.join(', ')}. Their endpoints answer 503 until the env vars in .env.example are set.`,
    );
  }
}

/** Builds the app, listens on HOST:PORT and wires graceful shutdown. */
export async function startServer(options: StartServerOptions = {}): Promise<RunningServer> {
  const env = options.env ?? loadEnv();
  const logger = options.logger ?? createLogger(env);
  const lifecycle = createLifecycle(logger);
  const ctx: AppContext = { env, logger, lifecycle };

  const modules = options.modules
    ? await buildApiModules(ctx, options.modules)
    : await loadApiModules(ctx);
  const app = createApp({ ctx, modules });

  const server = http.createServer(app);
  server.requestTimeout = SERVER_TIMEOUTS.requestTimeout;
  server.headersTimeout = SERVER_TIMEOUTS.headersTimeout;
  server.keepAliveTimeout = SERVER_TIMEOUTS.keepAliveTimeout;

  await listen(server, env.PORT, env.HOST);
  const address = server.address() as AddressInfo;
  logger.info(
    { host: address.address, port: address.port, nodeEnv: env.NODE_ENV },
    'Server listening',
  );
  warnAboutConfig(ctx);
  void lifecycle.runStarted();

  let removeProcessHandlers: () => void = () => undefined;
  let shuttingDown: Promise<void> | undefined;

  const shutdown: ShutdownFn = (reason, exitCode = 0) => {
    shuttingDown ??= (async () => {
      logger.info({ reason }, 'Shutting down');
      let timer: NodeJS.Timeout | undefined;
      const timedOut = new Promise<'timeout'>((resolve) => {
        timer = setTimeout(() => resolve('timeout'), SHUTDOWN_TIMEOUT_MS);
      });
      const work = (async () => {
        await closeServer(server);
        await lifecycle.runShutdown();
        return 'done' as const;
      })();

      const outcome = await Promise.race([work, timedOut]);
      clearTimeout(timer);
      removeProcessHandlers();

      if (outcome === 'timeout') {
        logger.error(
          { reason, timeoutMs: SHUTDOWN_TIMEOUT_MS },
          'Shutdown took too long, forcing exit',
        );
        process.exit(1);
        return;
      }
      logger.info({ reason, exitCode }, 'Shutdown complete');
      process.exit(exitCode);
    })();
    return shuttingDown;
  };

  if (options.installSignalHandlers ?? true) {
    removeProcessHandlers = installProcessHandlers(logger, shutdown);
  }

  return { server, ctx, shutdown };
}

/** True when this file is the program entry (node dist/server.js or tsx src/server.ts). */
function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMainModule()) {
  startServer().catch((err: unknown) => {
    const reason = err instanceof Error ? err.message : String(err);
    process.stderr.write(`The server could not start: ${reason}\n`);
    process.exit(1);
  });
}
