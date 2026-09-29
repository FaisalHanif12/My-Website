import { afterEach, describe, expect, it, vi } from 'vitest';

import { slotStarts } from '../../src/services/booking/time.js';
import {
  FAKE_ICAL_DOMAIN,
  FAKE_MEET_LINK_PREFIX,
  createFakeCalendar,
  getDevFakeCalendar,
} from '../../src/services/calendar/fake.js';
import type { CreateEventInput } from '../../src/services/calendar/types.js';
import { CalendarError, isCalendarError } from '../../src/services/calendar/types.js';
import { BLOCKED_FETCH_MESSAGE } from '../setup.js';

const at = (iso: string): Date => new Date(iso);
const FIXED_NOW = at('2026-10-05T06:00:00.000Z');

function eventInput(overrides: Partial<CreateEventInput> = {}): CreateEventInput {
  return {
    requestId: 'FH-0123456789',
    summary: 'Technical Deep Dive (60 min) with Test Visitor',
    description: 'Sessions: 1',
    start: at('2026-10-06T05:00:00.000Z'),
    end: at('2026-10-06T06:00:00.000Z'),
    timeZone: 'Asia/Karachi',
    attendee: { email: 'visitor@example.com', name: 'Test Visitor' },
    location: null,
    withGoogleMeet: true,
    ...overrides,
  };
}

afterEach(() => {
  getDevFakeCalendar().reset();
});

