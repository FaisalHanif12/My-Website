import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { WINDOW_DAYS } from '../../src/services/booking/catalog.js';
import {
  DEFAULT_BOOKING_TIMEZONE,
  addDays,
  bookingDateWindow,
  formatLongDay,
  formatPktStamp,
  formatTime,
  formatWhen,
  gmtLabel,
  hasNotice,
  inWindow,
  isSlotStart,
  isWeekday,
  overlaps,
  sessionEnd,
  slotLabel,
  slotStarts,
  slotsDateWindow,
  todayIn,
  ymdIn,
  zoneLabel,
  zoneOffsetMinutes,
} from '../../src/services/booking/time.js';

const HOUR = 60 * 60 * 1000;
const at = (iso: string): Date => new Date(iso);

/** The reference slotsFor (faisalhanif-redesign.html L6060), copied as it is. */
function referenceSlotsFor(k: string): number[] {
  const p = k.split('-').map(Number) as [number, number, number];
  const out: number[] = [];
  for (let h = 9; h <= 17; h++) out.push(Date.UTC(p[0], p[1] - 1, p[2], h - 5, 0));
  return out;
}

/** The reference fmtTime (L5841); \s turns the narrow no-break space of newer ICU plain. */
function referenceFmtTime(ms: number, tz: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })
    .format(ms)
    .replace(/\s/g, ' ');
}

describe('slotStarts', () => {
  it('returns 04:00Z to 12:00Z hourly for 2026-10-06 in Asia/Karachi', () => {
    expect(slotStarts('2026-10-06', 'Asia/Karachi').map((d) => d.toISOString())).toEqual([
      '2026-10-06T04:00:00.000Z',
      '2026-10-06T05:00:00.000Z',
      '2026-10-06T06:00:00.000Z',
      '2026-10-06T07:00:00.000Z',
      '2026-10-06T08:00:00.000Z',
      '2026-10-06T09:00:00.000Z',
      '2026-10-06T10:00:00.000Z',
      '2026-10-06T11:00:00.000Z',
      '2026-10-06T12:00:00.000Z',
    ]);
  });

  it.each(['2026-10-06', '2026-02-27', '2026-12-31', '2027-01-01', '2028-02-29'])(
    'matches the reference slotsFor formula on %s',
    (date) => {
      const slots = slotStarts(date, 'Asia/Karachi').map((d) => d.getTime());
      expect(slots).toEqual(referenceSlotsFor(date));
    },
  );

  it('uses Asia/Karachi by default', () => {
    expect(DEFAULT_BOOKING_TIMEZONE).toBe('Asia/Karachi');
    expect(slotStarts('2026-10-06').map((d) => d.getTime())).toEqual(
      referenceSlotsFor('2026-10-06'),
    );
  });

  it('builds 09:00 to 17:00 in another zone, across daylight saving', () => {
    // New York moves to EDT on 8 March 2026.
    expect(slotStarts('2026-03-06', 'America/New_York')[0]?.toISOString()).toBe(
      '2026-03-06T14:00:00.000Z',
    );
    expect(slotStarts('2026-03-09', 'America/New_York')[0]?.toISOString()).toBe(
      '2026-03-09T13:00:00.000Z',
    );
    expect(slotStarts('2026-03-09', 'America/New_York')[8]?.toISOString()).toBe(
      '2026-03-09T21:00:00.000Z',
    );
  });

  it('refuses a date that is not a real YYYY-MM-DD day or an unknown zone', () => {
    expect(() => slotStarts('2026-02-30')).toThrow(RangeError);
    expect(() => slotStarts('6 Oct 2026')).toThrow(RangeError);
    expect(() => slotStarts('2026-10-06', 'Mars/Olympus')).toThrow(RangeError);
  });
});

