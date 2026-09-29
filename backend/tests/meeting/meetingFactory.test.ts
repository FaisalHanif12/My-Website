import { afterEach, describe, expect, it } from 'vitest';

import { getMeetingProvider, resetMeetingForTests } from '../../src/services/meeting/index.js';
import { createGoogleMeetProvider } from '../../src/services/meeting/googleMeet.js';
import type { MeetingPlanInput } from '../../src/services/meeting/types.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { makeTestEnv } from '../helpers/testEnv.js';

const ZOOM_ENV = {
  ZOOM_ACCOUNT_ID: 'test-zoom-account-id',
  ZOOM_CLIENT_ID: 'test-zoom-client-id',
  ZOOM_CLIENT_SECRET: 'test-zoom-client-secret',
};

function ctx(overrides: Parameters<typeof makeTestEnv>[0] = {}) {
  return { env: makeTestEnv(overrides), logger: createCapturingLogger().logger };
}

const INPUT: MeetingPlanInput = {
  bookingId: 'bk_7f3a9c2e41d8',
  topic: 'Quick Chat (30 min) with Test Visitor',
  start: new Date('2026-10-06T05:00:00.000Z'),
  durationMinutes: 30,
  timeZone: 'Asia/Karachi',
};

afterEach(() => {
  resetMeetingForTests();
});

describe('createGoogleMeetProvider', () => {
  it('asks the calendar for a Meet conference and makes no call itself', async () => {
    const provider = createGoogleMeetProvider();
    expect(provider.platform).toBe('Google Meet');
    expect(provider.configured).toBe(true);
    await expect(provider.plan(INPUT)).resolves.toEqual({
      platform: 'Google Meet',
      withGoogleMeet: true,
      joinUrl: null,
      pending: false,
    });
  });
});

describe('getMeetingProvider', () => {
  it('returns one Google Meet provider for every env, the fake one included', () => {
    const provider = getMeetingProvider('Google Meet', ctx());
    expect(provider.platform).toBe('Google Meet');
    expect(provider.configured).toBe(true);
    expect(getMeetingProvider('Google Meet', ctx({ DEV_FAKE_EXTERNALS: true }))).toBe(provider);
  });

  it('returns a configured Zoom provider, one per process, when the Zoom env is set', () => {
    const context = ctx(ZOOM_ENV);
    const provider = getMeetingProvider('Zoom', context);
    expect(provider.platform).toBe('Zoom');
    expect(provider.configured).toBe(true);
    expect(getMeetingProvider('Zoom', context)).toBe(provider);
    expect(getMeetingProvider('Zoom', { ...context })).toBe(provider);
  });

  it('returns a Zoom provider that plans a pending link when Zoom is not set up', async () => {
    const provider = getMeetingProvider('Zoom', ctx());
    expect(provider.configured).toBe(false);
    await expect(provider.plan(INPUT)).resolves.toEqual({
      platform: 'Zoom',
      withGoogleMeet: false,
      joinUrl: null,
      pending: true,
    });
  });

  it('keeps Zoom on its real config with DEV_FAKE_EXTERNALS', () => {
    expect(getMeetingProvider('Zoom', ctx({ DEV_FAKE_EXTERNALS: true })).configured).toBe(false);
    resetMeetingForTests();
    expect(
      getMeetingProvider('Zoom', ctx({ ...ZOOM_ENV, DEV_FAKE_EXTERNALS: true })).configured,
    ).toBe(true);
  });

  it('builds new providers after a reset or for another env', () => {
    const context = ctx(ZOOM_ENV);
    const zoom = getMeetingProvider('Zoom', context);
    const meet = getMeetingProvider('Google Meet', context);
    resetMeetingForTests();
    const zoomAgain = getMeetingProvider('Zoom', context);
    expect(zoomAgain).not.toBe(zoom);
    expect(getMeetingProvider('Google Meet', context)).not.toBe(meet);
    expect(getMeetingProvider('Zoom', ctx(ZOOM_ENV))).not.toBe(zoomAgain);
  });

  it('throws on a platform it does not know', () => {
    expect(() => getMeetingProvider('Skype' as never, ctx())).toThrow(/Unknown meeting platform/);
  });
});
