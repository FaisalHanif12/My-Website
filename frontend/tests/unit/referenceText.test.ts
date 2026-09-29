import { describe, expect, it } from 'vitest';
import {
  collectStrings,
  decodeHtmlEntities,
  decodeJsEscapes,
  normalizeSpace,
  referenceSource,
  referenceText,
} from './referenceText';

describe('decodeHtmlEntities', () => {
  it('decodes named, decimal and hex references', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
    expect(decodeHtmlEntities('a&#160;b')).toBe('a\u00a0b');
    expect(decodeHtmlEntities('&ldquo;Hi&rdquo; &rsquo;')).toBe('\u201cHi\u201d \u2019');
    expect(decodeHtmlEntities('2022 &rarr; 2026')).toBe('2022 \u2192 2026');
    expect(decodeHtmlEntities('31.5&deg; N')).toBe('31.5\u00b0 N');
    expect(decodeHtmlEntities('&#39;x&#x27;')).toBe("'x'");
    expect(decodeHtmlEntities('&lt;b&gt; &quot;q&quot;')).toBe('<b> "q"');
  });

  it('decodes in a single pass and leaves unknown or malformed entities alone', () => {
    expect(decodeHtmlEntities('&amp;lt;')).toBe('&lt;');
    expect(decodeHtmlEntities('&notanentity; & alone &#xZZ;')).toBe('&notanentity; & alone &#xZZ;');
    expect(decodeHtmlEntities('&#99999999;')).toBe('&#99999999;');
  });
});

describe('decodeJsEscapes', () => {
  it('decodes quote, slash and control escapes', () => {
    expect(decodeJsEscapes("I\\'m here")).toBe("I'm here");
    expect(decodeJsEscapes('a\\/b')).toBe('a/b');
    expect(decodeJsEscapes('line\\nnext\\ttab')).toBe('line\nnext\ttab');
    expect(decodeJsEscapes('back\\\\slash')).toBe('back\\slash');
  });

  it('decodes unicode, code point and hex escapes', () => {
    expect(decodeJsEscapes('build \\u2014 ship')).toBe('build \u2014 ship');
    expect(decodeJsEscapes('dot \\u00b7 dot')).toBe('dot \u00b7 dot');
    expect(decodeJsEscapes('\\u{1F600}')).toBe('\u{1F600}');
    expect(decodeJsEscapes('\\x41')).toBe('A');
  });

  it('drops line continuations', () => {
    expect(decodeJsEscapes('one \\\ntwo')).toBe('one two');
  });
});

describe('normalizeSpace', () => {
  it('collapses whitespace runs and trims', () => {
    expect(normalizeSpace('  a\n     b\t c  ')).toBe('a b c');
  });
});

describe('referenceText', () => {
  it('reads the reference file', () => {
    const raw = referenceSource();
    expect(raw.startsWith('<!doctype html>')).toBe(true);
    expect(raw).toContain('&rsquo;');
  });

  it('returns the text with entities decoded', () => {
    const text = referenceText();
    expect(text).toContain('<title>Faisal Hanif \u00b7 Software Engineer</title>');
    expect(text).toContain('Let\u2019s</span>');
    expect(text).toContain('31.5204\u00b0 N, 74.3587\u00b0 E');
    expect(text).not.toContain('&rsquo;');
    expect(text).not.toContain('&ldquo;');
    expect(text).not.toContain('&#160;');
  });

  it('returns the text with JS string escapes decoded', () => {
    expect(referenceSource()).toContain("\\'");
    expect(referenceText()).not.toContain("\\'");
  });

  it('can collapse whitespace for copy that wraps in the HTML', () => {
    const text = referenceText({ collapseWhitespace: true });
    expect(text).not.toMatch(/\s{2,}/);
    expect(text).toContain('<meta charset="utf-8"> <meta name="viewport"');
  });

  it('caches the decoded text', () => {
    expect(referenceText()).toBe(referenceText());
  });
});

describe('collectStrings', () => {
  it('returns every string leaf with its path', () => {
    const content = {
      name: 'Faisal',
      years: 3,
      live: true,
      tags: ['React', 'Node.js'],
      projects: [{ title: 'GitPulse', links: { live: 'https://example.com' }, stars: null }],
      'odd-key': 'value',
    };
    expect(collectStrings(content)).toEqual([
      { path: 'name', value: 'Faisal' },
      { path: 'tags[0]', value: 'React' },
      { path: 'tags[1]', value: 'Node.js' },
      { path: 'projects[0].title', value: 'GitPulse' },
      { path: 'projects[0].links.live', value: 'https://example.com' },
      { path: '["odd-key"]', value: 'value' },
    ]);
  });

  it('prefixes paths with the root name and handles top level arrays and strings', () => {
    expect(collectStrings(['a', ['b']], 'list')).toEqual([
      { path: 'list[0]', value: 'a' },
      { path: 'list[1][0]', value: 'b' },
    ]);
    expect(collectStrings({ a: 'x' }, 'site')).toEqual([{ path: 'site.a', value: 'x' }]);
    expect(collectStrings('solo', 'root')).toEqual([{ path: 'root', value: 'solo' }]);
    expect(collectStrings(42)).toEqual([]);
  });

  it('walks Maps and Sets and survives cycles', () => {
    const node: { label: string; self?: unknown } = { label: 'loop' };
    node.self = node;
    const value = { m: new Map([['k', 'mv']]), s: new Set(['sv']), node };
    expect(collectStrings(value)).toEqual([
      { path: 'm.k', value: 'mv' },
      { path: 's[0]', value: 'sv' },
      { path: 'node.label', value: 'loop' },
    ]);
  });
});
