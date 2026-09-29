import type { Request, Response } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import type {
  IncrementResponse,
  Options,
  RateLimitRequestHandler,
  Logger as RateLimitLogger,
  Store as RateLimitStore,
} from 'express-rate-limit';
import { Errors, errorBody } from '../lib/errors.js';
import type { Logger } from '../lib/logger.js';
import type { CounterStore } from '../store/types.js';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Per IP limits (BACKEND_SPEC.md, API_CONTRACT.md). Each window starts on the first hit. */
export const RATE_LIMITS = {
  chatPerMinute: { limit: 8, windowMs: MINUTE_MS },
  chatPerDay: { limit: 60, windowMs: DAY_MS },
  contact: { limit: 5, windowMs: HOUR_MS },
  booking: { limit: 3, windowMs: HOUR_MS },
  bookingInfo: { limit: 60, windowMs: MINUTE_MS },
} as const;

export type RateLimitName = keyof typeof RATE_LIMITS;

/** Message of the warn line written when a limiter answers 429. */
export const RATE_LIMITED_EVENT = 'rate_limited';

/** Key used when Express has no address for the request (the socket already closed). */
const UNKNOWN_CLIENT = 'unknown-client';

/** Store key prefix of one limiter's counters. */
export function rateLimitPrefix(name: string): string {
  return `rl:${name}:`;
}

/**
 * The default client key: the IP Express resolved through `trust proxy`, with IPv6
 * addresses grouped by their /56 subnet (one household or server gets one budget).
 */
export function clientIpKey(req: Request): string {
  return ipKeyGenerator(req.ip ?? UNKNOWN_CLIENT);
}

/**
 * Lets express-rate-limit count in our CounterStore, so the counters live wherever the
 * app's Store lives (memory today, Redis later).
 */
export class CounterStoreAdapter implements RateLimitStore {
  readonly prefix: string;
  /** Keys sit in a store other processes may share, so they are not local to this limiter. */
  readonly localKeys = false;
  readonly #store: CounterStore;
  #windowMs: number;

  constructor(store: CounterStore, prefix: string, windowMs: number) {
    this.#store = store;
    this.prefix = prefix;
    this.#windowMs = windowMs;
  }

  /** express-rate-limit calls this once with its resolved options. */
  init(options: Options): void {
    this.#windowMs = options.windowMs;
  }

  async increment(key: string): Promise<IncrementResponse> {
    const { count, resetAt } = await this.#store.increment(this.prefix + key, this.#windowMs);
    return { totalHits: count, resetTime: new Date(resetAt) };
  }

  decrement(key: string): Promise<void> {
    return this.#store.decrement(this.prefix + key);
  }

  resetKey(key: string): Promise<void> {
    return this.#store.reset(this.prefix + key);
  }
}

export interface RateLimiterOptions {
  /** Short name: the store prefix `rl:${name}:`, the RateLimit header policy and the log. */
  name: string;
  windowMs: number;
  /** Requests allowed per window; the next one gets 429. */
  limit: number;
  store: CounterStore;
  /** Client key. Default clientIpKey. Use ipKeyGenerator(req.ip) for any IP fallback. */
  keyGenerator?: (req: Request) => string | Promise<string>;
  /** Where express-rate-limit reports misconfiguration. Default: a Node process warning. */
  logger?: Logger;
}

function errorCodeOf(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string') {
    return err.code;
  }
  return err instanceof Error ? err.name : 'unknown';
}

/**
 * express-rate-limit logs misconfigurations (and store errors) with messages that can hold
 * the client key, which is an IP address. Only the error code and the limiter name leave
 * here, never the message.
 */
function libraryLogger(name: string, logger: Logger | undefined): RateLimitLogger {
  const report = (level: 'error' | 'warn') => (err: unknown) => {
    const code = errorCodeOf(err);
    if (logger) {
      logger[level]({ limiter: name, code }, 'rate_limiter_problem');
    } else {
      process.emitWarning(`express-rate-limit reported ${code} for limiter "${name}"`);
    }
  };
  return { error: report('error'), warn: report('warn') };
}

/** Seconds until the window of the limiter that just refused `req` ends. */
function secondsUntilReset(req: Request, windowMs: number): number {
  const info = (req as Request & { rateLimit?: { resetTime?: Date } }).rateLimit;
  const resetTime = info?.resetTime;
  return resetTime ? (resetTime.getTime() - Date.now()) / 1000 : windowMs / 1000;
}

/**
 * One express-rate-limit 8 middleware counting in `store` under `rl:${name}:`. Sends the
 * IETF draft 8 RateLimit headers (no X-RateLimit-*). Over the limit it answers 429 with the
 * RATE_LIMITED envelope and Retry-After in whole seconds (at least 1), and logs a warn line
 * with the limiter name only (never the IP).
 */
export function createRateLimiter(options: RateLimiterOptions): RateLimitRequestHandler {
  const { name, windowMs, limit, store } = options;
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    identifier: name,
    keyGenerator: options.keyGenerator ?? clientIpKey,
    store: new CounterStoreAdapter(store, rateLimitPrefix(name), windowMs),
    logger: libraryLogger(name, options.logger),
    handler: (req: Request, res: Response) => {
      const error = Errors.rateLimited(secondsUntilReset(req, windowMs));
      req.log.warn({ limiter: name }, RATE_LIMITED_EVENT);
      res.setHeader('Retry-After', String(error.retryAfterSeconds ?? 1));
      res.status(error.status).json(errorBody(error));
    },
  });
}

export type RateLimiters = Readonly<Record<RateLimitName, RateLimitRequestHandler>>;

/**
 * Every limiter from RATE_LIMITS, counting in `store`. Calling this again with the same store
 * gives new middleware over the same counters.
 *
 * Features attach these per route, for example
 * `router.post('/chat', limiters.chatPerMinute, limiters.chatPerDay, handler)`. Never mount
 * one with a path-less router.use(): every module router is mounted at /api, so it also
 * sees the requests meant for modules mounted after it, and a path-less limiter would count
 * other endpoints too (sharedDecisions 4).
 */
export function rateLimiters(store: CounterStore, options: { logger?: Logger } = {}): RateLimiters {
  const build = (name: RateLimitName): RateLimitRequestHandler =>
    createRateLimiter({ name, ...RATE_LIMITS[name], store, logger: options.logger });
  return {
    chatPerMinute: build('chatPerMinute'),
    chatPerDay: build('chatPerDay'),
    contact: build('contact'),
    booking: build('booking'),
    bookingInfo: build('bookingInfo'),
  };
}
