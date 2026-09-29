import type { Router } from 'express';
import type { Env } from '../config/env.js';
import type { Lifecycle } from '../lib/lifecycle.js';
import type { Logger } from '../lib/logger.js';

/** What every feature module gets: config, the root logger and the lifecycle hooks. */
export interface AppContext {
  env: Env;
  logger: Logger;
  lifecycle: Lifecycle;
}

/**
 * A feature (chat, contact, booking-info, booking). Each <feature>.routes.ts default-exports
 * one, built by an exported create<Feature>Module(overrides?) factory so tests can inject
 * fakes. The router is mounted at /api; attach middleware per route, never router.use()
 * without a path.
 */
export interface ApiModule {
  name: string;
  createRouter(ctx: AppContext): Router | Promise<Router>;
}

/** A module whose router is built and ready to mount. */
export interface LoadedApiModule {
  name: string;
  router: Router;
}

export function isApiModule(value: unknown): value is ApiModule {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Record<keyof ApiModule, unknown>>;
  return (
    typeof candidate.name === 'string' &&
    candidate.name.length > 0 &&
    typeof candidate.createRouter === 'function'
  );
}
