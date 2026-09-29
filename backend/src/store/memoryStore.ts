import type { CounterState, Store } from './types.js';

export interface MemoryStoreOptions {
  /** Clock in epoch milliseconds (tests inject one). Default Date.now. */
  now?: () => number;
  /** Most counters plus values held at once. Default 50000. */
  maxEntries?: number;
  /** How often expired entries are swept, in milliseconds; 0 turns the timer off. Default 60000. */
  sweepIntervalMs?: number;
}

export const MEMORY_STORE_DEFAULTS = {
  maxEntries: 50_000,
  sweepIntervalMs: 60_000,
} as const;

/**
 * Share of maxEntries evicted in one go when the store is full, so a flood of new keys
 * sorts the entries once per batch instead of once per insert.
 */
const EVICT_FRACTION = 0.1;

interface CounterEntry {
  count: number;
  resetAt: number;
}

interface ValueEntry {
  value: unknown;
  expiresAt: number;
}

/** Runs `fn` and hands back its result as a promise; a throw becomes a rejection. */
function settle<T>(fn: () => T): Promise<T> {
  return new Promise<T>((resolve) => {
    resolve(fn());
  });
}

function assertDuration(name: string, ms: number): void {
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new RangeError(`${name} must be a positive number of milliseconds`);
  }
}

/**
 * The in-process Store: fine for one Node process (the VPS runs one). Expired entries are
 * dropped when read and by an unref'd sweep timer. Past `maxEntries` the entries closest to
 * expiry are evicted first. Values are stored and handed out as structuredClone copies, so
 * a caller can never change what another caller reads. Counters and values have separate
 * key spaces. After close() the store is empty and keeps working without the timer.
 */
export class MemoryStore implements Store {
  readonly #now: () => number;
  readonly #maxEntries: number;
  readonly #counters = new Map<string, CounterEntry>();
  readonly #values = new Map<string, ValueEntry>();
  #timer: NodeJS.Timeout | undefined;

  constructor(options: MemoryStoreOptions = {}) {
    // Looked up on every call, so a clock swapped in later (fake timers) is seen.
    this.#now = options.now ?? (() => Date.now());
    this.#maxEntries = options.maxEntries ?? MEMORY_STORE_DEFAULTS.maxEntries;
    if (!Number.isInteger(this.#maxEntries) || this.#maxEntries < 1) {
      throw new RangeError('maxEntries must be a whole number of at least 1');
    }
    const sweepIntervalMs = options.sweepIntervalMs ?? MEMORY_STORE_DEFAULTS.sweepIntervalMs;
    if (sweepIntervalMs > 0) {
      this.#timer = setInterval(() => {
        this.sweep();
      }, sweepIntervalMs);
      // Never keeps the process alive on its own.
      this.#timer.unref();
    }
  }

  /** Counters plus values held right now, including expired ones not swept yet. */
  get size(): number {
    return this.#counters.size + this.#values.size;
  }

  increment(key: string, windowMs: number): Promise<CounterState> {
    return settle(() => {
      assertDuration('windowMs', windowMs);
      const now = this.#now();
      const current = this.#counters.get(key);
      if (current && current.resetAt > now) {
        current.count += 1;
        return { count: current.count, resetAt: current.resetAt };
      }
      if (current) {
        this.#counters.delete(key);
      } else {
        this.#makeRoom();
      }
      const entry: CounterEntry = { count: 1, resetAt: now + windowMs };
      this.#counters.set(key, entry);
      return { count: entry.count, resetAt: entry.resetAt };
    });
  }

  decrement(key: string): Promise<void> {
    return settle(() => {
      const current = this.#liveCounter(key);
      if (current && current.count > 0) current.count -= 1;
    });
  }

  reset(key: string): Promise<void> {
    return settle(() => {
      this.#counters.delete(key);
    });
  }

  get<T>(key: string): Promise<T | undefined> {
    return settle(() => {
      const entry = this.#liveValue(key);
      // The caller that wrote the key chose T (see KeyValueStore).
      return entry ? (structuredClone(entry.value) as T) : undefined;
    });
  }

  set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    return settle(() => {
      this.#write(key, value, ttlMs);
    });
  }

  setIfAbsent<T>(key: string, value: T, ttlMs: number): Promise<boolean> {
    return settle(() => {
      if (this.#liveValue(key)) return false;
      this.#write(key, value, ttlMs);
      return true;
    });
  }

  delete(key: string): Promise<void> {
    return settle(() => {
      this.#values.delete(key);
    });
  }

  /** Drops every expired entry and returns how many went. The timer calls this. */
  sweep(): number {
    const now = this.#now();
    let removed = 0;
    for (const [key, entry] of this.#counters) {
      if (entry.resetAt <= now) {
        this.#counters.delete(key);
        removed += 1;
      }
    }
    for (const [key, entry] of this.#values) {
      if (entry.expiresAt <= now) {
        this.#values.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  close(): Promise<void> {
    return settle(() => {
      if (this.#timer !== undefined) {
        clearInterval(this.#timer);
        this.#timer = undefined;
      }
      this.#counters.clear();
      this.#values.clear();
    });
  }

  /** The counter for `key` while its window runs; an ended one is dropped. */
  #liveCounter(key: string): CounterEntry | undefined {
    const entry = this.#counters.get(key);
    if (entry === undefined) return undefined;
    if (entry.resetAt > this.#now()) return entry;
    this.#counters.delete(key);
    return undefined;
  }

  /** The value for `key` while it lives; an expired one is dropped. */
  #liveValue(key: string): ValueEntry | undefined {
    const entry = this.#values.get(key);
    if (entry === undefined) return undefined;
    if (entry.expiresAt > this.#now()) return entry;
    this.#values.delete(key);
    return undefined;
  }

  #write(key: string, value: unknown, ttlMs: number): void {
    assertDuration('ttlMs', ttlMs);
    // Clone first: a value that cannot be copied fails before anything changes.
    const copy = structuredClone(value);
    if (!this.#values.has(key)) this.#makeRoom();
    this.#values.set(key, { value: copy, expiresAt: this.#now() + ttlMs });
  }

  /**
   * Called before a new key goes in. When the store is full it first sweeps expired
   * entries, then evicts the live entries closest to expiry (a tenth of maxEntries at
   * once, at least enough for the new key), so size never passes maxEntries.
   */
  #makeRoom(): void {
    if (this.size < this.#maxEntries) return;
    this.sweep();
    if (this.size < this.#maxEntries) return;

    const needed = this.size - this.#maxEntries + 1;
    const batch = Math.max(needed, Math.ceil(this.#maxEntries * EVICT_FRACTION));
    const candidates: { expiresAt: number; drop: () => void }[] = [];
    for (const [key, entry] of this.#counters) {
      candidates.push({ expiresAt: entry.resetAt, drop: () => this.#counters.delete(key) });
    }
    for (const [key, entry] of this.#values) {
      candidates.push({ expiresAt: entry.expiresAt, drop: () => this.#values.delete(key) });
    }
    candidates.sort((a, b) => a.expiresAt - b.expiresAt);
    for (const candidate of candidates.slice(0, batch)) candidate.drop();
  }
}
