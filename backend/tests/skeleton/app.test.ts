import { Router } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { JSON_LIMIT_CHAT, JSON_LIMIT_DEFAULT } from '../../src/app.js';
import { Errors } from '../../src/lib/errors.js';
import { parseInput } from '../../src/middleware/validate.js';
import type { ApiModule } from '../../src/routes/types.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { buildTestApp } from '../helpers/testApp.js';
import { makeTestEnv } from '../helpers/testEnv.js';

const ALLOWED_ORIGIN = 'http://localhost:3000';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** A body whose JSON is about `kb` kilobytes. */
function bodyOfKb(kb: number): string {
  const wrapper = JSON.stringify({ data: '' });
  return JSON.stringify({ data: 'x'.repeat(kb * 1024 - wrapper.length) });
}

/** A test module with one route per behaviour the skeleton must handle. */
const probeModule: ApiModule = {
  name: 'probe',
  createRouter() {
    const router = Router();
    const echo = (req: { body: unknown }, res: { json(body: unknown): void }) => {
      res.json({ ok: true, bytes: JSON.stringify(req.body ?? null).length });
    };
    router.post('/chat', echo);
    router.post('/contact', echo);
    router.get('/boom', () => {
      throw new Error('secret internal detail');
    });
    router.get('/async-boom', async () => {
      await Promise.resolve();
      throw new TypeError('async secret detail');
    });
    router.get('/limited', () => {
      throw Errors.rateLimited(42.2);
    });
    router.get('/upstream', () => {
      throw Errors.upstream(undefined, new Error('openrouter said 401 sk-or-leak'));
    });
    router.get('/off', () => {
      throw Errors.notConfigured('google');
    });
    router.get('/zod', () => {
      z.object({ date: z.string() }).parse({});
    });
    router.post('/validated', (req, res) => {
      const data = parseInput(z.object({ name: z.string().min(2) }), req.body);
      res.json({ ok: true, name: data.name });
    });
    router.get('/ip', (req, res) => {
      res.json({ ok: true, ip: req.ip });
    });
    router.get('/stream', (_req, res, next) => {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      res.write('data: {"delta":"Hi"}\n\n');
      next(new Error('stream broke'));
    });
    return router;
  },
};

describe('GET /api/health', () => {
  it('answers { ok: true, status: "up" } with request id, no-store and helmet headers', async () => {
    const { app } = await buildTestApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, status: 'up' });
    expect(res.headers['x-request-id']).toMatch(UUID_RE);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('answers HEAD without a body', async () => {
    const { app } = await buildTestApp();
    const res = await request(app).head('/api/health');
    expect(res.status).toBe(200);
    expect(res.text ?? '').toBe('');
    expect(res.headers['x-request-id']).toMatch(UUID_RE);
  });
});

describe('request id', () => {
  it('echoes a well formed X-Request-Id', async () => {
    const { app } = await buildTestApp();
    const res = await request(app).get('/api/health').set('X-Request-Id', 'abcDEF12-3456');
    expect(res.headers['x-request-id']).toBe('abcDEF12-3456');
  });

  it.each(['short', 'has spaces in it', 'bad_chars!!', 'x'.repeat(65)])(
    'replaces %s with a fresh uuid',
    async (incoming) => {
      const { app } = await buildTestApp();
      const res = await request(app).get('/api/health').set('X-Request-Id', incoming);
      expect(res.headers['x-request-id']).toMatch(UUID_RE);
    },
  );
});

describe('not found', () => {
  it('answers 404 with the envelope under /api and elsewhere', async () => {
    const { app } = await buildTestApp();
    for (const path of ['/api/nope', '/nope', '/api']) {
      const res = await request(app).get(path);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ ok: false, error: { code: 'NOT_FOUND', message: 'Not found.' } });
    }
    const api = await request(app).get('/api/nope');
    expect(api.headers['cache-control']).toBe('no-store');
    expect(api.headers['x-request-id']).toMatch(UUID_RE);
  });
});

