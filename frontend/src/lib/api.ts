/**
 * Typed client for the backend API (.claude/prd/API_CONTRACT.md). The contact form, the booking
 * modal and the chat use it in place of the reference's window.FH_HOOKS (L19). Framework free: no
 * React, no retries, no logging (request bodies hold personal data).
 *
 * When NEXT_PUBLIC_API_URL is not set, API_ENABLED is false and every call throws
 * ApiError('DISABLED'). The callers then use the reference mailto flow (@/lib/mailto) or the local
 * chat responder; this client never falls back on its own.
 */

/* ------------------------------------------------------------------ config */

function normalizeBase(raw: string | undefined): string | null {
  const v = (raw ?? '').trim().replace(/\/+$/, '');
  return v ? v : null;
}

/**
 * Backend base URL from NEXT_PUBLIC_API_URL (the only env this module reads), trimmed and without
 * a trailing slash, or null when it is not set. The routes live under /api on it.
 */
export const API_BASE: string | null = normalizeBase(process.env.NEXT_PUBLIC_API_URL);

/** True when the API is configured. */
export const API_ENABLED: boolean = API_BASE !== null;

/** Request timeouts in ms. The chat's 12 seconds is the reference's (L6391). */
export const API_TIMEOUTS = {
  chat: 12000,
  contact: 15000,
  booking: 15000,
  slots: 8000,
  config: 8000,
} as const;

/* ------------------------------------------------------------------ types (API_CONTRACT.md) */

/** One chat history item (L6392 `history`). */
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** POST /api/chat body. history already ends with the current user message. */
export interface ChatRequest {
  /** 1 to 500 characters. */
  message: string;
  /** At most 12 items; the client sends history.slice(-12) like the reference. */
  history: ChatTurn[];
}

/** The contact form's project type radios (name="type"). */
export type ContactProjectType =
  | 'App Development'
  | 'Web Application'
  | 'E-commerce'
  | 'Maintenance & Support'
  | 'Consultation'
  | 'Other';

/** The contact form's budget radios (name="budget"); '' when none is picked. */
export type ContactBudget =
  '' | 'Under $1,000' | '$1,000 - $5,000' | '$5,000 - $10,000' | '$10,000+';

/** POST /api/contact body: the reference onContact payload (L5754) plus the two anti spam fields. */
export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  company: string;
  projectType: ContactProjectType;
  budget: ContactBudget;
  details: string;
  /** Honeypot, usually ''. Sent as '' when left out. */
  website?: string;
  /** Epoch ms when the form was first shown. */
  startedAt: number;
}

export interface ContactResponse {
  ok: true;
}

/** POST /api/booking body: the reference bookingData() (L6112-6117) plus the honeypot. */
export interface BookingRequest {
  sessionType: 'quick' | 'deep';
  sessionName: string;
  durationMinutes: number;
  pricePerSession: number;
  sessions: number;
  total: number;
  currency: 'USD';
  email: string;
  name: string;
  phone: string;
  company: string;
  /** "YYYY-MM-DD", the calendar day of the first slot. */
  date: string;
  /** IANA zone chosen in the modal. */
  timezone: string;
  /** ISO time of the first chosen slot. */
  startUtc: string;
  /** ISO time of every chosen slot, one per session (owner change, 2026-09-29). */
  slots: string[];
  timeLocal: string;
  timeLahore: string;
  platform: 'Google Meet';
  notes: string;
  /** Honeypot, usually ''. Sent as '' when left out. */
  website?: string;
}

export interface BookingResponse {
  ok: true;
  bookingId: string;
  meetLink: string | null;
  /** ISO time. */
  start: string;
  /** ISO time. */
  end: string;
}

/** GET /api/booking/slots response: free hourly starts in PKT ("09:00" .. "17:00"). */
export interface SlotsResponse {
  ok: true;
  timezone: 'Asia/Karachi';
  slots: string[];
}

export interface BookingSessionConfig {
  name: string;
  minutes: number;
  price: number;
}

/** GET /api/booking/config response. The UI never changes because of it. */
export interface BookingConfig {
  ok: true;
  platforms: { meet: boolean };
  sessions: { quick: BookingSessionConfig; deep: BookingSessionConfig };
  maxSessions: number;
  currency: 'USD';
  windowDays: number;
  hours: {
    days: string;
    start: string;
    end: string;
    firstSlot: string;
    lastSlot: string;
    stepMinutes: number;
    timezone: string;
  };
}

