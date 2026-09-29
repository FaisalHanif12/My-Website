import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import type { CounterStore } from '../store/types.js';

export interface DailyCapOptions {
  store: CounterStore;
  /** Short name used in the store key `cap:${name}:${YYYY-MM-DD}`. */
  name: string;
  /** Uses allowed per calendar day; the next one is refused. */
  limit: number;
  /** IANA zone whose calendar day the cap follows (BOOKING_TIMEZONE for chat). */
  timeZone: string;
  /** Clock. Default () => new Date(). Give the store the same clock in tests. */
  now?: () => Date;
}

export interface DailyCapResult {
  /** False once `count` is over `limit`. */
  allowed: boolean;
  /** Uses so far today, including this one. */
  count: number;
  limit: number;
}

export interface DailyCap {
  /** Counts one use for today and says whether it is still within the limit. */
  consume(): Promise<DailyCapResult>;
}

/** The calendar day of `date` in `timeZone`, as YYYY-MM-DD. */
export function localDateKey(date: Date, timeZone: string): string {
  return formatInTimeZone(date, timeZone, 'yyyy-MM-dd');
}

/** The first instant of the calendar day after `date` in `timeZone`. */
export function nextLocalMidnight(date: Date, timeZone: string): Date {
  const today = localDateKey(date, timeZone);
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const day = Number(today.slice(8, 10));
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  return fromZonedTime(`${tomorrow}T00:00:00`, timeZone);
}

/** Store key of the cap `name` on the local day `ymd`. */
export function dailyCapKey(name: string, ymd: string): string {
  return `cap:${name}:${ymd}`;
}

/**
 * A counter that starts again at local midnight in `timeZone`. Each day has its own key and
 * its window ends at the next local midnight, so the store drops it on its own. Used for
 * the chat global cap (CHAT_DAILY_GLOBAL_LIMIT per BOOKING_TIMEZONE day).
 */
export function createDailyCap(options: DailyCapOptions): DailyCap {
  const { store, name, limit, timeZone } = options;
  const now = options.now ?? (() => new Date());
  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError('limit must be a whole number of at least 0');
  }
  // Throws a RangeError now, not on the first request, when the zone is not valid.
  localDateKey(new Date(0), timeZone);

  return {
    async consume() {
      const at = now();
      const key = dailyCapKey(name, localDateKey(at, timeZone));
      const windowMs = Math.max(1, nextLocalMidnight(at, timeZone).getTime() - at.getTime());
      const { count } = await store.increment(key, windowMs);
      return { allowed: count <= limit, count, limit };
    },
  };
}