describe('JSON body', () => {
  it('answers 400 VALIDATION_ERROR for malformed JSON', async () => {
    const { app } = await buildTestApp({ modules: [probeModule] });
    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name": "Ada",');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body.' },
    });
  });

  it('uses a 32 KB limit on every route except POST /api/chat', async () => {
    expect(JSON_LIMIT_DEFAULT).toBe('32kb');
    const { app } = await buildTestApp({ modules: [probeModule] });
    const ok = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send(bodyOfKb(31));
    expect(ok.status).toBe(200);

    for (const path of ['/api/contact', '/api/booking', '/api/nope', '/elsewhere']) {
      const res = await request(app)
        .post(path)
        .set('Content-Type', 'application/json')
        .send(bodyOfKb(33));
      expect(res.status).toBe(413);
      expect(res.body).toEqual({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Request body is too large.' },
      });
    }
  });

  it('accepts up to 64 KB on POST /api/chat only', async () => {
    expect(JSON_LIMIT_CHAT).toBe('64kb');
    const { app } = await buildTestApp({ modules: [probeModule] });
    for (const path of ['/api/chat', '/api/chat/', '/api/chat?stream=true']) {
      const res = await request(app)
        .post(path)
        .set('Content-Type', 'application/json')
        .send(bodyOfKb(63));
      expect(res.status).toBe(200);
      expect((res.body as { bytes: number }).bytes).toBeGreaterThan(60 * 1024);
    }
    const tooBig = await request(app)
      .post('/api/chat')
      .set('Content-Type', 'application/json')
      .send(bodyOfKb(65));
    expect(tooBig.status).toBe(413);
    expect((tooBig.body as { error: { code: string } }).error.code).toBe('VALIDATION_ERROR');
  });

  it('parses JSON bodies for module routes', async () => {
    const { app } = await buildTestApp({ modules: [probeModule] });
    const ok = await request(app).post('/api/validated').send({ name: 'Ada', extra: 1 });
    expect(ok.body).toEqual({ ok: true, name: 'Ada' });
    const bad = await request(app).post('/api/validated').send({ name: 'A' });
    expect(bad.status).toBe(400);
    expect((bad.body as { error: { fields: Record<string, string> } }).error.fields).toHaveProperty(
      'name',
    );
  });
});

