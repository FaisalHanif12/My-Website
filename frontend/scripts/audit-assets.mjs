#!/usr/bin/env node
/**
 * Asset audit: every file the site loads must exist under frontend/public/.
 *
 * Usage (from frontend/): node scripts/audit-assets.mjs
 *
 * Sources scanned:
 *   1. The reference design (read only): FH.asset('...') calls, the works data (img:'imgs/...'),
 *      data-src video paths (resolved with FH.asset at L7605), every quoted imgs/ or vedioes/ path,
 *      absolute https://faisalhanif.work/... URLs, and the 5 base64 images, which the rebuild serves
 *      as files from public/images/ (scripts/extract-images.mjs).
 *   2. public/sass-app.html (carried over from the old site): src, href, poster and data-src
 *      attributes and inline url(). <a href> targets are page links, not loads: they pass when the
 *      file exists or next.config.ts redirects them.
 *   3. public/css/*.css: url() and @import, resolved against the stylesheet URL. A url() whose file is
 *      absent is "dormant" (not missing) when no class or id of its rule appears in any page that
 *      loads that stylesheet, because the browser never requests it.
 *   4. The app itself (src/**\/*.ts, *.tsx, without *.test / *.spec files, whose literals are
 *      fixtures): string literals that start with /imgs/, /vedioes/, /images/ or /css/, and
 *      asset('imgs/...') calls (the fe-08 helper). Comments are blanked first, so JSDoc examples
 *      are not read as loads.
 * Paths are URL decoded (%20 becomes a space) before the file check.
 *
 * Output: one line per asset, then a summary. Exit code 1 when something is missing. When something
 * is missing it writes frontend/MISSING_ASSETS.md (what, where it is referenced, git status); when
 * nothing is missing it removes a stale MISSING_ASSETS.md. No dependencies. Never prints base64.
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IMAGES } from './extract-images.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND = resolve(HERE, '..');
const PUBLIC = resolve(FRONTEND, 'public');
const REFERENCE = resolve(FRONTEND, '../reference-design/faisalhanif-redesign.html');
const NEXT_CONFIG = resolve(FRONTEND, 'next.config.ts');
const REPORT = resolve(FRONTEND, 'MISSING_ASSETS.md');
const SITE = 'https://faisalhanif.work/';
/** Any origin works for resolving relative URLs; only the path is used. */
const LOCAL = 'https://site.local/';

/** path (no leading slash, decoded) -> [{ where, how, kind, selectorTokens?, pages? }] */
const assets = new Map();

/**
 * Records one reference to a local file.
 * kind: 'load' (the browser fetches it), 'link' (a page a visitor navigates to),
 * 'css-url' (fetched only when its rule matches an element; extra holds selectorTokens and pages).
 */
function add(path, where, how, kind = 'load', extra = {}) {
  const clean = decodePath(path);
  if (!clean) return;
  const refs = assets.get(clean) ?? [];
  refs.push({ where, how, kind, ...extra });
  assets.set(clean, refs);
}

