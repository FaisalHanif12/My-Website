import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createBookingInfoModule } from '../../src/routes/booking-info.routes.js';
import { createBookingModule } from '../../src/routes/booking.routes.js';
import { createFakeCalendar } from '../../src/services/calendar/fake.js';
import { createJoinLinks, joinSecret } from '../../src/services/booking/joinLink.js';
import { createMemoryMailer } from '../../src/services/mail/index.js';
import { createGoogleMeetProvider } from '../../src/services/meeting/googleMeet.js';
import type { MeetingProvider } from '../../src/services/meeting/types.js';
import { MemoryStore } from '../../src/store/index.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { bodyOf } from '../helpers/body.js';
import { buildTestApp } from '../helpers/testApp.js';
import { makeTestEnv } from '../helpers/testEnv.js';

/** Tuesday 6 October 2026, 14:00 in Lahore. */
const NOW = new Date('2026-10-06T09:00:00Z');
/** Thursday 8 October 2026, 10:00 in Lahore (05:00 UTC). */
const SLOT = '2026-10-08T05:00:00.000Z';

const BODY = {
  sessionType: 'deep',
  sessionName: 'Wrong Name',
  durationMinutes: 5,
  pricePerSession: 1,
  sessions: 3,
  total: 3,
  currency: 'USD',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  phone: '+44 20 7946 0958',
  company: 'Analytical Engines',
  date: '2026-10-08',
  timezone: 'Europe/London',
  startUtc: SLOT,
  timeLocal: '6:00 AM',
  timeLahore: '10:00 AM',
  platform: 'Google Meet',
  notes: 'Please cover architecture.',
  website: '',
};

const KEY = 'key-aaaaaaaa-0001';

const zoomStub = (joinUrl: string | null): MeetingProvider => ({
  platform: 'Zoom',
  configured: joinUrl !== null,
  plan: () =>
    Promise.resolve({
      platform: 'Zoom',
      withGoogleMeet: false,
      joinUrl,
      pending: joinUrl === null,
      ...(joinUrl ? { externalId: '123' } : {}),
    }),
});

async function setup(
  options: { zoom?: string | null; mailer?: ReturnType<typeof createMemoryMailer> } = {},
) {
  const calendar = createFakeCalendar({ now: () => NOW });
  const mailer = options.mailer ?? createMemoryMailer();
  const store = new MemoryStore();
  const logs = createCapturingLogger();
  const env = makeTestEnv();
  const meetingFor = (platform: string): MeetingProvider =>
    platform === 'Zoom' ? zoomStub(options.zoom ?? null) : createGoogleMeetProvider();
  let n = 0;
  const { app } = await buildTestApp({
    env,
    logger: logs.logger,
    modules: [
      createBookingInfoModule({ calendar, store, now: () => NOW }),
      createBookingModule({
        calendar,
        mailer,
        store,
        now: () => NOW,
        meetingFor,
        newId: () => `FH-TEST${(n += 1).toString().padStart(4, '0')}`,
      }),
    ],
  });
  return { app, calendar, mailer, store, logs };
}

const post = (
  app: Parameters<typeof request>[0],
  body: object = BODY,
  key: string | null = KEY,
) => {
  const req = request(app).post('/api/booking');
  if (key) req.set('Idempotency-Key', key);
  return req.send(body);
};

