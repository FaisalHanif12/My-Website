import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import type * as ApiModule from '@/lib/api';

type Api = typeof ApiModule;
type FetchMock = Mock<(input: string, init: RequestInit) => Promise<Response>>;

const BASE = 'https://api.example.test';

/** Loads a fresh copy of the module with NEXT_PUBLIC_API_URL set to url (BASE when left out). */
async function loadApi(...args: [] | [url: string | undefined]): Promise<Api> {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_API_URL', args.length === 0 ? BASE : args[0]);
  return import('@/lib/api');
}

function json(status: number, data: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function text(status: number, body: string, headers: Record<string, string> = {}): Response {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain', ...headers } });
}

function mockFetch(impl: (input: string, init: RequestInit) => Promise<Response>): FetchMock {
  const fn: FetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
}

/** A fetch that never answers and rejects like the platform when its signal aborts. */
function hangingFetch(): FetchMock {
  return mockFetch(
    (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
  );
}

/** Settles p into its value or its error, so a pending rejection is never unhandled. */
function settle<T>(p: Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  return p.then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error }),
  );
}

async function rejection(p: Promise<unknown>): Promise<ApiModule.ApiError> {
  const r = await settle(p);
  if (r.ok) throw new Error('expected a rejection');
  return r.error as ApiModule.ApiError;
}

function call(fetchMock: FetchMock, i = 0): { url: string; init: RequestInit } {
  const [url, init] = fetchMock.mock.calls[i];
  return { url, init };
}

function headersOf(init: RequestInit): Record<string, string> {
  return init.headers as Record<string, string>;
}

const contactBody: ApiModule.ContactRequest = {
  name: 'Ali Khan',
  email: 'ali@company.com',
  phone: '+1 555 123 4567',
  company: 'Acme',
  projectType: 'Maintenance & Support',
  budget: '$1,000 - $5,000',
  details: 'We need help keeping our app healthy and fast.',
  startedAt: 1773133200000,
};

const bookingBody: ApiModule.BookingRequest = {
  sessionType: 'deep',
  sessionName: 'Technical Deep Dive',
  durationMinutes: 60,
  pricePerSession: 25,
  sessions: 2,
  total: 50,
  currency: 'USD',
  email: 'ali@company.com',
  name: 'Ali Khan',
  phone: '',
  company: 'Acme',
  date: '2026-03-12',
  timezone: 'Europe/London',
  startUtc: '2026-03-12T09:00:00.000Z',
  slots: ['2026-03-12T09:00:00.000Z', '2026-03-12T10:00:00.000Z'],
  timeLocal: '9:00 AM',
  timeLahore: '2:00 PM',
  platform: 'Google Meet',
  notes: 'A line or two.',
};

const bookingOk = {
  ok: true,
  bookingId: 'bk_123',
  meetLink: 'https://meet.google.com/abc-defg-hij',
  start: '2026-03-12T09:00:00.000Z',
  end: '2026-03-12T10:00:00.000Z',
};

beforeEach(() => {
  vi.spyOn(console, 'log');
  vi.spyOn(console, 'info');
  vi.spyOn(console, 'warn');
  vi.spyOn(console, 'error');
});

