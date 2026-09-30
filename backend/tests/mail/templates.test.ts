import { describe, expect, it } from 'vitest';
import { bookingOwnerSubject, renderBookingOwner } from '../../src/templates/bookingOwner.js';
import { bookingVisitorSubject, renderBookingVisitor } from '../../src/templates/bookingVisitor.js';
import { contactOwnerSubject, renderContactOwner } from '../../src/templates/contactOwner.js';
import {
  CONTACT_VISITOR_SUBJECT,
  renderContactVisitor,
} from '../../src/templates/contactVisitor.js';
import { oneLine } from '../../src/templates/escape.js';
import {
  button,
  detailRows,
  formatMoney,
  link,
  mailtoHref,
  NOT_GIVEN,
  renderLayout,
} from '../../src/templates/layout.js';
import {
  EXTRA_MAIL_PREVIEWS,
  HOSTILE_BOOKING,
  HOSTILE_CONTACT,
  MAIL_PREVIEWS,
  SAMPLE_BOOKING,
  SAMPLE_CONTACT,
} from '../../src/templates/samples.js';
import type { BookingEmailData, RenderedEmail } from '../../src/templates/types.js';

const EM_DASH = String.fromCharCode(0x2014);

/** The only tags the layout and helpers produce. */
const LAYOUT_TAGS = [
  'html',
  'head',
  'meta',
  'title',
  'style',
  'body',
  'div',
  'table',
  'tr',
  'td',
  'h1',
  'p',
  'span',
  'a',
  'br',
];

const ALL_RENDERS: Array<[string, () => RenderedEmail]> = [
  ...[...MAIL_PREVIEWS, ...EXTRA_MAIL_PREVIEWS].map((preview): [string, () => RenderedEmail] => [
    preview.name,
    preview.render,
  ]),
];

