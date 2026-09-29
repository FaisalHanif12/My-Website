import type { Express } from 'express';
import { createApp } from '../../src/app.js';
import type { Env } from '../../src/config/env.js';
import { createLifecycle } from '../../src/lib/lifecycle.js';
import { createLogger } from '../../src/lib/logger.js';
import type { Logger } from '../../src/lib/logger.js';
import { buildApiModules } from '../../src/routes/index.js';
import type { ApiModule, AppContext } from '../../src/routes/types.js';
import { makeTestEnv } from './testEnv.js';

export interface BuildTestAppOptions {
  /** Feature modules to mount (build them with their create<Feature>Module factories). */
  modules?: readonly ApiModule[];
  env?: Env;
  logger?: Logger;
}

export interface TestApp {
  app: Express;
  ctx: AppContext;
}

/** The real app pipeline with test env, a silent (or given) logger and only `modules`. */
export async function buildTestApp(options: BuildTestAppOptions = {}): Promise<TestApp> {
  const env = options.env ?? makeTestEnv();
  const logger = options.logger ?? createLogger(env);
  const ctx: AppContext = { env, logger, lifecycle: createLifecycle(logger) };
  const modules = await buildApiModules(ctx, options.modules ?? []);
  return { app: createApp({ ctx, modules }), ctx };
}
