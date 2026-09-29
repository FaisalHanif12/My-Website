import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDailyCap,
  dailyCapKey,
  localDateKey,
  nextLocalMidnight,
} from '../../src/lib/dailyCap.js';
import { MemoryStore } from '../../src/store/memoryStore.js';

const KARACHI = 'Asia/Karachi';
/** 2026-09-29 15:00 in Karachi (UTC+5). */
const AFTERNOON = Date.parse('2026-09-29T10:00:00.000Z');
/** 2026-09-30 00:00 in Karachi. */
const MIDNIGHT = Date.parse('2026-09-29T19:00:00.000Z');

let nowMs = AFTERNOON;
let store: MemoryStore;

beforeEach(() => {
  nowMs = AFTERNOON;
  store = new MemoryStore({ now: () => nowMs, sweepIntervalMs: 0 });
});

afterEach(async () => {
  vi.useRealTimers();
  await store.close();
});

function chatCap(limit: number) {
  return createDailyCap({
    store,
    name: 'chat',
    limit,
    timeZone: KARACHI,
    now: () => new Date(nowMs),
  });
}

describe('localDateKey and nextLocalMidnight', () => {
  it('uses the calendar day of the time zone', () => {
    expect(localDateKey(new Date(MIDNIGHT - 1), KARACHI)).toBe('2026-09-29');
    expect(localDateKey(new Date(MIDNIGHT), KARACHI)).toBe('2026-09-30');
    expect(localDateKey(new Date(MIDNIGHT - 1), 'UTC')).toBe('2026-09-29');
  });

  it('finds the next local midnight in Asia/Karachi', () => {
    expect(nextLocalMidnight(new Date(AFTERNOON), KARACHI).toISOString()).toBe(
      '2026-09-29T19:00:00.000Z',
    );
    expect(nextLocalMidnight(new Date(MIDNIGHT), KARACHI).toISOString()).toBe(
      '2026-09-30T19:00:00.000Z',
    );
  });

  it('rolls over months and years', () => {
    const newYearsEve = new Date('2026-12-31T12:00:00.000Z');
    expect(nextLocalMidnight(newYearsEve, KARACHI).toISOString()).toBe('2026-12-31T19:00:00.000Z');
    const lateOnEve = new Date('2026-12-31T20:00:00.000Z');
    expect(localDateKey(lateOnEve, KARACHI)).toBe('2027-01-01');
    expect(nextLocalMidnight(lateOnEve, KARACHI).toISOString()).toBe('2027-01-01T19:00:00.000Z');
  });

  it('follows daylight saving changes in zones that have them', () => {
    // New York moves to UTC-4 at 02:00 on 2026-03-08.
    const beforeChange = new Date('2026-03-07T17:00:00.000Z');
    expect(nextLocalMidnight(beforeChange, 'America/New_York').toISOString()).toBe(
      '2026-03-08T05:00:00.000Z',
    );
    const afterChange = new Date('2026-03-08T17:00:00.000Z');
    expect(nextLocalMidnight(afterChange, 'America/New_York').toISOString()).toBe(
      '2026-03-09T04:00:00.000Z',
    );
  });

  it('builds the store key from the name and the local day', () => {
    expect(dailyCapKey('chat', '2026-09-29')).toBe('cap:chat:2026-09-29');
  });
});

describe('createDailyCap', () => {
  it('allows up to the limit and reports allowed false after it', async () => {
    const cap = chatCap(3);
    await expect(cap.consume()).resolves.toEqual({ allowed: true, count: 1, limit: 3 });
    await expect(cap.consume()).resolves.toEqual({ allowed: true, count: 2, limit: 3 });
    await expect(cap.consume()).resolves.toEqual({ allowed: true, count: 3, limit: 3 });
    await expect(cap.consume()).resolves.toEqual({ allowed: false, count: 4, limit: 3 });
    await expect(cap.consume()).resolves.toEqual({ allowed: false, count: 5, limit: 3 });
  });

  it('starts again at midnight Asia/Karachi', async () => {
    const cap = chatCap(2);
    await cap.consume();
    await cap.consume();
    nowMs = MIDNIGHT - 1;
    await expect(cap.consume()).resolves.toMatchObject({ allowed: false, count: 3 });

    nowMs = MIDNIGHT;
    await expect(cap.consume()).resolves.toEqual({ allowed: true, count: 1, limit: 2 });
  });

  it('keys the counter by the local day and ends its window at the next local midnight', async () => {
    const increment = vi.spyOn(store, 'increment');
    await chatCap(5).consume();
    expect(increment).toHaveBeenCalledWith('cap:chat:2026-09-29', MIDNIGHT - AFTERNOON);
    await expect(store.increment('cap:chat:2026-09-29', 1)).resolves.toMatchObject({
      count: 2,
      resetAt: MIDNIGHT,
    });
  });

  it('lets the store drop the day once it is over', async () => {
    await chatCap(5).consume();
    expect(store.size).toBe(1);
    nowMs = MIDNIGHT;
    expect(store.sweep()).toBe(1);
  });

  it('keeps separate counts for separate names', async () => {
    const chat = chatCap(1);
    const other = createDailyCap({
      store,
      name: 'other',
      limit: 1,
      timeZone: KARACHI,
      now: () => new Date(nowMs),
    });
    await chat.consume();
    await expect(chat.consume()).resolves.toMatchObject({ allowed: false });
    await expect(other.consume()).resolves.toMatchObject({ allowed: true, count: 1 });
  });

  it('refuses everything with a limit of 0', async () => {
    await expect(chatCap(0).consume()).resolves.toEqual({ allowed: false, count: 1, limit: 0 });
  });

  it('rejects a bad limit or time zone when it is created', () => {
    expect(() => chatCap(-1)).toThrow(RangeError);
    expect(() => chatCap(1.5)).toThrow(RangeError);
    expect(() => createDailyCap({ store, name: 'chat', limit: 1, timeZone: 'Not/AZone' })).toThrow(
      RangeError,
    );
  });

  it('uses the real clock when none is given', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(MIDNIGHT - 1);
    const realStore = new MemoryStore({ sweepIntervalMs: 0 });
    const cap = createDailyCap({ store: realStore, name: 'chat', limit: 1, timeZone: KARACHI });
    await cap.consume();
    await expect(cap.consume()).resolves.toMatchObject({ allowed: false });

    vi.setSystemTime(MIDNIGHT);
    await expect(cap.consume()).resolves.toMatchObject({ allowed: true, count: 1 });
    await realStore.close();
  });
});
