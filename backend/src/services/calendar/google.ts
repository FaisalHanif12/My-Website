/**
 * Google Calendar provider (googleapis 182, Calendar API v3) behind the CalendarProvider
 * contract of ./types.ts.
 *
 * - freeBusy: freebusy.query on GOOGLE_CALENDAR_ID, one retry on network or 5xx errors.
 * - createEvent: events.insert with conferenceDataVersion 1 and sendUpdates "none". The
 *   event id is derived from the booking requestId, so a retried insert cannot create a
 *   second event: Google answers 409 and the existing event is read instead. When a Meet
 *   conference was asked for, the link comes from hangoutLink (or the video entry point);
 *   while the conference is still pending the event is read again a few times.
 * - deleteEvent: events.delete with sendUpdates "none"; an event already gone counts.
 *
 * Every call has an 8 s timeout combined with the caller's signal. Failures become a
 * CalendarError that holds no upstream text, tokens or event details. Logs carry event
 * names, operations, statuses and event ids only: never tokens, secrets, attendee emails
 * or event text.
 */
import { createHash } from 'node:crypto';

import { google } from 'googleapis';
import type { Auth, calendar_v3 } from 'googleapis';

import type { Env } from '../../config/env.js';
import type { Logger } from '../../lib/logger.js';
import type { BusyInterval, CalendarProvider, CreatedEvent, CreateEventInput } from './types.js';
import { CalendarError, isCalendarError } from './types.js';

/**
 * The smallest OAuth scopes the provider needs (confirmed against the Calendar v3 method
 * docs shipped with googleapis 182):
 * - calendar.freebusy: freebusy.query ("see the availability on your calendars");
 * - calendar.events.owned: events.insert, events.get and events.delete on calendars the
 *   account owns. GOOGLE_CALENDAR_ID must therefore be a calendar the owner's account
 *   owns (the default "primary" always is).
 * npm run google:auth (be-13) asks for exactly these.
 */
export const GOOGLE_CALENDAR_SCOPES: readonly string[] = [
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events.owned',
];

/** Time limit of one Google call (the token refresh included). */
export const GOOGLE_CALL_TIMEOUT_MS = 8_000;
/** How often a pending Meet conference is read again, and how long to wait in between. */
export const MEET_POLL_ATTEMPTS = 3;
export const MEET_POLL_DELAY_MS = 700;
/** Wait before the one retry of a failed freebusy or insert call. */
export const RETRY_DELAY_MS = 250;
/** The invalid_grant hint is logged at most once in this window. */
const INVALID_GRANT_HINT_INTERVAL_MS = 10 * 60_000;

export const INVALID_GRANT_HINT =
  'Google refresh token is not valid. Run npm run google:auth and update GOOGLE_REFRESH_TOKEN.';

/** Extra hooks for tests. Production passes none of them. */
export interface GoogleCalendarDeps {
  /** A ready Calendar v3 client (tests pass a stub, so nothing reaches Google). */
  calendar?: calendar_v3.Calendar;
  /**
   * Transport options for the OAuth2 client that is built when `calendar` is not given
   * (tests pass a fetchImplementation so the real client runs without the network).
   */
  transporterOptions?: Auth.OAuth2ClientOptions['transporterOptions'];
  /** Per call time limit in ms (default GOOGLE_CALL_TIMEOUT_MS). */
  timeoutMs?: number;
  /** Wait between reads of a pending conference (default MEET_POLL_DELAY_MS). */
  pollDelayMs?: number;
  /** Wait before a retry (default RETRY_DELAY_MS). */
  retryDelayMs?: number;
  /** Clock for the hint throttle. */
  now?: () => Date;
}

/** The env values the provider reads. */
export type GoogleCalendarEnv = Pick<
  Env,
  'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET' | 'GOOGLE_REFRESH_TOKEN' | 'GOOGLE_CALENDAR_ID'
>;

const BASE32HEX = '0123456789abcdefghijklmnopqrstuv';
const EVENT_ID_PREFIX = 'fh';
const EVENT_ID_HASH_CHARS = 30;

