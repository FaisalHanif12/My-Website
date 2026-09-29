import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../src/lib/errors.js';
import {
  IDEMPOTENCY_MISMATCH_MESSAGE,
  createIdempotency,
  fingerprintOf,
  idempotencyStoreKey,
  isValidIdempotencyKey,
  stableJson,
} from '../../src/lib/idempotency.js';
import type { IdempotencyRecord } from '../../src/lib/idempotency.js';
import { MemoryStore } from '../../src/store/memoryStore.js';

const START = 1_800_000_000_000;
const TTL = 60_000;
const KEY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

interface Booked {
  bookingId: string;
}

let nowMs = START;
let store: MemoryStore;

beforeEach(() => {
  nowMs = START;
  store = new MemoryStore({ now: () => nowMs, sweepIntervalMs: 0 });
});

afterEach(async () => {
  await store.close();
});

function bookings() {
  return createIdempotency<Booked>({
    store,
    prefix: 'booking',
    ttlMs: TTL,
    now: () => new Date(nowMs),
  });
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: Error) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function expectMismatch(promise: Promise<unknown>): Promise<void> {
  const err: unknown = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  expect(err).toBeInstanceOf(AppError);
  expect(err).toMatchObject({
    code: 'VALIDATION_ERROR',
    status: 400,
    fields: { idempotencyKey: IDEMPOTENCY_MISMATCH_MESSAGE },
  });
}

describe('isValidIdempotencyKey', () => {
  it('accepts 8 to 128 letters, digits, underscores and dashes', () => {
    expect(isValidIdempotencyKey(KEY)).toBe(true);
    expect(isValidIdempotencyKey('abcd_123')).toBe(true);
    expect(isValidIdempotencyKey('a'.repeat(128))).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isValidIdempotencyKey('abc_123')).toBe(false);
    expect(isValidIdempotencyKey('a'.repeat(129))).toBe(false);
    expect(isValidIdempotencyKey('has space1')).toBe(false);
    expect(isValidIdempotencyKey('dots.are.out')).toBe(false);
    expect(isValidIdempotencyKey('')).toBe(false);
    expect(isValidIdempotencyKey(undefined)).toBe(false);
    expect(isValidIdempotencyKey(12345678)).toBe(false);
  });
});

