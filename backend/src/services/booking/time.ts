/**
 * Booking time rules as pure functions (backend sharedDecisions 13). Nothing here reads the
 * clock: callers pass `now`. Days are YYYY-MM-DD strings; instants are Date objects.
 *
 * Reference behaviour this copies (faisalhanif-redesign.html):
 * - slotsFor(k) at L6060: for h 9..17, Date.UTC(y, m - 1, d, h - 5). The slots of a picked
 *   day are the hourly starts 09:00 to 17:00 PKT on that calendar day, whatever the zone
 *   the visitor shows them in.
 * - avail(d) at L6010: a day after the visitor's today, at most 60 days ahead by the
 *   visitor's own clock, and not a Saturday or Sunday.
 * - fmtTime at L5841: en-US hour and two digit minute, for example "2:00 PM".
 */
import { formatInTimeZone, fromZonedTime, getTimezoneOffset } from 'date-fns-tz';

import { isYmdDate } from '../../validators/common.js';
import {
  DEFAULT_BOOKING_TIMEZONE,
  FIRST_HOUR,
  LAST_HOUR,
  MIN_NOTICE_MS,
  SLOT_STEP_MINUTES,
  WINDOW_DAYS,
} from './catalog.js';
import type { DateWindow, Ymd } from './types.js';

export { DEFAULT_BOOKING_TIMEZONE };

const DAY_MS = 24 * 60 * 60 * 1000;

/** Splits a YYYY-MM-DD day into numbers; throws a RangeError for anything else. */
function parseYmd(date: Ymd): { year: number; month: number; day: number } {
  if (!isYmdDate(date)) throw new RangeError('Expected a real calendar day in YYYY-MM-DD form');
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  return { year, month, day };
}

