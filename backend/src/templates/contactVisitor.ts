import { oneLine } from './escape.js';
import {
  detailRows,
  firstName,
  messageBox,
  paragraph,
  renderLayout,
  renderTextLayout,
  sectionHeading,
  textBlock,
  textRows,
} from './layout.js';
import type { ContactEmailData, RenderedEmail } from './types.js';

export const CONTACT_VISITOR_SUBJECT = 'Thanks, I got your message';

const FOOTER =
  'You are getting this email because you sent a message through the contact form on faisalhanif.work.';

/**
 * The short confirmation to the visitor: Faisal replies within 24 hours, and a copy of the
 * project type and details they sent.
 */
export function renderContactVisitor(data: ContactEmailData): RenderedEmail {
  const first = firstName(data.name);
  const heading = `Thanks, ${first}!`;
  const intro = 'Thanks for reaching out. I got your message and will reply within 24 hours.';
  const addMore = 'If you want to add anything, just reply to this email.';
  const signOff = 'Faisal Hanif';

  const html = renderLayout({
    preheader: 'I got your message and will reply within 24 hours.',
    heading,
    bodyHtml:
      paragraph(intro) +
      sectionHeading('What you sent') +
      detailRows([['Project type', oneLine(data.projectType)]]) +
      messageBox('Project details', data.details) +
      paragraph(addMore) +
      paragraph(signOff),
    footer: FOOTER,
  });

  const text = renderTextLayout({
    heading,
    blocks: [
      intro,
      `What you sent\n\n${textRows([['Project type', oneLine(data.projectType)]])}`,
      textBlock('Project details', data.details),
      addMore,
      signOff,
    ],
    footer: FOOTER,
  });

  return { subject: CONTACT_VISITOR_SUBJECT, html, text };
}
