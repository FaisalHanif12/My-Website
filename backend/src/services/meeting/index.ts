/**
 * The meeting provider for the platform a visitor picked. Google Meet needs no setup of
 * its own. Zoom always follows its real config, also with DEV_FAKE_EXTERNALS (sharedDecisions
 * 9), so picking Zoom in dev:fake tests the meetLink: null path. Both are process singletons,
 * so the Zoom token cache is shared by every booking.
 */
import type { AppContext } from '../../routes/types.js';
import type { Platform } from '../booking/types.js';
import { createGoogleMeetProvider } from './googleMeet.js';
import type { MeetingProvider } from './types.js';
import { createZoomProvider } from './zoom.js';

export type MeetingContext = Pick<AppContext, 'env' | 'logger'>;

let googleMeet: MeetingProvider | undefined;
let cachedZoom: { env: MeetingContext['env']; provider: MeetingProvider } | undefined;

export function getMeetingProvider(platform: Platform, ctx: MeetingContext): MeetingProvider {
  switch (platform) {
    case 'Google Meet':
      googleMeet ??= createGoogleMeetProvider();
      return googleMeet;
    case 'Zoom':
      // One provider per process (a new env object only appears in tests).
      if (cachedZoom?.env !== ctx.env) {
        cachedZoom = { env: ctx.env, provider: createZoomProvider(ctx.env, ctx.logger) };
      }
      return cachedZoom.provider;
    default: {
      const unknown: never = platform;
      throw new Error(`Unknown meeting platform: ${String(unknown)}`);
    }
  }
}

/** Drops both singletons (and with them the cached Zoom token). */
export function resetMeetingForTests(): void {
  googleMeet = undefined;
  cachedZoom = undefined;
}
