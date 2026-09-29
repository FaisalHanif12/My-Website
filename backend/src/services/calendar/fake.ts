/**
 * In-memory calendar for dev:fake (DEV_FAKE_EXTERNALS=true) and tests. It never touches the
 * network. It behaves like the Google provider where the booking depends on it:
 * - freeBusy returns the events (and extra busy blocks) that overlap the asked range;
 * - createEvent with a requestId it has seen returns that same event, like Google does for
 *   a retried insert;
 * - a Meet link is attached only when withGoogleMeet is set, and it is clearly fake
 *   (https://meet.google.com/dev-fake-...).
 */
import { createHash } from 'node:crypto';

import type { BusyInterval, CalendarProvider, CreatedEvent, CreateEventInput } from './types.js';
import { CalendarError } from './types.js';

export const FAKE_MEET_LINK_PREFIX = 'https://meet.google.com/dev-fake-';
export const FAKE_ICAL_DOMAIN = 'dev-fake.faisalhanif.work';

/** Operations failNext can make fail. */
export type FakeCalendarOp = 'freeBusy' | 'createEvent' | 'deleteEvent';

/** An event held by the fake: the input it was made from plus what createEvent returned. */
export interface FakeCalendarEvent extends CreatedEvent {
  requestId: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  timeZone: string;
  attendee: { email: string; name: string } | null;
  location: string | null;
  withGoogleMeet: boolean;
  createdAt: Date;
}

export interface FakeCalendar extends CalendarProvider {
  readonly kind: 'fake';
  /** Copies of the events currently on the calendar, in creation order. */
  readonly events: readonly FakeCalendarEvent[];
  /** Copies of the extra busy blocks added with addBusy. */
  readonly busy: readonly BusyInterval[];
  /** Marks [start, end) busy without creating an event (another meeting of the owner). */
  addBusy(start: Date, end: Date): void;
  /** The next call of `op` throws a CalendarError with this `retryable` flag (queued). */
  failNext(op: FakeCalendarOp, retryable?: boolean): void;
  /** Removes every event, busy block and queued failure. */
  reset(): void;
}

export interface FakeCalendarOptions {
  /** Clock for createdAt (tests pass a fixed one). */
  now?: () => Date;
}

const BASE32HEX = '0123456789abcdefghijklmnopqrstuv';

/** Stable short id in Google's event id alphabet (base32hex, lower case). */
function shortId(seed: string, length: number): string {
  const bytes = createHash('sha256').update(seed).digest();
  let out = '';
  for (let i = 0; i < length; i += 1) out += BASE32HEX[(bytes[i] ?? 0) % 32];
  return out;
}

function copyInterval(interval: BusyInterval): BusyInterval {
  return { start: new Date(interval.start), end: new Date(interval.end) };
}

function copyEvent(event: FakeCalendarEvent): FakeCalendarEvent {
  return {
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
    attendee: event.attendee ? { ...event.attendee } : null,
    createdAt: new Date(event.createdAt),
  };
}

function toCreated(event: FakeCalendarEvent): CreatedEvent {
  return {
    eventId: event.eventId,
    iCalUID: event.iCalUID,
    htmlLink: event.htmlLink,
    meetLink: event.meetLink,
  };
}

function isValidDate(value: Date): boolean {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** Runs `work` and turns a throw into a rejected promise, like a real async provider. */
function settle<T>(work: () => T): Promise<T> {
  return new Promise<T>((resolve) => {
    resolve(work());
  });
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw new CalendarError('The calendar call was cancelled.', {
      retryable: true,
      reason: 'aborted',
    });
  }
}

