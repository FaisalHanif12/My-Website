import { Router } from 'express';
import type { Express, Request, RequestHandler } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CounterStoreAdapter,
  RATE_LIMITED_EVENT,
  RATE_LIMITS,
  clientIpKey,
  createRateLimiter,
  rateLimitPrefix,
  rateLimiters,
} from '../../src/middleware/rateLimit.js';
import type { RateLimiters } from '../../src/middleware/rateLimit.js';
import type { ApiModule } from '../../src/routes/types.js';
import { MemoryStore } from '../../src/store/memoryStore.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import type { CapturingLogger } from '../helpers/logCapture.js';
import { buildTestApp } from '../helpers/testApp.js';

const IP_A = '198.51.100.10';
const IP_B = '198.51.100.20';
const START = Date.UTC(2026, 8, 29, 6, 0, 0);

const ok: RequestHandler = (_req, res) => {
  res.json({ ok: true });
};

function moduleOf(name: string, mount: (router: Router) => void): ApiModule {
  return {
    name,
    createRouter() {
      const router = Router();
      mount(router);
      return router;
    },
  };
}

let store: MemoryStore;
let capture: CapturingLogger;

beforeEach(() => {
  store = new MemoryStore({ sweepIntervalMs: 0 });
  capture = createCapturingLogger();
});

afterEach(async () => {
  vi.useRealTimers();
  await store.close();
});

async function appWith(...modules: ApiModule[]): Promise<Express> {
  const { app } = await buildTestApp({ modules, logger: capture.logger });
  return app;
}

/** A chat-like module: POST /chat behind both chat limiters. */
function chatModule(limiters: RateLimiters): ApiModule {
  return moduleOf('chat', (router) => {
    router.post('/chat', limiters.chatPerMinute, limiters.chatPerDay, ok);
  });
}

function postChat(app: Express, ip: string) {
  return request(app).post('/api/chat').set('X-Forwarded-For', ip);
}

describe('RATE_LIMITS', () => {
  it('holds the limits from the spec', () => {
    expect(RATE_LIMITS).toEqual({
      chatPerMinute: { limit: 8, windowMs: 60_000 },
      chatPerDay: { limit: 60, windowMs: 86_400_000 },
      contact: { limit: 5, windowMs: 3_600_000 },
      booking: { limit: 3, windowMs: 3_600_000 },
      bookingInfo: { limit: 60, windowMs: 60_000 },
    });
  });

  it('rateLimiters() builds one middleware per limit', () => {
    const limiters = rateLimiters(store);
    expect(Object.keys(limiters).sort()).toEqual(Object.keys(RATE_LIMITS).sort());
    for (const limiter of Object.values(limiters)) expect(typeof limiter).toBe('function');
  });
});

