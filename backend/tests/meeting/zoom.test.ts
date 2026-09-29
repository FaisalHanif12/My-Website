import { describe, expect, it, vi } from 'vitest';

import type { MeetingPlanInput } from '../../src/services/meeting/types.js';
import { MeetingError } from '../../src/services/meeting/types.js';
import {
  ZOOM_MEETINGS_URL,
  ZOOM_TOKEN_URL,
  buildZoomMeetingRequest,
  createZoomProvider,
  toZoomTime,
} from '../../src/services/meeting/zoom.js';
import type { FetchLike, ZoomDeps } from '../../src/services/meeting/zoom.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { makeTestEnv } from '../helpers/testEnv.js';

/** Dummy secrets: the logs must never contain them. */
const SECRETS = {
  accountId: 'test-zoom-account-id',
  clientId: 'test-zoom-client-id',
  clientSecret: 'test-zoom-client-secret',
  accessToken: 'test-zoom-access-token-1',
  accessToken2: 'test-zoom-access-token-2',
};
const JOIN_URL = 'https://us05web.zoom.us/j/81234567890?pwd=secretpass';
const TOPIC = 'Technical Deep Dive (60 min) with Test Visitor';

const ZOOM_ENV = makeTestEnv({
  ZOOM_ACCOUNT_ID: SECRETS.accountId,
  ZOOM_CLIENT_ID: SECRETS.clientId,
  ZOOM_CLIENT_SECRET: SECRETS.clientSecret,
});

const T0 = new Date('2026-10-05T06:00:00.000Z');

function planInput(overrides: Partial<MeetingPlanInput> = {}): MeetingPlanInput {
  return {
    bookingId: 'bk_7f3a9c2e41d8',
    topic: TOPIC,
    start: new Date('2026-10-06T05:00:00.000Z'),
    durationMinutes: 60,
    timeZone: 'Asia/Karachi',
    ...overrides,
  };
}

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function tokenResponse(token = SECRETS.accessToken, expiresIn = 3600): Response {
  return json(200, { access_token: token, token_type: 'bearer', expires_in: expiresIn });
}

function meetingResponse(): Response {
  return json(201, { id: 81234567890, join_url: JOIN_URL, start_url: 'https://zoom.us/s/1' });
}

interface Harness {
  provider: ReturnType<typeof createZoomProvider>;
  fetch: ReturnType<typeof vi.fn<FetchLike>>;
  clock: { now: Date };
  capture: ReturnType<typeof createCapturingLogger>;
  urls: () => string[];
}

/** A Zoom provider with a mocked fetch that answers from the two queues. */
function harness(
  answers: { token?: (() => Response)[]; meeting?: (() => Response)[] } = {},
  deps: ZoomDeps = {},
  env = ZOOM_ENV,
): Harness {
  const tokenQueue = [...(answers.token ?? [() => tokenResponse()])];
  const meetingQueue = [...(answers.meeting ?? [meetingResponse, meetingResponse])];
  const clock = { now: T0 };
  const fetch = vi.fn<FetchLike>((url) => {
    const queue =
      url === ZOOM_TOKEN_URL ? tokenQueue : url === ZOOM_MEETINGS_URL ? meetingQueue : [];
    const next = queue.shift();
    return next ? Promise.resolve(next()) : Promise.reject(new Error(`Unexpected call to ${url}`));
  });
  const capture = createCapturingLogger();
  const provider = createZoomProvider(env, capture.logger, {
    fetch,
    now: () => clock.now,
    ...deps,
  });
  return { provider, fetch, clock, capture, urls: () => fetch.mock.calls.map(([url]) => url) };
}

/** The string body a mocked fetch call was sent with. */
function bodyText(init: RequestInit | undefined): string {
  const body = init?.body;
  if (typeof body !== 'string') throw new Error('Expected a string body');
  return body;
}

function expectCleanLogs(text: string): void {
  for (const secret of Object.values(SECRETS)) expect(text).not.toContain(secret);
  expect(text).not.toContain(JOIN_URL);
  expect(text).not.toContain('Test Visitor');
}

describe('buildZoomMeetingRequest', () => {
  it('builds a scheduled meeting in UTC with the waiting room on', () => {
    expect(toZoomTime(new Date('2026-10-06T05:00:00.000Z'))).toBe('2026-10-06T05:00:00Z');
    expect(buildZoomMeetingRequest(planInput())).toEqual({
      topic: TOPIC,
      type: 2,
      start_time: '2026-10-06T05:00:00Z',
      duration: 60,
      timezone: 'Asia/Karachi',
      settings: { join_before_host: false, waiting_room: true },
    });
    expect(buildZoomMeetingRequest(planInput({ topic: 'x'.repeat(300) })).topic).toHaveLength(200);
  });
});

