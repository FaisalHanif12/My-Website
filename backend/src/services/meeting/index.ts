/**
 * The meeting provider for the platform a visitor picked. Google Meet is the only platform and
 * needs no setup of its own. The provider is a process singleton.
 */
import type { AppContext } from '../../routes/types.js';
import type { Platform } from '../booking/types.js';
import { createGoogleMeetProvider } from './googleMeet.js';
import type { MeetingProvider } from './types.js';

export type MeetingContext = Pick<AppContext, 'env' | 'logger'>;

let googleMeet: MeetingProvider | undefined;

export function getMeetingProvider(platform: Platform, _ctx: MeetingContext): MeetingProvider {
  switch (platform) {
    case 'Google Meet':
      googleMeet ??= createGoogleMeetProvider();
      return googleMeet;
    default: {
      const unknown: never = platform;
      throw new Error(`Unknown meeting platform: ${String(unknown)}`);
    }
  }
}

/** Drops the singleton. Tests only. */
export function resetMeetingForTests(): void {
  googleMeet = undefined;
}
