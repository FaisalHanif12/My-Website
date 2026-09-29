import { createEvents } from 'ics';
import type { EventAttributes } from 'ics';
import type { MailAttachment } from '../mail/types.js';

export const ICS_FILENAME = 'faisal-hanif-meeting.ics';
export const ICS_PRODUCT_ID = 'faisalhanif.work/booking';

export interface IcsSession {
  /** The Google Calendar event UID, so calendars match the file to the event. */
  uid: string;
  start: Date;
  end: Date;
  title: string;
}

export interface IcsInput {
  /** One entry per booked session. */
  sessions: readonly IcsSession[];
  description: string;
  /** The join link: used as the location and the URL. null when there is none yet. */
  link: string | null;
  organizer: { name: string; email: string };
  attendee: { name: string; email: string };
}

function utcParts(date: Date): [number, number, number, number, number] {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ];
}

/** Keeps a value to one line (calendar fields cannot hold raw line breaks from a visitor). */
function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * The .ics text of a booking, one VEVENT per session. Throws when the calendar library rejects
 * the input, so the caller can log it and send the email without the file.
 */
export function buildIcs(input: IcsInput): string {
  const events: EventAttributes[] = input.sessions.map((session) => ({
    uid: session.uid,
    productId: ICS_PRODUCT_ID,
    method: 'PUBLISH',
    start: utcParts(session.start),
    startInputType: 'utc',
    startOutputType: 'utc',
    end: utcParts(session.end),
    endInputType: 'utc',
    endOutputType: 'utc',
    title: oneLine(session.title),
    description: input.description,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: { name: oneLine(input.organizer.name), email: input.organizer.email },
    attendees: [
      {
        name: oneLine(input.attendee.name),
        email: input.attendee.email,
        rsvp: false,
        partstat: 'ACCEPTED',
        role: 'REQ-PARTICIPANT',
      },
    ],
    ...(input.link ? { location: input.link, url: input.link } : {}),
  }));
  const { error, value } = createEvents(events);
  if (error || !value) throw new Error('The calendar invite could not be built.');
  return value;
}

/** The .ics as a mail attachment. */
export function icsAttachment(content: string): MailAttachment {
  return {
    filename: ICS_FILENAME,
    content,
    contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
  };
}