/* ------------------------------------------------------------------ errors */

/** Codes of the server error envelope. */
export type ServerErrorCode =
  'VALIDATION_ERROR' | 'RATE_LIMITED' | 'SLOT_TAKEN' | 'UPSTREAM_ERROR' | 'NOT_FOUND' | 'INTERNAL';

/** Server codes plus the client side ones. */
export type ApiErrorCode = ServerErrorCode | 'TIMEOUT' | 'NETWORK' | 'DISABLED';

const SERVER_CODES: readonly ServerErrorCode[] = [
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'SLOT_TAKEN',
  'UPSTREAM_ERROR',
  'NOT_FOUND',
  'INTERNAL',
];

/** Plain English messages. The UI shows the reference's own texts, never these. */
const MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: 'Some fields need a fix before this can be sent.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  SLOT_TAKEN: 'That time was just taken. Please pick another slot.',
  UPSTREAM_ERROR: 'A service the site relies on did not respond. Please try again.',
  NOT_FOUND: 'The requested item was not found.',
  INTERNAL: 'Something went wrong on the server. Please try again.',
  TIMEOUT: 'The request took too long. Please try again.',
  NETWORK: 'The request could not reach the server. Please check your connection and try again.',
  DISABLED: 'The API is not set up, so this request was not sent.',
};

const CANCELLED_MESSAGE = 'The request was cancelled.';

export interface ApiErrorInit {
  status?: number;
  fields?: Record<string, string>;
  retryAfter?: number;
  message?: string;
  cause?: unknown;
}

/**
 * Every failure of this client. status is the HTTP status, or 0 when no response came back
 * (TIMEOUT, NETWORK, DISABLED, and a caller abort, which is a NETWORK error with the caller's
 * signal already aborted). fields holds the server's VALIDATION_ERROR fields; retryAfter is the
 * Retry-After header in seconds.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;
  readonly retryAfter?: number;

  constructor(code: ApiErrorCode, init: ApiErrorInit = {}) {
    super(
      init.message ?? MESSAGES[code],
      init.cause === undefined ? undefined : { cause: init.cause },
    );
    this.name = 'ApiError';
    this.code = code;
    this.status = init.status ?? 0;
    if (init.fields) this.fields = init.fields;
    if (init.retryAfter !== undefined) this.retryAfter = init.retryAfter;
  }
}

/** True when e is an ApiError (optionally with one of the given codes). */
export function isApiError(e: unknown, ...codes: ApiErrorCode[]): e is ApiError {
  return e instanceof ApiError && (codes.length === 0 || codes.includes(e.code));
}

/* ------------------------------------------------------------------ request core */

/** Options every call takes. The caller's signal is combined with the call's own timeout. */
export interface ApiCallOptions {
  signal?: AbortSignal;
}

interface RequestOptions extends ApiCallOptions {
  method: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs: number;
  /** Codes forced for a status, whatever the envelope says (booking: 409 is SLOT_TAKEN). */
  statusCodes?: Partial<Record<number, ServerErrorCode>>;
}

interface ApiResult {
  status: number;
  /** Parsed JSON, or the text for a body that is not JSON. */
  data: unknown;
}

const UNREADABLE_MESSAGE = 'The server sent a response the site could not read.';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** JSON when the content type says so, else text, like the reference (L6393). */
function readBody(res: Response): Promise<unknown> {
  const ct = res.headers.get('content-type') || '';
  return ct.indexOf('json') > -1 ? res.json() : res.text();
}

/** Retry-After in seconds: delta seconds, or an HTTP date turned into seconds from now. */
export function parseRetryAfter(
  value: string | null,
  now: number = Date.now(),
): number | undefined {
  if (value === null) return undefined;
  const v = value.trim();
  if (/^\d+$/.test(v)) return Number(v);
  const t = Date.parse(v);
  if (Number.isNaN(t)) return undefined;
  return Math.max(0, Math.ceil((t - now) / 1000));
}

/** The code for a status when the body has no usable error envelope. */
function codeForStatus(status: number): ServerErrorCode {
  if (status === 400 || status === 413 || status === 415 || status === 422) {
    return 'VALIDATION_ERROR';
  }
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 502 || status === 503 || status === 504) return 'UPSTREAM_ERROR';
  return 'INTERNAL';
}