afterEach(() => {
  // No call ever logs (request bodies hold personal data).
  expect(console.log).not.toHaveBeenCalled();
  expect(console.info).not.toHaveBeenCalled();
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('config', () => {
  it('trims NEXT_PUBLIC_API_URL and drops trailing slashes', async () => {
    const api = await loadApi('  https://api.example.test/// ');
    expect(api.API_BASE).toBe('https://api.example.test');
    expect(api.API_ENABLED).toBe(true);
  });

  it.each([undefined, '', '   ', '/'])('is disabled for %j', async (url) => {
    const api = await loadApi(url);
    expect(api.API_BASE).toBeNull();
    expect(api.API_ENABLED).toBe(false);
  });

  it('keeps the timeouts from the brief', async () => {
    const api = await loadApi();
    expect(api.API_TIMEOUTS).toEqual({
      chat: 12000,
      contact: 15000,
      booking: 15000,
      slots: 8000,
      config: 8000,
    });
  });

  it('reads no env other than NEXT_PUBLIC_API_URL', () => {
    // Vitest runs from frontend/ (vitest.config.ts); import.meta.url is not a file URL in jsdom.
    const src = readFileSync(resolve(process.cwd(), 'src/lib/api.ts'), 'utf8');
    const reads = src.match(/process\.env(\.\w+|\[[^\]]*\])/g) ?? [];
    expect(reads).toEqual(['process.env.NEXT_PUBLIC_API_URL']);
  });
});

describe('disabled mode', () => {
  it('every call throws DISABLED and never fetches (the caller falls back, not the client)', async () => {
    const api = await loadApi('');
    const fetchMock = mockFetch(() => Promise.resolve(json(200, { ok: true })));
    const calls: Promise<unknown>[] = [
      api.postChat({ message: 'Rates', history: [] }),
      api.postContact(contactBody),
      api.postBooking(bookingBody, 'key-12345678'),
      api.getBookingSlots('2026-03-12', 'quick'),
      api.getBookingConfig(),
    ];
    for (const p of calls) {
      const e = await rejection(p);
      expect(e).toBeInstanceOf(api.ApiError);
      expect(e).toBeInstanceOf(Error);
      expect(e.name).toBe('ApiError');
      expect(e.code).toBe('DISABLED');
      expect(e.status).toBe(0);
      expect(e.message).not.toMatch(/—/);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('postChat', () => {
  const greeting = "Hi! I'm Faisal's assistant. How can I help you today?";

  it('sends { message, history.slice(-12) } exactly, as JSON, without credentials', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, { ok: true, reply: 'Hello' })));
    const history: (ApiModule.ChatTurn & { extra?: string })[] = [
      { role: 'assistant', content: greeting },
    ];
    for (let i = 1; i <= 13; i++) {
      history.push({ role: i % 2 ? 'user' : 'assistant', content: 'turn ' + i, extra: 'x' });
    }
    expect(history).toHaveLength(14);

    await expect(api.postChat({ message: 'turn 13', history })).resolves.toBe('Hello');

    const { url, init } = call(fetchMock);
    expect(url).toBe(BASE + '/api/chat');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('omit');
    expect(headersOf(init)).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    const expected = {
      message: 'turn 13',
      history: history.slice(-12).map((t) => ({ role: t.role, content: t.content })),
    };
    expect(init.body).toBe(JSON.stringify(expected));
    expect(JSON.parse(init.body as string).history).toHaveLength(12);
    expect(JSON.parse(init.body as string).history[0]).toEqual({
      role: 'assistant',
      content: 'turn 2',
    });
  });

  it('sends a short history as is', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, { reply: 'Sure' })));
    const history: ApiModule.ChatTurn[] = [
      { role: 'assistant', content: greeting },
      { role: 'user', content: 'Rates' },
    ];
    await api.postChat({ message: 'Rates', history });
    expect(call(fetchMock).init.body).toBe(
      '{"message":"Rates","history":[{"role":"assistant","content":"' +
        greeting +
        '"},{"role":"user","content":"Rates"}]}',
    );
  });

  it.each<[string, () => Response, string]>([
    ['reply', () => json(200, { ok: true, reply: 'From reply' }), 'From reply'],
    ['message', () => json(200, { message: 'From message' }), 'From message'],
    ['text', () => json(200, { text: 'From text' }), 'From text'],
    ['content', () => json(200, { content: 'From content' }), 'From content'],
    ['answer', () => json(200, { answer: 'From answer' }), 'From answer'],
    [
      'choices[0].message.content',
      () => json(200, { choices: [{ message: { role: 'assistant', content: 'From choices' } }] }),
      'From choices',
    ],
    ['the first truthy field', () => json(200, { reply: '', message: 'Second' }), 'Second'],
    ['reply before the others', () => json(200, { answer: 'no', reply: 'yes' }), 'yes'],
    ['a plain text body', () => text(200, 'Plain **text**\n\n- one'), 'Plain **text**\n\n- one'],
    ['a JSON string body', () => json(200, 'A JSON string'), 'A JSON string'],
    ['a body without a content type', () => new Response('No type', { status: 200 }), 'No type'],
  ])('reads %s', async (_label, res, expected) => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(res()));
    await expect(api.postChat({ message: 'hi', history: [] })).resolves.toBe(expected);
  });

  it.each<[string, () => Response]>([
    ['an empty reply', () => json(200, { ok: true, reply: '' })],
    ['an object without a reply field', () => json(200, { ok: true })],
    ['a reply that is not a string', () => json(200, { reply: 5 })],
    ['a reply that is an object', () => json(200, { reply: { text: 'x' } })],
    ['a null body', () => json(200, null)],
    ['an empty text body', () => text(200, '')],
    [
      'broken JSON',
      () =>
        new Response('{"reply":', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    ],
  ])('treats %s as an error', async (_label, res) => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(res()));
    const e = await rejection(api.postChat({ message: 'hi', history: [] }));
    expect(e).toBeInstanceOf(api.ApiError);
    expect(e.code).toBe('INTERNAL');
    expect(e.status).toBe(200);
  });

  it('throws on a non 2xx status even when the body has a reply', async () => {
    const api = await loadApi();
    mockFetch(() =>
      Promise.resolve(
        json(500, { ok: false, reply: 'ignored', error: { code: 'INTERNAL', message: 'x' } }),
      ),
    );
    const e = await rejection(api.postChat({ message: 'hi', history: [] }));
    expect(e.code).toBe('INTERNAL');
    expect(e.status).toBe(500);
  });
});

