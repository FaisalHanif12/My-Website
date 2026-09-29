/**
 * Booking types shared by the booking rules (catalog.ts, time.ts), the availability service
 * and the booking route. The reference modal sends these values in bookingData() (L6112-6117).
 */

/** Session id the reference modal uses (`S.type`). */
export type SessionType = 'quick' | 'deep';

/** Meeting platform the visitor picks at step 3 of the reference modal. */
export type Platform = 'Google Meet' | 'Zoom';

/** Calendar day in YYYY-MM-DD form, for example "2026-10-06". */
export type Ymd = string;

/** One session type of the catalog. */
export interface SessionTypeInfo {
  id: SessionType;
  /** Shown name, for example "Quick Chat". */
  name: string;
  /** Length of one session in minutes. */
  minutes: number;
  /** Price of one session in USD. */
  price: number;
  /** Duration text of the reference card pill, for example "30 minutes". */
  label: string;
}

/**
 * The fields of the booking payload the server trusts (API_CONTRACT.md). The display
 * fields the reference also sends (sessionName, durationMinutes, pricePerSession, total,
 * currency, timeLocal, timeLahore) are recomputed on the server and never read.
 */
export interface BookingRequest {
  sessionType: SessionType;
  /** Number of sessions, an integer from 1 to 10. */
  sessions: number;
  email: string;
  name: string;
  /** "" when not given. */
  phone: string;
  /** "" when not given. */
  company: string;
  /** The calendar day picked; its slots are built on this day in BOOKING_TIMEZONE. */
  date: Ymd;
  /** IANA zone chosen in the modal (the visitor's zone). */
  timezone: string;
  /** ISO time of the chosen slot, for example "2026-10-06T04:00:00.000Z". */
  startUtc: string;
  platform: Platform;
  /** "" when not given. */
  notes: string;
}

/** Price quote computed from the catalog (never from the client's numbers). */
export interface BookingQuote {
  sessionName: string;
  durationMinutes: number;
  pricePerSession: number;
  sessions: number;
  total: number;
  currency: 'USD';
}

/** What POST /api/booking returns after `ok: true`. */
export interface BookingResult {
  bookingId: string;
  /** The join link. null only when Zoom was picked but Zoom is not set up. */
  meetLink: string | null;
  /** ISO start time of the first session. */
  start: string;
  /** ISO end time of the first session. */
  end: string;
  /** Every booked session, in time order. */
  sessions: Array<{ start: string; end: string }>;
}

/** An inclusive range of calendar days. */
export interface DateWindow {
  first: Ymd;
  last: Ymd;
}
