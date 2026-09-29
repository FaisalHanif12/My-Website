import { contactFacts } from '@/content/site';

/**
 * The reference mailto flow (contact.js openMail, L5193-5198), used by the contact form and the
 * booking modal when NEXT_PUBLIC_API_URL is not set. Browser only: call it from an event handler.
 */

/** Builds the mailto link for the site email with the subject and body URI encoded. */
export function mailtoHref(subject: string, body: string): string {
  return (
    'mailto:' +
    contactFacts.email +
    '?subject=' +
    encodeURIComponent(subject) +
    '&body=' +
    encodeURIComponent(body)
  );
}

/**
 * Opens the visitor's mail app exactly like the reference: a hidden anchor with the mailto href
 * and rel="noopener" is appended to the body, clicked, and removed on the next task. Returns the
 * href.
 */
export function openMail(subject: string, body: string): string {
  const href = mailtoHref(subject, body);
  const a = document.createElement('a');
  a.href = href;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
  }, 0);
  return href;
}