describe('POST /api/booking', () => {
  it('creates one event and emails both sides the same Meet link with an .ics', async () => {
    const { app, calendar, mailer } = await setup();
    const res = await post(app);
    expect(res.status).toBe(200);
    expect(bodyOf(res).ok).toBe(true);
    expect(bodyOf(res).bookingId).toBe('FH-TEST0001');
    expect(bodyOf(res).start).toBe(SLOT);
    expect(bodyOf(res).end).toBe('2026-10-08T06:00:00.000Z');
    // Both sides get the join link, which hands out the real Meet address only around the booked time.
    const joinUrl = bodyOf(res).meetLink!;
    expect(joinUrl).toMatch(/^https:\/\/faisalhanif\.work\/api\/join\/[A-Za-z0-9_-]+$/);
    const env = makeTestEnv();
    const inside = createJoinLinks(joinSecret(env)!, env.SITE_URL).read(joinUrl.split('/').pop()!);
    expect(inside).toMatchObject({
      bookingId: 'FH-TEST0001',
      start: SLOT,
      end: '2026-10-08T06:00:00.000Z',
    });
    expect(inside!.url).toMatch(/^https:\/\/meet\.google\.com\//);

    expect(calendar.events).toHaveLength(1);
    const event = calendar.events[0]!;
    expect(event.withGoogleMeet).toBe(true);
    expect(event.summary).toBe('Technical Deep Dive (60 min) with Ada Lovelace');
    expect(event.description).toContain('Sessions: 3 (total $75 USD)');
    expect(event.description).toContain('Please cover architecture.');
    // The visitor stays off the event, so no calendar of theirs shows the real Meet address.
    expect(event.attendee).toBeNull();
    expect(event.description).not.toContain('meet.google.com');

    const visitor = mailer.byTag('booking-visitor')[0]!;
    const owner = mailer.byTag('booking-owner')[0]!;
    expect(visitor.to).toBe('ada@example.com');
    expect(owner.to).toBe('owner@example.com');
    expect(owner.replyTo).toBe('ada@example.com');
    for (const mail of [visitor, owner]) {
      expect(mail.html).toContain(bodyOf(res).meetLink);
      expect(mail.text).toContain(bodyOf(res).meetLink);
      expect(mail.attachments).toHaveLength(1);
      // Calendar files fold long lines with a line break and a space or tab.
      const ics = String(mail.attachments![0]!.content).replace(/\r\n[ \t]/g, '');
      expect(ics).toContain(`UID:${event.iCalUID}`);
      expect(ics).toContain('DTSTART:20261008T050000Z');
      expect(ics).toContain(bodyOf(res).meetLink);
    }
    // Names, prices and totals come from the server catalog, never from the client.
    expect(visitor.html).toContain('Technical Deep Dive');
    expect(visitor.html).toContain('$75');
    expect(visitor.html).not.toContain('Wrong Name');
    expect(visitor.html).toContain('FH-TEST0001');
  });

  it('rejects days and times outside the booking rules', async () => {
    const cases: Array<[string, object, 'date' | 'startUtc']> = [
      ['weekend', { date: '2026-10-10', startUtc: '2026-10-10T05:00:00.000Z' }, 'date'],
      ['today', { date: '2026-10-06', startUtc: '2026-10-06T10:00:00.000Z' }, 'date'],
      ['too far', { date: '2026-12-15', startUtc: '2026-12-15T05:00:00.000Z' }, 'date'],
      ['off the hour', { startUtc: '2026-10-08T05:30:00.000Z' }, 'startUtc'],
      ['other day', { startUtc: '2026-10-09T05:00:00.000Z' }, 'startUtc'],
      ['no zone', { startUtc: '2026-10-08T05:00:00' }, 'startUtc'],
    ];
    for (const [label, change, field] of cases) {
      const { app, calendar } = await setup();
      const res = await post(app, { ...BODY, ...change });
      expect(res.status, label).toBe(400);
      expect(bodyOf(res).error.fields[field], label).toBeDefined();
      expect(calendar.events, label).toHaveLength(0);
    }
  });

  it('accepts the first bookable day for a visitor far ahead of Lahore', async () => {
    const { app, calendar } = await setup();
    // Kiritimati is UTC+14: for that visitor "tomorrow" is 7 October, 09:00 PKT that day is fine.
    const res = await post(app, {
      ...BODY,
      timezone: 'Pacific/Kiritimati',
      date: '2026-10-07',
      startUtc: '2026-10-07T04:00:00.000Z',
    });
    expect(res.status).toBe(200);
    expect(calendar.events).toHaveLength(1);
  });

  it('needs two hours of notice (a visitor west of the date line can pick today in Lahore)', async () => {
    // Pago Pago is UTC-11: on 6 October 09:00 UTC it is still 5 October there, so 6 October counts
    // as tomorrow. 15:00 PKT is one hour away, 16:00 PKT is exactly two.
    const tooSoon = await setup();
    const soon = await post(tooSoon.app, {
      ...BODY,
      timezone: 'Pacific/Pago_Pago',
      date: '2026-10-06',
      startUtc: '2026-10-06T10:00:00.000Z',
    });
    expect(soon.status).toBe(400);
    expect(bodyOf(soon).error.fields.startUtc).toContain('2 hours');
    const ok = await setup();
    const fine = await post(ok.app, {
      ...BODY,
      timezone: 'Pacific/Pago_Pago',
      date: '2026-10-06',
      startUtc: '2026-10-06T11:00:00.000Z',
    });
    expect(fine.status).toBe(200);
  });

  it('validates fields and the Idempotency-Key', async () => {
    const { app } = await setup();
    const noKey = await post(app, BODY, null);
    expect(noKey.status).toBe(400);
    expect(bodyOf(noKey).error.fields.idempotencyKey).toBeDefined();
    const badKey = await post(app, BODY, 'short');
    expect(bodyOf(badKey).error.fields.idempotencyKey).toBeDefined();
    const bad = await post(app, {
      ...BODY,
      email: 'nope',
      name: 'A',
      sessions: 11,
      sessionType: 'vip',
      platform: 'Teams',
      timezone: 'Mars/Base',
      notes: 'x'.repeat(801),
    });
    expect(bad.status).toBe(400);
    expect(Object.keys(bodyOf(bad).error.fields).sort()).toEqual(
      ['email', 'name', 'notes', 'platform', 'sessionType', 'sessions', 'timezone'].sort(),
    );
  });

  it('answers 409 SLOT_TAKEN when the owner is busy at that time', async () => {
    const { app, calendar, mailer } = await setup();
    calendar.addBusy(new Date('2026-10-08T05:30:00Z'), new Date('2026-10-08T06:30:00Z'));
    const res = await post(app);
    expect(res.status).toBe(409);
    expect(bodyOf(res).error.code).toBe('SLOT_TAKEN');
    expect(calendar.events).toHaveLength(0);
    expect(mailer.outbox).toHaveLength(0);
  });

  it('two visitors racing for one slot: exactly one wins', async () => {
    const { app, calendar } = await setup();
    const [a, b] = await Promise.all([
      post(app, BODY, 'race-key-00000001'),
      post(app, { ...BODY, email: 'bob@example.com', name: 'Bob Builder' }, 'race-key-00000002'),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
    expect(calendar.events).toHaveLength(1);
  });

  it('a second booking of a slot booked a moment ago is 409, even before Google shows it', async () => {
    const { app } = await setup();
    expect((await post(app, BODY, 'first-key-00000001')).status).toBe(200);
    const second = await post(app, { ...BODY, email: 'bob@example.com' }, 'second-key-0000002');
    expect(second.status).toBe(409);
  });

  it('replays the same result for the same key and books once', async () => {
    const { app, calendar, mailer } = await setup();
    const first = await post(app);
    const second = await post(app);
    expect(second.status).toBe(200);
    expect(bodyOf(second)).toEqual(bodyOf(first));
    expect(calendar.events).toHaveLength(1);
    expect(mailer.outbox).toHaveLength(2);
    const other = await post(app, { ...BODY, notes: 'different' });
    expect(other.status).toBe(400);
    expect(bodyOf(other).error.fields.idempotencyKey).toBeDefined();
  });

  it('returns UPSTREAM_ERROR and sends no email when Google fails, and can be retried', async () => {
    const { app, calendar, mailer } = await setup();
    calendar.failNext('createEvent');
    const res = await post(app);
    expect(res.status).toBe(502);
    expect(bodyOf(res).error.code).toBe('UPSTREAM_ERROR');
    expect(mailer.outbox).toHaveLength(0);
    const retry = await post(app);
    expect(retry.status).toBe(200);
    expect(calendar.events).toHaveLength(1);
  });

  it('keeps the event and still succeeds when the emails fail, logging the booking id', async () => {
    const mailer = createMemoryMailer({ failOn: () => true });
    const { app, calendar, logs } = await setup({ mailer });
    const res = await post(app);
    expect(res.status).toBe(200);
    expect(calendar.events).toHaveLength(1);
    const failures = logs.lines().filter((r) => r['event'] === 'booking.mail_failed');
    expect(failures).toHaveLength(2);
    expect(failures[0]).toMatchObject({ bookingId: 'FH-TEST0001', level: 50 });
  });

  it('without a server secret the real link is sent and the visitor is an attendee', async () => {
    const calendar = createFakeCalendar({ now: () => NOW });
    const mailer = createMemoryMailer();
    const { app } = await buildTestApp({
      modules: [
        createBookingModule({
          calendar,
          mailer,
          store: new MemoryStore(),
          now: () => NOW,
          joinLinks: null,
        }),
      ],
    });
    const res = await post(app);
    expect(bodyOf(res).meetLink).toMatch(/^https:\/\/meet\.google\.com\//);
    expect(calendar.events[0]!.attendee).toEqual({
      email: 'ada@example.com',
      name: 'Ada Lovelace',
    });
  });

  it('Zoom set up: the Zoom link is the event location and goes into both emails', async () => {
    const { app, calendar, mailer } = await setup({ zoom: 'https://zoom.us/j/123456' });
    const res = await post(app, { ...BODY, platform: 'Zoom' });
    expect(res.status).toBe(200);
    const joinUrl = bodyOf(res).meetLink!;
    expect(joinUrl).toContain('/api/join/');
    const env = makeTestEnv();
    expect(
      createJoinLinks(joinSecret(env)!, env.SITE_URL).read(joinUrl.split('/').pop()!)!.url,
    ).toBe('https://zoom.us/j/123456');
    expect(calendar.events[0]!.withGoogleMeet).toBe(false);
    // The owner's own calendar event keeps the real Zoom address.
    expect(calendar.events[0]!.location).toBe('https://zoom.us/j/123456');
    for (const tag of ['booking-visitor', 'booking-owner']) {
      const html = mailer.byTag(tag)[0]!.html;
      expect(html).toContain(joinUrl);
      expect(html).not.toContain('zoom.us/j/123456');
    }
  });

  it('Zoom not set up: event without a conference, meetLink null, both emails explain', async () => {
    const { app, calendar, mailer } = await setup({ zoom: null });
    const res = await post(app, { ...BODY, platform: 'Zoom' });
    expect(res.status).toBe(200);
    expect(bodyOf(res).meetLink).toBeNull();
    expect(calendar.events).toHaveLength(1);
    expect(calendar.events[0]!.withGoogleMeet).toBe(false);
    expect(mailer.byTag('booking-visitor')[0]!.text).toContain('Faisal will send the Zoom link');
    expect(mailer.byTag('booking-owner')[0]!.text.toLowerCase()).toContain('zoom');
  });

  it('a filled honeypot gets a normal 200 and books nothing', async () => {
    const { app, calendar, mailer } = await setup();
    const res = await post(app, { ...BODY, website: 'http://spam.test' });
    expect(res.status).toBe(200);
    expect(bodyOf(res).ok).toBe(true);
    expect(calendar.events).toHaveLength(0);
    expect(mailer.outbox).toHaveLength(0);
  });

  it('limits to 3 bookings per hour per IP', async () => {
    const { app } = await setup();
    const days = ['2026-10-08', '2026-10-09', '2026-10-12'];
    for (const [i, date] of days.entries()) {
      const res = await post(
        app,
        { ...BODY, date, startUtc: `${date}T05:00:00.000Z` },
        `limit-key-0000000${i}`,
      );
      expect(res.status).toBe(200);
    }
    const res = await post(
      app,
      { ...BODY, date: '2026-10-13', startUtc: '2026-10-13T05:00:00.000Z' },
      'limit-key-00000009',
    );
    expect(res.status).toBe(429);
  });

  it('answers 503 when Google is not configured', async () => {
    const { app } = await buildTestApp({
      modules: [
        createBookingModule({
          calendar: null,
          mailer: createMemoryMailer(),
          store: new MemoryStore(),
          now: () => NOW,
        }),
      ],
    });
    expect((await post(app)).status).toBe(503);
  });
});

describe('GET /api/booking/slots and /config', () => {
  it('lists the free hourly starts in Pakistan time', async () => {
    const { app } = await setup();
    const res = await request(app).get('/api/booking/slots?date=2026-10-08&session=quick');
    expect(res.status).toBe(200);
    expect(bodyOf(res)).toEqual({
      ok: true,
      timezone: 'Asia/Karachi',
      slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    });
  });

  it('leaves out busy times, times booked a moment ago and slots under 2 hours away', async () => {
    const { app, calendar } = await setup();
    calendar.addBusy(new Date('2026-10-08T06:00:00Z'), new Date('2026-10-08T07:00:00Z'));
    const busy = await request(app).get('/api/booking/slots?date=2026-10-08&session=deep');
    expect(bodyOf(busy).slots).not.toContain('11:00');
    expect(bodyOf(busy).slots).toContain('10:00');
    await post(app);
    const after = await request(app).get('/api/booking/slots?date=2026-10-08&session=deep');
    expect(bodyOf(after).slots).not.toContain('10:00');
    // Today is 14:00 in Lahore: 15:00 is under two hours away, 16:00 is fine.
    const today = await request(app).get('/api/booking/slots?date=2026-10-06&session=quick');
    expect(bodyOf(today).slots).toEqual(['16:00', '17:00']);
  });

  it('returns [] outside the window and 400 for a weekend or bad query', async () => {
    const { app } = await setup();
    const far = await request(app).get('/api/booking/slots?date=2027-06-01&session=quick');
    expect(bodyOf(far).slots).toEqual([]);
    expect(
      (await request(app).get('/api/booking/slots?date=2026-10-10&session=quick')).status,
    ).toBe(400);
    expect((await request(app).get('/api/booking/slots?date=nope&session=quick')).status).toBe(400);
    expect((await request(app).get('/api/booking/slots?date=2026-10-08&session=vip')).status).toBe(
      400,
    );
  });

  it('answers the config with zoom: false when Zoom is not set up', async () => {
    const { app } = await setup();
    const res = await request(app).get('/api/booking/config');
    expect(res.status).toBe(200);
    expect(bodyOf(res).platforms).toEqual({ meet: true, zoom: false });
    expect(bodyOf(res).sessions.deep).toEqual({
      name: 'Technical Deep Dive',
      minutes: 60,
      price: 25,
    });
    expect(bodyOf(res).hours.timezone).toBe('Asia/Karachi');
  });

  it('answers 502 when Google fails on a slots request', async () => {
    const { app, calendar } = await setup();
    calendar.failNext('freeBusy');
    const res = await request(app).get('/api/booking/slots?date=2026-10-08&session=quick');
    expect(res.status).toBe(502);
  });
});
