import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLifecycle } from '../../src/lib/lifecycle.js';
import { createLogger } from '../../src/lib/logger.js';
import type { AppContext } from '../../src/routes/types.js';
import {
  MemoryStore,
  STORE_SHUTDOWN_HOOK,
  createStore,
  getSharedStore,
  resetSharedStoreForTests,
} from '../../src/store/index.js';
import { makeTestEnv } from '../helpers/testEnv.js';

function makeCtx(): AppContext {
  const env = makeTestEnv();
  const logger = createLogger(env);
  return { env, logger, lifecycle: createLifecycle(logger) };
}

afterEach(async () => {
  await resetSharedStoreForTests();
});

describe('createStore', () => {
  it('builds an in-memory store today', async () => {
    const store = createStore(makeTestEnv());
    expect(store).toBeInstanceOf(MemoryStore);
    await store.close();
  });

  it('builds a new store on every call', async () => {
    const a = createStore(makeTestEnv());
    const b = createStore(makeTestEnv());
    expect(a).not.toBe(b);
    await Promise.all([a.close(), b.close()]);
  });
});

describe('getSharedStore', () => {
  it('returns one store per process and registers its shutdown hook once', () => {
    const ctx = makeCtx();
    const onShutdown = vi.spyOn(ctx.lifecycle, 'onShutdown');

    const first = getSharedStore(ctx);
    const second = getSharedStore(ctx);
    const fromOtherCtx = getSharedStore(makeCtx());

    expect(second).toBe(first);
    expect(fromOtherCtx).toBe(first);
    expect(onShutdown).toHaveBeenCalledTimes(1);
    expect(onShutdown).toHaveBeenCalledWith(STORE_SHUTDOWN_HOOK, expect.any(Function));
    expect(STORE_SHUTDOWN_HOOK).toBe('store');
  });

  it('shares state between callers', async () => {
    const ctx = makeCtx();
    await getSharedStore(ctx).set('k', 'v', 1000);
    await expect(getSharedStore(ctx).get('k')).resolves.toBe('v');
  });

  it('is closed by the shutdown hook, and the next call builds a fresh store', async () => {
    const ctx = makeCtx();
    const store = getSharedStore(ctx);
    const close = vi.spyOn(store, 'close');
    await store.set('k', 'v', 1000);

    await ctx.lifecycle.runShutdown();

    expect(close).toHaveBeenCalledTimes(1);
    await expect(store.get('k')).resolves.toBeUndefined();
    const next = getSharedStore(makeCtx());
    expect(next).not.toBe(store);
  });

  it('a stale shutdown hook does not drop a newer store', async () => {
    const oldCtx = makeCtx();
    const oldStore = getSharedStore(oldCtx);
    await resetSharedStoreForTests();

    const newStore = getSharedStore(makeCtx());
    await newStore.set('k', 'v', 1000);
    await oldCtx.lifecycle.runShutdown();

    expect(getSharedStore(makeCtx())).toBe(newStore);
    await expect(newStore.get('k')).resolves.toBe('v');
    expect(oldStore).not.toBe(newStore);
  });
});

describe('resetSharedStoreForTests', () => {
  it('closes the shared store and forgets it', async () => {
    const store = getSharedStore(makeCtx());
    const close = vi.spyOn(store, 'close');

    await resetSharedStoreForTests();

    expect(close).toHaveBeenCalledTimes(1);
    expect(getSharedStore(makeCtx())).not.toBe(store);
  });

  it('does nothing when no shared store exists', async () => {
    await resetSharedStoreForTests();
    await expect(resetSharedStoreForTests()).resolves.toBeUndefined();
  });
});