describe('createZoomProvider without Zoom env', () => {
  it('is not configured and plans a pending link without any call', async () => {
    const { provider, fetch } = harness({}, {}, makeTestEnv());
    expect(provider.platform).toBe('Zoom');
    expect(provider.configured).toBe(false);
    await expect(provider.plan(planInput())).resolves.toEqual({
      platform: 'Zoom',
      withGoogleMeet: false,
      joinUrl: null,
      pending: true,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('needs all three ZOOM_ values', () => {
    const env = makeTestEnv({ ZOOM_ACCOUNT_ID: 'a', ZOOM_CLIENT_ID: 'b' });
    expect(harness({}, {}, env).provider.configured).toBe(false);
  });
});

describe('createZoomProvider with Zoom env', () => {
  it('gets one account credentials token and creates the meeting', async () => {
    const { provider, fetch, capture, urls } = harness();
    expect(provider.configured).toBe(true);

    await expect(provider.plan(planInput())).resolves.toEqual({
      platform: 'Zoom',
      withGoogleMeet: false,
      joinUrl: JOIN_URL,
      pending: false,
      externalId: '81234567890',
    });
    expect(urls()).toEqual([ZOOM_TOKEN_URL, ZOOM_MEETINGS_URL]);

    const tokenInit = fetch.mock.calls[0]?.[1];
    const tokenHeaders = tokenInit?.headers as Record<string, string>;
    const basic = Buffer.from(`${SECRETS.clientId}:${SECRETS.clientSecret}`).toString('base64');
    expect(tokenInit?.method).toBe('POST');
    expect(tokenHeaders.Authorization).toBe(`Basic ${basic}`);
    expect(tokenHeaders['Content-Type']).toBe('application/x-www-form-urlencoded');
    const form = new URLSearchParams(bodyText(tokenInit));
    expect(form.get('grant_type')).toBe('account_credentials');
    expect(form.get('account_id')).toBe(SECRETS.accountId);
    expect(tokenInit?.signal).toBeInstanceOf(AbortSignal);

    const meetingInit = fetch.mock.calls[1]?.[1];
    const meetingHeaders = meetingInit?.headers as Record<string, string>;
    expect(meetingInit?.method).toBe('POST');
    expect(meetingHeaders.Authorization).toBe(`Bearer ${SECRETS.accessToken}`);
    expect(meetingHeaders['Content-Type']).toBe('application/json');
    expect(JSON.parse(bodyText(meetingInit))).toEqual({
      topic: TOPIC,
      type: 2,
      start_time: '2026-10-06T05:00:00Z',
      duration: 60,
      timezone: 'Asia/Karachi',
      settings: { join_before_host: false, waiting_room: true },
    });

    expect(capture.lines().some((line) => line.event === 'zoom.meeting_created')).toBe(true);
    expectCleanLogs(capture.text());
  });

  it('reuses the token until 60 s before it expires, then gets a new one', async () => {
    const { provider, fetch, clock, urls } = harness({
      token: [
        () => tokenResponse(SECRETS.accessToken, 3600),
        () => tokenResponse(SECRETS.accessToken2),
      ],
      meeting: [meetingResponse, meetingResponse, meetingResponse],
    });

    await provider.plan(planInput());
    clock.now = new Date(T0.getTime() + (3600 - 61) * 1000);
    await provider.plan(planInput());
    expect(urls()).toEqual([ZOOM_TOKEN_URL, ZOOM_MEETINGS_URL, ZOOM_MEETINGS_URL]);

    clock.now = new Date(T0.getTime() + (3600 - 60) * 1000);
    await provider.plan(planInput());
    expect(urls()).toEqual([
      ZOOM_TOKEN_URL,
      ZOOM_MEETINGS_URL,
      ZOOM_MEETINGS_URL,
      ZOOM_TOKEN_URL,
      ZOOM_MEETINGS_URL,
    ]);
    const lastHeaders = fetch.mock.calls[4]?.[1].headers as Record<string, string>;
    expect(lastHeaders.Authorization).toBe(`Bearer ${SECRETS.accessToken2}`);
  });

  it('gets a new token once when Zoom refuses a cached one', async () => {
    const { provider, fetch, urls } = harness({
      token: [() => tokenResponse(), () => tokenResponse(SECRETS.accessToken2)],
      meeting: [meetingResponse, () => json(401, { code: 124 }), meetingResponse],
    });

    await provider.plan(planInput());
    await expect(provider.plan(planInput())).resolves.toMatchObject({ joinUrl: JOIN_URL });
    expect(urls()).toEqual([
      ZOOM_TOKEN_URL,
      ZOOM_MEETINGS_URL,
      ZOOM_MEETINGS_URL,
      ZOOM_TOKEN_URL,
      ZOOM_MEETINGS_URL,
    ]);
    const lastHeaders = fetch.mock.calls[4]?.[1].headers as Record<string, string>;
    expect(lastHeaders.Authorization).toBe(`Bearer ${SECRETS.accessToken2}`);
  });
});

describe('Zoom failures', () => {
  it('throws a non retryable MeetingError when Zoom refuses the credentials', async () => {
    const { provider, capture, urls } = harness({
      token: [
        () => json(400, { reason: 'Invalid client_id or client_secret', error: 'invalid_client' }),
      ],
    });

    const failure = provider.plan(planInput());
    await expect(failure).rejects.toBeInstanceOf(MeetingError);
    await expect(failure).rejects.toMatchObject({ retryable: false, status: 400, reason: 'token' });
    expect(urls()).toEqual([ZOOM_TOKEN_URL]);

    const warning = capture.lines().find((line) => line.event === 'zoom.meeting_failed');
    expect(warning?.msg).toContain('Check ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET');
    expectCleanLogs(capture.text());
    expect(capture.text()).not.toContain('Invalid client_id');
  });

  it('maps meeting statuses to retryable flags and fixed reasons', async () => {
    const cases: [number, boolean, string][] = [
      [500, true, 'server_error'],
      [503, true, 'server_error'],
      [429, true, 'rate_limited'],
      [403, false, 'not_allowed'],
      [400, false, 'rejected'],
    ];
    for (const [status, retryable, reason] of cases) {
      const { provider, capture } = harness({
        meeting: [() => json(status, { code: 300, message: 'upstream detail text' })],
      });
      const error = await provider.plan(planInput()).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(MeetingError);
      expect(error).toMatchObject({ retryable, status, reason });
      expect((error as Error).message).not.toContain('upstream detail text');
      expectCleanLogs(capture.text());
    }
  });

  it('does not try again when a fresh token is refused', async () => {
    const { provider, urls } = harness({ meeting: [() => json(401, { code: 124 })] });
    await expect(provider.plan(planInput())).rejects.toMatchObject({
      status: 401,
      reason: 'not_allowed',
    });
    expect(urls()).toEqual([ZOOM_TOKEN_URL, ZOOM_MEETINGS_URL]);
  });

  it('times out a call that hangs and aborts its signal', async () => {
    let seenSignal: AbortSignal | undefined;
    const hanging = vi.fn<FetchLike>((_url, init) => {
      seenSignal = init.signal ?? undefined;
      return new Promise<Response>(() => undefined);
    });
    const { provider } = harness({}, { fetch: hanging, timeoutMs: 20 });

    await expect(provider.plan(planInput())).rejects.toMatchObject({
      name: 'MeetingError',
      retryable: true,
      reason: 'timeout',
    });
    expect(hanging).toHaveBeenCalledTimes(1);
    expect(seenSignal?.aborted).toBe(true);
  });

  it('follows the caller signal', async () => {
    const controller = new AbortController();
    controller.abort();
    const { provider, fetch } = harness();
    await expect(provider.plan(planInput(), controller.signal)).rejects.toMatchObject({
      reason: 'aborted',
    });
    expect(fetch).not.toHaveBeenCalled();

    const later = new AbortController();
    const hanging = vi.fn<FetchLike>(() => new Promise<Response>(() => undefined));
    const slow = harness({}, { fetch: hanging });
    const pending = slow.provider.plan(planInput(), later.signal);
    later.abort();
    await expect(pending).rejects.toMatchObject({ reason: 'aborted', retryable: true });
  });

  it('marks a network failure as retryable', async () => {
    const offline = vi.fn<FetchLike>(() => Promise.reject(new TypeError('fetch failed')));
    const { provider } = harness({}, { fetch: offline });
    await expect(provider.plan(planInput())).rejects.toMatchObject({
      retryable: true,
      reason: 'network',
    });
  });

  it('refuses answers it cannot read', async () => {
    const noToken = harness({ token: [() => json(200, { token_type: 'bearer' })] });
    await expect(noToken.provider.plan(planInput())).rejects.toMatchObject({
      retryable: false,
      reason: 'bad_response',
    });

    const noLink = harness({ meeting: [() => json(201, { id: 81234567890 })] });
    await expect(noLink.provider.plan(planInput())).rejects.toMatchObject({
      reason: 'bad_response',
    });

    const notJson = harness({ meeting: [() => new Response('<html>', { status: 201 })] });
    await expect(notJson.provider.plan(planInput())).rejects.toMatchObject({
      reason: 'bad_response',
    });
  });

  it('rejects invalid details without any call', async () => {
    const { provider, fetch } = harness();
    await expect(provider.plan(planInput({ start: new Date('nope') }))).rejects.toMatchObject({
      reason: 'invalid_meeting',
    });
    await expect(provider.plan(planInput({ durationMinutes: 0 }))).rejects.toMatchObject({
      reason: 'invalid_meeting',
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
