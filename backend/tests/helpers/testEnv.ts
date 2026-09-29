import { parseEnv } from '../../src/config/env.js';
import type { Env } from '../../src/config/env.js';

/**
 * Dummy values only: chat and mail count as configured, Google and Zoom stay unset.
 * Nothing here reaches a real service (tests fake or mock every adapter).
 */
export const TEST_ENV_SOURCE: Readonly<Record<string, string>> = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  CORS_ORIGINS: 'http://localhost:3000',
  OPENROUTER_API_KEY: 'test-openrouter-key',
  OPENROUTER_MODEL: 'test/model',
  SMTP_HOST: 'smtp.example.test',
  SMTP_USER: 'sender@example.com',
  SMTP_PASS: 'test-smtp-pass',
  MAIL_TO_OWNER: 'owner@example.com',
};

/** A validated test Env; `overrides` replace parsed values (for example { PORT: 0 }). */
export function makeTestEnv(overrides: Partial<Env> = {}): Env {
  return { ...parseEnv(TEST_ENV_SOURCE), ...overrides };
}