/** Reads { ok: false, error: { code, message, fields? } }; unknown codes are ignored. */
function readEnvelope(data: unknown): { code?: ServerErrorCode; fields?: Record<string, string> } {
  if (!isObject(data) || !isObject(data.error)) return {};
  const { code, fields } = data.error;
  const out: { code?: ServerErrorCode; fields?: Record<string, string> } = {};
  if (typeof code === 'string' && (SERVER_CODES as readonly string[]).includes(code)) {
    out.code = code as ServerErrorCode;
  }
  if (isObject(fields)) {
    const f: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) if (typeof v === 'string') f[k] = v;
    if (Object.keys(f).length > 0) out.fields = f;
  }
  return out;
}

/**
 * One request: API_BASE + path, JSON headers, credentials omitted, no retries. The timer covers
 * the whole exchange including the body read, like the reference, which clears it only after the
 * chain settles (L6402). Throws ApiError for every failure.
 */
async function request(path: string, opts: RequestOptions): Promise<ApiResult> {
  if (API_BASE === null) throw new ApiError('DISABLED');
  const caller = opts.signal;
  if (caller?.aborted) {
    throw new ApiError('NETWORK', { message: CANCELLED_MESSAGE, cause: caller.reason });
  }
  if (typeof fetch !== 'function') throw new ApiError('NETWORK');

  const ctrl = new AbortController();
  let timedOut = false;
  const onCallerAbort = (): void => {
    ctrl.abort(caller?.reason);
  };
  caller?.addEventListener('abort', onCallerAbort, { once: true });
  const timer = setTimeout(() => {
    if (ctrl.signal.aborted) return;
    timedOut = true;
    ctrl.abort();
  }, opts.timeoutMs);

  const transportError = (e: unknown): ApiError => {
    if (timedOut) return new ApiError('TIMEOUT', { cause: e });
    if (caller?.aborted) return new ApiError('NETWORK', { message: CANCELLED_MESSAGE, cause: e });
    return new ApiError('NETWORK', { cause: e });
  };

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  Object.assign(headers, opts.headers);

  try {
    let res: Response;
    try {
      res = await fetch(API_BASE + path, {
        method: opts.method,
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        credentials: 'omit',
        cache: 'no-store',
        signal: ctrl.signal,
      });
    } catch (e) {
      throw transportError(e);
    }

    if (!res.ok) {
      let data: unknown;
      try {
        data = await readBody(res);
      } catch {
        // No readable envelope: the status alone decides the code.
      }
      const env = readEnvelope(data);
      const code = opts.statusCodes?.[res.status] ?? env.code ?? codeForStatus(res.status);
      throw new ApiError(code, {
        status: res.status,
        fields: env.fields,
        retryAfter: parseRetryAfter(res.headers.get('retry-after')),
      });
    }

    try {
      return { status: res.status, data: await readBody(res) };
    } catch (e) {
      if (timedOut || caller?.aborted) throw transportError(e);
      throw new ApiError('INTERNAL', { status: res.status, message: UNREADABLE_MESSAGE, cause: e });
    }
  } finally {
    clearTimeout(timer);
    caller?.removeEventListener('abort', onCallerAbort);
  }
}

/* ------------------------------------------------------------------ endpoints */

/** At most 12 history items, like the reference's history.slice(-12) (L6392). */
const CHAT_HISTORY_MAX = 12;

/**
 * The reply text exactly as the reference reads it (L6395-6396): a plain text body as is, else
 * reply, message, text, content, answer, then choices[0].message.content. The first truthy value
 * wins and must be a string; anything else (including '') gives null.
 */
export function replyText(d: unknown): string | null {
  if (typeof d === 'string') return d || null;
  if (!isObject(d)) return null;
  const c = d.choices;
  const first = isObject(c) ? c[0] : undefined;
  const choice = isObject(first) && isObject(first.message) ? first.message.content : undefined;
  const t = d.reply || d.message || d.text || d.content || d.answer || choice || '';
  return typeof t === 'string' && t ? t : null;
}

/**
 * POST /api/chat. Resolves with the reply text (the caller formats it with the reference's
 * fromText). 12 second timeout. An empty or unreadable reply is an INTERNAL error.
 */
