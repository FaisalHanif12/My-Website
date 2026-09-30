import type { calendar_v3 } from 'googleapis';
import { describe, expect, it, vi } from 'vitest';

import {
  GOOGLE_CALENDAR_SCOPES,
  INVALID_GRANT_HINT,
  createGoogleCalendarProvider,
  googleEventIdFor,
  meetLinkOf,
  toCalendarError,
} from '../../src/services/calendar/google.js';
import type { GoogleCalendarDeps } from '../../src/services/calendar/google.js';
import type { CreateEventInput } from '../../src/services/calendar/types.js';
import { CalendarError } from '../../src/services/calendar/types.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { makeTestEnv } from '../helpers/testEnv.js';

const at = (iso: string): Date => new Date(iso);

/** Dummy secrets: the logs of every test must never contain them. */
const SECRETS = {
  clientId: 'test-client-id.apps.googleusercontent.com',
  clientSecret: 'test-client-secret-value',
  refreshToken: '1//test-refresh-token-value',
  accessToken: 'ya29.test-access-token-value',
};

const ENV = makeTestEnv({
  GOOGLE_CLIENT_ID: SECRETS.clientId,
  GOOGLE_CLIENT_SECRET: SECRETS.clientSecret,
  GOOGLE_REFRESH_TOKEN: SECRETS.refreshToken,
  GOOGLE_CALENDAR_ID: 'primary',
});

const VISITOR_EMAIL = 'visitor@example.com';
const REQUEST_ID = 'bk_7f3a9c2e41d8';
const BASE32HEX_ID = /^[0-9a-v]{5,1024}$/;

function eventInput(overrides: Partial<CreateEventInput> = {}): CreateEventInput {
  return {
    requestId: REQUEST_ID,
    summary: 'Technical Deep Dive (60 min) with Test Visitor',
    description: 'Sessions: 1. Notes: private visitor notes',
    start: at('2026-10-06T05:00:00.000Z'),
    end: at('2026-10-06T06:00:00.000Z'),
    timeZone: 'Asia/Karachi',
    attendee: { email: VISITOR_EMAIL, name: 'Test Visitor' },
    location: null,
    withGoogleMeet: true,
    ...overrides,
  };
}

type ApiFn = (
  params: Record<string, unknown>,
  options: Record<string, unknown>,
) => Promise<unknown>;

/** A Calendar v3 client stub: every method is a vi.fn, nothing reaches Google. */
function stubCalendar() {
  const query = vi.fn<ApiFn>();
  const insert = vi.fn<ApiFn>();
  const get = vi.fn<ApiFn>();
  const remove = vi.fn<ApiFn>();
  const calendar = {
    freebusy: { query },
    events: { insert, get, delete: remove },
  } as unknown as calendar_v3.Calendar;
  return { calendar, query, insert, get, remove };
}

/** A GaxiosError look-alike carrying secrets and personal data, like the real one does. */
function upstreamError(status: number | undefined, data?: unknown, code?: string): Error {
  const error = new Error(
    status === undefined ? `request failed, reason: ${code ?? 'unknown'}` : 'Request failed',
  );
  return Object.assign(error, {
    ...(status === undefined ? {} : { status, response: { status, data } }),
    ...(code === undefined ? {} : { code }),
    config: {
      headers: { Authorization: `Bearer ${SECRETS.accessToken}` },
      data: { attendees: [{ email: VISITOR_EMAIL }], refresh_token: SECRETS.refreshToken },
    },
  });
}

function apiError(status: number, reason = 'failed'): Error {
  return upstreamError(status, {
    error: { code: status, message: `upstream text ${VISITOR_EMAIL}`, errors: [{ reason }] },
  });
}

function makeProvider(deps: GoogleCalendarDeps = {}) {
  const capture = createCapturingLogger();
  const stub = stubCalendar();
  const provider = createGoogleCalendarProvider(ENV, capture.logger, {
    calendar: stub.calendar,
    timeoutMs: 200,
    pollDelayMs: 1,
    retryDelayMs: 1,
    ...deps,
  });
  return { provider, capture, ...stub };
}