export function createFakeCalendar(options: FakeCalendarOptions = {}): FakeCalendar {
  const now = options.now ?? (() => new Date());
  const events: FakeCalendarEvent[] = [];
  const busy: BusyInterval[] = [];
  const failures: Record<FakeCalendarOp, boolean[]> = {
    freeBusy: [],
    createEvent: [],
    deleteEvent: [],
  };
  let sequence = 0;

  function maybeFail(op: FakeCalendarOp): void {
    const retryable = failures[op].shift();
    if (retryable === undefined) return;
    throw new CalendarError('The fake calendar failed on purpose.', {
      retryable,
      status: retryable ? 503 : 400,
      reason: 'fake_failure',
    });
  }

  return {
    kind: 'fake',

    get events(): readonly FakeCalendarEvent[] {
      return events.map(copyEvent);
    },

    get busy(): readonly BusyInterval[] {
      return busy.map(copyInterval);
    },

    addBusy(start: Date, end: Date): void {
      if (!isValidDate(start) || !isValidDate(end) || start >= end) {
        throw new RangeError('addBusy needs a valid start before a valid end');
      }
      busy.push({ start: new Date(start), end: new Date(end) });
    },

    failNext(op: FakeCalendarOp, retryable = true): void {
      failures[op].push(retryable);
    },

    reset(): void {
      events.length = 0;
      busy.length = 0;
      failures.freeBusy.length = 0;
      failures.createEvent.length = 0;
      failures.deleteEvent.length = 0;
      sequence = 0;
    },

    freeBusy(from: Date, to: Date, signal?: AbortSignal): Promise<BusyInterval[]> {
      return settle(() => {
        throwIfAborted(signal);
        maybeFail('freeBusy');
        if (!isValidDate(from) || !isValidDate(to) || from >= to) return [];
        const fromMs = from.getTime();
        const toMs = to.getTime();
        return [...events, ...busy]
          .filter((block) => block.start.getTime() < toMs && fromMs < block.end.getTime())
          .map(copyInterval)
          .sort((a, b) => a.start.getTime() - b.start.getTime());
      });
    },

    createEvent(input: CreateEventInput, signal?: AbortSignal): Promise<CreatedEvent> {
      return settle(() => {
        throwIfAborted(signal);
        maybeFail('createEvent');
        if (
          input.requestId.length === 0 ||
          !isValidDate(input.start) ||
          !isValidDate(input.end) ||
          input.start >= input.end
        ) {
          throw new CalendarError('The event details are not valid.', {
            retryable: false,
            status: 400,
            reason: 'invalid_event',
          });
        }

        const existing = events.find((event) => event.requestId === input.requestId);
        if (existing) return toCreated(existing);

        sequence += 1;
        const eventId = shortId(`${input.requestId}:${sequence}`, 20);
        const event: FakeCalendarEvent = {
          eventId,
          iCalUID: `${eventId}@${FAKE_ICAL_DOMAIN}`,
          htmlLink: `https://calendar.google.com/calendar/event?eid=dev-fake-${eventId}`,
          meetLink: input.withGoogleMeet ? `${FAKE_MEET_LINK_PREFIX}${eventId.slice(0, 10)}` : null,
          requestId: input.requestId,
          summary: input.summary,
          description: input.description,
          start: new Date(input.start),
          end: new Date(input.end),
          timeZone: input.timeZone,
          attendee: input.attendee ? { ...input.attendee } : null,
          location: input.location,
          withGoogleMeet: input.withGoogleMeet,
          createdAt: now(),
        };
        events.push(event);
        return toCreated(event);
      });
    },

    deleteEvent(eventId: string): Promise<void> {
      return settle(() => {
        maybeFail('deleteEvent');
        const index = events.findIndex((event) => event.eventId === eventId);
        if (index >= 0) events.splice(index, 1);
      });
    },
  };
}

let devFakeCalendar: FakeCalendar | undefined;

/**
 * The process wide fake calendar for dev:fake, so the booking info routes and the booking
 * route see the same events.
 */
export function getDevFakeCalendar(): FakeCalendar {
  devFakeCalendar ??= createFakeCalendar();
  return devFakeCalendar;
}