/** "/imgs/UHA-Company%20website.png?x#y" -> "imgs/UHA-Company website.png" */
function decodePath(path) {
  const bare = path.split(/[?#]/)[0].replace(/^\/+/, '');
  try {
    return decodeURIComponent(bare);
  } catch {
    return bare;
  }
}

function isExternal(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value) && !value.startsWith(SITE);
}

/** Resolves a URL written in a file served at `servedAt` (a site path like "css/style.css"). */
function resolveFrom(servedAt, value) {
  const url = new URL(
    value.startsWith(SITE) ? value.slice(SITE.length - 1) : value,
    LOCAL + servedAt,
  );
  return url.pathname;
}

/** Returns index -> 1 based line number for one text (binary search over the line starts). */
function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (index) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

function fileState(path) {
  const abs = join(PUBLIC, ...path.split('/'));
  if (!abs.startsWith(PUBLIC + sep)) return { exists: false, size: 0 };
  if (!existsSync(abs)) return { exists: false, size: 0 };
  const stat = statSync(abs);
  return { exists: stat.isFile(), size: stat.size };
}

/* ---------------------------------------------------------------- 1. reference */
function scanReference() {
  if (!existsSync(REFERENCE)) throw new Error(`reference not found: ${REFERENCE}`);
  const text = readFileSync(REFERENCE, 'utf8');
  const lineOf = lineIndex(text);
  const at = (i) => `reference L${lineOf(i)}`;

  for (const m of text.matchAll(/FH\.asset\((['"])([^'"]+)\1\)/g)) {
    add(m[2], at(m.index), "FH.asset('...')");
  }
  for (const m of text.matchAll(/\bimg:'([^']+)'/g)) {
    add(m[1], at(m.index), 'works data img (FH.asset in img(), L6944)');
  }
  for (const m of text.matchAll(/\bdata-src="([^"]+)"/g)) {
    add(m[1], at(m.index), 'video data-src (FH.asset at L7605)');
  }
  // Safety net: any other quoted imgs/ or vedioes/ path.
  for (const m of text.matchAll(/["'](?:\.\/)?((?:imgs|vedioes)\/[^"'?#<>]+)["']/g)) {
    const path = decodePath(m[1]);
    if (!assets.get(path)?.some((r) => r.where === at(m.index))) {
      add(m[1], at(m.index), 'quoted path');
    }
  }
  for (const m of text.matchAll(/https:\/\/faisalhanif\.work\/([^"'\s)<>]*)/g)) {
    // The bare origin is the site itself (canonical and og:url), not a file.
    if (m[1]) add(m[1], at(m.index), 'absolute https://faisalhanif.work/ URL');
  }

  const base64 = [...text.matchAll(/src="data:image\/webp;base64,/g)].length;
  if (base64 !== IMAGES.length) {
    throw new Error(
      `expected ${IMAGES.length} base64 WebP images in the reference, found ${base64}`,
    );
  }
  for (const img of IMAGES) {
    add(
      `images/${img.file}`,
      `reference L${img.line}`,
      'base64 image, extracted by extract-images.mjs',
    );
  }
}

/* ---------------------------------------------------------------- 2. public HTML pages */
/** stylesheet site path -> the page texts that load it (for the dormant url() check). */
const sheetPages = new Map();

function scanPublicPages() {
  const pages = readdirSync(PUBLIC).filter((f) => f.endsWith('.html'));
  for (const page of pages) {
    const text = readFileSync(join(PUBLIC, page), 'utf8');
    const lineOf = lineIndex(text);
    const at = (i) => `public/${page} L${lineOf(i)}`;

    for (const tag of text.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g)) {
      const name = tag[1].toLowerCase();
      const attrs = tag[2];
      for (const a of attrs.matchAll(/\b(src|href|poster|data-src)\s*=\s*(["'])([^"']*)\2/g)) {
        const value = a[3].trim();
        if (!value || isExternal(value) || value.startsWith('data:')) continue;
        const path = resolveFrom(page, value);
        const isLink = name === 'a' && a[1] === 'href';
        add(path, at(tag.index), `<${name} ${a[1]}>`, isLink ? 'link' : 'load');
        if (name === 'link' && /\brel\s*=\s*["']?stylesheet/i.test(attrs)) {
          const key = decodePath(path);
          sheetPages.set(key, [...(sheetPages.get(key) ?? []), text]);
        }
      }
    }
    for (const m of text.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)) {
      const value = m[2].trim();
      if (isExternal(value) || value.startsWith('data:')) continue;
      add(resolveFrom(page, value), at(m.index), 'inline url()', 'css-url', {
        selectorTokens: [],
        pages: [text],
      });
    }
  }
}

/* ---------------------------------------------------------------- 3. public CSS */
/** Class and id names in the selector of the rule that holds `index` (comments blanked first). */
function selectorTokens(css, index) {
  const open = css.lastIndexOf('{', index);
  if (open < 0) return [];
  const start =
    Math.max(
      css.lastIndexOf('}', open),
      css.lastIndexOf('{', open - 1),
      css.lastIndexOf(';', open),
    ) + 1;
  const selector = css.slice(start, open);
  return [...selector.matchAll(/[.#](-?[A-Za-z_][\w-]*)/g)].map((m) => m[1]);
}

function scanPublicCss() {
  const dir = join(PUBLIC, 'css');
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    const servedAt = `css/${file}`;
    const raw = readFileSync(join(dir, file), 'utf8');
    // Blank out comments but keep every index, so line numbers and selectors stay right.
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    const lineOf = lineIndex(css);
    const at = (i) => `public/${servedAt} L${lineOf(i)}`;
    const pages = sheetPages.get(servedAt) ?? [];

    for (const m of css.matchAll(/@import\s+(?:url\(\s*)?(["'])([^"']+)\1/g)) {
      if (!isExternal(m[2])) add(resolveFrom(servedAt, m[2]), at(m.index), '@import');
    }
    for (const m of css.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)) {
      const value = m[2].trim();
      if (isExternal(value) || value.startsWith('data:')) continue;
      add(resolveFrom(servedAt, value), at(m.index), `url() in ${servedAt}`, 'css-url', {
        selectorTokens: selectorTokens(css, m.index),
        pages,
      });
    }
  }
}

/* ---------------------------------------------------------------- 4. the app */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(abs);
  }
  return out;
}

/** Test and spec files: their string literals are fixtures, not loads. */
const TEST_FILE = /\.(test|spec)\.tsx?$/;

/**
 * One pass over the source: string literals first ('...', "...", `...`, with escapes), comments
 * second (/* ... *\/ and // to the end of the line). Only the comment matches are blanked, with the
 * same number of characters and every newline kept, so indices and line numbers stay right. Because
 * strings win the alternation, the // inside 'https://...' is never read as a comment.
 * Limits (fine for an audit): a regex literal that holds a quote can pair with another quote on the
 * same line, and a template literal with a nested template inside ${...} is read as two strings.
 */
const STRING_OR_COMMENT =
  /'(?:[^'\\\n]|\\[\s\S])*'|"(?:[^"\\\n]|\\[\s\S])*"|`(?:[^`\\]|\\[\s\S])*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

function stripComments(text) {
  return text.replace(STRING_OR_COMMENT, (m) => (m.startsWith('/') ? m.replace(/[^\n]/g, ' ') : m));
}

function scanApp() {
  const src = resolve(FRONTEND, 'src');
  if (!existsSync(src)) return;
  for (const file of walk(src)) {
    if (TEST_FILE.test(file)) continue;
    const code = stripComments(readFileSync(file, 'utf8'));
    const lineOf = lineIndex(code);
    const rel = relative(FRONTEND, file).split(sep).join('/');
    for (const m of code.matchAll(/(["'`])(\/(?:imgs|vedioes|images|css)\/[^"'`$]+)\1/g)) {
      add(m[2], `${rel} L${lineOf(m.index)}`, 'app string literal');
    }
    // The fe-08 helper takes the reference form without the leading slash: asset('imgs/...').
    for (const m of code.matchAll(/\basset\((['"`])((?:imgs|vedioes|images|css)\/[^'"`$]+)\1\)/g)) {
      add(m[2], `${rel} L${lineOf(m.index)}`, "app asset('...') call");
    }
  }
}

/* ---------------------------------------------------------------- classify and report */
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when the rule that holds this url() can match an element of a page that loads the sheet. */
function cssRefCanLoad(ref) {
  if (!ref.pages || ref.pages.length === 0) return false; // stylesheet not loaded by any page
  if (!ref.selectorTokens || ref.selectorTokens.length === 0) return true; // element selectors: assume used
  return ref.selectorTokens.some((token) => {
    const re = new RegExp(`(^|[^\\w-])${escapeRe(token)}([^\\w-]|$)`);
    return ref.pages.some((page) => re.test(page));
  });
}

function redirects() {
  if (!existsSync(NEXT_CONFIG)) return new Set();
  const text = readFileSync(NEXT_CONFIG, 'utf8');
  return new Set([...text.matchAll(/source:\s*(['"])\/([^'"]*)\1/g)].map((m) => decodePath(m[2])));
}

function classify() {
  const redirected = redirects();
  const rows = [];
  for (const [path, refs] of [...assets].sort(([a], [b]) => a.localeCompare(b))) {
    const { exists, size } = fileState(path);
    const loads = refs.filter((r) => r.kind === 'load');
    const links = refs.filter((r) => r.kind === 'link');
    const cssUrls = refs.filter((r) => r.kind === 'css-url');
    let status = 'OK';
    let note = '';
    if (!exists) {
      if (loads.length > 0 || cssUrls.some(cssRefCanLoad)) {
        status = 'MISSING';
      } else if (links.length > 0 && cssUrls.length === 0) {
        status = redirected.has(path) ? 'REDIRECT' : 'MISSING';
        if (status === 'REDIRECT') note = 'page link, redirected in next.config.ts';
      } else {
        status = 'DORMANT';
        note = 'never requested: no page that loads the stylesheet uses the rule';
      }
    }
    rows.push({ path, status, size, refs, note });
  }
  return rows;
}

function print(rows) {
  const width = Math.min(48, Math.max(...rows.map((r) => r.path.length)) + 2);
  for (const r of rows) {
    const first = r.refs[0];
    const more = r.refs.length > 1 ? ` (+${r.refs.length - 1} more)` : '';
    const size = r.status === 'OK' ? `${String(r.size).padStart(8)} B` : ''.padStart(10);
    console.log(
      `${r.status.padEnd(8)} ${`/${r.path}`.padEnd(width)} ${size}  ${first.where}: ${first.how}${more}${r.note ? `  [${r.note}]` : ''}`,
    );
  }
}

/** Unique "where" values, ordered by file then line ("reference L3040, reference L4807, ..."). */
function places(refs) {
  const key = (w) => {
    const m = /^(.*) L(\d+)$/.exec(w);
    return m ? [m[1], Number(m[2])] : [w, 0];
  };
  return [...new Set(refs.map((r) => r.where))]
    .sort((a, b) => {
      const [fa, la] = key(a);
      const [fb, lb] = key(b);
      return fa === fb ? la - lb : fa.localeCompare(fb);
    })
    .join(', ');
}

function writeReport(rows) {
  const missing = rows.filter((r) => r.status === 'MISSING');
  const dormant = rows.filter((r) => r.status === 'DORMANT');
  const lines = [
    '# Missing assets',
    '',
    'Written by `node scripts/audit-assets.mjs` (brief fe-06). Each file below is loaded by the reference design, `public/sass-app.html`, `public/css/*.css` or the app, but is not in `frontend/public/`.',
    '',
    'Old site on git main: not checked in git. The worker cannot run git; the orchestrator should check each path with `git show main:<path>` (the old site kept `imgs/` and `vedioes/` at the repo root).',
    '',
    '| File | Referenced at | How | Old site on git main |',
    '|---|---|---|---|',
    ...missing.map(
      (r) =>
        `| \`public/${r.path}\` | ${places(r.refs)} | ${[...new Set(r.refs.map((x) => x.how))].join('; ')} | not checked in git |`,
    ),
  ];
  if (dormant.length > 0) {
    lines.push(
      '',
      '## Not missing (never requested)',
      '',
      ...dormant.map((r) => `- \`/${r.path}\`: ${places(r.refs)} (${r.note}).`),
    );
  }
  writeFileSync(REPORT, `${lines.join('\n')}\n`);
}

function main() {
  scanReference();
  scanPublicPages();
  scanPublicCss();
  scanApp();
  const rows = classify();
  print(rows);

  const count = (s) => rows.filter((r) => r.status === s).length;
  const missing = count('MISSING');
  const fromReference = rows.filter((r) =>
    r.refs.some((x) => x.where.startsWith('reference')),
  ).length;
  console.log(
    `\n${rows.length} assets (${fromReference} used by the reference): ${count('OK')} present, ${count('REDIRECT')} page links redirected, ${count('DORMANT')} dormant, ${missing} missing.`,
  );

  const rel = relative(FRONTEND, REPORT);
  if (missing > 0) {
    writeReport(rows);
    console.error(`Wrote ${rel}.`);
    process.exitCode = 1;
  } else if (existsSync(REPORT)) {
    rmSync(REPORT);
    console.log(`Nothing missing: removed the stale ${rel}.`);
  } else {
    console.log(`Nothing missing: ${rel} not written.`);
  }
}

/**
 * True when node runs this file directly (not when a test imports it). Both sides go through
 * realpathSync, so a symlinked path to the script (or to a parent folder) still counts.
 */
function isMain() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  try {
    main();
  } catch (error) {
    console.error(`audit-assets: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
