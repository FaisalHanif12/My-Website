// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_APP_URL,
  DEFAULT_MAX_PERCENT,
  DEFAULT_REF_URL,
  DEFAULT_WAIT_MS,
  parseArgs,
} from './args';
import { ROUTES, THEMES, WIDTHS } from './matrix';

describe('parseArgs', () => {
  it('uses the documented defaults', () => {
    const a = parseArgs([]);
    expect(a.routes).toEqual(['/']);
    expect(a.widths).toEqual([1440]);
    expect(a.themes).toEqual(['light']);
    expect(a.actions).toEqual([]);
    expect(a.selector).toBeUndefined();
    expect(a.tag).toBeUndefined();
    expect(a.waitMs).toBe(DEFAULT_WAIT_MS);
    expect(a.waitMs).toBe(300);
    expect(a.maxPercent).toBe(DEFAULT_MAX_PERCENT);
    expect(a.maxPercent).toBe(0.5);
    expect(a.motion).toBe(false);
    expect(a.help).toBe(false);
    expect(a.refUrl).toBe(DEFAULT_REF_URL);
    expect(a.appUrl).toBe(new URL(DEFAULT_APP_URL).toString());
  });

  it('parses one route, width and theme', () => {
    const a = parseArgs(['--route', '/works', '--width', '1024', '--theme', 'dark']);
    expect(a.routes).toEqual(['/works']);
    expect(a.widths).toEqual([1024]);
    expect(a.themes).toEqual(['dark']);
  });

  it('expands all and both', () => {
    const a = parseArgs(['--route', 'all', '--width', 'all', '--theme', 'both']);
    expect(a.routes).toEqual([...ROUTES]);
    expect(a.widths).toEqual([...WIDTHS]);
    expect(a.themes).toEqual([...THEMES]);
    expect(a.routes.length * a.widths.length * a.themes.length).toBe(70);
  });

  it('keeps --hover and --click in command line order', () => {
    const a = parseArgs([
      '--click',
      '[data-book]',
      '--hover',
      '.btn',
      '--click',
      '#next',
      '--hover=.card:nth-child(2)',
    ]);
    expect(a.actions).toEqual([
      { type: 'click', selector: '[data-book]' },
      { type: 'hover', selector: '.btn' },
      { type: 'click', selector: '#next' },
      { type: 'hover', selector: '.card:nth-child(2)' },
    ]);
  });

  it('parses the remaining value flags and booleans', () => {
    const a = parseArgs([
      '--',
      '--selector',
      '#ct-hero',
      '--wait',
      '1200',
      '--max=0',
      '--motion',
      '--tag',
      'open modal',
      '--ref-url',
      'http://localhost:4400/faisalhanif-redesign.html',
      '--app-url=http://127.0.0.1:3100',
    ]);
    expect(a.selector).toBe('#ct-hero');
    expect(a.waitMs).toBe(1200);
    expect(a.maxPercent).toBe(0);
    expect(a.motion).toBe(true);
    expect(a.tag).toBe('open modal');
    expect(a.refUrl).toBe('http://localhost:4400/faisalhanif-redesign.html');
    expect(a.appUrl).toBe('http://127.0.0.1:3100/');
  });

  it('takes REF_URL and APP_URL from the env, flags win', () => {
    const env = { REF_URL: 'http://ref.test/page.html', APP_URL: 'http://app.test' };
    expect(parseArgs([], env).refUrl).toBe('http://ref.test/page.html');
    expect(parseArgs([], env).appUrl).toBe('http://app.test/');
    expect(parseArgs(['--app-url', 'http://other.test'], env).appUrl).toBe('http://other.test/');
  });

  it('sets help', () => {
    expect(parseArgs(['--help']).help).toBe(true);
  });

  it.each([
    [['--route', '/blog'], /--route must be one of/],
    [['--width', '1000'], /--width must be one of/],
    [['--theme', 'sepia'], /--theme must be light, dark or both/],
    [['--wait', '-5'], /--wait expects a number/],
    [['--max', 'lots'], /--max expects a number/],
    [['--app-url', 'localhost:3000/'], /--app-url expects an absolute URL/],
    [['--width'], /--width needs a value/],
    [['--click', '--motion'], /--click needs a value/],
    [['--hover', ' '], /--hover needs a CSS selector/],
    [['--motion=yes'], /--motion takes no value/],
    [['--zoom', '2'], /Unknown option --zoom/],
    [['works'], /Unexpected argument "works"/],
  ])('rejects %j', (argv, message) => {
    expect(() => parseArgs(argv)).toThrow(message);
  });
});