describe('timeouts', () => {
  it('aborts the chat after 12 seconds with TIMEOUT', async () => {
    const api = await loadApi();
    vi.useFakeTimers();
    const fetchMock = hangingFetch();
    const result = settle(api.postChat({ message: 'hi', history: [] }));
    await vi.advanceTimersByTimeAsync(11999);
    const signal = call(fetchMock).init.signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    let done = false;
    void result.then(() => {
      done = true;
    });
    await Promise.resolve();
    expect(done).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const r = await result;
    expect(signal.aborted).toBe(true);
    expect(r.ok).toBe(false);
    const e = (r as { error: ApiModule.ApiError }).error;
    expect(e).toBeInstanceOf(api.ApiError);
    expect(e.code).toBe('TIMEOUT');
    expect(e.status).toBe(0);
    expect(e.message).toBe('The request took too long. Please try again.');
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each<[string, number, (api: Api) => Promise<unknown>]>([
    ['postContact', 15000, (api) => api.postContact(contactBody)],
    ['postBooking', 15000, (api) => api.postBooking(bookingBody, 'key-12345678')],
    ['getBookingSlots', 8000, (api) => api.getBookingSlots('2026-03-12', 'quick')],
    ['getBookingConfig', 8000, (api) => api.getBookingConfig()],
  ])('%s times out after %i ms', async (_name, ms, run) => {
    const api = await loadApi();
    vi.useFakeTimers();
    const fetchMock = hangingFetch();
    const result = settle(run(api));
    await vi.advanceTimersByTimeAsync(ms - 1);
    expect((call(fetchMock).init.signal as AbortSignal).aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const r = await result;
    expect(r.ok).toBe(false);
    expect((r as { error: ApiModule.ApiError }).error.code).toBe('TIMEOUT');
  });

  it('clears its timer once the call settles', async () => {
    const api = await loadApi();
    vi.useFakeTimers();
    mockFetch(() => Promise.resolve(json(200, { reply: 'ok' })));
    await api.postChat({ message: 'hi', history: [] });
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('errors', () => {
  it('429 with Retry-After gives RATE_LIMITED and the seconds', async () => {
    const api = await loadApi();
    mockFetch(() =>
      Promise.resolve(
        json(
          429,
          { ok: false, error: { code: 'RATE_LIMITED', message: 'Server text, not shown' } },
          { 'Retry-After': '42' },
        ),
      ),
    );
    const e = await rejection(api.postChat({ message: 'hi', history: [] }));
    expect(e).toBeInstanceOf(api.ApiError);
    expect(e.code).toBe('RATE_LIMITED');
    expect(e.status).toBe(429);
    expect(e.retryAfter).toBe(42);
    expect(e.fields).toBeUndefined();
    expect(e.message).toBe('Too many requests. Please wait a moment and try again.');
  });

  it('429 without an envelope is still RATE_LIMITED; no header leaves retryAfter out', async () => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(text(429, 'Too Many Requests')));
    const e = await rejection(api.postContact(contactBody));
    expect(e.code).toBe('RATE_LIMITED');
    expect(e.retryAfter).toBeUndefined();
    expect('retryAfter' in e).toBe(false);
  });

  it('parses Retry-After as seconds or as an HTTP date', async () => {
    const api = await loadApi();
    const now = Date.UTC(2026, 2, 10, 9, 0, 0);
    expect(api.parseRetryAfter('120', now)).toBe(120);
    expect(api.parseRetryAfter(' 0 ', now)).toBe(0);
    expect(api.parseRetryAfter('Tue, 10 Mar 2026 09:01:30 GMT', now)).toBe(90);
    expect(api.parseRetryAfter('Tue, 10 Mar 2026 08:00:00 GMT', now)).toBe(0);
    expect(api.parseRetryAfter('soon', now)).toBeUndefined();
    expect(api.parseRetryAfter(null, now)).toBeUndefined();
  });

  it('passes VALIDATION_ERROR fields through (string values only)', async () => {
    const api = await loadApi();
    mockFetch(() =>
      Promise.resolve(
        json(400, {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: { email: 'Invalid email', startedAt: 'Submitted too fast', bogus: 5 },
          },
        }),
      ),
    );
    const e = await rejection(api.postContact(contactBody));
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.status).toBe(400);
    expect(e.fields).toEqual({ email: 'Invalid email', startedAt: 'Submitted too fast' });
  });

  it.each<[number, unknown, ApiModule.ApiErrorCode]>([
    [400, 'Bad Request', 'VALIDATION_ERROR'],
    [404, { ok: false, error: { code: 'NOT_FOUND', message: 'x' } }, 'NOT_FOUND'],
    [404, 'Not Found', 'NOT_FOUND'],
    [413, 'Payload Too Large', 'VALIDATION_ERROR'],
    [500, 'Internal Server Error', 'INTERNAL'],
    [502, { ok: false, error: { code: 'UPSTREAM_ERROR', message: 'x' } }, 'UPSTREAM_ERROR'],
    [503, { ok: false, error: { code: 'WEIRD', message: 'x' } }, 'UPSTREAM_ERROR'],
    [500, { ok: false, error: { code: 'VALIDATION_ERROR', message: 'x' } }, 'VALIDATION_ERROR'],
    [401, 'Unauthorized', 'INTERNAL'],
  ])('status %i with %j gives %s', async (status, body, code) => {
    const api = await loadApi();
    mockFetch(() =>
      Promise.resolve(typeof body === 'string' ? text(status, body) : json(status, body)),
    );
    const e = await rejection(api.getBookingConfig());
    expect(e.code).toBe(code);
    expect(e.status).toBe(status);
  });

  it('a network failure gives NETWORK with status 0', async () => {
    const api = await loadApi();
    const cause = new TypeError('Failed to fetch');
    mockFetch(() => Promise.reject(cause));
    const e = await rejection(api.postChat({ message: 'hi', history: [] }));
    expect(e).toBeInstanceOf(api.ApiError);
    expect(e.code).toBe('NETWORK');
    expect(e.status).toBe(0);
    expect(e.cause).toBe(cause);
    expect(e.message).toBe(
      'The request could not reach the server. Please check your connection and try again.',
    );
  });

  it('a missing fetch gives NETWORK', async () => {
    const api = await loadApi();
    vi.stubGlobal('fetch', undefined);
    const e = await rejection(api.getBookingConfig());
    expect(e.code).toBe('NETWORK');
  });

  it('error messages are plain English without em dashes', async () => {
    const api = await loadApi();
    const codes: ApiModule.ApiErrorCode[] = [
      'VALIDATION_ERROR',
      'RATE_LIMITED',
      'SLOT_TAKEN',
      'UPSTREAM_ERROR',
      'NOT_FOUND',
      'INTERNAL',
      'TIMEOUT',
      'NETWORK',
      'DISABLED',
    ];
    for (const code of codes) {
      const e = new api.ApiError(code);
      expect(e.message.length).toBeGreaterThan(10);
      expect(e.message).not.toMatch(/[–—]/);
      expect(api.isApiError(e)).toBe(true);
      expect(api.isApiError(e, code)).toBe(true);
    }
    expect(api.isApiError(new Error('x'))).toBe(false);
    expect(api.isApiError(new api.ApiError('TIMEOUT'), 'NETWORK', 'DISABLED')).toBe(false);
  });
});

describe('caller abort', () => {
  it('aborting mid flight aborts the fetch and throws a cancelled NETWORK error', async () => {
    const api = await loadApi();
    vi.useFakeTimers();
    const fetchMock = hangingFetch();
    const ctrl = new AbortController();
    const result = settle(api.postChat({ message: 'hi', history: [] }, { signal: ctrl.signal }));
    await vi.advanceTimersByTimeAsync(1000);
    const signal = call(fetchMock).init.signal as AbortSignal;
    expect(signal).not.toBe(ctrl.signal);
    expect(signal.aborted).toBe(false);

    ctrl.abort();
    const r = await result;
    expect(signal.aborted).toBe(true);
    expect(r.ok).toBe(false);
    const e = (r as { error: ApiModule.ApiError }).error;
    expect(e.code).toBe('NETWORK');
    expect(e.status).toBe(0);
    expect(e.message).toBe('The request was cancelled.');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('an already aborted signal never fetches', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, { reply: 'x' })));
    const ctrl = new AbortController();
    ctrl.abort();
    const e = await rejection(api.postContact(contactBody, { signal: ctrl.signal }));
    expect(e.code).toBe('NETWORK');
    expect(e.message).toBe('The request was cancelled.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('removes its abort listener from the caller signal when done', async () => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(json(200, { reply: 'x' })));
    const ctrl = new AbortController();
    const add = vi.spyOn(ctrl.signal, 'addEventListener');
    const remove = vi.spyOn(ctrl.signal, 'removeEventListener');
    await api.postChat({ message: 'hi', history: [] }, { signal: ctrl.signal });
    expect(add).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('abort', add.mock.calls[0][1]);
  });
});

describe('postContact', () => {
  it('sends the contract body field for field, with website "" when left out', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, { ok: true })));
    await expect(api.postContact({ ...contactBody })).resolves.toEqual({ ok: true });

    const { url, init } = call(fetchMock);
    expect(url).toBe(BASE + '/api/contact');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('omit');
    expect(headersOf(init)).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    expect(init.body).toBe(
      '{"name":"Ali Khan","email":"ali@company.com","phone":"+1 555 123 4567","company":"Acme",' +
        '"projectType":"Maintenance & Support","budget":"$1,000 - $5,000",' +
        '"details":"We need help keeping our app healthy and fast.","website":"",' +
        '"startedAt":1773133200000}',
    );
  });

  it('keeps a filled honeypot and drops unknown extra properties', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, { ok: true })));
    const withExtra = { ...contactBody, website: 'spam.example', extra: 'nope' };
    await api.postContact(withExtra);
    const sent = JSON.parse(call(fetchMock).init.body as string);
    expect(Object.keys(sent)).toEqual([
      'name',
      'email',
      'phone',
      'company',
      'projectType',
      'budget',
      'details',
      'website',
      'startedAt',
    ]);
    expect(sent.website).toBe('spam.example');
  });

  it('accepts a 2xx without a JSON body', async () => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(new Response(null, { status: 204 })));
    await expect(api.postContact(contactBody)).resolves.toEqual({ ok: true });
  });
});

