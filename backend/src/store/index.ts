import type { Env } from '../config/env.js';
import type { AppContext } from '../routes/types.js';
import { MemoryStore } from './memoryStore.js';
import type { Store } from './types.js';

export type { CounterState, CounterStore, KeyValueStore, Store } from './types.js';
export { MEMORY_STORE_DEFAULTS, MemoryStore } from './memoryStore.js';
export type { MemoryStoreOptions } from './memoryStore.js';

/** Name of the shutdown hook that closes the shared store. */
export const STORE_SHUTDOWN_HOOK = 'store';

/**
 * Builds the app's Store. Today it is always the in-process MemoryStore, which is right for
 * the single Node process on the VPS. To share state between several processes, add a
 * RedisStore that implements Store (same keys, JSON values) and pick it here, for example
 * `if (env.REDIS_URL) return new RedisStore(env.REDIS_URL);`. No caller changes.
 */
export function createStore(_env: Env): Store {
  return new MemoryStore();
}

let shared: Store | undefined;

/**
 * The process wide Store that every feature module uses unless a test injects its own.
 * The first call builds it and registers one shutdown hook that closes it; after that hook
 * runs, the next call builds a fresh store.
 */
export function getSharedStore(ctx: AppContext): Store {
  if (shared) return shared;
  const store = createStore(ctx.env);
  shared = store;
  ctx.lifecycle.onShutdown(STORE_SHUTDOWN_HOOK, async () => {
    if (shared === store) shared = undefined;
    await store.close();
  });
  return store;
}

/** Closes and forgets the shared store, so the next getSharedStore() builds a new one. */
export async function resetSharedStoreForTests(): Promise<void> {
  const store = shared;
  shared = undefined;
  if (store) await store.close();
}