describe('chat limiters', () => {
  it('answers the 9th request in a minute with the 429 envelope and Retry-After', async () => {
    const app = await appWith(chatModule(rateLimiters(store)));
    for (let i = 0; i < 8; i += 1) {
      const res = await postChat(app, IP_A);
      expect(res.status).toBe(200);
    }

    const res = await postChat(app, IP_A);
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      ok: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
    });
    const retryAfter = res.headers['retry-after'];
    expect(retryAfter).toMatch(/^\d+$/);
    expect(Number(retryAfter)).toBeGreaterThanOrEqual(1);
    expect(Number(retryAfter)).toBeLessThanOrEqual(60);
  });

  it('does not affect another IP', async () => {
    const app = await appWith(chatModule(rateLimiters(store)));
    for (let i = 0; i < 9; i += 1) await postChat(app, IP_A);
    expect((await postChat(app, IP_A)).status).toBe(429);
    expect((await postChat(app, IP_B)).status).toBe(200);
  });

  it('sends the draft 8 RateLimit headers and no X-RateLimit headers', async () => {
    const app = await appWith(chatModule(rateLimiters(store)));
    const res = await postChat(app, IP_A);
    expect(res.headers['ratelimit']).toContain('"chatPerMinute"; r=7');
    expect(res.headers['ratelimit']).toContain('"chatPerDay"; r=59');
    expect(res.headers['ratelimit-policy']).toContain('"chatPerMinute"; q=8; w=60');
    expect(res.headers['x-ratelimit-limit']).toBeUndefined();
  });

  it('keeps its counters in the injected store', async () => {
    const increment = vi.spyOn(store, 'increment');
    const app = await appWith(chatModule(rateLimiters(store)));
    for (let i = 0; i < 9; i += 1) await postChat(app, IP_A);

    expect(increment).toHaveBeenCalledWith(`${rateLimitPrefix('chatPerMinute')}${IP_A}`, 60_000);
    expect(increment).toHaveBeenCalledWith(`${rateLimitPrefix('chatPerDay')}${IP_A}`, 86_400_000);
    expect((await postChat(app, IP_A)).status).toBe(429);

    // Clearing the counter in the store lets the visitor in again.
    await store.reset(`rl:chatPerMinute:${IP_A}`);
    expect((await postChat(app, IP_A)).status).toBe(200);
  });

  it('logs a warn line with the limiter name and never the IP', async () => {
    const app = await appWith(chatModule(rateLimiters(store)));
    for (let i = 0; i < 9; i += 1) await postChat(app, IP_A);

    const lines = capture.lines().filter((line) => line.msg === RATE_LIMITED_EVENT);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ level: 40, limiter: 'chatPerMinute' });
    expect(capture.text()).not.toContain(IP_A);
  });

  it('counts both limiters, so request 61 in a day gets 429 even spread over minutes', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(START);
    const app = await appWith(chatModule(rateLimiters(store)));

    // 60 requests in batches of at most 8, each batch in a new minute window.
    for (let sent = 0; sent < 60; sent += 1) {
      if (sent > 0 && sent % 8 === 0) vi.setSystemTime(Date.now() + 61_000);
      const res = await postChat(app, IP_A);
      expect(res.status).toBe(200);
    }

    vi.setSystemTime(Date.now() + 61_000);
    const res = await postChat(app, IP_A);
    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({ ok: false, error: { code: 'RATE_LIMITED' } });
    // The day window started at START, so the wait is most of a day, not a minute.
    const elapsedSeconds = (Date.now() - START) / 1000;
    expect(Number(res.headers['retry-after'])).toBe(Math.ceil(86_400 - elapsedSeconds));
    expect(capture.lines().find((line) => line.msg === RATE_LIMITED_EVENT)).toMatchObject({
      limiter: 'chatPerDay',
    });

    // The next day the visitor is let in again.
    vi.setSystemTime(START + 86_400_000);
    expect((await postChat(app, IP_A)).status).toBe(200);
  });

  it('opens a new minute window once the old one ends', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(START);
    const app = await appWith(chatModule(rateLimiters(store)));
    for (let i = 0; i < 8; i += 1) await postChat(app, IP_A);

    vi.setSystemTime(START + 59_999);
    const limited = await postChat(app, IP_A);
    expect(limited.status).toBe(429);
    // Whole seconds and never below one, even with 1 ms left.
    expect(limited.headers['retry-after']).toBe('1');

    vi.setSystemTime(START + 60_000);
    expect((await postChat(app, IP_A)).status).toBe(200);
  });
});

describe('per route limiters across module routers', () => {
  it('a limiter on one route never counts requests to another module mounted at /api', async () => {
    const increment = vi.spyOn(store, 'increment');
    const limiters = rateLimiters(store);
    // Mounted first, so its router also sees every request meant for the next module.
    const contact = moduleOf('contact', (router) => {
      router.post('/contact', limiters.contact, ok);
    });
    const bookingInfo = moduleOf('booking-info', (router) => {
      router.get('/booking/slots', ok);
      router.get('/booking/config', limiters.bookingInfo, ok);
    });
    const app = await appWith(contact, bookingInfo);

    for (let i = 0; i < 12; i += 1) {
      expect(
        (await request(app).get('/api/booking/slots').set('X-Forwarded-For', IP_A)).status,
      ).toBe(200);
      await request(app).get('/api/nothing-here').set('X-Forwarded-For', IP_A);
    }
    expect(increment).not.toHaveBeenCalled();

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app).post('/api/contact').set('X-Forwarded-For', IP_A);
      expect(res.status).toBe(200);
    }
    const res = await request(app).post('/api/contact').set('X-Forwarded-For', IP_A);
    expect(res.status).toBe(429);

    // The contact limit does not spill onto the other module's limited route either.
    const config = await request(app).get('/api/booking/config').set('X-Forwarded-For', IP_A);
    expect(config.status).toBe(200);
    const keys = increment.mock.calls.map(([key]) => key);
    expect(new Set(keys)).toEqual(new Set([`rl:contact:${IP_A}`, `rl:bookingInfo:${IP_A}`]));
  });

  it('limiters built by separate rateLimiters() calls share the counters in one store', async () => {
    const first = moduleOf('booking', (router) => {
      router.post('/booking', rateLimiters(store).booking, ok);
    });
    const app = await appWith(first);
    for (let i = 0; i < 3; i += 1)
      await request(app).post('/api/booking').set('X-Forwarded-For', IP_A);

    const second = moduleOf('booking', (router) => {
      router.post('/booking', rateLimiters(store).booking, ok);
    });
    const rebuilt = await appWith(second);
    const res = await request(rebuilt).post('/api/booking').set('X-Forwarded-For', IP_A);
    expect(res.status).toBe(429);
  });
});