/** YYYY-MM-DD of a UTC midnight timestamp. */
function ymdFromUtcMs(ms: number): Ymd {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * ISO instant with an explicit zone ("Z" or "+05:00"). A string without one would be read
 * in the server's own zone, so it is never accepted as a slot start.
 */
const ISO_INSTANT_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i;

/** Reads an instant from a Date or an ISO string; null when it is not a valid time. */
function toInstant(value: Date | string): Date | null {
  if (typeof value === 'string' && !ISO_INSTANT_RE.test(value)) return null;
  const instant = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(instant.getTime()) ? null : instant;
}

function assertValidDate(value: Date): void {
  if (Number.isNaN(value.getTime())) throw new RangeError('Expected a valid Date');
}

// ---------------------------------------------------------------------------
// Days
// ---------------------------------------------------------------------------

/** The calendar day (YYYY-MM-DD) that the instant `at` falls on in `tz`. */
export function ymdIn(at: Date, tz: string): Ymd {
  assertValidDate(at);
  return formatInTimeZone(at, tz, 'yyyy-MM-dd');
}

/** Today in `tz` at the instant `now`. */
export function todayIn(tz: string, now: Date): Ymd {
  return ymdIn(now, tz);
}

/** The day `n` calendar days after `date` (n may be negative). */
export function addDays(date: Ymd, n: number): Ymd {
  if (!Number.isInteger(n)) throw new RangeError('addDays needs a whole number of days');
  const { year, month, day } = parseYmd(date);
  return ymdFromUtcMs(Date.UTC(year, month - 1, day) + n * DAY_MS);
}

/**
 * True for Monday to Friday. The weekday is the one of the calendar day itself, as in the
 * reference calendar, so it does not depend on any time zone.
 */
export function isWeekday(date: Ymd): boolean {
  const { year, month, day } = parseYmd(date);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday >= 1 && weekday <= 5;
}

/**
 * Days a visitor can pick in POST /api/booking: tomorrow up to today + 60 days, both by
 * the visitor's own clock (`visitorTz`), like the reference calendar.
 */
export function bookingDateWindow(now: Date, visitorTz: string): DateWindow {
  const today = todayIn(visitorTz, now);
  return { first: addDays(today, 1), last: addDays(today, WINDOW_DAYS) };
}

/**
 * Days GET /api/booking/slots serves: today up to today + 61 days in the booking zone. It
 * has no visitor zone, so it covers every day any visitor zone (UTC-12 to UTC+14) can pick.
 */
export function slotsDateWindow(
  now: Date,
  bookingTz: string = DEFAULT_BOOKING_TIMEZONE,
): DateWindow {
  const today = todayIn(bookingTz, now);
  return { first: today, last: addDays(today, WINDOW_DAYS + 1) };
}

/** True when `date` lies inside the window (both ends included). */
export function inWindow(date: Ymd, window: DateWindow): boolean {
  if (!isYmdDate(date)) return false;
  return date >= window.first && date <= window.last;
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/**
 * The slot starts of the calendar day `date` in `tz`, one every `minutes` minutes from 09:00 while
 * the session still ends by 18:00. A 60 minute session gives the 9 hourly starts 09:00..17:00 (for
 * Asia/Karachi exactly the reference slotsFor: Date.UTC(y, m - 1, d, h - 5)); a 30 minute session
 * gives 18 starts, 09:00, 09:30 .. 17:30 (owner change, 2026-09-29).
 */
export function slotStarts(
  date: Ymd,
  tz: string = DEFAULT_BOOKING_TIMEZONE,
  minutes: number = SLOT_STEP_MINUTES,
): Date[] {
  parseYmd(date);
  const starts: Date[] = [];
  const dayEnd = (LAST_HOUR + 1) * 60;
  for (let at = FIRST_HOUR * 60; at + minutes <= dayEnd; at += minutes) {
    const hh = String(Math.floor(at / 60)).padStart(2, '0');
    const mm = String(at % 60).padStart(2, '0');
    const start = fromZonedTime(`${date}T${hh}:${mm}:00`, tz);
    if (Number.isNaN(start.getTime())) throw new RangeError('Unknown time zone');
    starts.push(start);
  }
  return starts;
}

/** Slot label in `tz` on a 24 hour clock, for example "09:00" or "17:00". */
export function slotLabel(start: Date, tz: string = DEFAULT_BOOKING_TIMEZONE): string {
  assertValidDate(start);
  return formatInTimeZone(start, tz, 'HH:mm');
}

/**
 * True when `startUtc` (an ISO string with "Z" or an offset, or a Date) is exactly one of
 * the slot starts of `date` in `tz`. Anything that is not a valid day, zone or time gives
 * false.
 */
export function isSlotStart(
  date: Ymd,
  startUtc: Date | string,
  tz: string = DEFAULT_BOOKING_TIMEZONE,
  minutes: number = SLOT_STEP_MINUTES,
): boolean {
  const start = toInstant(startUtc);
  if (!start || !isYmdDate(date)) return false;
  try {
    const ms = start.getTime();
    return slotStarts(date, tz, minutes).some((slot) => slot.getTime() === ms);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

/** True when `start` is at least 2 hours after `now` (exactly 2 hours passes). */
export function hasNotice(start: Date, now: Date): boolean {
  return start.getTime() - now.getTime() >= MIN_NOTICE_MS;
}

/** End of a session that starts at `start` and lasts `minutes` minutes. */
export function sessionEnd(start: Date, minutes: number): Date {
  return new Date(start.getTime() + minutes * 60_000);
}

/**
 * True when [aStart, aEnd) and [bStart, bEnd) share time. Intervals that only touch
 * (one ends when the other starts) do not overlap.
 */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

// ---------------------------------------------------------------------------
// Formatting for emails, the calendar event and the .ics file
// ---------------------------------------------------------------------------

/** Clock time in `tz` like the reference fmtTime (en-US), for example "2:00 PM". */
export function formatTime(at: Date, tz: string): string {
  assertValidDate(at);
  return formatInTimeZone(at, tz, 'h:mm a');
}

/** Long day in `tz`, for example "Tuesday, 6 October 2026". */
export function formatLongDay(at: Date, tz: string): string {
  assertValidDate(at);
  return formatInTimeZone(at, tz, 'EEEE, d MMMM yyyy');
}

/**
 * Meeting time in `tz`, for example "Tuesday, 6 October 2026, 9:00 AM to 10:00 AM". When
 * the session ends on the next day in that zone, the end day is named too:
 * "Sunday, 1 November 2026, 11:00 PM to Monday, 2 November 2026, 12:00 AM".
 */
export function formatWhen(start: Date, end: Date, tz: string): string {
  const sameDay = ymdIn(start, tz) === ymdIn(end, tz);
  const endText = sameDay
    ? formatTime(end, tz)
    : `${formatLongDay(end, tz)}, ${formatTime(end, tz)}`;
  return `${formatLongDay(start, tz)}, ${formatTime(start, tz)} to ${endText}`;
}

/** Offset of `tz` from UTC in minutes at the instant `at` (east is positive). */
export function zoneOffsetMinutes(tz: string, at: Date): number {
  assertValidDate(at);
  const offsetMs = getTimezoneOffset(tz, at);
  if (Number.isNaN(offsetMs)) throw new RangeError('Unknown time zone');
  return Math.round(offsetMs / 60_000);
}

/**
 * The reference gmtLabel (L5828): "GMT" + sign + hours + ":mm" only when there are
 * minutes, so "GMT+5", "GMT-4", "GMT+5:45" and "GMT+0".
 */
export function gmtLabel(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(offsetMinutes);
  const minutes = abs % 60;
  const minutesText = minutes ? `:${String(minutes).padStart(2, '0')}` : '';
  return `GMT${sign}${Math.floor(abs / 60)}${minutesText}`;
}

/** Zone label for emails at the instant `at`, for example "GMT+5, Asia/Karachi". */
export function zoneLabel(tz: string, at: Date): string {
  return `${gmtLabel(zoneOffsetMinutes(tz, at))}, ${tz}`;
}

/**
 * "Received at" stamp for owner emails, for example "Tuesday, 6 October 2026, 2:05 PM PKT".
 * For a zone other than Asia/Karachi the zone label replaces "PKT".
 */
export function formatPktStamp(now: Date, tz: string = DEFAULT_BOOKING_TIMEZONE): string {
  const suffix = tz === DEFAULT_BOOKING_TIMEZONE ? 'PKT' : `(${zoneLabel(tz, now)})`;
  return `${formatLongDay(now, tz)}, ${formatTime(now, tz)} ${suffix}`;
}
