/**
 * Test helpers for the content briefs: read the reference design as plain text and walk exported
 * content objects, so a test can assert that every copy string appears verbatim in the reference.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Not `new URL(rel, import.meta.url)`: Vite rewrites that pattern into a dev server asset URL.
const HERE = dirname(fileURLToPath(import.meta.url));

/** Absolute path of the read only reference file (project root/reference-design). */
export const REFERENCE_PATH = resolve(HERE, '../../../reference-design/faisalhanif-redesign.html');

/** Named HTML entities we decode. Covers every entity the reference uses plus common typography. */
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  ldquo: '\u201c',
  rdquo: '\u201d',
  lsquo: '\u2018',
  rsquo: '\u2019',
  laquo: '\u00ab',
  raquo: '\u00bb',
  mdash: '\u2014',
  ndash: '\u2013',
  hellip: '\u2026',
  middot: '\u00b7',
  bull: '\u2022',
  rarr: '\u2192',
  larr: '\u2190',
  uarr: '\u2191',
  darr: '\u2193',
  harr: '\u2194',
  deg: '\u00b0',
  times: '\u00d7',
  divide: '\u00f7',
  plusmn: '\u00b1',
  copy: '\u00a9',
  reg: '\u00ae',
  trade: '\u2122',
  eacute: '\u00e9',
  thinsp: '\u2009',
  ensp: '\u2002',
  emsp: '\u2003',
  zwj: '\u200d',
  zwnj: '\u200c',
};

const ENTITY_RE = /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z][a-zA-Z0-9]*));/g;

/**
 * Decodes HTML character references in one pass (so "&amp;lt;" becomes "&lt;", not "<").
 * Unknown named entities are left untouched.
 */
export function decodeHtmlEntities(text: string): string {
  return text.replace(ENTITY_RE, (match, dec?: string, hex?: string, name?: string) => {
    if (dec !== undefined) return safeFromCodePoint(Number.parseInt(dec, 10)) ?? match;
    if (hex !== undefined) return safeFromCodePoint(Number.parseInt(hex, 16)) ?? match;
    if (name !== undefined) return NAMED_ENTITIES[name] ?? match;
    return match;
  });
}

const SINGLE_ESCAPES: Readonly<Record<string, string>> = {
  n: '\n',
  r: '\r',
  t: '\t',
  b: '\b',
  f: '\f',
  v: '\v',
  '0': '\0',
};

const JS_ESCAPE_RE = /\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r\n|[\s\S])/g;

/**
 * Decodes JavaScript string escapes (\n, \', \/, \u2014, \u{1F600}, \x41 and line continuations)
 * in one pass, so copy written inside the reference scripts reads like the runtime string.
 */
export function decodeJsEscapes(text: string): string {
  return text.replace(JS_ESCAPE_RE, (match, seq: string) => {
    if (seq.startsWith('u{'))
      return safeFromCodePoint(Number.parseInt(seq.slice(2, -1), 16)) ?? match;
    if (seq.length === 5 && seq[0] === 'u')
      return String.fromCharCode(Number.parseInt(seq.slice(1), 16));
    if (seq.length === 3 && seq[0] === 'x')
      return String.fromCharCode(Number.parseInt(seq.slice(1), 16));
    if (seq === '\n' || seq === '\r' || seq === '\r\n' || seq === '\u2028' || seq === '\u2029') {
      return ''; // line continuation
    }
    return SINGLE_ESCAPES[seq] ?? seq;
  });
}

function safeFromCodePoint(code: number): string | undefined {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return undefined;
  return String.fromCodePoint(code);
}

/** Collapses every run of whitespace (including newlines and indentation) into one space and trims. */
export function normalizeSpace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export interface ReferenceTextOptions {
  /** Collapse whitespace runs to single spaces, for copy that wraps across lines in the HTML. */
  collapseWhitespace?: boolean;
}

let rawCache: string | undefined;
let decodedCache: string | undefined;
let collapsedCache: string | undefined;

/** The reference file exactly as it is on disk (read once and cached). */
export function referenceSource(): string {
  rawCache ??= readFileSync(REFERENCE_PATH, 'utf8');
  return rawCache;
}

/**
 * The reference file text with JS string escapes and HTML entities decoded (read once and cached).
 * Use `referenceText().includes(value)` to prove a content string is copied verbatim.
 */
export function referenceText(options: ReferenceTextOptions = {}): string {
  decodedCache ??= decodeHtmlEntities(decodeJsEscapes(referenceSource()));
  if (!options.collapseWhitespace) return decodedCache;
  collapsedCache ??= normalizeSpace(decodedCache);
  return collapsedCache;
}

export interface StringLeaf {
  /** Where the string sits, for example "projects[3].tags[0]" or "site.name". */
  path: string;
  value: string;
}

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function childPath(parent: string, key: string): string {
  if (IDENTIFIER_RE.test(key)) return parent ? `${parent}.${key}` : key;
  return `${parent}[${JSON.stringify(key)}]`;
}

/**
 * Walks any exported value (object, array, Map, Set or nested mix) and returns every string leaf
 * with its path, in insertion order. `root` prefixes every path. Cycles are visited once.
 */
export function collectStrings(value: unknown, root = ''): StringLeaf[] {
  const out: StringLeaf[] = [];
  const seen = new WeakSet<object>();

  const walk = (node: unknown, path: string): void => {
    if (typeof node === 'string') {
      out.push({ path, value: node });
      return;
    }
    if (node === null || typeof node !== 'object') return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`));
    } else if (node instanceof Map) {
      for (const [key, item] of node) walk(item, childPath(path, String(key)));
    } else if (node instanceof Set) {
      let i = 0;
      for (const item of node) walk(item, `${path}[${i++}]`);
    } else {
      for (const [key, item] of Object.entries(node)) walk(item, childPath(path, key));
    }
  };

  walk(value, root);
  return out;
}
