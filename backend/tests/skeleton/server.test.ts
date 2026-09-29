import http from 'node:http';
import net from 'node:net';
import type { AddressInfo } from 'node:net';
import { Router } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiModule } from '../../src/routes/types.js';
import {
  SERVER_TIMEOUTS,
  SHUTDOWN_TIMEOUT_MS,
  startServer,
  type RunningServer,
} from '../../src/server.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { makeTestEnv } from '../helpers/testEnv.js';

type ProcessEvent = 'SIGTERM' | 'SIGINT' | 'unhandledRejection' | 'uncaughtException';
const EVENTS: ProcessEvent[] = ['SIGTERM', 'SIGINT', 'unhandledRejection', 'uncaughtException'];

let exitSpy: ReturnType<typeof vi.spyOn>;
const running: RunningServer[] = [];

beforeEach(() => {
  exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
});

afterEach(async () => {
  vi.useRealTimers();
  for (const item of running.splice(0)) {
    if (item.server.listening) {
      await new Promise<void>((resolve) => item.server.close(() => resolve()));
    }
  }
});

async function start(
  options: { modules?: ApiModule[]; installSignalHandlers?: boolean; devFake?: boolean } = {},
) {
  const capture = createCapturingLogger('debug');
  const result = await startServer({
    env: makeTestEnv({ PORT: 0, DEV_FAKE_EXTERNALS: options.devFake ?? false }),
    modules: options.modules ?? [],
    installSignalHandlers: options.installSignalHandlers ?? false,
    logger: capture.logger,
  });
  running.push(result);
  const port = (result.server.address() as AddressInfo).port;
  return { ...result, capture, port, baseUrl: `http://127.0.0.1:${port}` };
}

/** Resolves with the error code of a request that could not connect. */
function connectError(port: number): Promise<string> {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/api/health' }, (res) => {
      res.resume();
      resolve(`status ${res.statusCode ?? 0}`);
    });
    req.on('error', (err: NodeJS.ErrnoException) => resolve(err.code ?? 'error'));
  });
}

interface RawResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}

/** GET through the given agent (so keep-alive agents reuse their connection). */
function getWithAgent(port: number, path: string, agent: http.Agent): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port, path, agent }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        body += chunk;
      });
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolves 'done' when the promise settles within `ms`, else 'late' (real timers). */
async function within(promise: Promise<unknown>, ms: number): Promise<'done' | 'late'> {
  let timer: NodeJS.Timeout | undefined;
  const late = new Promise<'late'>((resolve) => {
    timer = setTimeout(() => resolve('late'), ms);
  });
  try {
    return await Promise.race([promise.then(() => 'done' as const), late]);
  } finally {
    clearTimeout(timer);
  }
}

/** A module whose GET /slow answers after SLOW_MS and calls onArrive when a request comes in. */
const SLOW_MS = 400;
function slowModule(onArrive: () => void): ApiModule {
  return {
    name: 'slow',
    createRouter() {
      const router = Router();
      router.get('/slow', async (_req, res) => {
        onArrive();
        await sleep(SLOW_MS);
        res.json({ ok: true, slow: true });
      });
      return router;
    },
  };
}

function listenersOf(event: ProcessEvent): ((...args: unknown[]) => void)[] {
  return process.listeners(event as NodeJS.Signals) as unknown as ((...args: unknown[]) => void)[];
}