/** Every href and src value in the HTML. */
function linkTargets(html: string): string[] {
  return [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((match) => match[1] ?? '');
}

/** Lines of a value as the text version shows them (single-line fields are joined). */
function textLines(value: string): string[] {
  return value
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

describe('subjects', () => {
  it('contact owner is exactly "New message from <name> via faisalhanif.work"', () => {
    expect(renderContactOwner(SAMPLE_CONTACT).subject).toBe(
      'New message from Amelia Hart via faisalhanif.work',
    );
  });

  it('contact visitor is "Thanks, I got your message"', () => {
    expect(renderContactVisitor(SAMPLE_CONTACT).subject).toBe('Thanks, I got your message');
    expect(CONTACT_VISITOR_SUBJECT).toBe('Thanks, I got your message');
  });

  it('booking visitor is "Booking confirmed: <sessionName> with Faisal Hanif"', () => {
    expect(renderBookingVisitor(SAMPLE_BOOKING).subject).toBe(
      'Booking confirmed: Technical Deep Dive with Faisal Hanif',
    );
  });

  it('booking owner is "New booking: <sessionName> with <name>"', () => {
    expect(renderBookingOwner(SAMPLE_BOOKING).subject).toBe(
      'New booking: Technical Deep Dive with Amelia Hart',
    );
  });

  it('never carries CR or LF, even from hostile names', () => {
    for (const subject of [
      renderContactOwner(HOSTILE_CONTACT).subject,
      renderBookingOwner(HOSTILE_BOOKING).subject,
      renderBookingVisitor({ ...HOSTILE_BOOKING, sessionName: 'Quick\r\nBcc: x@example.com' })
        .subject,
      contactOwnerSubject('a\nb'),
      bookingOwnerSubject('s\r', '\nn'),
      bookingVisitorSubject('x\r\ny'),
    ]) {
      expect(subject).not.toMatch(/[\r\n]/);
    }
    expect(renderContactOwner(HOSTILE_CONTACT).subject).toBe(
      `New message from Eve "Tester" <script>alert('name')</script> Bcc: victim@example.com via faisalhanif.work`,
    );
  });

  it('keeps the whole suffix for a name at the 120 character form limit', () => {
    const subject = contactOwnerSubject('N'.repeat(120));
    expect(subject.endsWith(' via faisalhanif.work')).toBe(true);
  });
});

describe('escaping in every template', () => {
  it.each(ALL_RENDERS)('%s has no raw markup from user input', (_name, render) => {
    const { html } = render();
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<img/i);
    expect(html).not.toMatch(/<svg/i);
    expect(html).not.toContain('<b>');
    // Every real tag is one the layout builds, and none has an event handler attribute.
    const tags = html.replace(/<!--[\s\S]*?-->/g, '').match(/<\/?[a-zA-Z][^>]*>/g) ?? [];
    for (const tag of tags) {
      const name = /^<\/?([a-zA-Z0-9]+)/.exec(tag)?.[1]?.toLowerCase() ?? '';
      expect(LAYOUT_TAGS).toContain(name);
      expect(tag).not.toMatch(/\son\w+\s*=/i);
    }
  });

  it.each(ALL_RENDERS)('%s links only to https, http, mailto or tel', (_name, render) => {
    for (const target of linkTargets(render().html)) {
      expect(target).toMatch(/^(https?:\/\/|mailto:|tel:)/);
      expect(target.toLowerCase()).not.toContain('javascript:');
    }
  });

  it('shows hostile input as escaped text', () => {
    const { html } = renderContactOwner(HOSTILE_CONTACT);
    expect(html).toContain('&lt;script&gt;alert(&#39;name&#39;)&lt;/script&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt; &amp; Sons &quot;Ltd&quot;');
    // The javascript: page source stays visible as text, never as a link.
    expect(html).toContain('javascript:alert(document.cookie)');
    expect(html).not.toContain('href="javascript');
  });

  it('drops the javascript: calendar link and encodes the event link', () => {
    const visitor = renderBookingVisitor(HOSTILE_BOOKING);
    expect(visitor.html).not.toContain('Add to Google Calendar');
    expect(visitor.text).not.toContain('javascript:');
    const owner = renderBookingOwner(HOSTILE_BOOKING);
    expect(owner.html).toContain(
      'href="https://www.google.com/calendar/event?eid=abc%22%3E%3Cscript%3Ealert(1)%3C/script%3E"',
    );
  });

  it('encodes the mailto local part so it cannot add headers', () => {
    expect(mailtoHref('a?cc=victim@example.com')).toBe('mailto:a%3Fcc%3Dvictim@example.com');
    expect(mailtoHref('x@example.com', 'Re: hi & bye')).toBe(
      'mailto:x@example.com?subject=Re%3A%20hi%20%26%20bye',
    );
  });

  it('never renders a button or link with an unsafe URL', () => {
    expect(button('Join', 'javascript:alert(1)')).toBe('');
    expect(button('Join', null)).toBe('');
    expect(link('<Label>', 'javascript:alert(1)').safeHtml).toBe('&lt;Label&gt;');
  });
});

describe('layout', () => {
  const html = renderLayout({
    preheader: 'Preview <text>',
    heading: 'Heading "quoted"',
    bodyHtml: detailRows([['Label <x>', 'Value & more']]),
    footer: 'Line one\nLine two',
  });

  it('is a light and dark aware, 600 px wide, table based document', () => {
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<meta name="color-scheme" content="light dark">');
    expect(html).toContain('<meta name="supported-color-schemes" content="light dark">');
    expect(html).toContain('max-width:600px');
    expect(html).toContain('@media (prefers-color-scheme:dark)');
    expect(html).toContain('role="presentation"');
    expect(html).toContain('>Faisal Hanif<');
    expect(html).toContain('#0e6655');
  });

  it('loads nothing remote', () => {
    expect(html).not.toMatch(/<img|<link|@import|url\(|<script/i);
  });

  it('escapes the heading, preheader, labels, values and footer', () => {
    expect(html).toContain('Heading &quot;quoted&quot;');
    expect(html).toContain('Preview &lt;text&gt;');
    expect(html).toContain('Label &lt;x&gt;');
    expect(html).toContain('Value &amp; more');
    expect(html).toContain('Line one<br>Line two');
  });

  it('formats money like the reference', () => {
    expect(formatMoney(15, 'USD')).toBe('$15');
    expect(formatMoney(12.5, 'USD')).toBe('$12.50');
    expect(formatMoney(250, 'USD')).toBe('$250');
  });
});

describe('contact owner email', () => {
  const email = renderContactOwner(SAMPLE_CONTACT);

  it('shows every field, the email as a mailto link and the Reply hint', () => {
    for (const value of [
      'Amelia Hart',
      'Northwind Studio',
      'App Development',
      '$1,000 - $5,000',
      'Tue, 29 Sep 2026, 2:05 PM PKT',
    ]) {
      expect(email.html).toContain(value);
    }
    expect(email.html).toContain('href="mailto:amelia.hart@example.com"');
    expect(email.html).toContain('href="https://faisalhanif.work/contact"');
    expect(email.html).toContain(
      'Press Reply to answer. Your reply goes straight to amelia.hart@example.com.',
    );
    for (const label of [
      'Name',
      'Email',
      'Phone',
      'Company',
      'Project type',
      'Budget',
      'Received',
      'Page',
    ]) {
      expect(email.html).toContain(`>${label}</td>`);
    }
  });

  it('shows "Not given" for an empty optional value', () => {
    expect(email.html).toContain(NOT_GIVEN);
    expect(email.text).toContain(`Phone: ${NOT_GIVEN}`);
  });

  it.each([
    ['sample', SAMPLE_CONTACT],
    ['hostile', HOSTILE_CONTACT],
  ])('the text version holds every value (%s)', (_name, data) => {
    const { text } = renderContactOwner(data);
    for (const value of [
      data.name,
      data.email,
      data.phone,
      data.company,
      data.projectType,
      data.budget,
      data.receivedAt,
      data.source,
    ]) {
      if (value) expect(text).toContain(oneLine(value));
    }
    for (const line of textLines(data.details)) expect(text).toContain(line);
  });
});

describe('contact visitor email', () => {
  const email = renderContactVisitor(SAMPLE_CONTACT);

  it('says Faisal replies within 24 hours and repeats project type and details', () => {
    expect(email.html).toContain('Thanks, Amelia!');
    expect(email.html).toContain('will reply within 24 hours');
    expect(email.html).toContain('App Development');
    expect(email.html).toContain('We need a cross-platform app');
    expect(email.text).toContain('will reply within 24 hours');
    expect(email.text).toContain('Project type: App Development');
    for (const line of textLines(SAMPLE_CONTACT.details)) expect(email.text).toContain(line);
  });

  it('does not show the visitor their phone, company or budget again', () => {
    expect(email.text).not.toContain('Northwind Studio');
    expect(email.text).not.toContain('$1,000 - $5,000');
  });
});

/** Every value of a booking that both booking emails must carry in their text version. */
function bookingValues(data: BookingEmailData): string[] {
  return [
    data.bookingId,
    data.sessionName,
    `${data.durationMinutes} minutes`,
    formatMoney(data.pricePerSession, data.currency),
    `Sessions: ${data.sessions}`,
    formatMoney(data.total, data.currency),
    data.whenVisitor,
    data.whenPkt,
    data.visitorTimeZone,
    data.platform,
    ...textLines(data.notes),
  ];
}

describe('booking visitor email', () => {
  const email = renderBookingVisitor(SAMPLE_BOOKING);

  it('shows both time zones, the total, the booking id and the session details', () => {
    expect(email.html).toContain('Wed, 30 Sep 2026, 10:00 AM to 11:00 AM (Europe/London)');
    expect(email.html).toContain('Wed, 30 Sep 2026, 2:00 PM to 3:00 PM PKT');
    expect(email.html).toContain('$75');
    expect(email.html).toContain('$25');
    expect(email.html).toContain('60 minutes');
    expect(email.html).toContain('bk_7f3a9c2e41d8');
  });

  it('has the big Join Google Meet button, the calendar link, reschedule and payment notes', () => {
    expect(email.html).toMatch(
      /<a href="https:\/\/meet\.google\.com\/abc-defg-hij"[^>]*>Join Google Meet<\/a>/,
    );
    expect(email.html).toContain('>Add to Google Calendar</a>');
    expect(email.html).toContain(
      'href="https://calendar.google.com/calendar/render?action=TEMPLATE',
    );
    expect(email.html).toContain('Need to reschedule or cancel? Just reply to this email.');
    expect(email.html).toContain('Payment details will follow from Faisal.');
    expect(email.text).toContain('Join Google Meet: https://meet.google.com/abc-defg-hij');
    expect(email.text).toContain('Add to Google Calendar: https://calendar.google.com/');
    expect(email.text).toContain('Payment details will follow from Faisal.');
    expect(email.html).not.toContain('Faisal will send the meeting link');
  });

  it('says Faisal will send the link when there is none, with no button', () => {
    const pending = renderBookingVisitor(HOSTILE_BOOKING);
    expect(pending.html).toContain('Faisal will send the meeting link before the call.');
    expect(pending.text).toContain('Faisal will send the meeting link before the call.');
    expect(pending.html).not.toMatch(/>Join Google Meet<\/a>/);
  });

  it('explains the other sessions only for a multi-session booking', () => {
    const multiLine = 'all of them use the same meeting link';
    expect(email.html).toContain(multiLine);
    expect(email.text).toContain('You booked 3 sessions.');
    const single = renderBookingVisitor({
      ...SAMPLE_BOOKING,
      sessions: 1,
      total: 25,
      multiSession: false,
    });
    expect(single.html).not.toContain(multiLine);
    expect(single.text).not.toContain(multiLine);
  });

  it.each([
    ['sample', SAMPLE_BOOKING],
    ['hostile', HOSTILE_BOOKING],
  ])('the text version holds every value (%s)', (_name, data) => {
    const { text } = renderBookingVisitor(data);
    for (const value of bookingValues(data)) expect(text).toContain(oneLine(value));
  });

  it('shows "Not given" for empty notes', () => {
    const noNotes = renderBookingVisitor({ ...SAMPLE_BOOKING, notes: '' });
    expect(noNotes.html).toContain(NOT_GIVEN);
    expect(noNotes.text).toContain(`Your notes:\n${NOT_GIVEN}`);
  });
});

describe('booking owner email', () => {
  it('shows the visitor details, the join link and the calendar event link', () => {
    const email = renderBookingOwner(SAMPLE_BOOKING);
    expect(email.html).toContain('href="mailto:amelia.hart@example.com"');
    expect(email.html).toContain('href="tel:+442079460958"');
    expect(email.html).toContain('Northwind Studio');
    expect(email.html).toMatch(/>Join Google Meet<\/a>/);
    expect(email.html).toContain(
      '<a href="https://www.google.com/calendar/event?eid=c2FtcGxlZXZlbnQ"',
    );
    expect(email.html).toContain('>Open in Google Calendar</a>');
    expect(email.html).not.toContain('Action needed');
    expect(email.text).toContain(
      'Calendar event: https://www.google.com/calendar/event?eid=c2FtcGxlZXZlbnQ',
    );
    expect(email.text).toContain('Meeting link: https://meet.google.com/abc-defg-hij');
    expect(email.html).toContain('Each one has its own calendar event');
  });

  it('shows "Not available" for the meeting link when there is none, with no warning box', () => {
    const email = renderBookingOwner(HOSTILE_BOOKING);
    expect(email.html).not.toContain('class="fh-warn"');
    expect(email.html).not.toContain('Zoom');
    expect(email.text).toContain('Meeting link: Not available');
  });

  it('shows "Not available" when there is no calendar event link', () => {
    const email = renderBookingOwner({ ...SAMPLE_BOOKING, eventLink: null });
    expect(email.text).toContain('Calendar event: Not available');
  });

  it.each([
    ['sample', SAMPLE_BOOKING],
    ['hostile', HOSTILE_BOOKING],
  ])('the text version holds every value (%s)', (_name, data) => {
    const { text } = renderBookingOwner(data);
    for (const value of [...bookingValues(data), data.name, data.email, data.phone, data.company]) {
      if (value) expect(text).toContain(oneLine(value));
    }
  });
});

describe('all new text', () => {
  it.each(ALL_RENDERS)('%s has no em dash', (_name, render) => {
    const { subject, html, text } = render();
    expect(subject).not.toContain(EM_DASH);
    expect(html).not.toContain(EM_DASH);
    expect(text).not.toContain(EM_DASH);
  });

  it('the preview script renders four emails by default', () => {
    expect(MAIL_PREVIEWS.map((preview) => preview.name)).toEqual([
      'contact-owner',
      'contact-visitor',
      'booking-visitor',
      'booking-owner',
    ]);
  });
});