describe('slotLabel', () => {
  it('labels each slot on a 24 hour clock', () => {
    expect(slotStarts('2026-10-06').map((d) => slotLabel(d, 'Asia/Karachi'))).toEqual([
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ]);
  });

  it('never prints 24:00 for midnight', () => {
    expect(slotLabel(at('2026-10-05T19:00:00.000Z'), 'Asia/Karachi')).toBe('00:00');
  });
});

describe('isSlotStart', () => {
  it('accepts every slot of the day as an ISO string or a Date', () => {
    for (const slot of slotStarts('2026-10-06')) {
      expect(isSlotStart('2026-10-06', slot.toISOString())).toBe(true);
      expect(isSlotStart('2026-10-06', slot)).toBe(true);
    }
    expect(isSlotStart('2026-10-06', '2026-10-06T04:00:00Z')).toBe(true);
    expect(isSlotStart('2026-10-06', '2026-10-06T09:00:00+05:00')).toBe(true);
  });

  it('refuses times that are not slot starts of that date', () => {
    expect(isSlotStart('2026-10-06', '2026-10-06T03:00:00.000Z')).toBe(false); // 08:00 PKT
    expect(isSlotStart('2026-10-06', '2026-10-06T13:00:00.000Z')).toBe(false); // 18:00 PKT
    expect(isSlotStart('2026-10-06', '2026-10-06T04:30:00.000Z')).toBe(false);
    expect(isSlotStart('2026-10-06', '2026-10-06T04:00:00.001Z')).toBe(false);
    expect(isSlotStart('2026-10-07', '2026-10-06T04:00:00.000Z')).toBe(false);
  });

  it('gives false for input that is not a time, a day or a zone', () => {
    expect(isSlotStart('2026-10-06', 'not a time')).toBe(false);
    // Without a zone the server's own zone would decide the instant, so it is refused.
    expect(isSlotStart('2026-10-06', '2026-10-06T09:00:00')).toBe(false);
    expect(isSlotStart('2026-10-06', '2026-10-06')).toBe(false);
    expect(isSlotStart('2026-10-06', 'Tue, 06 Oct 2026 04:00:00 GMT')).toBe(false);
    expect(isSlotStart('2026-10-06', new Date(Number.NaN))).toBe(false);
    expect(isSlotStart('2026-13-01', '2026-10-06T04:00:00.000Z')).toBe(false);
    expect(isSlotStart('2026-10-06', '2026-10-06T04:00:00.000Z', 'Nope/Zone')).toBe(false);
  });
});

describe('days', () => {
  it('isWeekday is true Monday to Friday and false on weekends', () => {
    expect(isWeekday('2026-10-05')).toBe(true); // Monday
    expect(isWeekday('2026-10-06')).toBe(true);
    expect(isWeekday('2026-10-09')).toBe(true); // Friday
    expect(isWeekday('2026-10-10')).toBe(false); // Saturday
    expect(isWeekday('2026-10-11')).toBe(false); // Sunday
    expect(isWeekday('2027-01-02')).toBe(false); // Saturday
    expect(() => isWeekday('2026-02-29')).toThrow(RangeError);
  });

  it('addDays crosses months, years and leap days', () => {
    expect(addDays('2026-10-06', 0)).toBe('2026-10-06');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-10-05', 60)).toBe('2026-12-04');
    expect(() => addDays('2026-10-06', 1.5)).toThrow(RangeError);
  });

  it('todayIn and ymdIn read the day in the given zone', () => {
    const now = at('2026-10-05T19:00:00.000Z');
    expect(todayIn('Asia/Karachi', now)).toBe('2026-10-06');
    expect(todayIn('UTC', now)).toBe('2026-10-05');
    expect(todayIn('Pacific/Honolulu', now)).toBe('2026-10-05');
    expect(ymdIn(at('2026-10-05T18:59:59.999Z'), 'Asia/Karachi')).toBe('2026-10-05');
    expect(() => todayIn('Nope/Zone', now)).toThrow(RangeError);
  });

  it('inWindow includes both ends', () => {
    const window = { first: '2026-10-06', last: '2026-12-04' };
    expect(inWindow('2026-10-06', window)).toBe(true);
    expect(inWindow('2026-12-04', window)).toBe(true);
    expect(inWindow('2026-10-05', window)).toBe(false);
    expect(inWindow('2026-12-05', window)).toBe(false);
    expect(inWindow('2026-11-31', window)).toBe(false);
  });
});

