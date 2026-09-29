import { escapeHtml, multiline, oneLine, safeUrl } from './escape.js';

/**
 * Shared email layout and building blocks. Table based with inline CSS so it holds up in
 * Gmail, Outlook and Apple Mail; no remote images or fonts. Colours come from the reference
 * tokens (REFERENCE_MAP.md 11.1.1), light first with dark overrides for clients that
 * support prefers-color-scheme (Apple Mail, Outlook for Mac and iOS) and Outlook.com.
 */

/** Light colours (reference :root tokens, rgba lines flattened onto white). */
export const COLORS = {
  brand: '#0e6655',
  brand900: '#08302a',
  brandInk: '#0f4c41',
  accent: '#10b981',
  ink: '#0f231e',
  ink2: '#34504a',
  muted: '#6b7f79',
  bg: '#f2f6f4',
  surface: '#ffffff',
  soft: '#eef5f2',
  line: '#e3ebe8',
  lineStrong: '#d3dfdb',
  onBrand: '#ffffff',
  onBrandSoft: '#c9efe0',
  warnBg: '#fff4ec',
  warnLine: '#c2410c',
  warnInk: '#7c2d12',
} as const;

/** Dark colours (reference [data-theme="dark"] tokens). */
export const DARK_COLORS = {
  bg: '#050f0c',
  surface: '#0b1a16',
  soft: '#132a24',
  line: '#223631',
  ink: '#e9f4f0',
  ink2: '#b4c9c2',
  muted: '#8fa59e',
  brandInk: '#7fdcb9',
  accent: '#34d399',
  warnBg: '#2a1709',
  warnLine: '#fb923c',
  warnInk: '#fed7aa',
} as const;

export const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const MONO_STACK = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace";

/** Shown for an optional value the visitor left empty. */
export const NOT_GIVEN = 'Not given';

/** HTML built by these helpers. Plain strings are always escaped; this marks trusted markup. */
export interface SafeHtml {
  readonly safeHtml: string;
}

/** Marks markup built here (never user input) as safe to insert as is. */
export function trustedHtml(html: string): SafeHtml {
  return { safeHtml: html };
}

function isSafeHtml(value: unknown): value is SafeHtml {
  return typeof value === 'object' && value !== null && 'safeHtml' in value;
}

/** A value for a details row or note: plain text (escaped) or SafeHtml. */
export type HtmlValue = string | number | null | undefined | SafeHtml;

function isEmpty(value: string | number | null | undefined): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}

/** Plain text for a value: the trimmed text, or "Not given" when empty. */
export function displayText(value: string | number | null | undefined): string {
  return isEmpty(value) ? NOT_GIVEN : String(value).trim();
}

/** First word of a name, for greetings. Falls back to "there". */
export function firstName(name: string): string {
  const first = oneLine(name).split(' ')[0] ?? '';
  return first || 'there';
}