export async function postChat(body: ChatRequest, opts: ApiCallOptions = {}): Promise<string> {
  const payload: ChatRequest = {
    message: body.message,
    history: body.history
      .slice(-CHAT_HISTORY_MAX)
      .map((turn) => ({ role: turn.role, content: turn.content })),
  };
  const { status, data } = await request('/api/chat', {
    method: 'POST',
    body: payload,
    timeoutMs: API_TIMEOUTS.chat,
    signal: opts.signal,
  });
  const reply = replyText(data);
  if (reply === null) {
    throw new ApiError('INTERNAL', { status, message: 'The chat reply was empty.' });
  }
  return reply;
}

/** POST /api/contact. The body is sent field for field in the contract's order. */
export async function postContact(
  body: ContactRequest,
  opts: ApiCallOptions = {},
): Promise<ContactResponse> {
  const payload: Required<ContactRequest> = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    company: body.company,
    projectType: body.projectType,
    budget: body.budget,
    details: body.details,
    website: body.website ?? '',
    startedAt: body.startedAt,
  };
  await request('/api/contact', {
    method: 'POST',
    body: payload,
    timeoutMs: API_TIMEOUTS.contact,
    signal: opts.signal,
  });
  return { ok: true };
}

/**
 * POST /api/booking with the Idempotency-Key header (one key per submit attempt, reused when that
 * attempt is retried). A 409 is always SLOT_TAKEN. Any 2xx means the booking was created, so the
 * response is normalized rather than rejected.
 */
export async function postBooking(
  body: BookingRequest,
  idempotencyKey: string,
  opts: ApiCallOptions = {},
): Promise<BookingResponse> {
  const payload: Required<BookingRequest> = {
    sessionType: body.sessionType,
    sessionName: body.sessionName,
    durationMinutes: body.durationMinutes,
    pricePerSession: body.pricePerSession,
    sessions: body.sessions,
    total: body.total,
    currency: body.currency,
    email: body.email,
    name: body.name,
    phone: body.phone,
    company: body.company,
    date: body.date,
    timezone: body.timezone,
    startUtc: body.startUtc,
    slots: body.slots,
    timeLocal: body.timeLocal,
    timeLahore: body.timeLahore,
    platform: body.platform,
    notes: body.notes,
    website: body.website ?? '',
  };
  const { data } = await request('/api/booking', {
    method: 'POST',
    body: payload,
    headers: { 'Idempotency-Key': idempotencyKey },
    timeoutMs: API_TIMEOUTS.booking,
    signal: opts.signal,
    statusCodes: { 409: 'SLOT_TAKEN' },
  });
  const d = isObject(data) ? data : {};
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  return {
    ok: true,
    bookingId: str(d.bookingId),
    meetLink: typeof d.meetLink === 'string' ? d.meetLink : null,
    start: str(d.start),
    end: str(d.end),
  };
}

/** GET /api/booking/slots. Resolves with the free hourly starts in PKT, for example "09:00". */
export async function getBookingSlots(
  date: string,
  session: BookingRequest['sessionType'],
  opts: ApiCallOptions = {},
): Promise<string[]> {
  const query = new URLSearchParams({ date, session }).toString();
  const { status, data } = await request('/api/booking/slots?' + query, {
    method: 'GET',
    timeoutMs: API_TIMEOUTS.slots,
    signal: opts.signal,
  });
  if (!isObject(data) || !Array.isArray(data.slots)) {
    throw new ApiError('INTERNAL', { status, message: UNREADABLE_MESSAGE });
  }
  return data.slots.filter((s): s is string => typeof s === 'string');
}

/** GET /api/booking/config. */
export async function getBookingConfig(opts: ApiCallOptions = {}): Promise<BookingConfig> {
  const { status, data } = await request('/api/booking/config', {
    method: 'GET',
    timeoutMs: API_TIMEOUTS.config,
    signal: opts.signal,
  });
  if (!isObject(data) || !isObject(data.sessions) || !isObject(data.platforms)) {
    throw new ApiError('INTERNAL', { status, message: UNREADABLE_MESSAGE });
  }
  // The shape was checked above as far as any caller relies on it.
  return data as unknown as BookingConfig;
}

/**
 * A fresh Idempotency-Key (a v4 uuid). crypto.randomUUID needs a secure context, so a plain http
 * origin (a phone on the LAN in development) builds the same format from getRandomValues.
 */
export function newIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return (
    h.slice(0, 8) +
    '-' +
    h.slice(8, 12) +
    '-' +
    h.slice(12, 16) +
    '-' +
    h.slice(16, 20) +
    '-' +
    h.slice(20)
  );
}
