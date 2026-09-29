/**
 * Shared setup of the owner's check scripts: the real env (backend/.env), a logger that shows
 * warnings and errors only, and small terminal helpers. The scripts print names and results,
 * never secrets.
 */
import { loadEnv } from '../src/config/env.js';
import type { Env } from '../src/config/env.js';
import { createLifecycle } from '../src/lib/lifecycle.js';
import { createLogger } from '../src/lib/logger.js';
import type { Logger } from '../src/lib/logger.js';
import type { AppContext } from '../src/routes/types.js';

export interface ScriptContext {
  env: Env;
  logger: Logger;
  ctx: AppContext;
}

/** Loads backend/.env and builds the same context the server gives its modules. */
export function scriptContext(): ScriptContext {
  const env = loadEnv();
  const logger = createLogger({ ...env, LOG_LEVEL: 'warn' });
  return { env, logger, ctx: { env, logger, lifecycle: createLifecycle(logger) } };
}

/** The value after `--name` (or `--name=value`), or undefined. */
export function flagValue(
  name: string,
  argv: readonly string[] = process.argv.slice(2),
): string | undefined {
  const prefix = `--${name}=`;
  const inline = argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const at = argv.indexOf(`--${name}`);
  return at >= 0 ? argv[at + 1] : undefined;
}

export function hasFlag(name: string, argv: readonly string[] = process.argv.slice(2)): boolean {
  return argv.includes(`--${name}`);
}

export const ok = (text: string): void => console.log(`  OK    ${text}`);
export const fail = (text: string): void => console.log(`  FAIL  ${text}`);
export const info = (text: string): void => console.log(`        ${text}`);

/** Prints why a script failed without leaking upstream text or secrets, and sets the exit code. */
export function reportFailure(error: unknown): void {
  const name = error instanceof Error ? error.name : 'Error';
  const message = error instanceof Error ? error.message : String(error);
  const extra =
    typeof error === 'object' && error !== null
      ? ['code', 'reason', 'status', 'responseCode']
          .map((key) => [key, (error as Record<string, unknown>)[key]] as const)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${String(value)}`)
          .join(' ')
      : '';
  console.log(`  FAIL  ${name}: ${message}${extra ? ` (${extra})` : ''}`);
  process.exitCode = 1;
}