describe('postBooking', () => {
  it('sends bookingData() field for field with the Idempotency-Key header', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, bookingOk)));
    await expect(api.postBooking(bookingBody, 'key-12345678')).resolves.toEqual(bookingOk);

    const { url, init } = call(fetchMock);
    expect(url).toBe(BASE + '/api/booking');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('omit');
    expect(headersOf(init)).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Idempotency-Key': 'key-12345678',
    });
    expect(init.body).toBe(
      '{"sessionType":"deep","sessionName":"Technical Deep Dive","durationMinutes":60,' +
        '"pricePerSession":25,"sessions":2,"total":50,"currency":"USD",' +
        '"email":"ali@company.com","name":"Ali Khan","phone":"","company":"Acme",' +
        '"date":"2026-03-12","timezone":"Europe/London","startUtc":"2026-03-12T09:00:00.000Z",' +
        '"slots":["2026-03-12T09:00:00.000Z","2026-03-12T10:00:00.000Z"],' +
        '"timeLocal":"9:00 AM","timeLahore":"2:00 PM","platform":"Google Meet",' +
        '"notes":"A line or two.","website":""}',
    );
  });

  it('keeps a filled honeypot', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, bookingOk)));
    await api.postBooking({ ...bookingBody, website: 'bot' }, 'key-12345678');
    expect(JSON.parse(call(fetchMock).init.body as string).website).toBe('bot');
  });

  it.each<[string, () => Response]>([
    [
      'the SLOT_TAKEN envelope',
      () => json(409, { ok: false, error: { code: 'SLOT_TAKEN', message: 'Taken' } }),
    ],
    [
      'another envelope code',
      () => json(409, { ok: false, error: { code: 'VALIDATION_ERROR', message: 'x' } }),
    ],
    ['no envelope', () => text(409, 'Conflict')],
  ])('409 with %s is SLOT_TAKEN', async (_label, res) => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(res()));
    const e = await rejection(api.postBooking(bookingBody, 'key-12345678'));
    expect(e).toBeInstanceOf(api.ApiError);
    expect(e.code).toBe('SLOT_TAKEN');
    expect(e.status).toBe(409);
    expect(e.message).toBe('That time was just taken. Please pick another slot.');
  });

  it('normalizes a 2xx body (no meetLink gives null)', async () => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(json(200, { ok: true, bookingId: 'bk_9', meetLink: null })));
    await expect(api.postBooking(bookingBody, 'key-12345678')).resolves.toEqual({
      ok: true,
      bookingId: 'bk_9',
      meetLink: null,
      start: '',
      end: '',
    });
  });
});

