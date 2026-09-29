import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { contactFacts } from '@/content/site';
import { mailtoHref, openMail } from '@/lib/mailto';
import { EMAIL_RE, esc, pad, parseYmd, ymd } from '@/lib/strings';

describe('esc (L5189)', () => {
  it('escapes the five HTML characters', () => {
    expect(esc('<a href="x">Tom & Jerry\'s</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;',
    );
  });

  it('turns null and undefined into an empty string and stringifies the rest', () => {
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
    expect(esc(0)).toBe('0');
    expect(esc(false)).toBe('false');
    expect(esc('plain text')).toBe('plain text');
  });
});

describe('pad (L5190)', () => {
  it('adds one leading zero below 10 only', () => {
    expect(pad(0)).toBe('00');
    expect(pad(7)).toBe('07');
    expect(pad(9)).toBe('09');
    expect(pad(10)).toBe('10');
    expect(pad(59)).toBe('59');
  });
});

describe('ymd and parseYmd (L5191-5192)', () => {
  it('formats the local calendar day', () => {
    expect(ymd(new Date(2026, 2, 5, 23, 59))).toBe('2026-03-05');
    expect(ymd(new Date(2026, 11, 31))).toBe('2026-12-31');
    expect(ymd(new Date(2027, 0, 1, 0, 0))).toBe('2027-01-01');
  });

  it('parses to local midnight of that day and round trips', () => {
    const d = parseYmd('2026-03-10');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(10);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(ymd(parseYmd('2026-12-31'))).toBe('2026-12-31');
  });
});

describe('EMAIL_RE (L5185)', () => {
  it('is the reference pattern', () => {
    expect(EMAIL_RE.source).toBe('^[^\\s@]+@[^\\s@.]+(\\.[^\\s@.]+)*\\.[A-Za-z]{2,}$');
    expect(EMAIL_RE.flags).toBe('');
  });

  it.each(['name@company.com', 'a.b+c@sub.domain.co.uk', 'x@y.io', 'mehrfaisal111@gmail.com'])(
    'accepts %s',
    (v) => {
      expect(EMAIL_RE.test(v)).toBe(true);
    },
  );

  it.each([
    'name@company',
    'name@company.c',
    'name@company.c0m',
    'na me@company.com',
    '@company.com',
    'name@.com',
    'name@company..com',
    'name@@company.com',
    '',
  ])('rejects %j', (v) => {
    expect(EMAIL_RE.test(v)).toBe(false);
  });
});

describe('openMail (L5193-5198)', () => {
  let clicked: HTMLAnchorElement[];

  beforeEach(() => {
    vi.useFakeTimers();
    clicked = [];
    // jsdom does not navigate to mailto links; record the click instead.
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push(this);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const subject = 'New project enquiry: App Development from Ali';
  const body = 'Hi Faisal,\n\nLine & more? 50% off #1\n';
  const expected =
    'mailto:mehrfaisal111@gmail.com' +
    '?subject=New%20project%20enquiry%3A%20App%20Development%20from%20Ali' +
    '&body=Hi%20Faisal%2C%0A%0ALine%20%26%20more%3F%2050%25%20off%20%231%0A';

  it('builds the href for the site email with encodeURIComponent', () => {
    expect(contactFacts.email).toBe('mehrfaisal111@gmail.com');
    expect(mailtoHref(subject, body)).toBe(expected);
  });

  it('clicks a hidden anchor in the body, returns the href and removes the anchor next task', () => {
    const before = document.body.querySelectorAll('a').length;
    const href = openMail(subject, body);
    expect(href).toBe(expected);
    expect(clicked).toHaveLength(1);
    const a = clicked[0];
    expect(a.getAttribute('href')).toBe(expected);
    expect(a.rel).toBe('noopener');
    expect(a.style.display).toBe('none');
    expect(a.parentNode).toBe(document.body);
    expect(document.body.querySelectorAll('a').length).toBe(before + 1);
    vi.advanceTimersByTime(0);
    expect(a.isConnected).toBe(false);
    expect(document.body.querySelectorAll('a').length).toBe(before);
  });
});