describe('startServer', () => {
  it('listens on HOST:PORT with the server timeouts and serves the app', async () => {
    const { server, baseUrl } = await start();
    expect(server.listening).toBe(true);
    expect((server.address() as AddressInfo).address).toBe('127.0.0.1');
    expect(server.requestTimeout).toBe(SERVER_TIMEOUTS.requestTimeout);
    expect(server.headersTimeout).toBe(SERVER_TIMEOUTS.headersTimeout);
    expect(server.keepAliveTimeout).toBe(SERVER_TIMEOUTS.keepAliveTimeout);
    expect(SERVER_TIMEOUTS).toEqual({
      requestTimeout: 30000,
      headersTimeout: 15000,
      keepAliveTimeout: 65000,
    });
    const res = await request(baseUrl).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, status: 'up' });
  });

  it('logs one warning that lists the unconfigured features', async () => {
    const { capture } = await start();
    const warnings = capture.lines().filter((line) => line.level === 40);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({ features: ['google', 'zoom'] });
    expect(String(warnings[0]?.msg)).toContain('Not configured: google, zoom');
  });

  it('says so when the dev fakes are on', async () => {
    const { capture } = await start({ devFake: true });
    const messages = capture.lines().map((line) => String(line.msg));
    expect(messages.some((msg) => msg.includes('DEV_FAKE_EXTERNALS is on'))).toBe(true);
    expect(capture.lines().find((line) => line.features)).toMatchObject({ features: ['zoom'] });
  });

  it('builds the given modules with its context and runs started hooks after listening', async () => {
    const probe: ApiModule = {
      name: 'probe',
      createRouter(ctx) {
        ctx.lifecycle.onStarted('probe-started', () => {
          ctx.logger.info('probe started hook ran');
        });
        const router = Router();
        router.get('/probe', (_req, res) => {
          res.json({ ok: true, env: ctx.env.NODE_ENV });
        });
        return router;
      },
    };
    const { capture, baseUrl } = await start({ modules: [probe] });
    await vi.waitFor(() => {
      expect(capture.text()).toContain('probe started hook ran');
    });
    const messages = capture.lines().map((line) => line.msg);
    expect(messages.indexOf('Server listening')).toBeLessThan(
      messages.indexOf('probe started hook ran'),
    );
    const res = await request(baseUrl).get('/api/probe');
    expect(res.body).toEqual({ ok: true, env: 'test' });
  });

  it('rejects when the port is taken', async () => {
    const first = await start();
    const capture = createCapturingLogger();
    await expect(
      startServer({
        env: makeTestEnv({ PORT: first.port }),
        modules: [],
        installSignalHandlers: false,
        logger: capture.logger,
      }),
    ).rejects.toMatchObject({ code: 'EADDRINUSE' });
  });
});

describe('shutdown', () => {
  it('stops accepting connections, runs hooks in reverse order and exits 0', async () => {
    const { ctx, shutdown, server, port, capture } = await start();
    const order: string[] = [];
    ctx.lifecycle.onShutdown('store', () => {
      order.push('store');
    });
    ctx.lifecycle.onShutdown('mail', async () => {
      expect(server.listening).toBe(false);
      await Promise.resolve();
      order.push('mail');
    });

    await shutdown('test');

    expect(server.listening).toBe(false);
    expect(await connectError(port)).toBe('ECONNREFUSED');
    expect(order).toEqual(['mail', 'store']);
    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(capture.lines().map((line) => line.msg)).toContain('Shutdown complete');
  });

  it('runs once even when called twice', async () => {
    const { ctx, shutdown } = await start();
    let calls = 0;
    ctx.lifecycle.onShutdown('count', () => {
      calls += 1;
    });
    const first = shutdown('one');
    const second = shutdown('two');
    expect(second).toBe(first);
    await first;
    expect(calls).toBe(1);
    expect(exitSpy).toHaveBeenCalledTimes(1);
  });

  it('exits with the given code', async () => {
    const { shutdown } = await start();
    await shutdown('crash', 1);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('closes a keep-alive connection once its running request is answered and exits 0 quickly', async () => {
    let arrived = false;
    const { ctx, shutdown, server, port } = await start({
      modules: [
        slowModule(() => {
          arrived = true;
        }),
      ],
    });
    const hook = vi.fn();
    ctx.lifecycle.onShutdown('hook', hook);
    const agent = new http.Agent({ keepAlive: true });
    try {
      const response = getWithAgent(port, '/api/slow', agent);
      await vi.waitFor(() => {
        expect(arrived).toBe(true);
      });

      const startedAt = Date.now();
      const done = shutdown('test');
      const res = await response;
      expect(await within(done, 3_000)).toBe('done');
      const elapsed = Date.now() - startedAt;

      expect(res.status).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ ok: true, slow: true });
      expect(server.listening).toBe(false);
      expect(hook).toHaveBeenCalledTimes(1);
      expect(exitSpy).toHaveBeenCalledTimes(1);
      expect(exitSpy).toHaveBeenCalledWith(0);
      expect(elapsed).toBeLessThan(3_000);
      expect(elapsed).toBeLessThan(SHUTDOWN_TIMEOUT_MS);
    } finally {
      agent.destroy();
    }
  });

  it('answers a request that arrives on an open connection during shutdown with Connection: close', async () => {
    const { shutdown, port } = await start();
    const socket = net.connect(port, '127.0.0.1');
    let raw = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk: string) => {
      raw += chunk;
    });
    const closed = new Promise<void>((resolve) => socket.once('close', () => resolve()));
    try {
      await new Promise<void>((resolve) => socket.once('connect', () => resolve()));
      // Send the request line and a header but hold back the blank line, so the connection
      // is busy (not idle) when shutdown starts and survives the idle sweeps.
      await new Promise<void>((resolve) => {
        socket.write('GET /api/health HTTP/1.1\r\nHost: localhost\r\n', () => resolve());
      });
      await sleep(100);

      const done = shutdown('test');
      await sleep(300);
      expect(socket.destroyed).toBe(false);
      socket.write('\r\n');

      expect(await within(closed, 3_000)).toBe('done');
      expect(await within(done, 3_000)).toBe('done');
      expect(raw).toMatch(/^HTTP\/1\.1 200 /);
      expect(raw.toLowerCase()).toContain('\r\nconnection: close\r\n');
      expect(raw).toContain('{"ok":true,"status":"up"}');
      expect(exitSpy).toHaveBeenCalledTimes(1);
      expect(exitSpy).toHaveBeenCalledWith(0);
    } finally {
      socket.destroy();
    }
  });

  it('forces exit 1 after 10 s when a hook hangs', async () => {
    const { ctx, shutdown, capture } = await start();
    ctx.lifecycle.onShutdown('hung', () => new Promise<void>(() => undefined));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    const done = shutdown('SIGTERM');
    await vi.advanceTimersByTimeAsync(SHUTDOWN_TIMEOUT_MS - 1);
    expect(exitSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await done;
    expect(SHUTDOWN_TIMEOUT_MS).toBe(10_000);
    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(capture.lines().map((line) => line.msg)).toContain(
      'Shutdown took too long, forcing exit',
    );
  });
});