describe('CORS', () => {
  it('allows a listed origin and exposes Retry-After and X-Request-Id', async () => {
    const { app } = await buildTestApp();
    const res = await request(app).get('/api/health').set('Origin', ALLOWED_ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(res.headers['access-control-expose-headers']).toBe('Retry-After,X-Request-Id');
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
    expect(res.headers.vary).toContain('Origin');
  });

  it('sends no allow-origin header to a foreign origin', async () => {
    const { app } = await buildTestApp();
    for (const origin of ['https://evil.example', 'http://localhost:3001', 'null']) {
      const res = await request(app).get('/api/health').set('Origin', origin);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    }
  });

  it('answers a preflight from a listed origin', async () => {
    const { app } = await buildTestApp({ modules: [probeModule] });
    const res = await request(app)
      .options('/api/booking')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type,idempotency-key,x-request-id');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(res.headers['access-control-allow-methods']).toBe('GET,POST,OPTIONS');
    expect(res.headers['access-control-allow-headers']).toBe(
      'Content-Type,Idempotency-Key,X-Request-Id',
    );
    expect(res.headers['access-control-max-age']).toBe('600');
  });

  it('gives a foreign preflight nothing the browser would accept', async () => {
    const { app } = await buildTestApp();
    const res = await request(app)
      .options('/api/contact')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('follows CORS_ORIGINS from the env', async () => {
    const env = makeTestEnv({ CORS_ORIGINS: ['https://faisalhanif.work'] });
    const { app } = await buildTestApp({ env });
    const site = await request(app).get('/api/health').set('Origin', 'https://faisalhanif.work');
    expect(site.headers['access-control-allow-origin']).toBe('https://faisalhanif.work');
    const local = await request(app).get('/api/health').set('Origin', ALLOWED_ORIGIN);
    expect(local.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('error handler', () => {
  it('answers 500 INTERNAL with no stack or error text; the log has both', async () => {
    const capture = createCapturingLogger();
    const { app } = await buildTestApp({ modules: [probeModule], logger: capture.logger });
    for (const path of ['/api/boom', '/api/async-boom']) {
      const res = await request(app).get(path);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        ok: false,
        error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' },
      });
      expect(res.text).not.toContain('secret');
      expect(res.text).not.toContain('at ');
      expect(res.text).not.toContain('Error');
    }
    const logged = capture.lines().filter((line) => line.msg === 'Unhandled error');
    expect(logged).toHaveLength(2);
    expect(logged[0]?.level).toBe(50);
    expect(JSON.stringify(logged[0])).toContain('secret internal detail');
    expect(JSON.stringify(logged[0])).toContain('stack');
    expect(JSON.stringify(logged[1])).toContain('async secret detail');
  });

  it('sends Retry-After with 429 RATE_LIMITED', async () => {
    const { app } = await buildTestApp({ modules: [probeModule] });
    const res = await request(app).get('/api/limited');
    expect(res.status).toBe(429);
    expect(res.headers['retry-after']).toBe('43');
    expect(res.body).toEqual({
      ok: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
    });
  });

  it('hides upstream text from the client and logs it', async () => {
    const capture = createCapturingLogger();
    const { app } = await buildTestApp({ modules: [probeModule], logger: capture.logger });
    const res = await request(app).get('/api/upstream');
    expect(res.status).toBe(502);
    expect(res.body).toEqual({
      ok: false,
      error: {
        code: 'UPSTREAM_ERROR',
        message: 'The service is busy right now. Please try again.',
      },
    });
    expect(res.text).not.toContain('sk-or-leak');
    expect(capture.text()).toContain('openrouter said 401');
  });

  it('answers 503 UPSTREAM_ERROR for a feature that is not configured', async () => {
    const capture = createCapturingLogger();
    const { app } = await buildTestApp({ modules: [probeModule], logger: capture.logger });
    const res = await request(app).get('/api/off');
    expect(res.status).toBe(503);
    expect((res.body as { error: { code: string } }).error.code).toBe('UPSTREAM_ERROR');
    expect(res.text).not.toContain('google');
    const line = capture.lines().find((l) => l.msg === 'Feature is not configured');
    expect(line).toMatchObject({ level: 40, feature: 'google' });
  });

  it('turns a thrown ZodError into 400 VALIDATION_ERROR with fields', async () => {
    const { app } = await buildTestApp({ modules: [probeModule] });
    const res = await request(app).get('/api/zod');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION_ERROR', fields: { date: expect.any(String) as string } },
    });
  });

  it('just ends a response whose headers were already sent (SSE)', async () => {
    const capture = createCapturingLogger();
    const { app } = await buildTestApp({ modules: [probeModule], logger: capture.logger });
    const res = await request(app).get('/api/stream').buffer(true);
    expect(res.status).toBe(200);
    expect(res.text).toBe('data: {"delta":"Hi"}\n\n');
    expect(capture.text()).toContain('Error after the response started');
  });
});

describe('proxy and logging', () => {
  it('trusts one proxy hop by default for req.ip', async () => {
    const { app } = await buildTestApp({ modules: [probeModule] });
    const res = await request(app).get('/api/ip').set('X-Forwarded-For', '203.0.113.9');
    expect((res.body as { ip: string }).ip).toBe('203.0.113.9');
  });

  it('ignores X-Forwarded-For when TRUST_PROXY is false', async () => {
    const env = makeTestEnv({ TRUST_PROXY: false });
    const { app } = await buildTestApp({ modules: [probeModule], env });
    const res = await request(app).get('/api/ip').set('X-Forwarded-For', '203.0.113.9');
    expect((res.body as { ip: string }).ip).not.toBe('203.0.113.9');
  });

  it('logs method, path without query, status, time and id only', async () => {
    const capture = createCapturingLogger();
    const { app } = await buildTestApp({ modules: [probeModule], logger: capture.logger });
    await request(app)
      .post('/api/contact?email=visitor@example.com')
      .set('X-Request-Id', 'req-12345678')
      .set('Authorization', 'Bearer sk-secret-token')
      .set('Cookie', 'session=abc')
      .set('X-Forwarded-For', '198.51.100.23')
      .send({ name: 'Zed Sentinel', email: 'zed@example.com', details: 'private project' });
    const line = capture.lines().find((l) => l.msg === 'request completed');
    expect(line).toMatchObject({
      level: 30,
      req: { id: 'req-12345678', method: 'POST', path: '/api/contact' },
      res: { statusCode: 200 },
    });
    expect(typeof line?.responseTime).toBe('number');
    const text = capture.text();
    for (const secret of [
      'visitor@example.com',
      'sk-secret-token',
      'session=abc',
      '198.51.100.23',
      'Zed Sentinel',
      'zed@example.com',
      'private project',
      'user-agent',
    ]) {
      expect(text).not.toContain(secret);
    }
  });

  it('logs health at debug, 4xx at warn and 5xx at error', async () => {
    const capture = createCapturingLogger();
    const { app } = await buildTestApp({ modules: [probeModule], logger: capture.logger });
    await request(app).get('/api/health');
    await request(app).get('/api/nope');
    await request(app).get('/api/boom');
    const levels = capture
      .lines()
      .filter((l) => l.msg === 'request completed' || l.msg === 'request errored')
      .map((l) => [(l.req as { path: string }).path, l.level]);
    expect(levels).toEqual([
      ['/api/health', 20],
      ['/api/nope', 40],
      ['/api/boom', 50],
    ]);
  });

  it('redacts personal data even when a caller logs it by mistake', () => {
    const capture = createCapturingLogger();
    capture.logger.info(
      {
        email: 'a@example.com',
        booking: { email: 'b@example.com', phone: '+1 555', company: 'Acme', notes: 'n' },
        contact: { details: 'secret plans' },
        name: 'contact',
        message: 'kept',
      },
      'oops',
    );
    const text = capture.text();
    for (const value of ['a@example.com', 'b@example.com', '+1 555', 'Acme', 'secret plans']) {
      expect(text).not.toContain(value);
    }
    expect(capture.lines()[0]).toMatchObject({
      service: 'faisal-portfolio-api',
      name: 'contact',
      message: 'kept',
    });
  });
});
