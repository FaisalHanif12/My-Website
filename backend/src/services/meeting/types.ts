/**
 * Meeting contract. The only provider is Google Meet (src/services/meeting/googleMeet.ts). The
 * booking service asks it for a plan BEFORE it creates the calendar event: plan() makes no call and
 * returns { withGoogleMeet: true, joinUrl: null }. The calendar provider then creates the event
 * with a Meet conference and the join link is read from the created event
 * (CreatedEvent.meetLink). Keeping the interface lets another platform be added later.
 */
import type { Platform } from '../booking/types.js';

export interface MeetingPlan {
  platform: Platform;
  /** True when the calendar event must carry a Google Meet conference. */
  withGoogleMeet: boolean;
  /** Join link made before the event exists, else null (always null for Google Meet). */
  joinUrl: string | null;
}

export interface MeetingPlanInput {
  bookingId: string;
  /** Meeting title, for example "Technical Deep Dive (60 min) with Jane Doe". */
  topic: string;
  start: Date;
  durationMinutes: number;
  /** IANA zone shown by the platform (BOOKING_TIMEZONE). */
  timeZone: string;
}

export interface MeetingProvider {
  readonly platform: Platform;
  /** False when the platform has no credentials; plan() then returns pending: true. */
  readonly configured: boolean;
  plan(input: MeetingPlanInput, signal?: AbortSignal): Promise<MeetingPlan>;
}

export interface MeetingErrorOptions {
  /** True when trying again later may work (network, timeout, 429, 5xx). */
  retryable: boolean;
  /** Upstream HTTP status, when there was one. */
  status?: number;
  /** Short machine reason such as "timeout" or "token". Never upstream text. */
  reason?: string;
}

/**
 * Error thrown by a MeetingProvider when the meeting could not be made. Like CalendarError
 * it never holds tokens, secrets or upstream text, so logging it is safe. The booking turns
 * it into UPSTREAM_ERROR and creates no event and sends no email.
 */
export class MeetingError extends Error {
  override readonly name = 'MeetingError';
  readonly retryable: boolean;
  readonly status: number | undefined;
  readonly reason: string | undefined;

  constructor(message: string, options: MeetingErrorOptions) {
    super(message);
    this.retryable = options.retryable;
    this.status = options.status;
    this.reason = options.reason;
  }
}

export function isMeetingError(value: unknown): value is MeetingError {
  return value instanceof MeetingError;
}
