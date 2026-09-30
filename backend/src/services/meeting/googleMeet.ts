/**
 * Google Meet provider. It makes no call: the calendar provider creates the event with a
 * Meet conference (withGoogleMeet: true) and the join link is read from the created event
 * (CreatedEvent.meetLink). Google Meet needs no setup of its own beyond Google Calendar.
 */
import type { MeetingPlan, MeetingProvider } from './types.js';

export function createGoogleMeetProvider(): MeetingProvider {
  return {
    platform: 'Google Meet',
    configured: true,
    plan(): Promise<MeetingPlan> {
      return Promise.resolve({
        platform: 'Google Meet',
        withGoogleMeet: true,
        joinUrl: null,
      });
    },
  };
}