/** "$25" for whole US dollars, "$12.50" with cents, other currencies by code. */
export function formatMoney(amount: number, currency: string): string {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : 'USD';
  const whole = Number.isInteger(amount);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

/** "30 minutes", like the reference session cards. */
export function formatDuration(minutes: number): string {
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

function renderValue(value: HtmlValue): string {
  if (isSafeHtml(value)) return value.safeHtml;
  if (isEmpty(value)) {
    return `<span class="fh-muted" style="color:${COLORS.muted};">${NOT_GIVEN}</span>`;
  }
  return multiline(String(value).trim());
}

/** A link, or just the escaped label when the URL is not a safe https, http, mailto or tel link. */
export function link(label: string, url: string | null | undefined): SafeHtml {
  const href = safeUrl(url);
  if (!href) return trustedHtml(escapeHtml(label));
  return trustedHtml(
    `<a href="${escapeHtml(href)}" class="fh-link" target="_blank" rel="noopener" ` +
      `style="color:${COLORS.brand};text-decoration:underline;word-break:break-all;">` +
      `${escapeHtml(label)}</a>`,
  );
}

/** The email address as a mailto link (or "Not given"). */
export function mailtoLink(email: string): SafeHtml {
  const address = oneLine(email);
  if (!address) return trustedHtml(renderValue(''));
  return link(address, mailtoHref(address));
}

/** mailto: URL with the local part encoded, so "?", "&" or "#" in it cannot add headers. */
export function mailtoHref(address: string, subject?: string): string {
  const at = address.lastIndexOf('@');
  const local = at > 0 ? address.slice(0, at) : address;
  const domain = at > 0 ? address.slice(at + 1) : '';
  const target = domain
    ? `${encodeURIComponent(local)}@${encodeURIComponent(domain)}`
    : encodeURIComponent(local);
  const query = subject ? `?subject=${encodeURIComponent(oneLine(subject))}` : '';
  return `mailto:${target}${query}`;
}

/** A phone number as a tel link (or "Not given"). */
export function telLink(phone: string): SafeHtml {
  const number = oneLine(phone);
  if (!number) return trustedHtml(renderValue(''));
  const dial = number.replace(/[^+\d]/g, '');
  return dial.length >= 5 ? link(number, `tel:${dial}`) : trustedHtml(escapeHtml(number));
}

/** Monospace text, for ids. */
export function code(value: string): SafeHtml {
  return trustedHtml(
    `<span style="font-family:${MONO_STACK};font-size:14px;">${escapeHtml(oneLine(value))}</span>`,
  );
}

/** A paragraph of body text (escaped, line breaks kept). */
export function paragraph(text: HtmlValue): string {
  return (
    `<p class="fh-ink2" style="margin:0 0 16px;font-family:${FONT_STACK};font-size:15px;` +
    `line-height:1.6;color:${COLORS.ink2};">${renderValue(text)}</p>`
  );
}

/** A small uppercase heading above a group of rows. */
export function sectionHeading(text: string): string {
  return (
    `<p class="fh-label" style="margin:8px 0 4px;font-family:${FONT_STACK};font-size:12px;` +
    `line-height:1.4;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;` +
    `color:${COLORS.brandInk};">${escapeHtml(text)}</p>`
  );
}

/** One label and value per row. Values are escaped unless they are SafeHtml; empty shows "Not given". */
export function detailRows(rows: ReadonlyArray<readonly [string, HtmlValue]>): string {
  const body = rows
    .map(
      ([label, value]) =>
        `<tr>` +
        `<td class="fh-row-label fh-muted fh-line" valign="top" width="36%" ` +
        `style="width:36%;padding:10px 12px 10px 0;border-bottom:1px solid ${COLORS.line};` +
        `font-family:${FONT_STACK};font-size:13px;line-height:1.5;color:${COLORS.muted};">` +
        `${escapeHtml(label)}</td>` +
        `<td class="fh-row-value fh-ink fh-line" valign="top" ` +
        `style="padding:10px 0;border-bottom:1px solid ${COLORS.line};font-family:${FONT_STACK};` +
        `font-size:15px;line-height:1.5;color:${COLORS.ink};word-break:break-word;` +
        `overflow-wrap:anywhere;">${renderValue(value)}</td>` +
        `</tr>`,
    )
    .join('');
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
    `style="width:100%;border-collapse:collapse;margin:0 0 20px;">${body}</table>`
  );
}

/**
 * A big button. Returns "" when the URL is not a safe https, http, mailto or tel link, so a
 * bad link never shows as a button.
 */
export function button(label: string, url: string | null | undefined): string {
  const href = safeUrl(url);
  if (!href) return '';
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="fh-btn" ` +
    `style="margin:4px 0 20px;border-collapse:separate;"><tr>` +
    `<td align="center" bgcolor="${COLORS.brand}" ` +
    `style="background-color:${COLORS.brand};border-radius:12px;mso-padding-alt:14px 28px;">` +
    `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" ` +
    `style="display:inline-block;padding:14px 28px;font-family:${FONT_STACK};font-size:16px;` +
    `line-height:1.2;font-weight:700;color:${COLORS.onBrand};text-decoration:none;` +
    `border-radius:12px;">${escapeHtml(label)}</a>` +
    `</td></tr></table>`
  );
}

export type NoteTone = 'info' | 'warning';

/** A highlighted box: info (green edge) or warning (orange edge, with an optional title). */
export function note(text: HtmlValue, tone: NoteTone = 'info', title?: string): string {
  const warning = tone === 'warning';
  const boxClass = warning ? 'fh-warn' : 'fh-soft';
  const textClass = warning ? 'fh-warn-ink' : 'fh-ink2';
  const bg = warning ? COLORS.warnBg : COLORS.soft;
  const edge = warning ? COLORS.warnLine : COLORS.accent;
  const color = warning ? COLORS.warnInk : COLORS.ink2;
  const heading = title
    ? `<p class="${textClass}" style="margin:0 0 6px;font-family:${FONT_STACK};font-size:15px;` +
      `line-height:1.4;font-weight:800;color:${color};">${escapeHtml(title)}</p>`
    : '';
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
    `style="width:100%;border-collapse:separate;margin:0 0 20px;"><tr>` +
    `<td class="${boxClass}" bgcolor="${bg}" style="background-color:${bg};` +
    `border-left:4px solid ${edge};border-radius:10px;padding:14px 16px;">` +
    heading +
    `<p class="${textClass}" style="margin:0;font-family:${FONT_STACK};font-size:14px;` +
    `line-height:1.6;color:${color};">${renderValue(text)}</p>` +
    `</td></tr></table>`
  );
}

