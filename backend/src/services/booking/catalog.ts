/**
 * The booking catalog: session types, prices, limits and hours. This file and time.ts are
 * the single source of the booking rules (backend sharedDecisions 13). The values copy the
 * reference booking modal (TYPES, slotsFor at L6060, the calendar at L6006-6010).
 */
import type { BookingQuote, Platform, SessionType, SessionTypeInfo } from './types.js';

/** Session types of the reference modal. */
export const SESSION_TYPES: Readonly<Record<SessionType, Readonly<SessionTypeInfo>>> = {
  quick: { id: 'quick', name: 'Quick Chat', minutes: 30, price: 15, label: '30 minutes' },
  deep: { id: 'deep', name: 'Technical Deep Dive', minutes: 60, price: 25, label: '60 minutes' },
};

/** Session ids in catalog order (for zod enums). */
export const SESSION_TYPE_IDS = ['quick', 'deep'] as const satisfies readonly SessionType[];

/** Meeting platforms of the reference modal, in its order. */
export const PLATFORMS = ['Google Meet', 'Zoom'] as const satisfies readonly Platform[];

/** Fewest and most sessions one booking can hold (the reference stepper). */
export const MIN_SESSIONS = 1;
export const MAX_SESSIONS = 10;

export const CURRENCY = 'USD';

/** Last bookable day, counted from the visitor's today (the reference maxDate()). */
export const WINDOW_DAYS = 60;

/** First and last slot start hours in the booking time zone (09:00 to 17:00). */
export const FIRST_HOUR = 9;
export const LAST_HOUR = 17;

/** Minutes between two slot starts. */
export const SLOT_STEP_MINUTES = 60;

/** Every session ends by this time in the booking time zone. */
export const DAY_END = '18:00';

/** A slot needs at least this much notice (2 hours). */
export const MIN_NOTICE_MS = 2 * 60 * 60 * 1000;

/** The zone the reference builds its slots in (PKT, UTC+5, no daylight saving). */
export const DEFAULT_BOOKING_TIMEZONE = 'Asia/Karachi';

/** True when `value` is a session id of the catalog. */
export function isSessionType(value: unknown): value is SessionType {
  return typeof value === 'string' && (SESSION_TYPE_IDS as readonly string[]).includes(value);
}

/** True when `value` is one of the platforms of the reference modal. */
export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && (PLATFORMS as readonly string[]).includes(value);
}

/** The catalog entry of a session type. */
export function sessionInfo(sessionType: SessionType): Readonly<SessionTypeInfo> {
  return SESSION_TYPES[sessionType];
}

/**
 * Price quote for `sessions` sessions of `sessionType`, computed from the catalog only.
 * Throws a RangeError when `sessions` is not an integer from 1 to 10 (the validators reject
 * that first, so this only guards against a programming error).
 */
export function quote(sessionType: SessionType, sessions: number): BookingQuote {
  if (!Number.isInteger(sessions) || sessions < MIN_SESSIONS || sessions > MAX_SESSIONS) {
    throw new RangeError(`sessions must be an integer from ${MIN_SESSIONS} to ${MAX_SESSIONS}`);
  }
  const info = SESSION_TYPES[sessionType];
  return {
    sessionName: info.name,
    durationMinutes: info.minutes,
    pricePerSession: info.price,
    sessions,
    total: info.price * sessions,
    currency: CURRENCY,
  };
}

/** Body of GET /api/booking/config without `ok` (API_CONTRACT.md). */
export interface BookingConfig {
  platforms: { meet: true; zoom: boolean };
  sessions: Record<SessionType, { name: string; minutes: number; price: number }>;
  maxSessions: number;
  currency: 'USD';
  windowDays: number;
  hours: {
    days: 'Mon-Fri';
    start: string;
    end: string;
    firstSlot: string;
    lastSlot: string;
    stepMinutes: number;
    timezone: string;
  };
}

/** Two digit hour label, for example 9 -> "09:00". */
function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * The GET /api/booking/config body without `ok`. `zoom` reports whether Zoom is set up
 * (information only: the reference keeps Zoom selectable either way); `timeZone` is
 * BOOKING_TIMEZONE.
 */
export function bookingConfig(options: { zoom: boolean; timeZone: string }): BookingConfig {
  return {
    platforms: { meet: true, zoom: options.zoom },
    sessions: {
      quick: {
        name: SESSION_TYPES.quick.name,
        minutes: SESSION_TYPES.quick.minutes,
        price: SESSION_TYPES.quick.price,
      },
      deep: {
        name: SESSION_TYPES.deep.name,
        minutes: SESSION_TYPES.deep.minutes,
        price: SESSION_TYPES.deep.price,
      },
    },
    maxSessions: MAX_SESSIONS,
    currency: CURRENCY,
    windowDays: WINDOW_DAYS,
    hours: {
      days: 'Mon-Fri',
      start: hourLabel(FIRST_HOUR),
      end: DAY_END,
      firstSlot: hourLabel(FIRST_HOUR),
      lastSlot: hourLabel(LAST_HOUR),
      stepMinutes: SLOT_STEP_MINUTES,
      timezone: options.timeZone,
    },
  };
}
