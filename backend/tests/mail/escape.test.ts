import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  HEADER_TEXT_MAX,
  headerText,
  multiline,
  oneLine,
  safeUrl,
} from '../../src/templates/escape.js';

describe('escapeHtml', () => {
  it('escapes the five HTML special characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('never leaves a raw script tag', () => {
    const out = escapeHtml('<script>alert(1)</script><SCRIPT src=x></SCRIPT>');
    expect(out).not.toMatch(/<script/i);
    expect(out).toContain('&lt;script&gt;');
  });

  it('turns null and undefined into an empty string and keeps numbers', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(25)).toBe('25');
  });

  it('escapes an ampersand only once per pass', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });
});

describe('safeUrl', () => {
  it.each([
    ['https://meet.google.com/abc-defg-hij', 'https://meet.google.com/abc-defg-hij'],
    ['http://example.com/page', 'http://example.com/page'],
    ['mailto:someone@example.com', 'mailto:someone@example.com'],
    ['tel:+15550100', 'tel:+15550100'],
    ['  https://faisalhanif.work  ', 'https://faisalhanif.work/'],
  ])('keeps %s', (input, expected) => {
    expect(safeUrl(input)).toBe(expected);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'ftp://example.com/file',
    '//evil.example/path',
    '/relative/path',
    '#anchor',
    'https://exa mple.com',
    'https://',
    '',
    '   ',
  ])('drops %j', (input) => {
    expect(safeUrl(input)).toBe('');
  });

  it('drops null, undefined and very long links', () => {
    expect(safeUrl(null)).toBe('');
    expect(safeUrl(undefined)).toBe('');
    expect(safeUrl(`https://example.com/${'a'.repeat(2100)}`)).toBe('');
  });

  it('percent-encodes quotes and angle brackets in web links', () => {
    const out = safeUrl('https://example.com/?q="><script>alert(1)</script>');
    expect(out).not.toMatch(/[<>"]/);
  });
});

describe('multiline', () => {
  it('escapes first, then turns every kind of line break into <br>', () => {
    expect(multiline('a<b>\r\nb\rc\nd')).toBe('a&lt;b&gt;<br>b<br>c<br>d');
  });

  it('handles empty values', () => {
    expect(multiline(undefined)).toBe('');
    expect(multiline('')).toBe('');
  });
});

describe('headerText', () => {
  it('strips CR and LF so no header can be added', () => {
    const out = headerText('Eve\r\nBcc: victim@example.com\n\rX-Test: 1');
    expect(out).not.toMatch(/[\r\n]/);
    expect(out).toBe('Eve Bcc: victim@example.com X-Test: 1');
  });

  it('collapses spaces and control characters', () => {
    expect(headerText('  a \t\t b \u0000 c d  ')).toBe('a b c d');
  });

  it(`caps the value at ${HEADER_TEXT_MAX} characters`, () => {
    const out = headerText('x'.repeat(400));
    expect(out).toHaveLength(HEADER_TEXT_MAX);
  });

  it('does not split an emoji at the cap', () => {
    const out = headerText('😀'.repeat(200));
    expect(Array.from(out)).toHaveLength(HEADER_TEXT_MAX);
    expect(out.endsWith('😀')).toBe(true);
  });

  it('returns an empty string for missing values', () => {
    expect(headerText(undefined)).toBe('');
    expect(headerText(null)).toBe('');
  });
});

describe('oneLine', () => {
  it('joins lines with single spaces and does not escape', () => {
    expect(oneLine(' <b>Jane</b>\r\n  Doe ')).toBe('<b>Jane</b> Doe');
  });
});
