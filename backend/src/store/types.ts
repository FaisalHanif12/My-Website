/**
 * Storage contracts for every piece of short lived server state: rate limit counters, the
 * chat daily cap, idempotency records, contact dedupe, the freebusy cache and the recently
 * booked set. Callers only see these interfaces, so a Redis store can replace the in-memory
 * one later without changing them.
 *
 * Values must be JSON serialisable (plain objects, arrays, strings, finite numbers,
 * booleans and null). The in-memory store copies values with structuredClone, which would
 * also keep a Date or a Map, but a Redis store would not: keep to JSON so both behave the
 * same. Timestamps go in as epoch milliseconds.
 */

/** The state of one counter after an increment. */
export interface CounterState {
  /** Hits in the current window, including this one. */
  count: number;
  /** When the window ends and the count starts again from zero (epoch milliseconds). */
  resetAt: number;
}

/**
 * Fixed window counters. A window starts on the first hit of a key and lasts `windowMs`;
 * later hits in the same window never move its end.
 */
export interface CounterStore {
  /** Adds one hit to `key`, starting a new window of `windowMs` when none is running. */
  increment(key: string, windowMs: number): Promise<CounterState>;
  /** Takes one hit away from `key` in its current window (never below zero). */
  decrement(key: string): Promise<void>;
  /** Forgets the counter for `key`; the next hit starts a new window. */
  reset(key: string): Promise<void>;
}

/**
 * Values with a time to live. `T` is not checked at run time: the caller that writes a key
 * decides its shape and the callers that read it must agree.
 */
export interface KeyValueStore {
  /** The value for `key`, or undefined when it is missing or expired. */
  get<T>(key: string): Promise<T | undefined>;
  /** Stores `value` under `key` for `ttlMs`, replacing any value already there. */
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  /** Stores `value` only when `key` holds no live value. Resolves true when it stored it. */
  setIfAbsent<T>(key: string, value: T, ttlMs: number): Promise<boolean>;
  /** Removes the value for `key` (a no-op when there is none). */
  delete(key: string): Promise<void>;
}

/** The store the app shares between features. Counters and values use separate key spaces. */
export interface Store extends CounterStore, KeyValueStore {
  /** Stops background work and releases resources. Called once on shutdown. */
  close(): Promise<void>;
}