describe('client key', () => {
  function fakeRequest(ip: string | undefined): Request {
    return { ip } as Request;
  }

  it('uses the IPv4 address as it is, also when IPv4-mapped', () => {
    expect(clientIpKey(fakeRequest('203.0.113.9'))).toBe('203.0.113.9');
    expect(clientIpKey(fakeRequest('::ffff:203.0.113.9'))).toBe('203.0.113.9');
  });

  it('groups IPv6 addresses by their /56 subnet', () => {
    const a = clientIpKey(fakeRequest('2001:db8:abcd:1200::1'));
    const b = clientIpKey(fakeRequest('2001:db8:abcd:12ff:ffff::2'));
    const other = clientIpKey(fakeRequest('2001:db8:abcd:1300::1'));
    expect(a).toBe(b);
    expect(a).not.toBe(other);
    expect(a).toMatch(/\/56$/);
  });

  it('still returns a key when Express has no address', () => {
    expect(clientIpKey(fakeRequest(undefined))).toBe('unknown-client');
  });

  it('limits IPv6 visitors of one subnet together', async () => {
    const app = await appWith(
      moduleOf('booking', (router) => {
        router.post('/booking', rateLimiters(store).booking, ok);
      }),
    );
    const post = (ip: string) => request(app).post('/api/booking').set('X-Forwarded-For', ip);
    await post('2001:db8:abcd:1200::1');
    await post('2001:db8:abcd:1200::2');
    await post('2001:db8:abcd:1234::3');
    expect((await post('2001:db8:abcd:1200::4')).status).toBe(429);
    expect((await post('2001:db8:abcd:1300::1')).status).toBe(200);
  });

  it('accepts a custom key generator', async () => {
    const limiter = createRateLimiter({
      name: 'custom',
      windowMs: 60_000,
      limit: 1,
      store,
      keyGenerator: () => 'everyone',
    });
    const app = await appWith(
      moduleOf('custom', (router) => {
        router.post('/custom', limiter, ok);
      }),
    );
    expect((await request(app).post('/api/custom').set('X-Forwarded-For', IP_A)).status).toBe(200);
    expect((await request(app).post('/api/custom').set('X-Forwarded-For', IP_B)).status).toBe(429);
  });
});

describe('CounterStoreAdapter', () => {
  it('maps the CounterStore onto the express-rate-limit Store under its prefix', async () => {
    const adapter = new CounterStoreAdapter(store, 'rl:test:', 1000);
    expect(adapter.prefix).toBe('rl:test:');
    expect(adapter.localKeys).toBe(false);

    const first = await adapter.increment('k');
    expect(first.totalHits).toBe(1);
    expect(first.resetTime).toBeInstanceOf(Date);
    await adapter.increment('k');
    await adapter.decrement('k');
    await expect(store.increment('rl:test:k', 1000)).resolves.toMatchObject({ count: 2 });

    await adapter.resetKey('k');
    await expect(adapter.increment('k')).resolves.toMatchObject({ totalHits: 1 });
  });

  it('takes windowMs from init()', async () => {
    const increment = vi.spyOn(store, 'increment');
    const adapter = new CounterStoreAdapter(store, 'rl:test:', 1000);
    adapter.init({ windowMs: 5000 } as Parameters<CounterStoreAdapter['init']>[0]);
    await adapter.increment('k');
    expect(increment).toHaveBeenCalledWith('rl:test:k', 5000);
  });
});

describe('express-rate-limit problems', () => {
  /** A misconfiguration: two limiters with one name on one route count a request twice. */
  function twiceModule(options: { withLogger: boolean }): ApiModule {
    const build = () =>
      createRateLimiter({
        name: 'twice',
        windowMs: 60_000,
        limit: 10,
        store,
        ...(options.withLogger ? { logger: capture.logger } : {}),
      });
    const first = build();
    const second = build();
    return moduleOf('twice', (router) => {
      router.post('/twice', first, second, ok);
    });
  }

  it('are logged with a code and the limiter name, never the client IP', async () => {
    const app = await appWith(twiceModule({ withLogger: true }));
    await request(app).post('/api/twice').set('X-Forwarded-For', IP_A);

    const problem = capture.lines().find((line) => line.msg === 'rate_limiter_problem');
    expect(problem).toMatchObject({ level: 50, limiter: 'twice', code: 'ERR_ERL_DOUBLE_COUNT' });
    expect(capture.text()).not.toContain(IP_A);
  });

  it('fall back to a Node warning without the IP when no logger is given', async () => {
    const emitWarning = vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
    const app = await appWith(twiceModule({ withLogger: false }));
    await request(app).post('/api/twice').set('X-Forwarded-For', IP_A);

    expect(emitWarning).toHaveBeenCalledWith(
      'express-rate-limit reported ERR_ERL_DOUBLE_COUNT for limiter "twice"',
    );
    const warned = emitWarning.mock.calls.map((call) => String(call[0])).join('\n');
    expect(warned).not.toContain(IP_A);
  });
});
