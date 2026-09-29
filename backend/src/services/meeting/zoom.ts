/**
 * Zoom provider (Server-to-Server OAuth, called with the built-in fetch, no Zoom SDK).
 *
 * - Not configured (any ZOOM_ value missing): plan() makes no call and returns
 *   { platform "Zoom", withGoogleMeet false, joinUrl null, pending true }.
 * - Configured: an account credentials token from https://zoom.us/oauth/token (cached until
 *   60 s before it expires), then POST https://api.zoom.us/v2/users/me/meetings. plan()
 *   returns the meeting's join_url as joinUrl and its id as externalId.
 *
 * Every call has an 8 s timeout combined with the caller's signal. A failed call throws a
 * MeetingError (the booking then answers UPSTREAM_ERROR and creates no event and sends no
 * email). Logs never hold tokens, secrets, the join link or the topic (it holds a name).
 */
import { features } from '../../config/env.js';
import type { Env } from '../../config/env.js';
import type { Logger } from '../../lib/logger.js';
import type { MeetingPlan, MeetingPlanInput, MeetingProvider } from './types.js';
import { MeetingError, isMeetingError } from './types.js';

export const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';
export const ZOOM_MEETINGS_URL = 'https://api.zoom.us/v2/users/me/meetings';
/** Time limit of one Zoom call. */
export const ZOOM_CALL_TIMEOUT_MS = 8_000;
/** A cached token is replaced this long before it expires. */
export const ZOOM_TOKEN_EARLY_REFRESH_MS = 60_000;
/** Zoom's limit for a meeting topic. */
const ZOOM_TOPIC_MAX = 200;

/** The part of fetch the provider uses. */
export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** Extra hooks for tests. Production passes none of them. */
export interface ZoomDeps {
  /** Replaces the built-in fetch (tests pass a mock). */
  fetch?: FetchLike;
  /** Clock for the token cache. */
  now?: () => Date;
  /** Per call time limit in ms (default ZOOM_CALL_TIMEOUT_MS). */
  timeoutMs?: number;
}

/** The body of POST /v2/users/me/meetings this provider sends. */
export interface ZoomMeetingRequest {
  topic: string;
  /** 2 = a scheduled meeting. */
  type: 2;
  /** UTC time in Zoom's format, for example "2026-10-06T05:00:00Z". */
  start_time: string;
  /** Minutes. */
  duration: number;
  timezone: string;
  settings: { join_before_host: false; waiting_room: true };
}

/** Zoom's start_time format: UTC, seconds precision, trailing Z. */
export function toZoomTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Builds the create meeting body for one booking. */
export function buildZoomMeetingRequest(input: MeetingPlanInput): ZoomMeetingRequest {
  return {
    topic: input.topic.slice(0, ZOOM_TOPIC_MAX),
    type: 2,
    start_time: toZoomTime(input.start),
    duration: input.durationMinutes,
    timezone: input.timeZone,
    settings: { join_before_host: false, waiting_room: true },
  };
}

function abortedError(): MeetingError {
  return new MeetingError('The Zoom call was cancelled.', { retryable: true, reason: 'aborted' });
}

function timeoutError(): MeetingError {
  return new MeetingError('The Zoom call timed out.', { retryable: true, reason: 'timeout' });
}

/**
 * Runs one Zoom call with a time limit combined with the caller's signal. The call gets
 * the combined signal, and its result is raced against it as well.
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
    if (isMeetingError(error)) throw error;
    if (error instanceof TypeError) {
      // fetch rejects with a TypeError when the request never got an answer.
      throw new MeetingError('Zoom could not be reached.', { retryable: true, reason: 'network' });
    }
    throw new MeetingError('The Zoom call failed.', { retryable: false, reason: 'unknown' });
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
}

/** A MeetingError for an HTTP failure. `stage` says which call failed. */
function httpError(stage: 'token' | 'meeting', status: number): MeetingError {
  const retryable = status === 429 || status >= 500;
  let reason: string;
  if (stage === 'token') reason = 'token';
  else if (status === 429) reason = 'rate_limited';
  else if (status >= 500) reason = 'server_error';
  else if (status === 401 || status === 403) reason = 'not_allowed';
  else reason = 'rejected';
  const message =
    stage === 'token' ? 'Zoom did not give an access token.' : 'Zoom did not create the meeting.';
  return new MeetingError(message, { retryable, status, reason });
}

function badResponse(stage: 'token' | 'meeting'): MeetingError {
  return new MeetingError(
    stage === 'token'
      ? 'Zoom sent a token answer we cannot read.'
      : 'Zoom sent a meeting we cannot read.',
    { retryable: false, reason: 'bad_response' },
  );
}

/** Frees the connection of a response whose body is not needed. */
async function discardBody(res: Response): Promise<void> {
  try {
    await res.body?.cancel();
  } catch {
    // nothing to free
  }
}

async function readJson(
  res: Response,
  stage: 'token' | 'meeting',
): Promise<Record<string, unknown>> {
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw badResponse(stage);
  }
  if (typeof data !== 'object' || data === null) throw badResponse(stage);
  return data as Record<string, unknown>;
}

interface CachedToken {
  value: string;
  /** Epoch ms when Zoom says the token expires. */
  expiresAt: number;
}