function freeBusyData(
  busy: { start: string; end: string }[],
  key = 'primary',
): { data: calendar_v3.Schema$FreeBusyResponse } {
  return { data: { calendars: { [key]: { busy } } } };
}

function expectCleanLogs(text: string): void {
  for (const secret of Object.values(SECRETS)) expect(text).not.toContain(secret);
  expect(text).not.toContain(VISITOR_EMAIL);
  expect(text).not.toContain('Test Visitor');
  expect(text).not.toContain('private visitor notes');
}

describe('GOOGLE_CALENDAR_SCOPES', () => {
  it('asks only for freebusy and owned events', () => {
    expect(GOOGLE_CALENDAR_SCOPES).toEqual([
      'https://www.googleapis.com/auth/calendar.freebusy',
      'https://www.googleapis.com/auth/calendar.events.owned',
    ]);
  });
});

describe('googleEventIdFor', () => {
  it('is a stable base32hex id that Google accepts', () => {
    const id = googleEventIdFor(REQUEST_ID);
    expect(id).toMatch(BASE32HEX_ID);
    expect(id).toHaveLength(32);
    expect(googleEventIdFor(REQUEST_ID)).toBe(id);
    expect(googleEventIdFor('FH-UPPER_case.and-symbols!')).toMatch(BASE32HEX_ID);
  });

  it('differs between bookings and between generations', () => {
    const ids = new Set([
      googleEventIdFor(REQUEST_ID),
      googleEventIdFor('bk_other'),
      googleEventIdFor(REQUEST_ID, 1),
      googleEventIdFor(REQUEST_ID, 2),
    ]);
    expect(ids.size).toBe(4);
  });
});

describe('meetLinkOf', () => {
  it('prefers hangoutLink and falls back to the video entry point', () => {
    expect(meetLinkOf({ hangoutLink: 'https://meet.google.com/abc-defg-hij' })).toBe(
      'https://meet.google.com/abc-defg-hij',
    );
    expect(
      meetLinkOf({
        conferenceData: {
          entryPoints: [
            { entryPointType: 'phone', uri: 'tel:+1-555-0100' },
            { entryPointType: 'video', uri: 'https://meet.google.com/xyz-abcd-efg' },
          ],
        },
      }),
    ).toBe('https://meet.google.com/xyz-abcd-efg');
    expect(meetLinkOf({})).toBeNull();
  });
});

describe('toCalendarError', () => {
  it('maps statuses to retryable flags and fixed reasons without upstream text', () => {
    const cases: [Error, boolean, string, number | undefined][] = [
      [apiError(500), true, 'server_error', 500],
      [apiError(503), true, 'server_error', 503],
      [apiError(429), true, 'rate_limited', 429],
      [apiError(403, 'rateLimitExceeded'), true, 'rate_limited', 403],
      [apiError(403, 'forbidden'), false, 'not_allowed', 403],
      [apiError(401), false, 'not_allowed', 401],
      [apiError(404), false, 'not_found', 404],
      [apiError(410), false, 'not_found', 410],
      [apiError(409, 'duplicate'), false, 'conflict', 409],
      [apiError(400), false, 'rejected', 400],
      [upstreamError(undefined, undefined, 'ECONNRESET'), true, 'network', undefined],
      [upstreamError(undefined), true, 'network', undefined],
    ];
    for (const [error, retryable, reason, status] of cases) {
      const mapped = toCalendarError(error);
      expect(mapped).toBeInstanceOf(CalendarError);
      expect(mapped).toMatchObject({ retryable, reason, status });
      expect(mapped.message).not.toContain(VISITOR_EMAIL);
      expect(Object.keys(mapped)).not.toContain('cause');
    }
  });

  it('treats invalid_grant as not retryable', () => {
    const mapped = toCalendarError(
      upstreamError(400, { error: 'invalid_grant', error_description: 'Token has been revoked.' }),
    );
    expect(mapped).toMatchObject({ retryable: false, reason: 'invalid_grant', status: 400 });
    expect(toCalendarError(new Error('invalid_grant'))).toMatchObject({ reason: 'invalid_grant' });
  });

  it('keeps a CalendarError and marks unknown failures as not retryable', () => {
    const own = new CalendarError('x', { retryable: true, reason: 'timeout' });
    expect(toCalendarError(own)).toBe(own);
    expect(toCalendarError(new RangeError('bug'))).toMatchObject({
      retryable: false,
      reason: 'unknown',
    });
    expect(toCalendarError(new TypeError('fetch failed'))).toMatchObject({ reason: 'network' });
  });
});

