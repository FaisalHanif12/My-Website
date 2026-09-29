import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MEMORY_STORE_DEFAULTS, MemoryStore } from '../../src/store/memoryStore.js';

const START = 1_700_000_000_000;

let clock = START;
const now = (): number => clock;
let store: MemoryStore;

beforeEach(() => {
  clock = START;
  // No sweep timer unless a test asks for one.
  store = new MemoryStore({ now, sweepIntervalMs: 0 });
});

afterEach(async () => {
  await store.close();
  vi.useRealTimers();
});

describe('MemoryStore counters', () => {
  it('starts a fixed window on the first hit and keeps its end on later hits', async () => {
    await expect(store.increment('a', 1000)).resolves.toEqual({ count: 1, resetAt: START + 1000 });
    clock += 400;
    await expect(store.increment('a', 1000)).resolves.toEqual({ count: 2, resetAt: START + 1000 });
    clock += 599;
    await expect(store.increment('a', 1000)).resolves.toEqual({ count: 3, resetAt: START + 1000 });
  });

  it('starts again from one when the window has ended', async () => {
    await store.increment('a', 1000);
    await store.increment('a', 1000);
    clock += 1000;
    await expect(store.increment('a', 1000)).resolves.toEqual({ count: 1, resetAt: clock + 1000 });
  });

  it('keeps one counter per key', async () => {
    await store.increment('a', 1000);
    await store.increment('a', 1000);
    await expect(store.increment('b', 1000)).resolves.toMatchObject({ count: 1 });
  });

  it('decrements within the window and never below zero', async () => {
    await store.increment('a', 1000);
    await store.increment('a', 1000);
    await store.decrement('a');
    await expect(store.increment('a', 1000)).resolves.toMatchObject({ count: 2 });
    await store.decrement('a');
    await store.decrement('a');
    await store.decrement('a');
    await expect(store.increment('a', 1000)).resolves.toMatchObject({ count: 1 });
  });

  it('ignores a decrement for a missing or ended counter', async () => {
    await expect(store.decrement('missing')).resolves.toBeUndefined();
    await store.increment('a', 1000);
    clock += 1000;
    await store.decrement('a');
    expect(store.size).toBe(0);
  });

  it('reset forgets the counter so the next hit opens a new window', async () => {
    await store.increment('a', 1000);
    await store.increment('a', 1000);
    clock += 500;
    await store.reset('a');
    await expect(store.increment('a', 1000)).resolves.toEqual({ count: 1, resetAt: clock + 1000 });
  });

  it('rejects a window that is not a positive number', async () => {
    await expect(store.increment('a', 0)).rejects.toBeInstanceOf(RangeError);
    await expect(store.increment('a', Number.NaN)).rejects.toBeInstanceOf(RangeError);
    expect(store.size).toBe(0);
  });
});

describe('MemoryStore values', () => {
  it('returns undefined for a missing key', async () => {
    await expect(store.get('missing')).resolves.toBeUndefined();
  });

  it('stores a value until its TTL ends, then drops it on read', async () => {
    await store.set('k', { n: 1 }, 1000);
    clock += 999;
    await expect(store.get('k')).resolves.toEqual({ n: 1 });
    clock += 1;
    await expect(store.get('k')).resolves.toBeUndefined();
    expect(store.size).toBe(0);
  });

  it('set replaces the value and its TTL', async () => {
    await store.set('k', 'first', 1000);
    clock += 800;
    await store.set('k', 'second', 1000);
    clock += 800;
    await expect(store.get('k')).resolves.toBe('second');
    expect(store.size).toBe(1);
  });

  it('setIfAbsent stores only when no live value is there', async () => {
    await expect(store.setIfAbsent('k', 'first', 1000)).resolves.toBe(true);
    await expect(store.setIfAbsent('k', 'second', 1000)).resolves.toBe(false);
    await expect(store.get('k')).resolves.toBe('first');
    clock += 1000;
    await expect(store.setIfAbsent('k', 'third', 1000)).resolves.toBe(true);
    await expect(store.get('k')).resolves.toBe('third');
  });

  it('delete removes a value and ignores a missing key', async () => {
    await store.set('k', true, 1000);
    await store.delete('k');
    await expect(store.get('k')).resolves.toBeUndefined();
    await expect(store.delete('missing')).resolves.toBeUndefined();
  });

  it('keeps counters and values in separate key spaces', async () => {
    await store.set('shared', 'value', 1000);
    await store.increment('shared', 1000);
    await expect(store.get('shared')).resolves.toBe('value');
    await store.reset('shared');
    await expect(store.get('shared')).resolves.toBe('value');
    await store.delete('shared');
    await expect(store.increment('shared', 1000)).resolves.toMatchObject({ count: 1 });
  });

  it('stores and returns copies, so callers cannot change each other', async () => {
    const original = { list: [1, 2], nested: { ok: true } };
    await store.set('k', original, 1000);
    original.list.push(3);
    original.nested.ok = false;

    const first = await store.get<typeof original>('k');
    expect(first).toEqual({ list: [1, 2], nested: { ok: true } });
    first?.list.push(99);

    await expect(store.get('k')).resolves.toEqual({ list: [1, 2], nested: { ok: true } });
  });

  it('rejects a value that cannot be copied and keeps the old one', async () => {
    await store.set('k', 'old', 1000);
    await expect(store.set('k', { fn: () => 1 }, 1000)).rejects.toThrow();
    await expect(store.get('k')).resolves.toBe('old');
  });

  it('rejects a TTL that is not a positive number', async () => {
    await expect(store.set('k', 1, -5)).rejects.toBeInstanceOf(RangeError);
    await expect(store.setIfAbsent('k', 1, Number.POSITIVE_INFINITY)).rejects.toBeInstanceOf(
      RangeError,
    );
    expect(store.size).toBe(0);
  });
});

