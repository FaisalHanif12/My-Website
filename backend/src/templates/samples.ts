import { renderBookingOwner } from './bookingOwner.js';
import { renderBookingVisitor } from './bookingVisitor.js';
import { renderContactOwner } from './contactOwner.js';
import { renderContactVisitor } from './contactVisitor.js';
import type { BookingEmailData, ContactEmailData, RenderedEmail } from './types.js';

/**
 * Sample data for the mail preview script and the template tests. Every person, address and
 * link here is made up (example.com, fictional phone ranges). The hostile samples carry the
 * input an attacker might send: tags, quotes, CR/LF header tricks and javascript: links.
 */

export const SAMPLE_CONTACT: ContactEmailData = {
  name: 'Amelia Hart',
  email: 'amelia.hart@example.com',
  phone: '',
  company: 'Northwind Studio',
  projectType: 'App Development',
  budget: '$1,000 - $5,000',
  details:
    'Hi Faisal,\nWe need a cross-platform app for booking yoga classes, with payments and ' +
    'push reminders.\n\nCould we talk about timelines and a rough estimate?',
  receivedAt: 'Tue, 29 Sep 2026, 2:05 PM PKT',
  source: 'https://faisalhanif.work/contact',
};

export const HOSTILE_NAME =
  'Eve "Tester" <script>alert(\'name\')</script>\r\nBcc: victim@example.com';

export const HOSTILE_CONTACT: ContactEmailData = {
  name: HOSTILE_NAME,
  email: "o'hara+test@example.com",
  phone: '+1 (555) 010-9999',
  company: '<img src=x onerror=alert(1)> & Sons "Ltd"',
  projectType: 'Web Application',
  budget: '',
  details:
    'Line one has <b>bold</b> & "double" and \'single\' quotes.\r\n' +
    'Line two: <script>document.location="https://evil.example"</script>\r\n\r\n' +
    'Line four: [click me](javascript:alert(1)) and <a href="javascript:alert(2)">this</a>',
  receivedAt: 'Tue, 29 Sep 2026, 2:07 PM PKT',
  source: 'javascript:alert(document.cookie)',
};

export const SAMPLE_BOOKING: BookingEmailData = {
  bookingId: 'bk_7f3a9c2e41d8',
  sessionName: 'Technical Deep Dive',
  durationMinutes: 60,
  pricePerSession: 25,
  sessions: 3,
  total: 75,
  currency: 'USD',
  name: 'Amelia Hart',
  email: 'amelia.hart@example.com',
  phone: '+44 20 7946 0958',
  company: 'Northwind Studio',
  notes:
    'We are planning a React Native app with offline sync.\nI would like a second opinion on the architecture.',
  platform: 'Google Meet',
  meetLink: 'https://meet.google.com/abc-defg-hij',
  zoomPending: false,
  whenVisitor: 'Wed, 30 Sep 2026, 10:00 AM to 11:00 AM',
  whenPkt: 'Wed, 30 Sep 2026, 2:00 PM to 3:00 PM PKT',
  visitorTimeZone: 'Europe/London',
  addToCalendarUrl:
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=Technical%20Deep%20Dive%20with%20Faisal%20Hanif' +
    '&dates=20260930T090000Z/20260930T100000Z' +
    '&details=Join%3A%20https%3A%2F%2Fmeet.google.com%2Fabc-defg-hij',
  eventLink: 'https://www.google.com/calendar/event?eid=c2FtcGxlZXZlbnQ',
  multiSession: true,
};

export const HOSTILE_BOOKING: BookingEmailData = {
  bookingId: 'bk_<b>9e1d</b>',
  sessionName: 'Quick Chat',
  durationMinutes: 30,
  pricePerSession: 15,
  sessions: 1,
  total: 15,
  currency: 'USD',
  name: HOSTILE_NAME,
  email: "o'hara+test@example.com",
  phone: '',
  company: '"><svg onload=alert(1)>',
  notes: 'Please call me.\r\nSubject: spoofed\r\n<script>alert("notes")</script>',
  platform: 'Zoom',
  meetLink: null,
  zoomPending: true,
  whenVisitor: 'Thu, 1 Oct 2026, 7:00 AM to 7:30 AM',
  whenPkt: 'Thu, 1 Oct 2026, 4:00 PM to 4:30 PM PKT',
  visitorTimeZone: 'America/New_York',
  addToCalendarUrl: 'javascript:alert(document.domain)',
  eventLink: 'https://www.google.com/calendar/event?eid=abc"><script>alert(1)</script>',
  multiSession: false,
};

export interface EmailPreview {
  /** File name part, for example "contact-owner". */
  name: string;
  render: () => RenderedEmail;
}

/** The four emails the preview script writes by default (the hostile samples show the escaping). */
export const MAIL_PREVIEWS: readonly EmailPreview[] = [
  { name: 'contact-owner', render: () => renderContactOwner(HOSTILE_CONTACT) },
  { name: 'contact-visitor', render: () => renderContactVisitor(SAMPLE_CONTACT) },
  { name: 'booking-visitor', render: () => renderBookingVisitor(SAMPLE_BOOKING) },
  { name: 'booking-owner', render: () => renderBookingOwner(HOSTILE_BOOKING) },
];

/** The other branches (npm run mail:preview -- --all). */
export const EXTRA_MAIL_PREVIEWS: readonly EmailPreview[] = [
  { name: 'contact-owner-plain', render: () => renderContactOwner(SAMPLE_CONTACT) },
  { name: 'contact-visitor-hostile', render: () => renderContactVisitor(HOSTILE_CONTACT) },
  { name: 'booking-visitor-zoom-pending', render: () => renderBookingVisitor(HOSTILE_BOOKING) },
  { name: 'booking-owner-meet', render: () => renderBookingOwner(SAMPLE_BOOKING) },
];
