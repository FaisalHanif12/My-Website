import { headerText, oneLine, safeUrl } from './escape.js';
import {
  button,
  detailRows,
  firstName,
  link,
  mailtoHref,
  mailtoLink,
  messageBox,
  note,
  paragraph,
  renderLayout,
  renderTextLayout,
  telLink,
  textBlock,
  textRows,
} from './layout.js';
import type { HtmlValue } from './layout.js';
import type { ContactEmailData, RenderedEmail } from './types.js';

/** "New message from <name> via faisalhanif.work", with the name made header safe. */
export function contactOwnerSubject(name: string): string {
  return `New message from ${headerText(name)} via faisalhanif.work`;
}

const FOOTER = 'Sent by the contact form on faisalhanif.work.';

/** The page as a link when it is a web address, else as plain text. */
function sourceHtml(source: string): HtmlValue {
  const text = oneLine(source);
  const href = safeUrl(text);
  return href.startsWith('https:') || href.startsWith('http:') ? link(text, href) : text;
}

/**
 * The email to the owner for a new contact form message. Every form field, the time in
 * Pakistan and the page it came from. The route sets Reply-To to the visitor.
 */
export function renderContactOwner(data: ContactEmailData): RenderedEmail {
  const name = oneLine(data.name);
  const email = oneLine(data.email);
  const first = firstName(name);
  const intro = `${name} sent a message through the contact form on faisalhanif.work.`;
  const replyHint = `Press Reply to answer. Your reply goes straight to ${email}.`;

  const html = renderLayout({
    preheader: `${oneLine(data.projectType)} enquiry. Press Reply to answer ${first}.`,
    heading: 'New message from the website',
    bodyHtml:
      paragraph(intro) +
      detailRows([
        ['Name', name],
        ['Email', mailtoLink(email)],
        ['Phone', telLink(data.phone)],
        ['Company', oneLine(data.company)],
        ['Project type', oneLine(data.projectType)],
        ['Budget', oneLine(data.budget)],
        ['Received', oneLine(data.receivedAt)],
        ['Page', sourceHtml(data.source)],
      ]) +
      messageBox('Project details', data.details) +
      button(`Reply to ${first}`, mailtoHref(email, 'Re: your message on faisalhanif.work')) +
      note(replyHint),
    footer: FOOTER,
  });

  const text = renderTextLayout({
    heading: 'New message from the website',
    blocks: [
      intro,
      textRows([
        ['Name', name],
        ['Email', email],
        ['Phone', oneLine(data.phone)],
        ['Company', oneLine(data.company)],
        ['Project type', oneLine(data.projectType)],
        ['Budget', oneLine(data.budget)],
        ['Received', oneLine(data.receivedAt)],
        ['Page', oneLine(data.source)],
      ]),
      textBlock('Project details', data.details),
      replyHint,
    ],
    footer: FOOTER,
  });

  return { subject: contactOwnerSubject(data.name), html, text };
}
