import { createHash } from 'node:crypto';
import type { KeyValueStore } from '../store/types.js';
import { Errors } from './errors.js';
import type { AppError } from './errors.js';

/** Shape of the Idempotency-Key header (API_CONTRACT.md), for example a uuid. */
export const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9_-]{8,128}$/;

/** Field message when a key comes back with a different request body. */
export const IDEMPOTENCY_MISMATCH_MESSAGE = 'This key was already used for a different request.';

export function isValidIdempotencyKey(value: unknown): value is string {
  return typeof value === 'string' && IDEMPOTENCY_KEY_RE.test(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * JSON with the keys of every plain object sorted, so two objects with the same content
 * always give the same text. Otherwise it follows JSON.stringify (toJSON first, undefined
 * properties dropped). Undefined on its own gives "".
 */
export function stableJson(value: unknown): string {
  const text = JSON.stringify(value, (_key, current: unknown) => {
    if (!isPlainObject(current)) return current;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(current).sort()) sorted[key] = current[key];
    return sorted;
  }) as string | undefined;
  return text ?? '';
}

/** sha256 (hex) of stableJson(value): what an idempotency key is bound to. */
export function fingerprintOf(value: unknown): string {
  return createHash('sha256').update(stableJson(value)).digest('hex');
}

/** What the store keeps for one key. JSON only, like every store value. */
export interface IdempotencyRecord<T> {
  fingerprint: string;
  value: T;
  /** When the first success was stored (epoch milliseconds). */
  storedAt: number;
}

export interface IdempotencyResult<T> {
  /** True when `value` came from an earlier (or a concurrent) run with the same key. */
  replayed: boolean;
  value: T;
}

export interface IdempotencyOptions {
  store: KeyValueStore;
  /** Feature name; records live under `idem:${prefix}:${key}`. */
  prefix: string;
  /** How long a stored success is replayed. */
  ttlMs: number;
  /** Clock for `storedAt`. Default () => new Date(). */
  now?: () => Date;
  /**
   * Called when saving a success fails. The run still resolves with its value: the work
   * already happened, and an error would make the client retry it.
   */
  onStoreError?: (err: unknown) => void;
}

export interface Idempotency<T> {
  /**
   * Runs `work` once per key. The same key and fingerprint replays the stored value; the
   * same key with another fingerprint throws VALIDATION_ERROR on `idempotencyKey`. Calls
   * that arrive while the first is still running share its promise (in this process).
   * Only successes are stored, so a failed run can be retried with the same key.
   */
  run(key: string, fingerprint: string, work: () => Promise<T>): Promise<IdempotencyResult<T>>;
  /** The stored record for `key`, if any. */
  peek(key: string): Promise<IdempotencyRecord<T> | undefined>;
}

function mismatchError(): AppError {
  return Errors.validation({ idempotencyKey: IDEMPOTENCY_MISMATCH_MESSAGE });
}

interface InFlight<T> {
  fingerprint: string;
  promise: Promise<IdempotencyResult<T>>;
}

/** Store key of one idempotency record. */
export function idempotencyStoreKey(prefix: string, key: string): string {
  return `idem:${prefix}:${key}`;
}

export function createIdempotency<T>(options: IdempotencyOptions): Idempotency<T> {
  const { store, prefix, ttlMs, onStoreError } = options;
  const now = options.now ?? (() => new Date());
  const inFlight = new Map<string, InFlight<T>>();

  async function execute(
    storeKey: string,
    fingerprint: string,
    work: () => Promise<T>,
  ): Promise<IdempotencyResult<T>> {
    const stored = await store.get<IdempotencyRecord<T>>(storeKey);
    if (stored) {
      if (stored.fingerprint !== fingerprint) throw mismatchError();
      return { replayed: true, value: stored.value };
    }
    const value = await work();
    const record: IdempotencyRecord<T> = { fingerprint, value, storedAt: now().getTime() };
    try {
      await store.set(storeKey, record, ttlMs);
    } catch (err) {
      onStoreError?.(err);
    }
    return { replayed: false, value };
  }

  return {
    run(key, fingerprint, work) {
      const storeKey = idempotencyStoreKey(prefix, key);
      const running = inFlight.get(storeKey);
      if (running) {
        if (running.fingerprint !== fingerprint) return Promise.reject(mismatchError());
        return running.promise.then(({ value }) => ({ replayed: true, value }));
      }

      // Registered before the first await, so a second call right after this one joins it.
      const entry: InFlight<T> = { fingerprint, promise: execute(storeKey, fingerprint, work) };
      inFlight.set(storeKey, entry);
      const forget = (): void => {
        if (inFlight.get(storeKey) === entry) inFlight.delete(storeKey);
      };
      void entry.promise.then(forget, forget);
      return entry.promise;
    },

    peek(key) {
      return store.get<IdempotencyRecord<T>>(idempotencyStoreKey(prefix, key));
    },
  };
}