describe('bookingDateWindow (tomorrow to today + 60 days by the visitor clock)', () => {
  // UTC-10, UTC and UTC+14 at clock times on both sides of their midnights.
  const cases: Array<[string, string, string, string]> = [
    ['2026-10-05T09:30:00.000Z', 'Pacific/Honolulu', '2026-10-05', '2026-12-03'],
    ['2026-10-05T09:30:00.000Z', 'UTC', '2026-10-06', '2026-12-04'],
    ['2026-10-05T09:30:00.000Z', 'Pacific/Kiritimati', '2026-10-06', '2026-12-04'],
    ['2026-10-05T09:59:59.999Z', 'Pacific/Honolulu', '2026-10-05', '2026-12-03'],
    ['2026-10-05T09:59:59.999Z', 'Pacific/Kiritimati', '2026-10-06', '2026-12-04'],
    ['2026-10-05T10:00:00.000Z', 'Pacific/Honolulu', '2026-10-06', '2026-12-04'],
    ['2026-10-05T10:00:00.000Z', 'UTC', '2026-10-06', '2026-12-04'],
    ['2026-10-05T10:00:00.000Z', 'Pacific/Kiritimati', '2026-10-07', '2026-12-05'],
    ['2026-10-05T23:59:59.999Z', 'UTC', '2026-10-06', '2026-12-04'],
    ['2026-10-06T00:00:00.000Z', 'UTC', '2026-10-07', '2026-12-05'],
    ['2026-12-31T12:00:00.000Z', 'Pacific/Honolulu', '2027-01-01', '2027-03-01'],
    ['2026-12-31T12:00:00.000Z', 'UTC', '2027-01-01', '2027-03-01'],
    ['2026-12-31T12:00:00.000Z', 'Pacific/Kiritimati', '2027-01-02', '2027-03-02'],
  ];

  it.each(cases)('at %s in %s runs from %s to %s', (now, zone, first, last) => {
    const window = bookingDateWindow(at(now), zone);
    expect(window).toEqual({ first, last });
    expect(inWindow(first, window)).toBe(true);
    expect(inWindow(last, window)).toBe(true);
    expect(inWindow(addDays(first, -1), window)).toBe(false); // the visitor's today
    expect(inWindow(addDays(last, 1), window)).toBe(false);
  });

  it('matches the reference avail(): after today0 and at most maxDate', () => {
    const window = bookingDateWindow(at('2026-10-05T09:30:00.000Z'), 'UTC');
    expect(addDays(window.first, WINDOW_DAYS - 1)).toBe(window.last);
  });
});

describe('slotsDateWindow (today to today + 61 days in the booking zone)', () => {
  it.each([
    ['2026-10-05T09:30:00.000Z', '2026-10-05', '2026-12-05'],
    ['2026-10-05T18:59:59.999Z', '2026-10-05', '2026-12-05'],
    ['2026-10-05T19:00:00.000Z', '2026-10-06', '2026-12-06'],
  ])('at %s runs from %s to %s', (now, first, last) => {
    expect(slotsDateWindow(at(now), 'Asia/Karachi')).toEqual({ first, last });
  });

  it('covers every day any visitor zone can book', () => {
    // Etc/GMT+12 is UTC-12 and Pacific/Kiritimati is UTC+14, the two ends of the world clock.
    const zones = [
      'Etc/GMT+12',
      'Pacific/Honolulu',
      'America/New_York',
      'UTC',
      'Asia/Karachi',
      'Asia/Tokyo',
      'Pacific/Auckland',
      'Pacific/Kiritimati',
    ];
    const start = at('2026-10-05T00:00:00.000Z').getTime();
    for (let step = 0; step < 48; step += 1) {
      const now = new Date(start + step * 30 * 60 * 1000);
      const slotsWindow = slotsDateWindow(now);
      for (const zone of zones) {
        const visitor = bookingDateWindow(now, zone);
        expect(visitor.first >= slotsWindow.first, `${zone} ${now.toISOString()}`).toBe(true);
        expect(visitor.last <= slotsWindow.last, `${zone} ${now.toISOString()}`).toBe(true);
      }
    }
  });
});