describe('createFakeCalendar', () => {
  it('is a fake provider with an empty calendar', async () => {
    const calendar = createFakeCalendar({ now: () => FIXED_NOW });
    expect(calendar.kind).toBe('fake');
    expect(calendar.events).toEqual([]);
    await expect(
      calendar.freeBusy(at('2026-10-06T04:00:00.000Z'), at('2026-10-06T13:00:00.000Z')),
    ).resolves.toEqual([]);
  });

  it('creates an event with a clearly fake Meet link and UID', async () => {
    const calendar = createFakeCalendar({ now: () => FIXED_NOW });
    const created = await calendar.createEvent(eventInput());

    expect(created.meetLink).toMatch(/^https:\/\/meet\.google\.com\/dev-fake-[0-9a-v]{10}$/);
    expect(created.meetLink?.startsWith(FAKE_MEET_LINK_PREFIX)).toBe(true);
    expect(created.iCalUID).toBe(`${created.eventId}@${FAKE_ICAL_DOMAIN}`);
    expect(created.iCalUID).toMatch(/@dev-fake\.faisalhanif\.work$/);
    expect(created.eventId).toMatch(/^[0-9a-v]{20}$/);
    expect(created.htmlLink).toContain('dev-fake-');

    expect(calendar.events).toHaveLength(1);
    const [event] = calendar.events;
    expect(event).toMatchObject({
      requestId: 'FH-0123456789',
      summary: 'Technical Deep Dive (60 min) with Test Visitor',
      timeZone: 'Asia/Karachi',
      attendee: { email: 'visitor@example.com', name: 'Test Visitor' },
      location: null,
      withGoogleMeet: true,
      meetLink: created.meetLink,
      createdAt: FIXED_NOW,
    });
  });

  it('adds no Meet link without withGoogleMeet and keeps the location', async () => {
    const calendar = createFakeCalendar();
    const created = await calendar.createEvent(
      eventInput({ withGoogleMeet: false, location: 'https://zoom.us/j/123' }),
    );
    expect(created.meetLink).toBeNull();
    expect(calendar.events[0]?.location).toBe('https://zoom.us/j/123');
  });

  it('dedupes by requestId like Google', async () => {
    const calendar = createFakeCalendar();
    const first = await calendar.createEvent(eventInput());
    const again = await calendar.createEvent(eventInput({ summary: 'Changed' }));
    expect(again).toEqual(first);
    expect(calendar.events).toHaveLength(1);

    const other = await calendar.createEvent(eventInput({ requestId: 'FH-other00001' }));
    expect(other.eventId).not.toBe(first.eventId);
    expect(other.meetLink).not.toBe(first.meetLink);
    expect(calendar.events).toHaveLength(2);
  });

  it('answers freeBusy with the events that overlap the range', async () => {
    const calendar = createFakeCalendar();
    const [nine, ten, eleven] = slotStarts('2026-10-06', 'Asia/Karachi') as [Date, Date, Date];
    await calendar.createEvent(eventInput({ requestId: 'a', start: ten, end: eleven }));
    await calendar.createEvent(
      eventInput({
        requestId: 'b',
        start: at('2026-10-07T04:00:00.000Z'),
        end: at('2026-10-07T05:00:00.000Z'),
      }),
    );

    const dayStart = at('2026-10-06T04:00:00.000Z');
    const dayEnd = at('2026-10-06T13:00:00.000Z');
    await expect(calendar.freeBusy(dayStart, dayEnd)).resolves.toEqual([
      { start: ten, end: eleven },
    ]);
    // Touching the range edges is not an overlap.
    await expect(calendar.freeBusy(nine, ten)).resolves.toEqual([]);
    await expect(calendar.freeBusy(eleven, dayEnd)).resolves.toEqual([]);
    // An empty or reversed range has nothing busy.
    await expect(calendar.freeBusy(dayEnd, dayStart)).resolves.toEqual([]);
  });

  it('includes busy blocks added with addBusy, sorted by start', async () => {
    const calendar = createFakeCalendar();
    await calendar.createEvent(
      eventInput({ start: at('2026-10-06T08:00:00.000Z'), end: at('2026-10-06T09:00:00.000Z') }),
    );
    calendar.addBusy(at('2026-10-06T05:30:00.000Z'), at('2026-10-06T06:00:00.000Z'));
    const busy = await calendar.freeBusy(
      at('2026-10-06T04:00:00.000Z'),
      at('2026-10-06T13:00:00.000Z'),
    );
    expect(busy.map((b) => b.start.toISOString())).toEqual([
      '2026-10-06T05:30:00.000Z',
      '2026-10-06T08:00:00.000Z',
    ]);
    expect(calendar.busy).toHaveLength(1);
    expect(calendar.events).toHaveLength(1);
    expect(() =>
      calendar.addBusy(at('2026-10-06T06:00:00.000Z'), at('2026-10-06T05:00:00.000Z')),
    ).toThrow(RangeError);
  });

  it('hands out copies, so callers cannot change what it holds', async () => {
    const calendar = createFakeCalendar();
    await calendar.createEvent(eventInput());
    const [busy] = await calendar.freeBusy(
      at('2026-10-06T00:00:00.000Z'),
      at('2026-10-07T00:00:00.000Z'),
    );
    busy?.start.setTime(0);
    calendar.events[0]?.start.setTime(0);
    expect(calendar.events[0]?.start.toISOString()).toBe('2026-10-06T05:00:00.000Z');
  });

  it('deleteEvent removes the event and ignores an unknown id', async () => {
    const calendar = createFakeCalendar();
    const created = await calendar.createEvent(eventInput());
    await calendar.deleteEvent(created.eventId);
    expect(calendar.events).toEqual([]);
    await expect(calendar.deleteEvent('missing')).resolves.toBeUndefined();
    await expect(
      calendar.freeBusy(at('2026-10-06T00:00:00.000Z'), at('2026-10-07T00:00:00.000Z')),
    ).resolves.toEqual([]);
  });

  it('refuses an event that ends before it starts', async () => {
    const calendar = createFakeCalendar();
    const error: unknown = await calendar
      .createEvent(eventInput({ end: at('2026-10-06T04:00:00.000Z') }))
      .catch((e: unknown) => e);
    expect(isCalendarError(error)).toBe(true);
    expect(error).toMatchObject({ retryable: false, reason: 'invalid_event' });
    expect(calendar.events).toEqual([]);
  });

  it('failNext makes the next call of that operation reject once', async () => {
    const calendar = createFakeCalendar();
    const from = at('2026-10-06T00:00:00.000Z');
    const to = at('2026-10-07T00:00:00.000Z');

    calendar.failNext('freeBusy');
    const freeBusyError: unknown = await calendar.freeBusy(from, to).catch((e: unknown) => e);
    expect(freeBusyError).toBeInstanceOf(CalendarError);
    expect(freeBusyError).toMatchObject({ retryable: true, name: 'CalendarError' });
    await expect(calendar.freeBusy(from, to)).resolves.toEqual([]);

    calendar.failNext('createEvent', false);
    await expect(calendar.createEvent(eventInput())).rejects.toMatchObject({ retryable: false });
    expect(calendar.events).toEqual([]);
    const created = await calendar.createEvent(eventInput());

    calendar.failNext('deleteEvent');
    await expect(calendar.deleteEvent(created.eventId)).rejects.toBeInstanceOf(CalendarError);
    expect(calendar.events).toHaveLength(1);
  });

  it('rejects when the caller already aborted', async () => {
    const calendar = createFakeCalendar();
    const controller = new AbortController();
    controller.abort();
    await expect(
      calendar.freeBusy(
        at('2026-10-06T00:00:00.000Z'),
        at('2026-10-07T00:00:00.000Z'),
        controller.signal,
      ),
    ).rejects.toMatchObject({ reason: 'aborted', retryable: true });
    await expect(calendar.createEvent(eventInput(), controller.signal)).rejects.toBeInstanceOf(
      CalendarError,
    );
  });

  it('reset clears events, busy blocks and queued failures', async () => {
    const calendar = createFakeCalendar();
    await calendar.createEvent(eventInput());
    calendar.addBusy(at('2026-10-06T07:00:00.000Z'), at('2026-10-06T08:00:00.000Z'));
    calendar.failNext('freeBusy');
    calendar.reset();
    expect(calendar.events).toEqual([]);
    expect(calendar.busy).toEqual([]);
    await expect(
      calendar.freeBusy(at('2026-10-06T00:00:00.000Z'), at('2026-10-07T00:00:00.000Z')),
    ).resolves.toEqual([]);
  });

  it('never touches the network', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const calendar = createFakeCalendar();
    const created = await calendar.createEvent(eventInput());
    await calendar.freeBusy(at('2026-10-06T00:00:00.000Z'), at('2026-10-07T00:00:00.000Z'));
    await calendar.deleteEvent(created.eventId);
    expect(fetchSpy).not.toHaveBeenCalled();
    await expect(fetch('https://example.com')).rejects.toThrow(BLOCKED_FETCH_MESSAGE);
  });
});

describe('getDevFakeCalendar', () => {
  it('returns one shared calendar for the process', async () => {
    const first = getDevFakeCalendar();
    expect(getDevFakeCalendar()).toBe(first);
    expect(first.kind).toBe('fake');
    await first.createEvent(eventInput());
    expect(getDevFakeCalendar().events).toHaveLength(1);
  });
});
