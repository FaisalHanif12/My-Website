import { afterEach, describe, expect, it } from 'vitest';

import { getMeetingProvider, resetMeetingForTests } from '../../src/services/meeting/index.js';
import { createGoogleMeetProvider } from '../../src/services/meeting/googleMeet.js';
import type { MeetingPlanInput } from '../../src/services/meeting/types.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { makeTestEnv } from '../helpers/testEnv.js';

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

  it('builds a new provider after a reset', () => {
    const context = ctx();
    const meet = getMeetingProvider('Google Meet', context);
    resetMeetingForTests();
    expect(getMeetingProvider('Google Meet', context)).not.toBe(meet);
  });

  it('does not know Zoom any more', () => {
    expect(() => getMeetingProvider('Zoom' as never, ctx())).toThrow(/Unknown meeting platform/);
  });

  it('throws on a platform it does not know', () => {
    expect(() => getMeetingProvider('Skype' as never, ctx())).toThrow(/Unknown meeting platform/);
  });
});
