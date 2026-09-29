/**
 * Meeting contract. be-06 implements it for Google Meet (src/services/meeting/googleMeet.ts)
 * and Zoom (src/services/meeting/zoom.ts). The booking service asks the provider of the
 * platform the visitor picked for a plan BEFORE it creates the calendar event:
 *
 * - Google Meet: plan() makes no call and returns { withGoogleMeet: true, joinUrl: null,
 *   pending: false }. The calendar provider then creates the event with a Meet conference
 *   and the join link is read from the created event (CreatedEvent.meetLink).
 * - Zoom, configured: plan() creates the Zoom meeting first and returns its join_url as
 *   joinUrl (and the Zoom meeting id as externalId), with withGoogleMeet false. The booking
 *   passes joinUrl as the event location, and that same link goes into both emails.
 * - Zoom, not configured: plan() makes no call and returns { withGoogleMeet: false,
 *   joinUrl: null, pending: true }. The event is still created (without a conference), the
 *   booking answers meetLink: null, the visitor email says Faisal will send the Zoom link
 *   before the call, and the owner email flags it.
 *
 * So the meeting link of a booking is plan.joinUrl ?? createdEvent.meetLink.
 */
import type { Platform } from '../booking/types.js';

export interface MeetingPlan {
  platform: Platform;
  /** True when the calendar event must carry a Google Meet conference. */
  withGoogleMeet: boolean;
  /** Join link made before the event exists (Zoom), else null. */
  joinUrl: string | null;
  /** True when the link will be sent later by hand (Zoom picked but not set up). */
  pending: boolean;
  /** Id of the meeting at the platform (the Zoom meeting id), when there is one. */
  externalId?: string;
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
