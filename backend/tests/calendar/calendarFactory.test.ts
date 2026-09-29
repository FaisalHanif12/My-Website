import { afterEach, describe, expect, it } from 'vitest';

import { getDevFakeCalendar } from '../../src/services/calendar/fake.js';
import { getCalendarProvider, resetCalendarForTests } from '../../src/services/calendar/index.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { makeTestEnv } from '../helpers/testEnv.js';

const GOOGLE_ENV = {
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  GOOGLE_REFRESH_TOKEN: 'test-refresh-token',
};

function ctx(overrides: Parameters<typeof makeTestEnv>[0] = {}) {
  return { env: makeTestEnv(overrides), logger: createCapturingLogger().logger };
}

afterEach(() => {
  resetCalendarForTests();
});

describe('getCalendarProvider', () => {
  it('returns the process wide fake with DEV_FAKE_EXTERNALS', () => {
    const provider = getCalendarProvider(ctx({ DEV_FAKE_EXTERNALS: true }));
    expect(provider).toBe(getDevFakeCalendar());
    expect(provider?.kind).toBe('fake');
  });

  it('prefers the fake even when Google is configured', () => {
    const provider = getCalendarProvider(ctx({ ...GOOGLE_ENV, DEV_FAKE_EXTERNALS: true }));
    expect(provider?.kind).toBe('fake');
  });

  it('returns one Google provider per process when the Google env is set', () => {
    const context = ctx(GOOGLE_ENV);
    const provider = getCalendarProvider(context);
    expect(provider?.kind).toBe('google');
    expect(getCalendarProvider(context)).toBe(provider);
    expect(getCalendarProvider({ ...context })).toBe(provider);
  });

  it('builds a new Google provider after a reset or for another env', () => {
    const context = ctx(GOOGLE_ENV);
    const first = getCalendarProvider(context);
    resetCalendarForTests();
    const second = getCalendarProvider(context);
    expect(second).not.toBe(first);
    expect(getCalendarProvider(ctx(GOOGLE_ENV))).not.toBe(second);
  });

  it('returns null when Google is not configured', () => {
    expect(getCalendarProvider(ctx())).toBeNull();
    expect(getCalendarProvider(ctx({ ...GOOGLE_ENV, GOOGLE_REFRESH_TOKEN: undefined }))).toBeNull();
  });

  it('empties the dev fake on reset', async () => {
    const fake = getDevFakeCalendar();
    fake.addBusy(new Date('2026-10-06T05:00:00Z'), new Date('2026-10-06T06:00:00Z'));
    resetCalendarForTests();
    expect(fake.busy).toEqual([]);
    await expect(
      fake.freeBusy(new Date('2026-10-06T04:00:00Z'), new Date('2026-10-06T08:00:00Z')),
    ).resolves.toEqual([]);
  });
});
