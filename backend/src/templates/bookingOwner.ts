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
import { joinLabel, joinUrl, sessionRows, visitorTime } from './bookingVisitor.js';
import type { BookingEmailData, RenderedEmail } from './types.js';

/** "New booking: <session> with <name>", header safe. */
export function bookingOwnerSubject(sessionName: string, name: string): string {
  return `New booking: ${headerText(sessionName)} with ${headerText(name)}`;
}

const FOOTER = 'Sent by the booking form on faisalhanif.work.';
const NOT_AVAILABLE = 'Not available';
const ZOOM_TITLE = 'Action needed: send a Zoom link';

/**
 * The new booking email to the owner: the visitor's details, the session and prices, both
 * times, the join link, the calendar event link, and a warning box when the visitor picked
 * Zoom but Zoom is not set up. The booking service sets Reply-To to the visitor.
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
  const zoomWarning =
    `${name} picked Zoom, but Zoom is not set up on the server, so no Zoom meeting was ` +
    `created. Send ${first} a Zoom link yourself before the call.`;
  const multi = data.multiSession
    ? `${first} booked ${data.sessions} sessions. The calendar event covers the first one. ` +
      'Plan the other sessions together on the first call.'
    : '';
  const replyHint = `Press Reply to answer. Your reply goes straight to ${email}.`;
  const payment = `No payment was taken. Send ${first} the payment details.`;
  const noLink = data.zoomPending ? 'Not created (Zoom is not set up)' : NOT_AVAILABLE;

  const whenRows: Array<[string, string]> = [
    ['When (PKT)', oneLine(data.whenPkt)],
    ['Visitor time', visitorTime(data)],
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
    preheader: `${sessionName} on ${oneLine(data.whenPkt)}.${data.zoomPending ? ' Zoom link needed.' : ''}`,
    heading,
    bodyHtml:
      (data.zoomPending ? note(zoomWarning, 'warning', ZOOM_TITLE) : '') +
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
      data.zoomPending ? `${ZOOM_TITLE.toUpperCase()}\n${zoomWarning}` : '',
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