describe('MemoryStore size limit', () => {
  it('uses the documented defaults', () => {
    expect(MEMORY_STORE_DEFAULTS).toEqual({ maxEntries: 50_000, sweepIntervalMs: 60_000 });
  });

  it('refuses a maxEntries below one', () => {
    expect(() => new MemoryStore({ maxEntries: 0 })).toThrow(RangeError);
    expect(() => new MemoryStore({ maxEntries: 1.5 })).toThrow(RangeError);
  });

  it('evicts the entry closest to expiry when a new key would pass maxEntries', async () => {
    const small = new MemoryStore({ now, maxEntries: 3, sweepIntervalMs: 0 });
    await small.set('late', 1, 3000);
    await small.increment('soonest', 1000);
    await small.set('middle', 2, 2000);
    await small.set('new', 3, 5000);

    expect(small.size).toBe(3);
    await expect(small.get('late')).resolves.toBe(1);
    await expect(small.get('middle')).resolves.toBe(2);
    await expect(small.get('new')).resolves.toBe(3);
    // The evicted counter starts again from one.
    await expect(small.increment('soonest', 1000)).resolves.toMatchObject({ count: 1 });
    await small.close();
  });

  it('never grows past maxEntries under a flood of new keys', async () => {
    const small = new MemoryStore({ now, maxEntries: 50, sweepIntervalMs: 0 });
    for (let i = 0; i < 500; i += 1) {
      clock += 1;
      if (i % 2 === 0) await small.increment(`ip-${i}`, 60_000);
      else await small.set(`value-${i}`, i, 60_000);
      expect(small.size).toBeLessThanOrEqual(50);
    }
    // The newest entries (furthest from expiry) survive.
    await expect(small.get('value-499')).resolves.toBe(499);
    await small.close();
  });

  it('drops expired entries before evicting live ones', async () => {
    const small = new MemoryStore({ now, maxEntries: 2, sweepIntervalMs: 0 });
    await small.set('expired', 1, 100);
    await small.set('live', 2, 10_000);
    clock += 100;
    await small.set('new', 3, 10_000);

    expect(small.size).toBe(2);
    await expect(small.get('live')).resolves.toBe(2);
    await expect(small.get('new')).resolves.toBe(3);
    await small.close();
  });

  it('does not evict when an existing key is updated', async () => {
    const small = new MemoryStore({ now, maxEntries: 2, sweepIntervalMs: 0 });
    await small.set('a', 1, 1000);
    await small.set('b', 2, 2000);
    await small.set('a', 10, 1000);
    await small.increment('c', 5000);
    await small.increment('c', 5000);
    expect(small.size).toBe(2);
    await expect(small.get('b')).resolves.toBe(2);
    await small.close();
  });
});

describe('MemoryStore sweep and close', () => {
  it('sweep() removes expired counters and values and reports how many', async () => {
    await store.set('short', 1, 100);
    await store.set('long', 2, 10_000);
    await store.increment('counter', 100);
    clock += 100;
    expect(store.sweep()).toBe(2);
    expect(store.size).toBe(1);
  });

  it('runs the sweep on an unref timer every sweepIntervalMs', async () => {
    vi.useFakeTimers();
    const swept = new MemoryStore({ now, sweepIntervalMs: 60_000 });
    expect(vi.getTimerCount()).toBe(1);

    await swept.set('short', 1, 1000);
    await swept.increment('counter', 1000);
    await swept.set('long', 2, 600_000);
    clock += 1000;
    expect(swept.size).toBe(3);

    vi.advanceTimersByTime(60_000);
    expect(swept.size).toBe(1);
    await swept.close();
  });

  it('close() clears the timer and every entry, and the store still works after', async () => {
    vi.useFakeTimers();
    const closing = new MemoryStore({ now });
    await closing.set('k', 1, 1000);
    await closing.increment('c', 1000);
    expect(vi.getTimerCount()).toBe(1);

    await closing.close();
    expect(vi.getTimerCount()).toBe(0);
    expect(closing.size).toBe(0);
    await expect(closing.get('k')).resolves.toBeUndefined();

    await closing.set('k', 2, 1000);
    await expect(closing.get('k')).resolves.toBe(2);
    await closing.close();
  });

  it('starts no timer when sweepIntervalMs is 0', () => {
    vi.useFakeTimers();
    const manual = new MemoryStore({ sweepIntervalMs: 0 });
    expect(vi.getTimerCount()).toBe(0);
    void manual.close();
  });

  it('uses Date.now when no clock is given', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
    const real = new MemoryStore();
    await expect(real.increment('a', 1000)).resolves.toEqual({ count: 1, resetAt: START + 1000 });
    vi.setSystemTime(START + 1000);
    await expect(real.increment('a', 1000)).resolves.toMatchObject({ count: 1 });
    await real.close();
  });

  it('reads Date.now on every call, so a clock faked after construction is used', async () => {
    const early = new MemoryStore({ sweepIntervalMs: 0 });
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(START);
    await expect(early.increment('a', 1000)).resolves.toEqual({ count: 1, resetAt: START + 1000 });
    await early.close();
  });
});