describe('timing', () => {
  const start = at('2026-10-06T04:00:00.000Z');

  it('hasNotice needs at least 2 hours', () => {
    expect(hasNotice(start, new Date(start.getTime() - 2 * HOUR))).toBe(true);
    expect(hasNotice(start, new Date(start.getTime() - 2 * HOUR + 1))).toBe(false);
    expect(hasNotice(start, new Date(start.getTime() - 2 * HOUR - 1))).toBe(true);
    expect(hasNotice(start, new Date(start.getTime() + HOUR))).toBe(false);
  });

  it('sessionEnd adds the session minutes', () => {
    expect(sessionEnd(start, 30).toISOString()).toBe('2026-10-06T04:30:00.000Z');
    expect(sessionEnd(start, 60).toISOString()).toBe('2026-10-06T05:00:00.000Z');
  });

  it('overlaps treats touching intervals as free', () => {
    const a1 = at('2026-10-06T04:00:00.000Z');
    const a2 = at('2026-10-06T05:00:00.000Z');
    const b3 = at('2026-10-06T06:00:00.000Z');
    expect(overlaps(a1, a2, a2, b3)).toBe(false);
    expect(overlaps(a2, b3, a1, a2)).toBe(false);
    expect(overlaps(a1, a2, new Date(a2.getTime() - 1), b3)).toBe(true);
    expect(overlaps(a1, b3, at('2026-10-06T04:30:00.000Z'), a2)).toBe(true); // contains
    expect(overlaps(a1, a2, a1, a2)).toBe(true);
    expect(overlaps(a1, a2, b3, at('2026-10-06T07:00:00.000Z'))).toBe(false);
  });
});

