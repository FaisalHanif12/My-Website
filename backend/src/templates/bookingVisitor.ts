import { headerText, oneLine, safeUrl } from './escape.js';
import {
  button,
  code,
  detailRows,
  firstName,
  formatDuration,
  formatMoney,
  link,
  messageBox,
  note,
  paragraph,
  renderLayout,
  renderTextLayout,
  sectionHeading,
  textBlock,
  textRows,
  trustedHtml,
} from './layout.js';
import type { BookingEmailData, MeetingPlatform, RenderedEmail } from './types.js';

/** "Booking confirmed: <session> with Faisal Hanif", header safe. */
export function bookingVisitorSubject(sessionName: string): string {
  return `Booking confirmed: ${headerText(sessionName)} with Faisal Hanif`;
}

/** The join button label for the platform. */
export function joinLabel(platform: MeetingPlatform): string {
  void platform;
  return 'Join Google Meet';
}

/** Session, duration, price per session, sessions and total, as plain text rows (both emails). */
export function sessionRows(data: BookingEmailData): Array<[string, string]> {
  return [
    ['Session', oneLine(data.sessionName)],
    ['Duration', formatDuration(data.durationMinutes)],
    ['Price per session', formatMoney(data.pricePerSession, data.currency)],
    ['Sessions', String(data.sessions)],
    ['Total', formatMoney(data.total, data.currency)],
  ];
}

/** "Wed, 30 Sep 2026, 10:00 AM to 11:00 AM (Europe/London)". */
export function visitorTime(data: BookingEmailData): string {
  const zone = oneLine(data.visitorTimeZone);
  const when = oneLine(data.whenVisitor);
  return zone ? `${when} (${zone})` : when;
}

/** True when the visitor is in Pakistan: their time would repeat the Pakistan time row. */
function samePlace(visitorZone: string, visitor: string, pkt: string): boolean {
  if (visitorZone === 'Asia/Karachi') return true;
  return visitor.trim() === pkt.replace(/\s*PKT$/i, '').trim();
}

/**
 * The time rows of a booking. One session: "Your time" and "Pakistan time" (labels and order come
 * from `labels`). Several: two rows per session, "Session 2 (your time)" and "Session 2 (Pakistan)"
 * (the words in brackets also come from `labels`). A visitor in Pakistan gets the Pakistan row only,
 * because a second row would repeat the same time.
 */
export function sessionTimeRows(
  data: BookingEmailData,
  labels: {
    you: string;
    pkt: string;
    /** Bracket word of the visitor's row in a several-session booking. */
    youShort?: string;
    /** Bracket word of the Pakistan row in a several-session booking. */
    pktShort?: string;
    pktFirst?: boolean;
  } = {
    you: 'Your time',
    pkt: 'Pakistan time',
  },
): Array<[string, string]> {
  const list = data.sessionTimes;
  const zone = oneLine(data.visitorTimeZone);
  const youShort = labels.youShort ?? 'your time';
  const pktShort = labels.pktShort ?? 'Pakistan';
  if (!list || list.length < 2) {
    const pkt: [string, string] = [labels.pkt, oneLine(data.whenPkt)];
    if (samePlace(zone, oneLine(data.whenVisitor), oneLine(data.whenPkt))) return [pkt];
    const you: [string, string] = [labels.you, visitorTime(data)];
    return labels.pktFirst ? [pkt, you] : [you, pkt];
  }
  return list.flatMap((t, i): Array<[string, string]> => {
    const when = oneLine(t.whenVisitor);
    const pkt: [string, string] = [`Session ${i + 1} (${pktShort})`, oneLine(t.whenPkt)];
    if (samePlace(zone, when, oneLine(t.whenPkt))) return [pkt];
    return [[`Session ${i + 1} (${youShort})`, zone ? `${when} (${zone})` : when], pkt];
  });
}

/** The join link when it is a safe web link, else "". */
export function joinUrl(data: BookingEmailData): string {
  const href = safeUrl(data.meetLink);
  return href.startsWith('https:') || href.startsWith('http:') ? href : '';
}

/** What the visitor reads when there is no join link yet. */
export function pendingLinkText(): string {
  return 'Faisal will send the meeting link before the call.';
}

const FOOTER = 'You are getting this email because you booked a call on faisalhanif.work.';
const RESCHEDULE = 'Need to reschedule or cancel? Just reply to this email.';
const PAYMENT = 'Payment details will follow from Faisal.';
const INVITE = 'The attached invite also works with Apple Calendar and Outlook.';

/**
 * The booking confirmation to the visitor: the session, prices, the time in their zone and
 * in Pakistan, the join button (or a line that the link follows), their notes, the booking id, an
 * "Add to Google Calendar" link, how to reschedule and the payment note.
 */
export function renderBookingVisitor(data: BookingEmailData): RenderedEmail {
  const first = firstName(data.name);
  const sessionName = oneLine(data.sessionName);
  const heading = 'Your booking is confirmed';
  const intro = `Hi ${first}, thanks for booking a ${sessionName} with Faisal Hanif. Here are the details.`;
  const join = joinUrl(data);
  const pending = pendingLinkText();
  const multi = data.multiSession
    ? `You booked ${data.sessions} sessions. Each one has its own time above and all of them use ` +
      'the same meeting link, which opens shortly before each session.'
    : '';
  const calendarUrl = safeUrl(data.addToCalendarUrl);

  const rows: Array<[string, string]> = [
    ...sessionRows(data),
    ...sessionTimeRows(data),
    ['Platform', data.platform],
  ];

  const joinHtml = join
    ? button(joinLabel(data.platform), join) +
      paragraph(trustedHtml(`Or open this link: ${link(join, join).safeHtml}`))
    : note(pending);

  const calendarHtml = calendarUrl
    ? paragraph(trustedHtml(`${link('Add to Google Calendar', calendarUrl).safeHtml}. ${INVITE}`))
    : paragraph(INVITE);

  const html = renderLayout({
    preheader: `${oneLine(data.whenVisitor)}. ${join ? 'Your join link is inside.' : pending}`,
    heading,
    bodyHtml:
      paragraph(intro) +
      joinHtml +
      sectionHeading('Booking details') +
      detailRows([...rows, ['Booking ID', code(data.bookingId)]]) +
      (multi ? note(multi) : '') +
      messageBox('Your notes', data.notes) +
      calendarHtml +
      paragraph(RESCHEDULE) +
      paragraph(PAYMENT),
    footer: FOOTER,
  });

  const text = renderTextLayout({
    heading,
    blocks: [
      intro,
      join ? `${joinLabel(data.platform)}: ${join}` : pending,
      `Booking details\n\n${textRows([...rows, ['Booking ID', oneLine(data.bookingId)]])}`,
      multi,
      textBlock('Your notes', data.notes),
      calendarUrl ? `Add to Google Calendar: ${calendarUrl}\n${INVITE}` : INVITE,
      RESCHEDULE,
      PAYMENT,
    ],
    footer: FOOTER,
  });

  return { subject: bookingVisitorSubject(data.sessionName), html, text };
}
