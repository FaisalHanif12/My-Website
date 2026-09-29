import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createContactModule } from '../../src/routes/contact.routes.js';
import { createMemoryMailer } from '../../src/services/mail/index.js';
import { MemoryStore } from '../../src/store/index.js';
import { isSubmittedTooFast } from '../../src/validators/contact.js';
import { bodyOf } from '../helpers/body.js';
import { buildTestApp } from '../helpers/testApp.js';
import { makeTestEnv } from '../helpers/testEnv.js';

const NOW = new Date('2026-10-06T09:00:00Z');

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+44 20 7946 0958',
  company: 'Analytical Engines',
  projectType: 'Web Application',
  budget: '$1,000 - $5,000',
  details: 'I need a portfolio site with a booking flow and an AI chat.',
  website: '',
  startedAt: NOW.getTime() - 20_000,
};

async function setup(mailer = createMemoryMailer(), envOverrides = {}) {
  const store = new MemoryStore();
  const { app } = await buildTestApp({
    env: makeTestEnv(envOverrides),
    modules: [createContactModule({ mailer, store, now: () => NOW })],
  });
  return { app, mailer, store };
}

describe('POST /api/contact', () => {
  it('emails the owner with Reply-To and the visitor a confirmation', async () => {
    const { app, mailer } = await setup();
    const res = await request(app).post('/api/contact').send(VALID);
    expect(res.status).toBe(200);
    expect(bodyOf(res)).toEqual({ ok: true });
    const owner = mailer.byTag('contact-owner')[0]!;
    expect(owner.to).toBe('owner@example.com');
    expect(owner.replyTo).toBe('ada@example.com');
    expect(owner.subject).toBe('New message from Ada Lovelace via faisalhanif.work');
    expect(owner.html).toContain('Web Application');
    expect(owner.html).toContain('Analytical Engines');
    expect(owner.text).toContain('portfolio site');
    const visitor = mailer.byTag('contact-visitor')[0]!;
    expect(visitor.to).toBe('ada@example.com');
    expect(visitor.subject).toBe('Thanks, I got your message');
  });

  it('escapes visitor input in the HTML', async () => {
    const { app, mailer } = await setup();
    await request(app)
      .post('/api/contact')
      .send({
        ...VALID,
        name: 'Eve <script>alert(1)</script>',
        details: '<img src=x onerror=alert(1)> please build me something nice',
      });
    const html = mailer.byTag('contact-owner')[0]!.html;
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;');
  });

  it('returns field errors for invalid input', async () => {
    const { app, mailer } = await setup();
    const res = await request(app)
      .post('/api/contact')
      .send({
        ...VALID,
        name: 'A',
        email: 'nope',
        phone: 'abc',
        projectType: 'Something',
        budget: 'free',
        details: 'short',
      });
    expect(res.status).toBe(400);
    expect(bodyOf(res).error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(bodyOf(res).error.fields).sort()).toEqual(
      ['budget', 'details', 'email', 'name', 'phone', 'projectType'].sort(),
    );
    expect(mailer.outbox).toHaveLength(0);
  });

  it('accepts empty optional fields and no budget', async () => {
    const { app, mailer } = await setup();
    const res = await request(app)
      .post('/api/contact')
      .send({ ...VALID, phone: '', company: '', budget: '' });
    expect(res.status).toBe(200);
    expect(mailer.byTag('contact-owner')).toHaveLength(1);
  });

  it('a filled honeypot gets a normal 200 and sends nothing, even with other fields wrong', async () => {
    const { app, mailer } = await setup();
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'x', website: 'http://spam.test' });
    expect(res.status).toBe(200);
    expect(bodyOf(res)).toEqual({ ok: true });
    expect(mailer.outbox).toHaveLength(0);
  });

  it('rejects a submit under three seconds after the form was shown', async () => {
    const { app, mailer } = await setup();
    const res = await request(app)
      .post('/api/contact')
      .send({ ...VALID, startedAt: NOW.getTime() - 1500 });
    expect(res.status).toBe(400);
    expect(bodyOf(res).error.fields.startedAt).toBeDefined();
    expect(mailer.outbox).toHaveLength(0);
    expect(isSubmittedTooFast(NOW.getTime() - 3000, NOW.getTime())).toBe(false);
    expect(isSubmittedTooFast(NOW.getTime() - 2999, NOW.getTime())).toBe(true);
    // A visitor whose clock is an hour ahead is not treated as a bot.
    expect(isSubmittedTooFast(NOW.getTime() + 3_600_000, NOW.getTime())).toBe(false);
  });

  it('returns UPSTREAM_ERROR when the owner email fails, and lets the visitor retry', async () => {
    const mailer = createMemoryMailer({ failOn: 'contact-owner' });
    const { app } = await setup(mailer);
    const res = await request(app).post('/api/contact').send(VALID);
    expect(res.status).toBe(502);
    expect(bodyOf(res).error.code).toBe('UPSTREAM_ERROR');
    mailer.setFailOn(undefined);
    const retry = await request(app).post('/api/contact').send(VALID);
    expect(retry.status).toBe(200);
    expect(mailer.byTag('contact-owner')).toHaveLength(1);
  });

  it('still succeeds when only the visitor confirmation fails', async () => {
    const mailer = createMemoryMailer({ failOn: 'contact-visitor' });
    const { app } = await setup(mailer);
    const res = await request(app).post('/api/contact').send(VALID);
    expect(res.status).toBe(200);
    expect(mailer.byTag('contact-owner')).toHaveLength(1);
  });

  it('does not send the same message twice in a row', async () => {
    const { app, mailer } = await setup();
    await request(app).post('/api/contact').send(VALID);
    const again = await request(app).post('/api/contact').send(VALID);
    expect(again.status).toBe(200);
    expect(mailer.byTag('contact-owner')).toHaveLength(1);
  });

  it('limits to 5 per hour per IP', async () => {
    const { app } = await setup();
    for (let i = 0; i < 5; i += 1) {
      const res = await request(app)
        .post('/api/contact')
        .send({ ...VALID, details: `Message number ${i} with enough text to pass.` });
      expect(res.status).toBe(200);
    }
    const res = await request(app).post('/api/contact').send(VALID);
    expect(res.status).toBe(429);
    expect(res.headers['retry-after']).toBeDefined();
  });

  it('answers 503 when mail is not configured', async () => {
    const { app } = await buildTestApp({
      env: makeTestEnv({ SMTP_USER: undefined, SMTP_PASS: undefined }),
      modules: [createContactModule({ store: new MemoryStore(), now: () => NOW })],
    });
    const res = await request(app).post('/api/contact').send(VALID);
    expect(res.status).toBe(503);
  });

  it('rejects a body that is not an object', async () => {
    const { app } = await setup();
    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('[1,2]');
    expect(res.status).toBe(400);
  });
});