describe('process handlers', () => {
  function counts(): Record<ProcessEvent, number> {
    return Object.fromEntries(EVENTS.map((event) => [event, listenersOf(event).length])) as Record<
      ProcessEvent,
      number
    >;
  }

  function added(before: Record<ProcessEvent, number>, event: ProcessEvent) {
    const listener = listenersOf(event).slice(before[event]).at(-1);
    if (!listener) throw new Error(`no ${event} listener was added`);
    return listener;
  }

  it('installs nothing when installSignalHandlers is false', async () => {
    const before = counts();
    await start({ installSignalHandlers: false });
    expect(counts()).toEqual(before);
  });

  it('shuts down on SIGTERM with exit 0 and removes its listeners', async () => {
    const before = counts();
    const { ctx } = await start({ installSignalHandlers: true });
    for (const event of EVENTS) expect(listenersOf(event).length).toBe(before[event] + 1);
    const hook = vi.fn();
    ctx.lifecycle.onShutdown('hook', hook);

    added(before, 'SIGTERM')();
    await vi.waitFor(() => {
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
    expect(hook).toHaveBeenCalledTimes(1);
    expect(counts()).toEqual(before);
  });

  it('shuts down on SIGINT with exit 0', async () => {
    const before = counts();
    await start({ installSignalHandlers: true });
    added(before, 'SIGINT')();
    await vi.waitFor(() => {
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
    expect(counts()).toEqual(before);
  });

  it('logs an unhandled rejection at fatal and exits 1, once', async () => {
    const before = counts();
    const { capture } = await start({ installSignalHandlers: true });
    const onRejection = added(before, 'unhandledRejection');
    onRejection(new Error('lost promise'));
    onRejection(new Error('second one'));
    await vi.waitFor(() => {
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
    expect(exitSpy).toHaveBeenCalledTimes(1);
    const fatal = capture.lines().filter((line) => line.level === 60);
    expect(fatal.length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(fatal[0])).toContain('lost promise');
  });

  it('logs an uncaught exception at fatal and exits 1', async () => {
    const before = counts();
    const { capture } = await start({ installSignalHandlers: true });
    added(before, 'uncaughtException')(new Error('thrown somewhere'));
    await vi.waitFor(() => {
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
    expect(capture.text()).toContain('thrown somewhere');
    expect(counts()).toEqual(before);
  });
});
