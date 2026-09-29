const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes a value for HTML text and for quoted attribute values. null and undefined become "". */
export function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

const SAFE_PROTOCOLS = new Set(['https:', 'http:', 'mailto:', 'tel:']);

/** Longest link we put in an email. */
const MAX_URL_LENGTH = 2048;

/**
 * Returns the URL when it is an absolute https, http, mailto or tel link, else "".
 * The result is not escaped: always pass it through escapeHtml inside an attribute.
 */
export function safeUrl(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return '';
  // Control characters or spaces inside a link are never legitimate here.
  // eslint-disable-next-line no-control-regex -- control characters are exactly what we reject
  if (/[\u0000-\u0020\u007f]/.test(trimmed)) return '';
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return '';
  }
  if (!SAFE_PROTOCOLS.has(url.protocol)) return '';
  if ((url.protocol === 'https:' || url.protocol === 'http:') && !url.hostname) return '';
  return url.href;
}

/** Escapes the text, then turns each line break into <br>. */
export function multiline(value: string | null | undefined): string {
  return escapeHtml(value).replace(/\r\n|\r|\n|\u2028|\u2029/g, '<br>');
}

/** Longest header value we build from user input. */
export const HEADER_TEXT_MAX = 150;

/**
 * A value that is safe inside a mail header: line breaks and control characters become
 * spaces, runs of spaces collapse, and the result is at most 150 characters.
 */
export function headerText(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  const flat = value
    // eslint-disable-next-line no-control-regex -- control characters are exactly what we remove
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const chars = Array.from(flat);
  return chars.length <= HEADER_TEXT_MAX
    ? flat
    : chars.slice(0, HEADER_TEXT_MAX).join('').trimEnd();
}

/** One line of text: line breaks become spaces and runs of spaces collapse. Not escaped. */
export function oneLine(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  return (
    value
      // eslint-disable-next-line no-control-regex -- control characters are exactly what we remove
      .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}