/** A titled box for longer visitor text (project details, notes). Escaped, line breaks kept. */
export function messageBox(title: string, text: string): string {
  return (
    sectionHeading(title) +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
    `style="width:100%;border-collapse:separate;margin:0 0 20px;"><tr>` +
    `<td class="fh-soft fh-ink" bgcolor="${COLORS.soft}" style="background-color:${COLORS.soft};` +
    `border-radius:10px;padding:14px 16px;font-family:${FONT_STACK};font-size:15px;` +
    `line-height:1.6;color:${COLORS.ink};word-break:break-word;overflow-wrap:anywhere;">` +
    `${renderValue(text)}</td></tr></table>`
  );
}

const D = DARK_COLORS;

/** Dark overrides and small screen rules. Clients without <style> support keep the inline light look. */
const STYLES =
  `:root{color-scheme:light dark;supported-color-schemes:light dark;}` +
  `body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}` +
  `table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}` +
  `a{text-decoration:underline;}` +
  `@media screen and (max-width:480px){` +
  `.fh-pad{padding-left:20px !important;padding-right:20px !important;}` +
  `.fh-row-label{display:block !important;width:auto !important;padding:12px 0 2px !important;border-bottom:0 !important;}` +
  `.fh-row-value{display:block !important;width:auto !important;padding:0 0 12px !important;}` +
  `.fh-h1{font-size:20px !important;}` +
  `}` +
  `@media (prefers-color-scheme:dark){` +
  `.fh-bg{background-color:${D.bg} !important;}` +
  `.fh-card{background-color:${D.surface} !important;border-color:${D.line} !important;}` +
  `.fh-soft{background-color:${D.soft} !important;}` +
  `.fh-line{border-color:${D.line} !important;}` +
  `.fh-ink{color:${D.ink} !important;}` +
  `.fh-ink2{color:${D.ink2} !important;}` +
  `.fh-muted{color:${D.muted} !important;}` +
  `.fh-label{color:${D.brandInk} !important;}` +
  `.fh-link{color:${D.accent} !important;}` +
  `.fh-warn{background-color:${D.warnBg} !important;border-color:${D.warnLine} !important;}` +
  `.fh-warn-ink{color:${D.warnInk} !important;}` +
  `}` +
  // Outlook.com dark mode marks the elements it recolours with these attributes.
  `[data-ogsc] .fh-ink{color:${D.ink} !important;}` +
  `[data-ogsc] .fh-ink2{color:${D.ink2} !important;}` +
  `[data-ogsc] .fh-muted{color:${D.muted} !important;}` +
  `[data-ogsc] .fh-label{color:${D.brandInk} !important;}` +
  `[data-ogsc] .fh-link{color:${D.accent} !important;}` +
  `[data-ogsc] .fh-warn-ink{color:${D.warnInk} !important;}` +
  `[data-ogsb] .fh-bg{background-color:${D.bg} !important;}` +
  `[data-ogsb] .fh-card{background-color:${D.surface} !important;}` +
  `[data-ogsb] .fh-soft{background-color:${D.soft} !important;}` +
  `[data-ogsb] .fh-warn{background-color:${D.warnBg} !important;}`;

export interface LayoutOptions {
  /** Preview text shown next to the subject in the inbox (plain text). */
  preheader: string;
  /** The big heading inside the card (plain text). */
  heading: string;
  /** Card body, built with the helpers above. */
  bodyHtml: string;
  /** Small print under the card (plain text, line breaks kept). */
  footer: string;
}

