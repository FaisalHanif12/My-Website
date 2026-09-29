import type { Env } from '../../config/env.js';
import { Errors } from '../../lib/errors.js';
import type { Logger } from '../../lib/logger.js';
import type { KeyValueStore } from '../../store/types.js';
import { isCalendarError } from '../calendar/types.js';
import type { BusyInterval, CalendarProvider } from '../calendar/types.js';
import { sessionInfo } from './catalog.js';
import {
  hasNotice,
  inWindow,
  isWeekday,
  overlaps,
  sessionEnd,
  slotLabel,
  slotStarts,
  slotsDateWindow,
  ymdIn,
} from './time.js';
import type { SessionType, Ymd } from './types.js';

/** Busy blocks of a day are kept this long, so a page of clicks does not call Google each time. */
export const FREEBUSY_CACHE_TTL_MS = 20_000;
/** A slot booked here counts as taken this long, until Google's busy list shows it. */
export const RECENT_BOOKING_TTL_MS = 30 * 60_000;

export interface AvailabilityOptions {
  calendar: CalendarProvider;
  store: KeyValueStore;
  env: Pick<Env, 'BOOKING_TIMEZONE'>;
  logger: Logger;
  now?: () => Date;
}

/** A busy block in the store (JSON only: epoch milliseconds). */
interface StoredBusy {
  start: number;
  end: number;
}

export interface Availability {
  /**
   * The free hourly starts of a day as "HH:mm" in the booking zone (GET /api/booking/slots).
   * [] for a day outside the served window; throws VALIDATION_ERROR for a weekend.
   */
  freeSlots(date: Ymd, session: SessionType): Promise<string[]>;
  /** True when `start` is free for a session of `minutes` (used under the slot lock). */
  isFree(start: Date, minutes: number, options?: { fresh?: boolean }): Promise<boolean>;
  /** Remembers a booked slot until Google shows it as busy. */
  markBooked(start: Date, end: Date): Promise<void>;
}

const busyKey = (date: Ymd) => `freebusy:${date}`;
const bookedKey = (start: Date) => `booked:${start.toISOString()}`;

export function createAvailability(options: AvailabilityOptions): Availability {
  const { calendar, store, env, logger } = options;
  const now = options.now ?? (() => new Date());
  const tz = env.BOOKING_TIMEZONE;
  const log = logger.child({ component: 'availability' });

  /** Busy blocks over the booking-zone day of `date`, from the cache or from Google. */
  async function busyOn(date: Ymd, fresh: boolean): Promise<BusyInterval[]> {
    const key = busyKey(date);
    if (!fresh) {
      const cached = await store.get<StoredBusy[]>(key);
      if (cached) return cached.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
    }
    const starts = slotStarts(date, tz);
    const first = starts[0];
    const last = starts[starts.length - 1];
    if (!first || !last) return [];
    // From the first slot to the end of the last one, with an hour of margin either side.
    const from = new Date(first.getTime() - 60 * 60_000);
    const to = new Date(last.getTime() + 2 * 60 * 60_000);
    let busy: BusyInterval[];
    try {
      busy = await calendar.freeBusy(from, to);
    } catch (error) {
      log.error(
        isCalendarError(error)
          ? { reason: error.reason, status: error.status, retryable: error.retryable }
          : { reason: 'unexpected' },
        'freebusy_failed',
      );
      throw Errors.upstream(undefined, error);
    }
    const stored: StoredBusy[] = busy.map((b) => ({
      start: b.start.getTime(),
      end: b.end.getTime(),
    }));
    await store.set(key, stored, FREEBUSY_CACHE_TTL_MS).catch(() => undefined);
    return busy;
  }

  async function recentlyBooked(start: Date, end: Date): Promise<boolean> {
    // A slot booked here is stored under its own start; a 60 minute session covers one slot.
    const other = await store.get<StoredBusy>(bookedKey(start));
    return other !== undefined && overlaps(start, end, new Date(other.start), new Date(other.end));
  }

  async function free(
    start: Date,
    minutes: number,
    busy: readonly BusyInterval[],
  ): Promise<boolean> {
    const end = sessionEnd(start, minutes);
    if (busy.some((b) => overlaps(start, end, b.start, b.end))) return false;
    // A slot booked on this server in the last 30 minutes.
    return !(await recentlyBooked(start, end));
  }

  return {
    async freeSlots(date, session) {
      if (!isWeekday(date)) {
        throw Errors.validation({ date: 'Pick a weekday (Monday to Friday).' });
      }
      if (!inWindow(date, slotsDateWindow(now(), tz))) return [];
      const info = sessionInfo(session);
      const busy = await busyOn(date, false);
      const out: string[] = [];
      for (const start of slotStarts(date, tz, info.minutes)) {
        if (!hasNotice(start, now())) continue;
        if (await free(start, info.minutes, busy)) out.push(slotLabel(start, tz));
      }
      return out;
    },

    async isFree(start, minutes, opts = {}) {
      const busy = await busyOn(ymdIn(start, tz), opts.fresh ?? false);
      return free(start, minutes, busy);
    },

    async markBooked(start, end) {
      const value: StoredBusy = { start: start.getTime(), end: end.getTime() };
      await store.set(bookedKey(start), value, RECENT_BOOKING_TTL_MS);
      await store.delete(busyKey(ymdIn(start, tz)));
    },
  };
}