interface CreatedZoomMeeting {
  id: string;
  joinUrl: string;
}

export function createZoomProvider(env: Env, logger: Logger, deps: ZoomDeps = {}): MeetingProvider {
  const configured = features(env).zoom;
  const doFetch: FetchLike = deps.fetch ?? ((url, init) => globalThis.fetch(url, init));
  const now = deps.now ?? (() => new Date());
  const timeoutMs = deps.timeoutMs ?? ZOOM_CALL_TIMEOUT_MS;
  const log = logger.child({ module: 'zoom' });
  let cached: CachedToken | undefined;

  function basicAuth(): string {
    const pair = `${env.ZOOM_CLIENT_ID ?? ''}:${env.ZOOM_CLIENT_SECRET ?? ''}`;
    return `Basic ${Buffer.from(pair, 'utf8').toString('base64')}`;
  }

  async function fetchToken(signal: AbortSignal | undefined): Promise<string> {
    const token = await withDeadline(timeoutMs, signal, async (combined) => {
      const res = await doFetch(ZOOM_TOKEN_URL, {
        method: 'POST',
        headers: {
          Authorization: basicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'account_credentials',
          account_id: env.ZOOM_ACCOUNT_ID ?? '',
        }).toString(),
        signal: combined,
      });
      if (!res.ok) {
        await discardBody(res);
        throw httpError('token', res.status);
      }
      const data = await readJson(res, 'token');
      const value = data.access_token;
      const expiresIn = data.expires_in;
      if (typeof value !== 'string' || value.length === 0) throw badResponse('token');
      const seconds = typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : 3600;
      return { value, expiresAt: now().getTime() + seconds * 1000 };
    });
    cached = token;
    return token.value;
  }

  /** The cached token while it has more than a minute left, else a new one. */
  function getToken(signal: AbortSignal | undefined): Promise<string> {
    if (cached && now().getTime() < cached.expiresAt - ZOOM_TOKEN_EARLY_REFRESH_MS) {
      return Promise.resolve(cached.value);
    }
    cached = undefined;
    return fetchToken(signal);
  }

  async function postMeeting(
    token: string,
    body: ZoomMeetingRequest,
    signal: AbortSignal | undefined,
  ): Promise<CreatedZoomMeeting> {
    return withDeadline(timeoutMs, signal, async (combined) => {
      const res = await doFetch(ZOOM_MEETINGS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: combined,
      });
      if (!res.ok) {
        await discardBody(res);
        throw httpError('meeting', res.status);
      }
      const data = await readJson(res, 'meeting');
      const joinUrl = data.join_url;
      const id = data.id;
      if (typeof joinUrl !== 'string' || !/^https:\/\/\S+$/.test(joinUrl)) {
        throw badResponse('meeting');
      }
      if ((typeof id !== 'number' && typeof id !== 'string') || String(id).length === 0) {
        throw badResponse('meeting');
      }
      return { id: String(id), joinUrl };
    });
  }

  /** Creates the meeting; a 401 with a cached token gets one more try with a new token. */
  async function createMeeting(
    input: MeetingPlanInput,
    signal: AbortSignal | undefined,
  ): Promise<CreatedZoomMeeting> {
    const body = buildZoomMeetingRequest(input);
    const hadCachedToken = cached !== undefined;
    const token = await getToken(signal);
    try {
      return await postMeeting(token, body, signal);
    } catch (error) {
      if (!(isMeetingError(error) && error.status === 401)) throw error;
      cached = undefined;
      if (!hadCachedToken) throw error;
      return postMeeting(await fetchToken(signal), body, signal);
    }
  }

  return {
    platform: 'Zoom',
    configured,

    async plan(input: MeetingPlanInput, signal?: AbortSignal): Promise<MeetingPlan> {
      if (!configured) {
        return { platform: 'Zoom', withGoogleMeet: false, joinUrl: null, pending: true };
      }
      if (
        !(input.start instanceof Date) ||
        Number.isNaN(input.start.getTime()) ||
        !Number.isInteger(input.durationMinutes) ||
        input.durationMinutes <= 0
      ) {
        throw new MeetingError('The meeting details are not valid.', {
          retryable: false,
          reason: 'invalid_meeting',
        });
      }

      try {
        const meeting = await createMeeting(input, signal);
        log.info(
          { event: 'zoom.meeting_created', bookingId: input.bookingId },
          'Zoom meeting created',
        );
        return {
          platform: 'Zoom',
          withGoogleMeet: false,
          joinUrl: meeting.joinUrl,
          pending: false,
          externalId: meeting.id,
        };
      } catch (error) {
        const failure = isMeetingError(error)
          ? error
          : new MeetingError('The Zoom call failed.', { retryable: false, reason: 'unknown' });
        log.warn(
          {
            event: 'zoom.meeting_failed',
            bookingId: input.bookingId,
            reason: failure.reason,
            status: failure.status,
            retryable: failure.retryable,
          },
          failure.reason === 'token' && !failure.retryable
            ? 'Zoom refused the credentials. Check ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET.'
            : 'Zoom meeting was not created',
        );
        throw failure;
      }
    },
  };
}
