import { describe, expect, it } from 'vitest';

import {
  CURRENCY,
  DAY_END,
  FIRST_HOUR,
  LAST_HOUR,
  MAX_SESSIONS,
  MIN_NOTICE_MS,
  MIN_SESSIONS,
  PLATFORMS,
  SESSION_TYPES,
  SESSION_TYPE_IDS,
  WINDOW_DAYS,
  bookingConfig,
  isPlatform,
  isSessionType,
  quote,
  sessionInfo,
} from '../../src/services/booking/catalog.js';

/** The GET /api/booking/config example of API_CONTRACT.md. */
const CONTRACT_CONFIG = {
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

describe('catalog constants', () => {
  it('copies the reference session types', () => {
    expect(SESSION_TYPES).toEqual({
      quick: { id: 'quick', name: 'Quick Chat', minutes: 30, price: 15, label: '30 minutes' },
      deep: {
        id: 'deep',
        name: 'Technical Deep Dive',
        minutes: 60,
        price: 25,
        label: '60 minutes',
      },
    });
    expect(SESSION_TYPE_IDS).toEqual(['quick', 'deep']);
    expect(sessionInfo('deep').name).toBe('Technical Deep Dive');
  });

  it('holds the booking limits and hours', () => {
    expect(MIN_SESSIONS).toBe(1);
    expect(MAX_SESSIONS).toBe(10);
    expect(CURRENCY).toBe('USD');
    expect(WINDOW_DAYS).toBe(60);
    expect(FIRST_HOUR).toBe(9);
    expect(LAST_HOUR).toBe(17);
    expect(DAY_END).toBe('18:00');
    expect(MIN_NOTICE_MS).toBe(2 * 60 * 60 * 1000);
    expect(PLATFORMS).toEqual(['Google Meet']);
  });

  it('recognises session ids and platforms', () => {
    expect(isSessionType('quick')).toBe(true);
    expect(isSessionType('deep')).toBe(true);
    expect(isSessionType('long')).toBe(false);
    expect(isSessionType(1)).toBe(false);
    expect(isPlatform('Google Meet')).toBe(true);
    expect(isPlatform('Zoom')).toBe(false);
    expect(isPlatform('google meet')).toBe(false);
    expect(isPlatform(undefined)).toBe(false);
  });
});

describe('quote', () => {
  it('prices one session', () => {
    expect(quote('quick', 1)).toEqual({
      sessionName: 'Quick Chat',
      durationMinutes: 30,
      pricePerSession: 15,
      sessions: 1,
      total: 15,
      currency: 'USD',
    });
    expect(quote('deep', 1).total).toBe(25);
  });

  it('prices ten sessions', () => {
    expect(quote('quick', 10).total).toBe(150);
    expect(quote('deep', 10)).toEqual({
      sessionName: 'Technical Deep Dive',
      durationMinutes: 60,
      pricePerSession: 25,
      sessions: 10,
      total: 250,
      currency: 'USD',
    });
  });

  it('refuses a session count outside 1 to 10 or not whole', () => {
    expect(() => quote('quick', 0)).toThrow(RangeError);
    expect(() => quote('quick', 11)).toThrow(RangeError);
    expect(() => quote('deep', 2.5)).toThrow(RangeError);
    expect(() => quote('deep', Number.NaN)).toThrow(RangeError);
  });
});

describe('bookingConfig', () => {
  it('deep equals the API_CONTRACT.md example without ok', () => {
    const { ok: _ok, ...expected } = CONTRACT_CONFIG;
    expect(bookingConfig({ timeZone: 'Asia/Karachi' })).toStrictEqual(expected);
  });

  it('reports Google Meet and the configured zone', () => {
    const config = bookingConfig({ timeZone: 'Europe/London' });
    expect(config.platforms).toEqual({ meet: true });
    expect(config.hours.timezone).toBe('Europe/London');
  });

  it('keeps the contract key order when sent as JSON', () => {
    const body = JSON.stringify({
      ok: true,
      ...bookingConfig({ timeZone: 'Asia/Karachi' }),
    });
    expect(body).toBe(JSON.stringify(CONTRACT_CONFIG));
  });
});