describe('formatting', () => {
  it('formatTime prints en-US times like the reference fmtTime', () => {
    expect(formatTime(at('2026-10-06T09:00:00.000Z'), 'Asia/Karachi')).toBe('2:00 PM');
    expect(formatTime(at('2026-10-06T04:00:00.000Z'), 'Asia/Karachi')).toBe('9:00 AM');
    expect(formatTime(at('2026-10-06T04:00:00.000Z'), 'America/New_York')).toBe('12:00 AM');
    const zones = ['Asia/Karachi', 'America/New_York', 'Asia/Kolkata', 'Europe/London', 'UTC'];
    for (const zone of zones) {
      for (const slot of slotStarts('2026-10-06')) {
        expect(formatTime(slot, zone)).toBe(referenceFmtTime(slot.getTime(), zone));
      }
    }
  });

  it('formatLongDay names the day in the zone', () => {
    expect(formatLongDay(at('2026-10-06T04:00:00.000Z'), 'Asia/Karachi')).toBe(
      'Tuesday, 6 October 2026',
    );
    expect(formatLongDay(at('2026-10-06T03:00:00.000Z'), 'America/Los_Angeles')).toBe(
      'Monday, 5 October 2026',
    );
  });

  it('formatWhen in Asia/Karachi', () => {
    const start = at('2026-10-06T04:00:00.000Z');
    expect(formatWhen(start, sessionEnd(start, 60), 'Asia/Karachi')).toBe(
      'Tuesday, 6 October 2026, 9:00 AM to 10:00 AM',
    );
    const last = at('2026-10-06T12:00:00.000Z');
    expect(formatWhen(last, sessionEnd(last, 30), 'Asia/Karachi')).toBe(
      'Tuesday, 6 October 2026, 5:00 PM to 5:30 PM',
    );
  });

  it('formatWhen in America/New_York on both sides of daylight saving', () => {
    // EDT (UTC-4) in October.
    const october = at('2026-10-06T12:00:00.000Z');
    expect(formatWhen(october, sessionEnd(october, 60), 'America/New_York')).toBe(
      'Tuesday, 6 October 2026, 8:00 AM to 9:00 AM',
    );
    // EST (UTC-5) after 1 November 2026: the same PKT slot is an hour earlier in New York.
    const november = at('2026-11-03T12:00:00.000Z');
    expect(formatWhen(november, sessionEnd(november, 60), 'America/New_York')).toBe(
      'Tuesday, 3 November 2026, 7:00 AM to 8:00 AM',
    );
  });

  it('formatWhen names the end day when the session ends after midnight', () => {
    const start = at('2026-11-02T04:00:00.000Z'); // Monday 09:00 PKT, Sunday 23:00 EST
    expect(formatWhen(start, sessionEnd(start, 60), 'America/New_York')).toBe(
      'Sunday, 1 November 2026, 11:00 PM to Monday, 2 November 2026, 12:00 AM',
    );
  });

  it('gmtLabel copies the reference format', () => {
    expect(gmtLabel(300)).toBe('GMT+5');
    expect(gmtLabel(0)).toBe('GMT+0');
    expect(gmtLabel(-240)).toBe('GMT-4');
    expect(gmtLabel(345)).toBe('GMT+5:45');
    expect(gmtLabel(-150)).toBe('GMT-2:30');
  });

  it('zoneLabel reads the offset at the given instant', () => {
    const october = at('2026-10-06T04:00:00.000Z');
    const november = at('2026-11-03T04:00:00.000Z');
    expect(zoneLabel('Asia/Karachi', october)).toBe('GMT+5, Asia/Karachi');
    expect(zoneLabel('America/New_York', october)).toBe('GMT-4, America/New_York');
    expect(zoneLabel('America/New_York', november)).toBe('GMT-5, America/New_York');
    expect(zoneLabel('Asia/Kolkata', october)).toBe('GMT+5:30, Asia/Kolkata');
    expect(zoneLabel('Asia/Kathmandu', october)).toBe('GMT+5:45, Asia/Kathmandu');
    expect(zoneLabel('UTC', october)).toBe('GMT+0, UTC');
    expect(zoneOffsetMinutes('Pacific/Kiritimati', october)).toBe(14 * 60);
    expect(() => zoneLabel('Nope/Zone', october)).toThrow(RangeError);
  });

  it('formatPktStamp prints a received at line', () => {
    const now = at('2026-10-06T09:05:00.000Z');
    expect(formatPktStamp(now)).toBe('Tuesday, 6 October 2026, 2:05 PM PKT');
    expect(formatPktStamp(now, 'Europe/London')).toBe(
      'Tuesday, 6 October 2026, 10:05 AM (GMT+1, Europe/London)',
    );
  });

  it('refuses an invalid Date', () => {
    const bad = new Date(Number.NaN);
    expect(() => formatTime(bad, 'UTC')).toThrow(RangeError);
    expect(() => slotLabel(bad)).toThrow(RangeError);
    expect(() => formatWhen(bad, bad, 'UTC')).toThrow(RangeError);
  });
});

describe('no clock reads', () => {
  it.each(['time.ts', 'catalog.ts'])('src/services/booking/%s never reads the clock', (file) => {
    const url = new URL(`../../src/services/booking/${file}`, import.meta.url);
    const source = readFileSync(fileURLToPath(url), 'utf8');
    expect(source).not.toMatch(/Date\.now\s*\(/);
    expect(source).not.toMatch(/new Date\(\s*\)/);
    expect(source).not.toMatch(/performance\.now\s*\(/);
  });
});
