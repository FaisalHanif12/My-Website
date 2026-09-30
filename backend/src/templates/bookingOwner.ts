import { headerText, oneLine, safeUrl } from './escape.js';
import {
  button,
  code,
  detailRows,
  firstName,
  link,
  mailtoLink,
  messageBox,
  note,
  paragraph,
  renderLayout,
  renderTextLayout,
  sectionHeading,
  telLink,
  textBlock,
  textRows,
} from './layout.js';
import type { HtmlValue, TextValue } from './layout.js';
import { joinLabel, joinUrl, sessionRows, sessionTimeRows } from './bookingVisitor.js';
import type { BookingEmailData, RenderedEmail } from './types.js';

/** "New booking: <session> with <name>", header safe. */
export function bookingOwnerSubject(sessionName: string, name: string): string {
  return `New booking: ${headerText(sessionName)} with ${headerText(name)}`;
}

const FOOTER = 'Sent by the booking form on faisalhanif.work.';
const NOT_AVAILABLE = 'Not available';

/**
 * The new booking email to the owner: the visitor's details, the session and prices, both
 * times, the join link and the calendar event link. The booking service sets Reply-To to the
 * visitor.
 */
export function renderBookingOwner(data: BookingEmailData): RenderedEmail {
  const name = oneLine(data.name);
  const email = oneLine(data.email);
  const first = firstName(name);
  const sessionName = oneLine(data.sessionName);
  const heading = 'New booking';
  const intro = `${name} booked a ${sessionName}.`;
  const join = joinUrl(data);
  const eventUrl = safeUrl(data.eventLink);
  const multi = data.multiSession
    ? `${first} booked ${data.sessions} sessions. Each one has its own calendar event, and all of ` +
      'them use the same meeting link.'
    : '';
  const replyHint = `Press Reply to answer. Your reply goes straight to ${email}.`;
  const payment = `No payment was taken. Send ${first} the payment details.`;
  const noLink = NOT_AVAILABLE;

  const whenRows: Array<[string, string]> = [
    ...sessionTimeRows(data, { you: 'Visitor time', pkt: 'When (PKT)', pktFirst: true }),
    ['Platform', data.platform],
  ];

  const visitorHtml: Array<[string, HtmlValue]> = [
    ['Name', name],
    ['Email', mailtoLink(email)],
    ['Phone', telLink(data.phone)],
    ['Company', oneLine(data.company)],
  ];
  const visitorText: Array<[string, TextValue]> = [
    ['Name', name],
    ['Email', email],
    ['Phone', oneLine(data.phone)],
    ['Company', oneLine(data.company)],
  ];

  const html = renderLayout({
    preheader: `${sessionName} on ${oneLine(data.whenPkt)}.`,
    heading,
    bodyHtml:
      paragraph(intro) +
      (join ? button(joinLabel(data.platform), join) : '') +
      sectionHeading('Visitor') +
      detailRows(visitorHtml) +
      sectionHeading('Booking') +
      detailRows([
        ...sessionRows(data),
        ...whenRows,
        ['Meeting link', join ? link(join, join) : noLink],
        ['Booking ID', code(data.bookingId)],
        ['Calendar event', eventUrl ? link('Open in Google Calendar', eventUrl) : NOT_AVAILABLE],
      ]) +
      (multi ? note(multi) : '') +
      messageBox('Their notes', data.notes) +
      note(replyHint) +
      paragraph(payment),
    footer: FOOTER,
  });

  const text = renderTextLayout({
    heading,
    blocks: [
      intro,
      `Visitor\n\n${textRows(visitorText)}`,
      `Booking\n\n${textRows([
        ...sessionRows(data),
        ...whenRows,
        ['Meeting link', join || noLink],
        ['Booking ID', oneLine(data.bookingId)],
        ['Calendar event', eventUrl || NOT_AVAILABLE],
      ])}`,
      multi,
      textBlock('Their notes', data.notes),
      replyHint,
      payment,
    ],
    footer: FOOTER,
  });

  return { subject: bookingOwnerSubject(data.sessionName, data.name), html, text };
}
