/**
 * Calendar contract. be-06 implements it for Google Calendar (src/services/calendar/google.ts)
 * and fake.ts implements it in memory for dev:fake and tests. The availability service and
 * the booking service only talk to this interface.
 */

/** A busy block on the owner's calendar (UTC instants, end not included). */
export interface BusyInterval {
  start: Date;
  end: Date;
}

/** The one event a booking creates on the owner's calendar. */
export interface CreateEventInput {
  /**
   * Unique per booking (the booking id). The provider uses it to dedupe retries: a second
   * createEvent with the same requestId returns the first event instead of a new one.
   */
  requestId: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  /** IANA zone the event is shown in on the owner's calendar (BOOKING_TIMEZONE). */
  timeZone: string;
  /**
   * The visitor, added as an attendee without Google's own invite email. null keeps the visitor
   * off the event (their calendar would show the raw meeting link, which the join link hides).
   */
  attendee: { email: string; name: string } | null;
  /** Address used as the event location, or null. */
  location: string | null;
  /** True when the provider must attach a Google Meet conference to the event. */
  withGoogleMeet: boolean;
}

/** What the booking needs back from a created event. */
export interface CreatedEvent {
  eventId: string;
  /** The event UID; the .ics files use it so calendars match them to this event. */
  iCalUID: string;
  /** Link to the event on the owner's calendar, or null when the provider has none. */
  htmlLink: string | null;
  /** The Google Meet link when one was requested and created, else null. */
  meetLink: string | null;
}

export type CalendarKind = 'google' | 'fake';

export interface CalendarProvider {
  readonly kind: CalendarKind;
  /** Busy blocks that overlap [from, to). */
  freeBusy(from: Date, to: Date, signal?: AbortSignal): Promise<BusyInterval[]>;
  createEvent(input: CreateEventInput, signal?: AbortSignal): Promise<CreatedEvent>;
  /** Removes an event. An event that is already gone counts as removed. */
  deleteEvent(eventId: string): Promise<void>;
}

export interface CalendarErrorOptions {
  /** True when trying again later may work (network, timeout, 429, 5xx). */
  retryable: boolean;
  /** Upstream HTTP status, when there was one. */
  status?: number;
  /** Short machine reason such as "timeout" or "invalid_grant". Never upstream text. */
  reason?: string;
}

/**
 * Error thrown by every CalendarProvider. It carries only a plain message, whether a retry
 * may help, and an optional status and short reason. It never holds the upstream error,
 * tokens, request headers or event details, so logging it is safe.
 */
export class CalendarError extends Error {
  override readonly name = 'CalendarError';
  readonly retryable: boolean;
  readonly status: number | undefined;
  readonly reason: string | undefined;

  constructor(message: string, options: CalendarErrorOptions) {
    super(message);
    this.retryable = options.retryable;
    this.status = options.status;
    this.reason = options.reason;
  }
}

export function isCalendarError(value: unknown): value is CalendarError {
  return value instanceof CalendarError;
}