describe('getBookingSlots', () => {
  it('GETs the slots for a day and session and returns the array', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() =>
      Promise.resolve(
        json(200, { ok: true, timezone: 'Asia/Karachi', slots: ['09:00', '10:00', '14:00'] }),
      ),
    );
    await expect(api.getBookingSlots('2026-03-12', 'deep')).resolves.toEqual([
      '09:00',
      '10:00',
      '14:00',
    ]);
    const { url, init } = call(fetchMock);
    expect(url).toBe(BASE + '/api/booking/slots?date=2026-03-12&session=deep');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(init.credentials).toBe('omit');
    expect(init.cache).toBe('no-store');
    expect(headersOf(init)).toEqual({ Accept: 'application/json' });
  });

  it('encodes the query values', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, { ok: true, slots: [] })));
    await expect(api.getBookingSlots('2026-03-12&x=1', 'quick')).resolves.toEqual([]);
    expect(call(fetchMock).url).toBe(
      BASE + '/api/booking/slots?date=2026-03-12%26x%3D1&session=quick',
    );
  });

  it('rejects a body without a slots array', async () => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(json(200, { ok: true })));
    const e = await rejection(api.getBookingSlots('2026-03-12', 'quick'));
    expect(e.code).toBe('INTERNAL');
    expect(e.status).toBe(200);
  });

  it('a weekend day (400) is VALIDATION_ERROR', async () => {
    const api = await loadApi();
    mockFetch(() =>
      Promise.resolve(json(400, { ok: false, error: { code: 'VALIDATION_ERROR', message: 'x' } })),
    );
    const e = await rejection(api.getBookingSlots('2026-03-14', 'quick'));
    expect(e.code).toBe('VALIDATION_ERROR');
  });
});