describe('freeBusy', () => {
  const FROM = at('2026-10-06T04:00:00.000Z');
  const TO = at('2026-10-06T13:00:00.000Z');

  it('queries the calendar and maps the busy blocks to sorted dates', async () => {
    const { provider, query } = makeProvider();
    query.mockResolvedValueOnce(
      freeBusyData([
        { start: '2026-10-06T09:00:00Z', end: '2026-10-06T10:00:00Z' },
        { start: '2026-10-06T05:00:00Z', end: '2026-10-06T05:30:00Z' },
        { start: 'not a date', end: '2026-10-06T06:00:00Z' },
      ]),
    );

    const busy = await provider.freeBusy(FROM, TO);

    expect(provider.kind).toBe('google');
    expect(busy).toEqual([
      { start: at('2026-10-06T05:00:00Z'), end: at('2026-10-06T05:30:00Z') },
      { start: at('2026-10-06T09:00:00Z'), end: at('2026-10-06T10:00:00Z') },
    ]);
    expect(query).toHaveBeenCalledTimes(1);
    const [params, options] = query.mock.calls[0] ?? [];
    expect(params).toEqual({
      requestBody: {
        timeMin: '2026-10-06T04:00:00.000Z',
        timeMax: '2026-10-06T13:00:00.000Z',
        items: [{ id: 'primary' }],
      },
    });
    expect(options?.retry).toBe(false);
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it('reads the only calendar entry when Google keys it by the real id', async () => {
    const { provider, query } = makeProvider();
    query.mockResolvedValueOnce(
      freeBusyData([{ start: '2026-10-06T05:00:00Z', end: '2026-10-06T06:00:00Z' }], 'owner@x.io'),
    );
    await expect(provider.freeBusy(FROM, TO)).resolves.toHaveLength(1);
  });

  it('makes no call for an empty or invalid range', async () => {
    const { provider, query } = makeProvider();
    await expect(provider.freeBusy(TO, FROM)).resolves.toEqual([]);
    await expect(provider.freeBusy(new Date(Number.NaN), TO)).resolves.toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });

  it('turns an error listed for the calendar into a CalendarError', async () => {
    const { provider, query } = makeProvider();
    query.mockResolvedValue({
      data: { calendars: { primary: { errors: [{ domain: 'global', reason: 'notFound' }] } } },
    });
    await expect(provider.freeBusy(FROM, TO)).rejects.toMatchObject({
      name: 'CalendarError',
      retryable: false,
      reason: 'not_found',
    });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('retries once when Google lists a backend error for the calendar', async () => {
    const { provider, query } = makeProvider();
    query
      .mockResolvedValueOnce({
        data: { calendars: { primary: { errors: [{ reason: 'backendError' }] } } },
      })
      .mockResolvedValueOnce(freeBusyData([]));
    await expect(provider.freeBusy(FROM, TO)).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('retries once on a 5xx or a network error, then gives up', async () => {
    const first = makeProvider();
    first.query.mockRejectedValueOnce(apiError(503)).mockResolvedValueOnce(freeBusyData([]));
    await expect(first.provider.freeBusy(FROM, TO)).resolves.toEqual([]);
    expect(first.query).toHaveBeenCalledTimes(2);

    const second = makeProvider();
    second.query
      .mockRejectedValueOnce(upstreamError(undefined, undefined, 'ECONNRESET'))
      .mockRejectedValueOnce(apiError(502));
    await expect(second.provider.freeBusy(FROM, TO)).rejects.toMatchObject({
      retryable: true,
      reason: 'server_error',
      status: 502,
    });
    expect(second.query).toHaveBeenCalledTimes(2);
    expectCleanLogs(second.capture.text());
  });

  it('does not retry a 4xx or a 429', async () => {
    const { provider, query } = makeProvider();
    query.mockRejectedValueOnce(apiError(400)).mockRejectedValueOnce(apiError(429));
    await expect(provider.freeBusy(FROM, TO)).rejects.toMatchObject({ retryable: false });
    await expect(provider.freeBusy(FROM, TO)).rejects.toMatchObject({
      retryable: true,
      reason: 'rate_limited',
    });
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('times out a call that hangs and aborts its signal', async () => {
    const { provider, query } = makeProvider({ timeoutMs: 20 });
    let seen: AbortSignal | undefined;
    query.mockImplementation((_params, options) => {
      seen = options.signal as AbortSignal;
      return new Promise(() => undefined);
    });
    await expect(provider.freeBusy(FROM, TO)).rejects.toMatchObject({
      retryable: true,
      reason: 'timeout',
    });
    expect(seen?.aborted).toBe(true);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('follows the caller signal', async () => {
    const { provider, query } = makeProvider({ timeoutMs: 5_000 });
    await expect(provider.freeBusy(FROM, TO, AbortSignal.abort())).rejects.toMatchObject({
      reason: 'aborted',
    });
    expect(query).not.toHaveBeenCalled();

    const controller = new AbortController();
    query.mockImplementation(() => new Promise(() => undefined));
    const pending = provider.freeBusy(FROM, TO, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ retryable: true, reason: 'aborted' });
  });
});

const MEET_LINK = 'https://meet.google.com/abc-defg-hij';

function googleEvent(overrides: Partial<calendar_v3.Schema$Event> = {}): {
  data: calendar_v3.Schema$Event;
} {
  const id = googleEventIdFor(REQUEST_ID);
  return {
    data: {
      id,
      iCalUID: `${id}@google.com`,
      htmlLink: `https://www.google.com/calendar/event?eid=${id}`,
      status: 'confirmed',
      hangoutLink: MEET_LINK,
      conferenceData: { createRequest: { status: { statusCode: 'success' } } },
      ...overrides,
    },
  };
}

const PENDING: Partial<calendar_v3.Schema$Event> = {
  hangoutLink: null,
  conferenceData: { createRequest: { status: { statusCode: 'pending' } } },
};

describe('createEvent', () => {
  it('inserts one event with a Meet conference, the booking requestId and a stable id', async () => {
    const { provider, insert, get, capture } = makeProvider();
    insert.mockResolvedValueOnce(googleEvent());

    const created = await provider.createEvent(eventInput());

    const eventId = googleEventIdFor(REQUEST_ID);
    expect(created).toEqual({
      eventId,
      iCalUID: `${eventId}@google.com`,
      htmlLink: `https://www.google.com/calendar/event?eid=${eventId}`,
      meetLink: MEET_LINK,
    });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(get).not.toHaveBeenCalled();
    const [params, options] = insert.mock.calls[0] ?? [];
    expect(params).toEqual({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'none',
      requestBody: {
        id: eventId,
        summary: 'Technical Deep Dive (60 min) with Test Visitor',
        description: 'Sessions: 1. Notes: private visitor notes',
        start: { dateTime: '2026-10-06T05:00:00.000Z', timeZone: 'Asia/Karachi' },
        end: { dateTime: '2026-10-06T06:00:00.000Z', timeZone: 'Asia/Karachi' },
        attendees: [{ email: VISITOR_EMAIL, displayName: 'Test Visitor' }],
        conferenceData: {
          createRequest: {
            requestId: REQUEST_ID,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });
    expect(eventId).toMatch(BASE32HEX_ID);
    expect(options?.retry).toBe(false);
    expectCleanLogs(capture.text());
  });

  it('adds no conference when none is asked for, sets the location and never returns a Meet link', async () => {
    const { provider, insert } = makeProvider();
    // Google may still attach a Meet link when the owner auto adds one to new events.
    insert.mockResolvedValueOnce(googleEvent());

    const created = await provider.createEvent(
      eventInput({ withGoogleMeet: false, location: 'https://meet.example.test/room-123' }),
    );

    expect(created.meetLink).toBeNull();
    const body = insert.mock.calls[0]?.[0].requestBody as calendar_v3.Schema$Event;
    expect(body.conferenceData).toBeUndefined();
    expect(body.location).toBe('https://meet.example.test/room-123');
  });

  it('reads the link from the video entry point when hangoutLink is missing', async () => {
    const { provider, insert } = makeProvider();
    insert.mockResolvedValueOnce(
      googleEvent({
        hangoutLink: null,
        conferenceData: {
          createRequest: { status: { statusCode: 'success' } },
          entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/vid-eoen-try' }],
        },
      }),
    );
    await expect(provider.createEvent(eventInput())).resolves.toMatchObject({
      meetLink: 'https://meet.google.com/vid-eoen-try',
    });
  });

  it('reads a pending conference again until the link is there', async () => {
    const { provider, insert, get } = makeProvider();
    insert.mockResolvedValueOnce(googleEvent(PENDING));
    get.mockResolvedValueOnce(googleEvent(PENDING)).mockResolvedValueOnce(googleEvent());

    const created = await provider.createEvent(eventInput());

    expect(created.meetLink).toBe(MEET_LINK);
    expect(get).toHaveBeenCalledTimes(2);
    expect(get.mock.calls[0]?.[0]).toEqual({
      calendarId: 'primary',
      eventId: googleEventIdFor(REQUEST_ID),
    });
  });

  it('stops after 3 reads and returns a null link with a warning', async () => {
    const { provider, insert, get, capture } = makeProvider();
    insert.mockResolvedValueOnce(googleEvent(PENDING));
    get.mockResolvedValue(googleEvent(PENDING));

    const created = await provider.createEvent(eventInput());

    expect(created.meetLink).toBeNull();
    expect(get).toHaveBeenCalledTimes(3);
    const warning = capture
      .lines()
      .find((line) => line.event === 'google_calendar.meet_link_missing');
    expect(warning).toMatchObject({ conferenceStatus: 'pending' });
    expectCleanLogs(capture.text());
  });

  it('returns the existing event on a 409, so one booking never makes two events', async () => {
    const { provider, insert, get } = makeProvider();
    insert.mockRejectedValueOnce(apiError(409, 'duplicate'));
    get.mockResolvedValueOnce(googleEvent());

    const created = await provider.createEvent(eventInput());

    expect(created.eventId).toBe(googleEventIdFor(REQUEST_ID));
    expect(created.meetLink).toBe(MEET_LINK);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0]?.[0]).toEqual({
      calendarId: 'primary',
      eventId: googleEventIdFor(REQUEST_ID),
    });
  });

  it('retries an insert after a network error and reuses the event the first try made', async () => {
    const { provider, insert, get } = makeProvider();
    insert
      .mockRejectedValueOnce(upstreamError(undefined, undefined, 'ECONNRESET'))
      .mockRejectedValueOnce(apiError(409, 'duplicate'));
    get.mockResolvedValueOnce(googleEvent());

    const created = await provider.createEvent(eventInput());

    expect(created.meetLink).toBe(MEET_LINK);
    expect(insert).toHaveBeenCalledTimes(2);
    const ids = insert.mock.calls.map(
      ([params]) => (params.requestBody as calendar_v3.Schema$Event).id,
    );
    expect(new Set(ids).size).toBe(1);
  });

  it('uses the next derived id when the earlier event of the booking was deleted', async () => {
    const { provider, insert, get } = makeProvider();
    const nextId = googleEventIdFor(REQUEST_ID, 1);
    insert
      .mockRejectedValueOnce(apiError(409, 'duplicate'))
      .mockResolvedValueOnce(googleEvent({ id: nextId, iCalUID: `${nextId}@google.com` }));
    get.mockResolvedValueOnce(googleEvent({ status: 'cancelled' }));

    const created = await provider.createEvent(eventInput());

    expect(created.eventId).toBe(nextId);
    const second = insert.mock.calls[1]?.[0].requestBody as calendar_v3.Schema$Event;
    expect(second.id).toBe(nextId);
    expect(second.conferenceData?.createRequest?.requestId).toBe(`${REQUEST_ID}-1`);
  });

  it('does not retry a 4xx insert and rejects invalid details without a call', async () => {
    const { provider, insert } = makeProvider();
    insert.mockRejectedValueOnce(apiError(400));
    await expect(provider.createEvent(eventInput())).rejects.toMatchObject({
      retryable: false,
      status: 400,
    });
    expect(insert).toHaveBeenCalledTimes(1);

    await expect(
      provider.createEvent(eventInput({ end: at('2026-10-06T05:00:00.000Z') })),
    ).rejects.toMatchObject({ reason: 'invalid_event', retryable: false });
    expect(insert).toHaveBeenCalledTimes(1);
  });
});

describe('deleteEvent', () => {
  it('deletes without Google emails and counts a missing event as done', async () => {
    const { provider, remove } = makeProvider();
    remove
      .mockResolvedValueOnce({ data: undefined })
      .mockRejectedValueOnce(apiError(404, 'notFound'))
      .mockRejectedValueOnce(apiError(410, 'deleted'));

    await provider.deleteEvent('fhabc123');
    await provider.deleteEvent('fhabc123');
    await provider.deleteEvent('fhabc123');

    expect(remove.mock.calls[0]?.[0]).toEqual({
      calendarId: 'primary',
      eventId: 'fhabc123',
      sendUpdates: 'none',
    });
  });

  it('passes other failures on as a CalendarError', async () => {
    const { provider, remove } = makeProvider();
    remove.mockRejectedValueOnce(apiError(500));
    await expect(provider.deleteEvent('fhabc123')).rejects.toMatchObject({
      name: 'CalendarError',
      retryable: true,
    });
  });
});

describe('invalid_grant', () => {
  it('is not retryable, logs one clear hint and never logs a secret', async () => {
    const { provider, query, capture } = makeProvider();
    query.mockRejectedValue(
      upstreamError(400, { error: 'invalid_grant', error_description: 'Token has been revoked.' }),
    );

    const FROM = at('2026-10-06T04:00:00.000Z');
    const TO = at('2026-10-06T13:00:00.000Z');
    await expect(provider.freeBusy(FROM, TO)).rejects.toMatchObject({
      retryable: false,
      reason: 'invalid_grant',
    });
    await expect(provider.freeBusy(FROM, TO)).rejects.toMatchObject({ reason: 'invalid_grant' });

    expect(query).toHaveBeenCalledTimes(2);
    const hints = capture.lines().filter((line) => line.msg === INVALID_GRANT_HINT);
    expect(hints).toHaveLength(1);
    expect(hints[0]).toMatchObject({ event: 'google_calendar.invalid_grant', op: 'freebusy' });
    expectCleanLogs(capture.text());
    expect(capture.text()).not.toContain('Token has been revoked');
  });
});

describe('the real googleapis client with a mocked transport', () => {
  const TOKEN_URL = 'https://oauth2.googleapis.com/token';
  const API_PREFIX = 'https://www.googleapis.com/calendar/v3/';

  function json(status: number, data: unknown): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  interface SeenRequest {
    url: URL;
    method: string;
    headers: Headers;
    body: string;
  }

  /** Answers the token and Calendar endpoints only; anything else fails the test. */
  function mockTransport(tokenAnswer: () => Response, apiAnswer: (req: SeenRequest) => Response) {
    const seen: SeenRequest[] = [];
    const fetchImplementation = vi.fn<typeof fetch>((input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      const body = init?.body;
      const req: SeenRequest = {
        url,
        method: init?.method ?? 'GET',
        headers: new Headers(init?.headers),
        body:
          typeof body === 'string' ? body : body instanceof URLSearchParams ? body.toString() : '',
      };
      seen.push(req);
      if (url.href.startsWith(TOKEN_URL)) return Promise.resolve(tokenAnswer());
      if (url.href.startsWith(API_PREFIX)) return Promise.resolve(apiAnswer(req));
      return Promise.reject(new Error(`Unexpected request to ${url.host}`));
    });
    return { fetchImplementation, seen };
  }

  it('refreshes the token and sends the insert with the right query and body', async () => {
    const capture = createCapturingLogger();
    const { fetchImplementation, seen } = mockTransport(
      () =>
        json(200, { access_token: SECRETS.accessToken, expires_in: 3599, token_type: 'Bearer' }),
      () => json(200, googleEvent().data),
    );
    const provider = createGoogleCalendarProvider(ENV, capture.logger, {
      transporterOptions: { fetchImplementation },
    });

    const created = await provider.createEvent(eventInput());

    expect(created.meetLink).toBe(MEET_LINK);
    const insert = seen.find((req) => req.url.href.startsWith(API_PREFIX));
    expect(insert?.method).toBe('POST');
    expect(insert?.url.pathname).toBe('/calendar/v3/calendars/primary/events');
    expect(insert?.url.searchParams.get('conferenceDataVersion')).toBe('1');
    expect(insert?.url.searchParams.get('sendUpdates')).toBe('none');
    expect(insert?.headers.get('authorization')).toBe(`Bearer ${SECRETS.accessToken}`);
    const body = JSON.parse(insert?.body ?? '{}') as calendar_v3.Schema$Event;
    expect(body.id).toBe(googleEventIdFor(REQUEST_ID));
    expect(body.conferenceData?.createRequest?.conferenceSolutionKey?.type).toBe('hangoutsMeet');
    expect(seen.every((req) => req.url.protocol === 'https:')).toBe(true);
    expectCleanLogs(capture.text());
  });

  it('maps a refused refresh token to invalid_grant with the hint', async () => {
    const capture = createCapturingLogger();
    const { fetchImplementation, seen } = mockTransport(
      () =>
        json(400, {
          error: 'invalid_grant',
          error_description: 'Token has been expired or revoked.',
        }),
      () => json(500, {}),
    );
    const provider = createGoogleCalendarProvider(ENV, capture.logger, {
      transporterOptions: { fetchImplementation },
    });

    await expect(
      provider.freeBusy(at('2026-10-06T04:00:00.000Z'), at('2026-10-06T13:00:00.000Z')),
    ).rejects.toMatchObject({ name: 'CalendarError', retryable: false, reason: 'invalid_grant' });

    expect(seen.every((req) => req.url.href.startsWith(TOKEN_URL))).toBe(true);
    expect(capture.lines().some((line) => line.msg === INVALID_GRANT_HINT)).toBe(true);
    expectCleanLogs(capture.text());
    expect(capture.text()).not.toContain('expired or revoked');
  });

  it('needs the three Google secrets when no client is given', () => {
    const capture = createCapturingLogger();
    expect(() =>
      createGoogleCalendarProvider(
        makeTestEnv({ GOOGLE_CLIENT_ID: undefined, GOOGLE_REFRESH_TOKEN: undefined }),
        capture.logger,
      ),
    ).toThrow(/GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN/);
  });
});
