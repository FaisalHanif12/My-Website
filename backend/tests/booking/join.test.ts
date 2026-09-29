import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createJoinModule } from '../../src/routes/join.routes.js';
import {
  JOIN_CLOSES_AFTER_MS,
  JOIN_OPENS_BEFORE_MS,
  createJoinLinks,
  joinSecret,
  joinState,
  joinWindow,
} from '../../src/services/booking/joinLink.js';
import { MemoryStore } from '../../src/store/index.js';
import { buildTestApp } from '../helpers/testApp.js';
import { makeTestEnv } from '../helpers/testEnv.js';

const START = new Date('2026-10-08T05:00:00.000Z');
const END = new Date('2026-10-08T06:00:00.000Z');
const RAW = 'https://meet.google.com/abc-defg-hij';
const env = makeTestEnv();
const links = createJoinLinks('test-secret', env.SITE_URL);
const url = links.create({
  bookingId: 'FH-TEST0001',
  url: RAW,
  start: START.toISOString(),
  end: END.toISOString(),
});
const tokenOf = (u: string) => u.split('/').pop()!;

async function get(now: Date, token = tokenOf(url)) {
  const { app } = await buildTestApp({
    modules: [createJoinModule({ joinLinks: links, store: new MemoryStore(), now: () => now })],
  });
  return request(app).get(`/api/join/${token}`).redirects(0);
}

describe('join link window', () => {
  it('opens 10 minutes before the start and closes 15 minutes after the end', () => {
    const w = joinWindow(START, END);
    expect(w.opensAt.getTime()).toBe(START.getTime() - JOIN_OPENS_BEFORE_MS);
    expect(w.closesAt.getTime()).toBe(END.getTime() + JOIN_CLOSES_AFTER_MS);
    expect(joinState(w, new Date(START.getTime() - JOIN_OPENS_BEFORE_MS - 1))).toBe('early');
    expect(joinState(w, new Date(START.getTime() - JOIN_OPENS_BEFORE_MS))).toBe('open');
    expect(joinState(w, new Date(END.getTime() + JOIN_CLOSES_AFTER_MS))).toBe('open');
    expect(joinState(w, new Date(END.getTime() + JOIN_CLOSES_AFTER_MS + 1))).toBe('ended');
  });

  it('picks a secret from JOIN_LINK_SECRET, else an existing server secret, else none', () => {
    expect(joinSecret({ JOIN_LINK_SECRET: 'a', GOOGLE_CLIENT_SECRET: 'b', SMTP_PASS: 'c' })).toBe(
      'a',
    );
    expect(
      joinSecret({ JOIN_LINK_SECRET: undefined, GOOGLE_CLIENT_SECRET: 'b', SMTP_PASS: 'c' }),
    ).toBe('b');
    expect(
      joinSecret({
        JOIN_LINK_SECRET: undefined,
        GOOGLE_CLIENT_SECRET: undefined,
        SMTP_PASS: undefined,
      }),
    ).toBeNull();
  });
});

describe('join link token', () => {
  it('does not show the real meeting address and cannot be changed', () => {
    const token = tokenOf(url);
    expect(Buffer.from(token, 'base64url').toString('utf8')).not.toContain('meet.google.com');
    expect(token).not.toContain('meet');
    expect(links.read(token)?.url).toBe(RAW);
    const flipped = Buffer.from(token, 'base64url');
    flipped[flipped.length - 1] = (flipped[flipped.length - 1] ?? 0) ^ 1;
    expect(links.read(flipped.toString('base64url'))).toBeNull();
    expect(links.read('garbage')).toBeNull();
    expect(createJoinLinks('another-secret', env.SITE_URL).read(token)).toBeNull();
  });
});

describe('GET /api/join/:token', () => {
  it('shows a "not open yet" page with the time before the window and gives out no address', async () => {
    const res = await get(new Date(START.getTime() - JOIN_OPENS_BEFORE_MS - 60_000));
    expect(res.status).toBe(200);
    expect(res.headers.location).toBeUndefined();
    expect(res.text).toContain('Not open yet');
    expect(res.text).toContain('Thursday, 8 October 2026');
    expect(res.text).not.toContain('meet.google.com');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('redirects to the real address inside the window', async () => {
    for (const at of [new Date(START.getTime() - JOIN_OPENS_BEFORE_MS), START, END]) {
      const res = await get(at);
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(RAW);
    }
  });

  it('answers 410 after the window with no address', async () => {
    const res = await get(new Date(END.getTime() + JOIN_CLOSES_AFTER_MS + 60_000));
    expect(res.status).toBe(410);
    expect(res.text).toContain('has ended');
    expect(res.text).not.toContain('meet.google.com');
  });

  it('answers 404 for a token that is not valid', async () => {
    const res = await get(START, 'not-a-token');
    expect(res.status).toBe(404);
  });
});