describe('getBookingConfig', () => {
  const config = {
    ok: true,
    platforms: { meet: true },
    sessions: {
      quick: { name: 'Quick Chat', minutes: 30, price: 15 },
      deep: { name: 'Technical Deep Dive', minutes: 60, price: 25 },
    },
    maxSessions: 10,
    currency: 'USD',
    windowDays: 60,
    hours: {
      days: 'Mon-Fri',
      start: '09:00',
      end: '18:00',
      firstSlot: '09:00',
      lastSlot: '17:00',
      stepMinutes: 60,
      timezone: 'Asia/Karachi',
    },
  };

  it('GETs the config', async () => {
    const api = await loadApi();
    const fetchMock = mockFetch(() => Promise.resolve(json(200, config)));
    await expect(api.getBookingConfig()).resolves.toEqual(config);
    const { url, init } = call(fetchMock);
    expect(url).toBe(BASE + '/api/booking/config');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
  });

  it('rejects a body that is not a config', async () => {
    const api = await loadApi();
    mockFetch(() => Promise.resolve(text(200, 'hello')));
    const e = await rejection(api.getBookingConfig());
    expect(e.code).toBe('INTERNAL');
  });
});

describe('newIdempotencyKey', () => {
  const UUID4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const HEADER = /^[A-Za-z0-9_-]{8,128}$/;

  it('returns a fresh uuid from crypto.randomUUID', async () => {
    const api = await loadApi();
    const spy = vi.spyOn(globalThis.crypto, 'randomUUID');
    const a = api.newIdempotencyKey();
    const b = api.newIdempotencyKey();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(a).toMatch(UUID4);
    expect(a).toMatch(HEADER);
    expect(a).not.toBe(b);
  });

  it('builds a v4 uuid from getRandomValues outside a secure context', async () => {
    const api = await loadApi();
    const real = globalThis.crypto;
    vi.stubGlobal('crypto', { getRandomValues: real.getRandomValues.bind(real) });
    const a = api.newIdempotencyKey();
    const b = api.newIdempotencyKey();
    expect(a).toMatch(UUID4);
    expect(a).toMatch(HEADER);
    expect(a).not.toBe(b);
  });
});