/**
 * The Google event id for a booking: "fh" plus 30 base32hex characters of a SHA-256 of the
 * requestId (32 characters, a-v and 0-9, inside Google's 5 to 1024 rule). The same
 * requestId always gives the same id, which is what makes a retried insert safe.
 * `generation` is only above 0 when an earlier event of the same booking was deleted
 * (Google keeps a deleted id reserved), see createEvent.
 */
export function googleEventIdFor(requestId: string, generation = 0): string {
  const seed = generation === 0 ? requestId : `${requestId}#${generation}`;
  const bytes = createHash('sha256').update(`faisalhanif.work/booking/${seed}`).digest();
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5 && out.length < EVENT_ID_HASH_CHARS) {
      out += BASE32HEX[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
    if (out.length >= EVENT_ID_HASH_CHARS) break;
  }
  return `${EVENT_ID_PREFIX}${out}`;
}

/** Sleeps `ms`, or rejects with an "aborted" CalendarError when the signal fires. */
function pause(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortedError());
      return;
    }
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(abortedError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function abortedError(): CalendarError {
  return new CalendarError('The calendar call was cancelled.', {
    retryable: true,
    reason: 'aborted',
  });
}

function timeoutError(): CalendarError {
  return new CalendarError('The calendar call timed out.', { retryable: true, reason: 'timeout' });
}

/**
 * Runs one Google call with a time limit combined with the caller's signal. The call gets
 * the combined signal; the result is also raced against it, so a hung token refresh (which
 * does not see the signal) still ends on time. Timeouts and cancels become CalendarErrors;
 * other failures are passed on for toCalendarError.
 */
async function withDeadline<T>(
  timeoutMs: number,
  callerSignal: AbortSignal | undefined,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  if (callerSignal?.aborted) throw abortedError();
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onCallerAbort = (): void => {
    controller.abort();
  };
  callerSignal?.addEventListener('abort', onCallerAbort, { once: true });

  try {
    return await new Promise<T>((resolve, reject) => {
      controller.signal.addEventListener('abort', () => reject(new Error('deadline')), {
        once: true,
      });
      run(controller.signal).then(resolve, reject);
    });
  } catch (error) {
    if (timedOut) throw timeoutError();
    if (callerSignal?.aborted) throw abortedError();
    throw error;
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
}

/** Node and fetch error codes that mean the request never got an HTTP answer. */
const NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ECONNABORTED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  'EPIPE',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'UND_ERR_SOCKET',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
]);