describe('stableJson and fingerprintOf', () => {
  it('sorts object keys at every level and keeps array order', () => {
    expect(stableJson({ b: 1, a: { d: [3, 1], c: null } })).toBe(
      '{"a":{"c":null,"d":[3,1]},"b":1}',
    );
  });

  it('follows JSON.stringify for undefined, dates and a lone undefined', () => {
    expect(stableJson({ b: undefined, a: new Date(0) })).toBe('{"a":"1970-01-01T00:00:00.000Z"}');
    expect(stableJson(undefined)).toBe('');
  });

  it('gives the same fingerprint for the same content in any key order', () => {
    const a = fingerprintOf({ name: 'Ada', slot: { date: '2026-10-01', startUtc: 'x' } });
    const b = fingerprintOf({ slot: { startUtc: 'x', date: '2026-10-01' }, name: 'Ada' });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('gives a different fingerprint for different content', () => {
    expect(fingerprintOf({ sessions: 1 })).not.toBe(fingerprintOf({ sessions: 2 }));
    expect(fingerprintOf([1, 2])).not.toBe(fingerprintOf([2, 1]));
  });
});

describe('createIdempotency', () => {
  it('runs the work once and replays the first result for the same key and fingerprint', async () => {
    const idem = bookings();
    const work = vi.fn(() => Promise.resolve({ bookingId: 'bk_1' }));

    await expect(idem.run(KEY, 'fp-1', work)).resolves.toEqual({
      replayed: false,
      value: { bookingId: 'bk_1' },
    });
    await expect(idem.run(KEY, 'fp-1', work)).resolves.toEqual({
      replayed: true,
      value: { bookingId: 'bk_1' },
    });
    expect(work).toHaveBeenCalledTimes(1);
  });

  it('rejects the same key with another fingerprint as VALIDATION_ERROR', async () => {
    const idem = bookings();
    await idem.run(KEY, 'fp-1', () => Promise.resolve({ bookingId: 'bk_1' }));
    const work = vi.fn(() => Promise.resolve({ bookingId: 'bk_2' }));

    await expectMismatch(idem.run(KEY, 'fp-2', work));
    expect(work).not.toHaveBeenCalled();
  });

  it('runs concurrent calls with one key once and gives both the result', async () => {
    const idem = bookings();
    const gate = deferred<Booked>();
    const work = vi.fn(() => gate.promise);

    const first = idem.run(KEY, 'fp-1', work);
    const second = idem.run(KEY, 'fp-1', work);
    gate.resolve({ bookingId: 'bk_1' });

    await expect(first).resolves.toEqual({ replayed: false, value: { bookingId: 'bk_1' } });
    await expect(second).resolves.toEqual({ replayed: true, value: { bookingId: 'bk_1' } });
    expect(work).toHaveBeenCalledTimes(1);
  });

  it('rejects a concurrent call with the same key and another fingerprint', async () => {
    const idem = bookings();
    const gate = deferred<Booked>();
    const first = idem.run(KEY, 'fp-1', () => gate.promise);

    await expectMismatch(idem.run(KEY, 'fp-2', () => Promise.resolve({ bookingId: 'bk_2' })));
    gate.resolve({ bookingId: 'bk_1' });
    await expect(first).resolves.toMatchObject({ replayed: false });
  });

  it('never stores a failure, so the same key can be retried', async () => {
    const idem = bookings();
    const gate = deferred<Booked>();
    const failing = vi.fn(() => gate.promise);

    const first = idem.run(KEY, 'fp-1', failing);
    const joined = idem.run(KEY, 'fp-1', failing);
    gate.reject(new Error('calendar is down'));
    await expect(first).rejects.toThrow('calendar is down');
    await expect(joined).rejects.toThrow('calendar is down');
    expect(failing).toHaveBeenCalledTimes(1);
    await expect(idem.peek(KEY)).resolves.toBeUndefined();

    const retry = vi.fn(() => Promise.resolve({ bookingId: 'bk_1' }));
    await expect(idem.run(KEY, 'fp-1', retry)).resolves.toEqual({
      replayed: false,
      value: { bookingId: 'bk_1' },
    });
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('treats a work function that throws right away as a failure too', async () => {
    const idem = bookings();
    const throwing = (): Promise<Booked> => {
      throw new Error('bad input');
    };
    await expect(idem.run(KEY, 'fp-1', throwing)).rejects.toThrow('bad input');
    await expect(idem.peek(KEY)).resolves.toBeUndefined();
  });

  it('stores the record under idem:<prefix>:<key> with its fingerprint and time', async () => {
    const idem = bookings();
    await idem.run(KEY, 'fp-1', () => Promise.resolve({ bookingId: 'bk_1' }));

    const expected: IdempotencyRecord<Booked> = {
      fingerprint: 'fp-1',
      value: { bookingId: 'bk_1' },
      storedAt: START,
    };
    await expect(idem.peek(KEY)).resolves.toEqual(expected);
    expect(idempotencyStoreKey('booking', KEY)).toBe(`idem:booking:${KEY}`);
    await expect(store.get(`idem:booking:${KEY}`)).resolves.toEqual(expected);
  });

  it('replays from the store for a new instance with the same prefix', async () => {
    await bookings().run(KEY, 'fp-1', () => Promise.resolve({ bookingId: 'bk_1' }));
    const work = vi.fn(() => Promise.resolve({ bookingId: 'bk_2' }));
    await expect(bookings().run(KEY, 'fp-1', work)).resolves.toEqual({
      replayed: true,
      value: { bookingId: 'bk_1' },
    });
    expect(work).not.toHaveBeenCalled();
  });

  it('keeps keys of different prefixes apart', async () => {
    await bookings().run(KEY, 'fp-1', () => Promise.resolve({ bookingId: 'bk_1' }));
    const other = createIdempotency<Booked>({ store, prefix: 'other', ttlMs: TTL });
    await expect(
      other.run(KEY, 'fp-2', () => Promise.resolve({ bookingId: 'bk_9' })),
    ).resolves.toEqual({ replayed: false, value: { bookingId: 'bk_9' } });
  });

  it('forgets a stored result after ttlMs', async () => {
    const idem = bookings();
    await idem.run(KEY, 'fp-1', () => Promise.resolve({ bookingId: 'bk_1' }));
    nowMs += TTL;
    await expect(
      idem.run(KEY, 'fp-2', () => Promise.resolve({ bookingId: 'bk_2' })),
    ).resolves.toEqual({ replayed: false, value: { bookingId: 'bk_2' } });
  });

  it('still returns the value when saving it fails, and reports the store error', async () => {
    const onStoreError = vi.fn();
    const idem = createIdempotency<Booked>({ store, prefix: 'booking', ttlMs: TTL, onStoreError });
    const failure = new Error('store is down');
    vi.spyOn(store, 'set').mockRejectedValueOnce(failure);

    await expect(
      idem.run(KEY, 'fp-1', () => Promise.resolve({ bookingId: 'bk_1' })),
    ).resolves.toEqual({ replayed: false, value: { bookingId: 'bk_1' } });
    expect(onStoreError).toHaveBeenCalledWith(failure);
    await expect(idem.peek(KEY)).resolves.toBeUndefined();
  });

  it('ignores a failed save when no onStoreError is given', async () => {
    const idem = bookings();
    vi.spyOn(store, 'set').mockRejectedValueOnce(new Error('store is down'));
    await expect(
      idem.run(KEY, 'fp-1', () => Promise.resolve({ bookingId: 'bk_1' })),
    ).resolves.toMatchObject({ replayed: false });
  });
});
