/**
 * Small string and date helpers shared by the contact form, the booking modal and the chat,
 * ported exactly from the reference's contact.js (L5185, L5189-5192). Framework free, no side
 * effects.
 */

/**
 * The email check used by the contact form, the booking modal and the chat (L5185): a local part,
 * an @, one or more dot separated labels and a TLD of at least two letters.
 */
export const EMAIL_RE: RegExp = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

const ESC_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** HTML escapes & < > " and ' (L5189). null and undefined become ''. */
export function esc(s: unknown): string {
  return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
}

/** Pads a number below 10 with one leading zero (L5190): 7 -> "07", 12 -> "12". */
export function pad(n: number): string {
  return (n < 10 ? '0' : '') + n;
}

/** Local calendar day of d as "YYYY-MM-DD" (L5191). */
export function ymd(d: Date): string {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

/** "YYYY-MM-DD" to a Date at local midnight of that day (L5192). */
export function parseYmd(s: string): Date {
  const p = s.split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}
