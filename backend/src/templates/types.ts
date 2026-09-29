/** What every template returns. The subject is already safe for a mail header. */
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Everything the contact emails show. The contact route (be-09) fills it from the validated
 * form; optional fields the visitor left empty are "".
 */
export interface ContactEmailData {
  name: string;
  email: string;
  phone: string;
  company: string;
  /** One of the six reference project types, for example "Web Application". */
  projectType: string;
  /** One of the four reference budgets, or "" when not picked. */
  budget: string;
  details: string;
  /** When the message arrived, already formatted in Pakistan time, for example "Tue, 29 Sep 2026, 2:05 PM PKT". */
  receivedAt: string;
  /** The page the form was sent from (a URL or a short label). */
  source: string;
}

export type MeetingPlatform = 'Google Meet' | 'Zoom';

/**
 * Everything the booking emails show. The booking service (be-11) fills it from the
 * server side booking (names, prices and times recomputed on the server).
 */
export interface BookingEmailData {
  bookingId: string;
  sessionName: string;
  durationMinutes: number;
  pricePerSession: number;
  sessions: number;
  total: number;
  /** ISO 4217 code, "USD" for every booking in v1. */
  currency: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  platform: MeetingPlatform;
  /** The join link for both sides, or null when no meeting was created (Zoom not set up). */
  meetLink: string | null;
  /** The visitor picked Zoom but Zoom is not set up: Faisal sends a link himself. */
  zoomPending: boolean;
  /** The first session in the visitor's zone, for example "Wed, 30 Sep 2026, 10:00 AM to 11:00 AM". */
  whenVisitor: string;
  /** The same time in Pakistan, for example "Wed, 30 Sep 2026, 2:00 PM to 3:00 PM PKT". */
  whenPkt: string;
  /** The visitor's IANA zone, for example "Europe/London". */
  visitorTimeZone: string;
  /** Google Calendar "add event" link for the visitor. */
  addToCalendarUrl: string;
  /** The owner's calendar event (htmlLink), when the calendar returned one. */
  eventLink: string | null;
  /** More than one session: every session has its own time and calendar event. */
  multiSession: boolean;
  /**
   * The time of every booked session in order (the first one equals whenVisitor and whenPkt).
   * Leave out, or give one, for a single session.
   */
  sessionTimes?: ReadonlyArray<{ whenVisitor: string; whenPkt: string }>;
}