/** The full HTML document: green header band with the "Faisal Hanif" wordmark, a white card, small print. */
export function renderLayout(options: LayoutOptions): string {
  const preheader = escapeHtml(oneLine(options.preheader));
  // Filler after the preheader stops inbox previews from pulling in body text.
  const filler = '&#8204;&nbsp;'.repeat(60);
  return (
    `<!DOCTYPE html>` +
    `<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">` +
    `<head>` +
    `<meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta http-equiv="X-UA-Compatible" content="IE=edge">` +
    `<meta name="x-apple-disable-message-reformatting">` +
    `<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">` +
    `<meta name="color-scheme" content="light dark">` +
    `<meta name="supported-color-schemes" content="light dark">` +
    `<title>${escapeHtml(oneLine(options.heading))}</title>` +
    `<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->` +
    `<style>${STYLES}</style>` +
    `</head>` +
    `<body class="fh-bg" style="margin:0;padding:0;width:100%;background-color:${COLORS.bg};">` +
    `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">` +
    `${preheader}${filler}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="fh-bg" ` +
    `bgcolor="${COLORS.bg}" style="width:100%;background-color:${COLORS.bg};border-collapse:collapse;">` +
    `<tr><td align="center" style="padding:24px 12px;">` +
    `<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
    `style="width:100%;max-width:600px;border-collapse:separate;">` +
    // Header band with the text wordmark.
    `<tr><td class="fh-pad" bgcolor="${COLORS.brand}" style="background-color:${COLORS.brand};` +
    `background-image:linear-gradient(135deg,${COLORS.brand} 0%,#0a5a4a 100%);` +
    `border-radius:16px 16px 0 0;padding:22px 32px;">` +
    `<p style="margin:0;font-family:${FONT_STACK};font-size:20px;line-height:1.2;font-weight:800;` +
    `letter-spacing:-0.01em;color:${COLORS.onBrand};">Faisal Hanif</p>` +
    `</td></tr>` +
    `<tr><td height="4" bgcolor="${COLORS.accent}" style="height:4px;line-height:4px;font-size:4px;` +
    `background-color:${COLORS.accent};">&nbsp;</td></tr>` +
    // Card.
    `<tr><td class="fh-card fh-pad" bgcolor="${COLORS.surface}" style="background-color:${COLORS.surface};` +
    `border:1px solid ${COLORS.lineStrong};border-top:0;border-radius:0 0 16px 16px;padding:28px 32px 12px;">` +
    `<h1 class="fh-ink fh-h1" style="margin:0 0 16px;font-family:${FONT_STACK};font-size:22px;` +
    `line-height:1.3;font-weight:800;letter-spacing:-0.01em;color:${COLORS.ink};">` +
    `${escapeHtml(oneLine(options.heading))}</h1>` +
    options.bodyHtml +
    `</td></tr>` +
    // Small print.
    `<tr><td class="fh-muted fh-pad" style="padding:18px 32px 8px;font-family:${FONT_STACK};` +
    `font-size:12px;line-height:1.6;color:${COLORS.muted};text-align:center;">` +
    `${multiline(options.footer)}</td></tr>` +
    `</table>` +
    `<!--[if mso]></td></tr></table><![endif]-->` +
    `</td></tr></table>` +
    `</body></html>`
  );
}

/** A value for the plain text version. */
export type TextValue = string | number | null | undefined;

/** "Label: value" lines; empty values show "Not given"; later lines of a long value are indented. */
export function textRows(rows: ReadonlyArray<readonly [string, TextValue]>): string {
  return rows
    .map(([label, value]) => {
      const lines = displayText(value).split(/\r\n|\r|\n/);
      const [first = '', ...rest] = lines;
      return [`${label}: ${first}`, ...rest.map((line) => `  ${line}`)].join('\n');
    })
    .join('\n');
}

/** A titled block of longer text for the plain text version. */
export function textBlock(title: string, value: TextValue): string {
  return `${title}:\n${displayText(value)}`;
}

export interface TextLayoutOptions {
  heading: string;
  /** Blocks of text; empty blocks are dropped and the rest are separated by a blank line. */
  blocks: readonly string[];
  footer: string;
}

/** The plain text version: wordmark, heading, blocks and the small print. */
export function renderTextLayout(options: TextLayoutOptions): string {
  const heading = oneLine(options.heading);
  const parts = [
    'Faisal Hanif',
    '',
    heading,
    '='.repeat(Math.min(Math.max(heading.length, 3), 60)),
    '',
    options.blocks
      .map((block) => block.trim())
      .filter((block) => block.length > 0)
      .join('\n\n'),
    '',
    '--',
    options.footer.trim(),
  ];
  return `${parts.join('\n')}\n`;
}
