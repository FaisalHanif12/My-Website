import type { Logger } from './logger.js';

export type LifecycleHook = () => void | Promise<void>;

export interface Lifecycle {
  /** Runs after the server listens (SMTP verify, config warnings). Failures only log. */
  onStarted: (name: string, fn: LifecycleHook) => void;
  /** Runs on shutdown after the server stops taking connections, in reverse order. */
  onShutdown: (name: string, fn: LifecycleHook) => void;
  /** Runs every started hook at the same time. Never throws. */
  runStarted: () => Promise<void>;
  /** Runs shutdown hooks one by one in reverse order, each guarded. Runs once. */
  runShutdown: () => Promise<void>;
}

interface NamedHook {
  readonly name: string;
  readonly fn: LifecycleHook;
}

async function runGuarded(
  hook: NamedHook,
  logger: Logger,
  phase: 'started' | 'shutdown',
): Promise<void> {
  try {
    await hook.fn();
  } catch (err) {
    logger.warn({ err, hook: hook.name, phase }, `Lifecycle hook "${hook.name}" failed`);
  }
}

export function createLifecycle(logger: Logger): Lifecycle {
  const started: NamedHook[] = [];
  const shutdown: NamedHook[] = [];
  let shutdownRun: Promise<void> | undefined;

  return {
    onStarted(name, fn) {
      started.push({ name, fn });
    },

    onShutdown(name, fn) {
      shutdown.push({ name, fn });
    },

    async runStarted() {
      await Promise.all(started.map((hook) => runGuarded(hook, logger, 'started')));
    },

    runShutdown() {
      shutdownRun ??= (async () => {
        for (const hook of [...shutdown].reverse()) {
          await runGuarded(hook, logger, 'shutdown');
        }
      })();
      return shutdownRun;
    },
  };
}