/** Google API error reasons that mean "slow down", sent with 403 as well as 429. */
const RATE_LIMIT_REASONS = new Set(['rateLimitExceeded', 'userRateLimitExceeded', 'quotaExceeded']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** The parts of a GaxiosError this file reads (duck typed, so no gaxios import is needed). */
interface UpstreamErrorView {
  status: number | undefined;
  /** OAuth error code from a token endpoint body, such as "invalid_grant". */
  oauthError: string | undefined;
  /** First Google API error reason, such as "rateLimitExceeded". */
  apiReason: string | undefined;
  code: string | undefined;
  name: string | undefined;
  message: string;
  hasResponse: boolean;
  /** Has a request config, so it came from gaxios (GaxiosError keeps the name "Error"). */
  fromGaxios: boolean;
}

function viewError(error: unknown): UpstreamErrorView {
  const record = isRecord(error) ? error : {};
  const response = isRecord(record.response) ? record.response : undefined;
  const data = response && isRecord(response.data) ? response.data : undefined;

  let status: number | undefined;
  if (typeof record.status === 'number') status = record.status;
  else if (response && typeof response.status === 'number') status = response.status;
  else if (typeof record.code === 'number') status = record.code;

  const oauthError = data && typeof data.error === 'string' ? data.error : undefined;
  let apiReason: string | undefined;
  if (data && isRecord(data.error) && Array.isArray(data.error.errors)) {
    const first: unknown = data.error.errors[0];
    if (isRecord(first) && typeof first.reason === 'string') apiReason = first.reason;
  }

  return {
    status,
    oauthError,
    apiReason,
    code: typeof record.code === 'string' ? record.code : undefined,
    name: typeof record.name === 'string' ? record.name : undefined,
    message: error instanceof Error ? error.message : '',
    hasResponse: response !== undefined,
    fromGaxios: isRecord(record.config),
  };
}

function isInvalidGrant(view: UpstreamErrorView): boolean {
  return view.oauthError === 'invalid_grant' || /\binvalid_grant\b/.test(view.message);
}

/**
 * Turns any failure of a Google call into a CalendarError: network, 429 and 5xx are
 * retryable; invalid_grant and other 4xx are not. Only the status and a short fixed reason
 * are kept, never the upstream message, request config or response body.
 */
export function toCalendarError(error: unknown): CalendarError {
  if (isCalendarError(error)) return error;
  const view = viewError(error);

  if (isInvalidGrant(view)) {
    return new CalendarError('The Google refresh token is not valid.', {
      retryable: false,
      status: view.status ?? 400,
      reason: 'invalid_grant',
    });
  }

  const status = view.status;
  if (status !== undefined && status >= 400) {
    if (
      status === 429 ||
      (view.apiReason !== undefined && RATE_LIMIT_REASONS.has(view.apiReason))
    ) {
      return new CalendarError('Google Calendar asked us to slow down.', {
        retryable: true,
        status,
        reason: 'rate_limited',
      });
    }
    if (status >= 500) {
      return new CalendarError('Google Calendar had a server error.', {
        retryable: true,
        status,
        reason: 'server_error',
      });
    }
    const reason =
      status === 401 || status === 403
        ? 'not_allowed'
        : status === 404 || status === 410
          ? 'not_found'
          : status === 409
            ? 'conflict'
            : 'rejected';
    return new CalendarError('Google Calendar rejected the request.', {
      retryable: false,
      status,
      reason,
    });
  }

  if (view.name === 'AbortError' || view.name === 'TimeoutError' || view.code === 'TimeoutError') {
    return timeoutError();
  }
  if (
    (view.code !== undefined && NETWORK_CODES.has(view.code)) ||
    (view.fromGaxios && !view.hasResponse) ||
    error instanceof TypeError
  ) {
    return new CalendarError('Google Calendar could not be reached.', {
      retryable: true,
      reason: 'network',
    });
  }
  return new CalendarError('The Google Calendar call failed.', {
    retryable: false,
    reason: 'unknown',
  });
}

/** Worth one more try right away: the request never got an answer, or Google had a 5xx. */
function shouldRetryOnce(error: CalendarError): boolean {
  return error.reason === 'network' || error.reason === 'server_error';
}

/** How many deterministic ids one booking may use (see createEvent). */
const MAX_ID_GENERATIONS = 3;

type EventResource = calendar_v3.Schema$Event;

/** The Meet link of an event: hangoutLink, else the video entry point of the conference. */
export function meetLinkOf(event: EventResource): string | null {
  if (typeof event.hangoutLink === 'string' && event.hangoutLink.length > 0) {
    return event.hangoutLink;
  }
  const video = event.conferenceData?.entryPoints?.find(
    (entry) =>
      entry.entryPointType === 'video' && typeof entry.uri === 'string' && entry.uri.length > 0,
  );
  return video?.uri ?? null;
}

/** "pending", "success" or "failure" once a conference was asked for, else undefined. */
function conferenceStatusOf(event: EventResource): string | undefined {
  return event.conferenceData?.createRequest?.status?.statusCode ?? undefined;
}

function isValidDate(value: Date): boolean {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** The events.insert body for one booking (id derived from the requestId). */
function buildEventBody(
  input: CreateEventInput,
  eventId: string,
  conferenceRequestId: string,
): EventResource {
  const body: EventResource = {
    id: eventId,
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.start.toISOString(), timeZone: input.timeZone },
    end: { dateTime: input.end.toISOString(), timeZone: input.timeZone },
  };
  if (input.attendee) {
    body.attendees = [{ email: input.attendee.email, displayName: input.attendee.name }];
  }
  if (input.location) body.location = input.location;
  if (input.withGoogleMeet) {
    body.conferenceData = {
      createRequest: {
        requestId: conferenceRequestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }
  return body;
}

/** Freebusy error reasons Google may send per calendar that a retry can fix. */
const RETRYABLE_FREEBUSY_REASONS = new Set(['backendError', 'internalError']);

/**
 * The busy blocks of our calendar in a freebusy response. Errors Google lists for the
 * calendar (for example notFound) become a CalendarError.
 */
function readBusy(data: calendar_v3.Schema$FreeBusyResponse, calendarId: string): BusyInterval[] {
  const calendars = data.calendars ?? {};
  const entries = Object.values(calendars);
  const entry = calendars[calendarId] ?? (entries.length === 1 ? entries[0] : undefined);
  if (!entry) {
    throw new CalendarError('Google Calendar sent no availability for the calendar.', {
      retryable: false,
      reason: 'calendar_missing',
    });
  }

  const firstError = entry.errors?.[0];
  if (firstError) {
    const retryable = RETRYABLE_FREEBUSY_REASONS.has(firstError.reason ?? '');
    throw new CalendarError('Google Calendar could not read the calendar availability.', {
      retryable,
      reason: retryable
        ? 'server_error'
        : firstError.reason === 'notFound'
          ? 'not_found'
          : 'calendar_error',
    });
  }

  const busy: BusyInterval[] = [];
  for (const period of entry.busy ?? []) {
    if (!period.start || !period.end) continue;
    const start = new Date(period.start);
    const end = new Date(period.end);
    if (isValidDate(start) && isValidDate(end) && start < end) busy.push({ start, end });
  }
  return busy.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function buildCalendarClient(
  env: GoogleCalendarEnv,
  transporterOptions: GoogleCalendarDeps['transporterOptions'],
): calendar_v3.Calendar {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
    throw new Error(
      'Google Calendar needs GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN.',
    );
  }
  const auth = new google.auth.OAuth2({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    ...(transporterOptions ? { transporterOptions } : {}),
  });
  auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth });
}

/** Per call request options: our own signal, and no gaxios retries (this file decides). */
interface CallOptions {
  signal: AbortSignal;
  retry: false;
}

/**
 * The Google Calendar provider. OAuth2 client from GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * and GOOGLE_REFRESH_TOKEN; events live on GOOGLE_CALENDAR_ID.
 */
export function createGoogleCalendarProvider(
  env: GoogleCalendarEnv,
  logger: Logger,
  deps: GoogleCalendarDeps = {},
): CalendarProvider {
  const calendar = deps.calendar ?? buildCalendarClient(env, deps.transporterOptions);
  const calendarId = env.GOOGLE_CALENDAR_ID;
  const timeoutMs = deps.timeoutMs ?? GOOGLE_CALL_TIMEOUT_MS;
  const pollDelayMs = deps.pollDelayMs ?? MEET_POLL_DELAY_MS;
  const retryDelayMs = deps.retryDelayMs ?? RETRY_DELAY_MS;
  const now = deps.now ?? (() => new Date());
  const log = logger.child({ module: 'google-calendar' });
  let lastHintAt: number | undefined;

  function noteFailure(op: string, error: CalendarError): void {
    if (error.reason !== 'invalid_grant') return;
    const nowMs = now().getTime();
    if (lastHintAt !== undefined && nowMs - lastHintAt < INVALID_GRANT_HINT_INTERVAL_MS) return;
    lastHintAt = nowMs;
    log.error({ event: 'google_calendar.invalid_grant', op }, INVALID_GRANT_HINT);
  }

  /** One Google call with the deadline; every failure leaves as a CalendarError. */
  async function call<T>(
    op: string,
    signal: AbortSignal | undefined,
    run: (options: CallOptions) => Promise<T>,
  ): Promise<T> {
    try {
      return await withDeadline(timeoutMs, signal, (combined) =>
        run({ signal: combined, retry: false }),
      );
    } catch (error) {
      const mapped = toCalendarError(error);
      noteFailure(op, mapped);
      throw mapped;
    }
  }

  /** Runs `attempt`, and once more after a short wait on a network or 5xx failure. */
  async function withOneRetry<T>(
    op: string,
    signal: AbortSignal | undefined,
    attempt: () => Promise<T>,
  ): Promise<T> {
    try {
      return await attempt();
    } catch (error) {
      if (!isCalendarError(error) || !shouldRetryOnce(error)) throw error;
      log.warn(
        { event: 'google_calendar.retry', op, reason: error.reason, status: error.status },
        'Google Calendar call failed, trying once more',
      );
      await pause(retryDelayMs, signal);
      return attempt();
    }
  }

  function getEvent(eventId: string, signal: AbortSignal | undefined): Promise<EventResource> {
    return call('get', signal, async (options) => {
      const res = await calendar.events.get({ calendarId, eventId }, options);
      return res.data;
    });
  }

  function insertEvent(
    body: EventResource,
    signal: AbortSignal | undefined,
  ): Promise<EventResource> {
    return withOneRetry('insert', signal, () =>
      call('insert', signal, async (options) => {
        const res = await calendar.events.insert(
          { calendarId, conferenceDataVersion: 1, sendUpdates: 'none', requestBody: body },
          options,
        );
        return res.data;
      }),
    );
  }

  /**
   * Inserts the event under the id derived from the requestId. A 409 means an earlier try
   * of this booking already made it, so that event is read and returned. If that event was
   * deleted since (Google keeps the id reserved), the next derived id is used.
   */
  async function insertOrReuse(
    input: CreateEventInput,
    signal: AbortSignal | undefined,
  ): Promise<{ event: EventResource; eventId: string }> {
    for (let generation = 0; generation < MAX_ID_GENERATIONS; generation += 1) {
      const eventId = googleEventIdFor(input.requestId, generation);
      const conferenceRequestId =
        generation === 0 ? input.requestId : `${input.requestId}-${generation}`;
      try {
        const event = await insertEvent(
          buildEventBody(input, eventId, conferenceRequestId),
          signal,
        );
        return { event, eventId };
      } catch (error) {
        if (!isCalendarError(error) || error.status !== 409) throw error;
      }

      let existing: EventResource | undefined;
      try {
        existing = await getEvent(eventId, signal);
      } catch (error) {
        if (!isCalendarError(error) || error.reason !== 'not_found') throw error;
      }
      if (existing && existing.status !== 'cancelled') {
        log.info({ event: 'google_calendar.event_reused', eventId }, 'Event already existed');
        return { event: existing, eventId };
      }
    }
    throw new CalendarError('The calendar event of this booking was deleted.', {
      retryable: false,
      status: 409,
      reason: 'event_cancelled',
    });
  }

  return {
    kind: 'google',

    async freeBusy(from: Date, to: Date, signal?: AbortSignal): Promise<BusyInterval[]> {
      if (!isValidDate(from) || !isValidDate(to) || from >= to) return [];
      const requestBody: calendar_v3.Schema$FreeBusyRequest = {
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: [{ id: calendarId }],
      };
      return withOneRetry('freebusy', signal, () =>
        call('freebusy', signal, async (options) => {
          const res = await calendar.freebusy.query({ requestBody }, options);
          return readBusy(res.data, calendarId);
        }),
      );
    },

    async createEvent(input: CreateEventInput, signal?: AbortSignal): Promise<CreatedEvent> {
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

      let { event, eventId } = await insertOrReuse(input, signal);
      let meetLink: string | null = null;

      if (input.withGoogleMeet) {
        meetLink = meetLinkOf(event);
        for (
          let attempt = 0;
          attempt < MEET_POLL_ATTEMPTS &&
          meetLink === null &&
          conferenceStatusOf(event) === 'pending';
          attempt += 1
        ) {
          await pause(pollDelayMs, signal);
          event = await getEvent(eventId, signal);
          meetLink = meetLinkOf(event);
        }
        if (meetLink === null) {
          log.warn(
            {
              event: 'google_calendar.meet_link_missing',
              eventId,
              conferenceStatus: conferenceStatusOf(event) ?? 'none',
            },
            'The event has no Google Meet link yet',
          );
        }
      }

      eventId = event.id ?? eventId;
      log.info({ event: 'google_calendar.event_created', eventId }, 'Calendar event ready');
      return {
        eventId,
        iCalUID: event.iCalUID ?? `${eventId}@google.com`,
        htmlLink: event.htmlLink ?? null,
        meetLink,
      };
    },

    async deleteEvent(eventId: string): Promise<void> {
      try {
        await call('delete', undefined, async (options) => {
          await calendar.events.delete({ calendarId, eventId, sendUpdates: 'none' }, options);
        });
      } catch (error) {
        if (isCalendarError(error) && error.reason === 'not_found') return;
        throw error;
      }
    },
  };
}
