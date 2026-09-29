// @vitest-environment node
/**
 * Works and Approvals content (projects.ts, certificates.ts) against the reference design.
 *
 * 1. Every copy string (length >= 3) appears verbatim in the reference text, apart from a short
 *    allowlist of derived values (asset paths and one enum), which get their own checks.
 * 2. The reference data arrays (PROJECTS, CERTS, P_FILTERS, C_FILTERS, HUES, RINGS, CAT_ICON,
 *    CAT_LBL, works.js L6862-6936 and L7420) are evaluated straight from the reference source with
 *    node:vm and compared field by field, so order, counts, URLs and every character are proven.
 * 3. The two heroes, the grid and rail copy and the PureBody modal are parsed back out of the
 *    reference markup and templates.
 * 4. Counts from REFERENCE_MAP.md 11.5.11, the four em dashes, pure data modules, and every asset
 *    path exists under public/ (hero screenshots with their intrinsic size).
 *
 * The reference holds 5 base64 images (L3112, L3833, L3843, L3853, L3862). Every text taken from it
 * has the payload masked first, so no assertion message can print base64.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { IMAGES, webpSize } from '../../scripts/extract-images.mjs';
import { collectStrings, referenceSource, referenceText } from '../../tests/unit/referenceText';
import {
  APPROVALS_HERO,
  CERTIFICATE_CATEGORY_LABEL,
  CERTIFICATE_FILTERS,
  CERTIFICATE_RAIL_COPY,
  CERTIFICATES,
  type Certificate,
} from './certificates';
import {
  CATEGORY_ICON,
  LATEST_TITLE_PARTS,
  PROJECT_FILTERS,
  PROJECT_GRID_COPY,
  PROJECTS,
  PUREBODY_SHOWCASE,
  WORKS_HERO,
  type Project,
} from './projects';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(HERE, '../../public');
const SOURCE_FILES = ['projects.ts', 'certificates.ts'] as const;

const EXPORTS = {
  PROJECT_FILTERS,
  CATEGORY_ICON,
  PROJECTS,
  LATEST_TITLE_PARTS,
  PROJECT_GRID_COPY,
  WORKS_HERO,
  PUREBODY_SHOWCASE,
  CERTIFICATE_FILTERS,
  CERTIFICATE_CATEGORY_LABEL,
  CERTIFICATES,
  CERTIFICATE_RAIL_COPY,
  APPROVALS_HERO,
};

/**
 * Derived values, not copy: asset paths (the reference writes 'imgs/...' and 'vedioes/...' without
 * the leading slash, and the hero screenshots are base64) and the device kind enum.
 */
const ALLOWLIST: readonly RegExp[] = [
  /^PROJECTS\[\d+\]\.image$/,
  /^CERTIFICATES\[\d+\]\.image$/,
  /^WORKS_HERO\.cards\[\d+\]\.image\.src$/,
  /^WORKS_HERO\.phone\.screens\[\d+\]\.src$/,
  /^PUREBODY_SHOWCASE\.demos\[\d+\]\.video$/,
];

const mask = (text: string): string => text.replace(/base64,[A-Za-z0-9+/=]+/g, 'base64,<...>');

/** Decoded reference text (entities and JS escapes), base64 masked. */
const TEXT = mask(referenceText());
const TEXT_COLLAPSED = mask(referenceText({ collapseWhitespace: true }));
/** The reference file as written on disk (JS templates keep their quotes), base64 masked. */
const SOURCE = mask(referenceSource());

function between(source: string, start: string, end: string): string {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + 1);
  if (a < 0 || b < 0) throw new Error(`reference markers not found: ${start} .. ${end}`);
  return source.slice(a, b);
}

const WORKS_HERO_HTML = between(
  TEXT,
  '<header class="page-hero wk-hero wk-hero--works"',
  '</header>',
);
const WORKS_BODY_HTML = between(
  TEXT,
  '<div class="wrap wk-main">',
  '<!-- ===================== 04 APPROVALS',
);
const AP_HERO_HTML = between(TEXT, '<header class="page-hero wk-hero wk-hero--ap"', '</header>');
const AP_BODY_HTML = between(TEXT, '<div class="wk-toolbar" id="wk-ap-toolbar"', '</section>');
const PB_HTML = between(
  TEXT,
  '<div class="fh-modal wk-pb" id="purebody"',
  '<div class="toast" id="toast"',
);

function all(re: RegExp, source: string): RegExpExecArray[] {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return [...source.matchAll(new RegExp(re.source, flags))];
}

function one(re: RegExp, source: string): RegExpExecArray {
  const found = all(re, source);
  expect(found, `exactly one match for ${re}`).toHaveLength(1);
  return found[0]!;
}

/**
 * The works.js script of the reference (L6852 on). The chat script before it has its own
 * `var PROJECTS` (L6186, chat knowledge), so the data lookups start here.
 */
const WORKS_JS = SOURCE.slice(SOURCE.indexOf('<script>/* ---- works.js ---- */'));

/** Evaluates `var NAME = <literal>;` from works.js and returns a plain JSON copy. */
function referenceVar<T>(name: string, open: '[' | '{'): T {
  const close = open === '[' ? ']' : '}';
  const re = new RegExp(`var ${name}\\s*=\\s*(\\${open}[\\s\\S]*?\\${close});`);
  const match = re.exec(WORKS_JS);
  if (!match) throw new Error(`reference variable ${name} not found`);
  const value: unknown = runInNewContext(`(${match[1]})`, {});
  return JSON.parse(JSON.stringify(value)) as T;
}

const leaves = () =>
  Object.entries(EXPORTS).flatMap(([name, value]) => collectStrings(value, name));

describe('copy strings', () => {
  it('finds the Works and Approvals parts of the reference', () => {
    expect(WORKS_HERO_HTML).toContain('id="wk-hero"');
    expect(WORKS_BODY_HTML).toContain('id="wk-toolbar"');
    expect(AP_HERO_HTML).toContain('id="wk-ap-hero"');
    expect(AP_BODY_HTML).toContain('id="wk-rail"');
    expect(PB_HTML).toContain('id="wk-pb-title"');
  });

  it('every copy string (length >= 3) appears verbatim in the reference', () => {
    const missing = leaves()
      .filter(({ path, value }) => value.length >= 3 && !ALLOWLIST.some((re) => re.test(path)))
      .filter(({ value }) => !TEXT.includes(value) && !TEXT_COLLAPSED.includes(value));
    expect(missing).toEqual([]);
  });

  it('keeps the allowlist to asset paths and the device kind enum', () => {
    const allowed = leaves().filter(({ path }) => ALLOWLIST.some((re) => re.test(path)));
    expect(allowed).toHaveLength(14 + 7 + 4 + 4 + 3);
    for (const { path, value } of allowed) {
      if (path.endsWith('.kind')) {
        expect(['browser', 'phone'], path).toContain(value);
      } else if (value.startsWith('/images/')) {
        // Base64 in the reference; the file names come from the section 8 table.
        expect(
          IMAGES.map((img) => `/images/${img.file}`),
          path,
        ).toContain(value);
      } else {
        // The reference writes the same path without the leading slash ('imgs/...', "vedioes/...").
        expect(value, path).toMatch(/^\/(imgs|vedioes)\//);
        const written = referencePath(value);
        expect(SOURCE.includes(`'${written}'`) || SOURCE.includes(`"${written}"`), path).toBe(true);
      }
    }
  });

  it('has exactly the four project em dashes, written as \\u2014 escapes', () => {
    const withDash = leaves()
      .filter(({ value }) => value.includes('—'))
      .map(({ path }) => path);
    expect(withDash).toEqual([
      'PROJECTS[0].description',
      'PROJECTS[1].description',
      'PROJECTS[2].description',
      'PROJECTS[3].description',
    ]);
    for (const file of SOURCE_FILES) {
      const source = readFileSync(resolve(HERE, file), 'utf8');
      expect(source.includes('—'), `${file} has a raw em dash`).toBe(false);
      const escapes = source.split('\\u2014').length - 1;
      expect(escapes, `${file} \\u2014 escapes`).toBe(file === 'projects.ts' ? 4 : 0);
    }
  });
});

interface RefProject {
  t: string;
  ini: string;
  cat: string;
  k: string;
  b: string;
  img: string;
  live: string;
  modal?: string;
  src: string | null;
  tags: string[];
  d: string;
}

interface RefCert {
  iss: string;
  mono: string;
  type: string;
  y: string;
  k: string;
  img: string;
  url: string;
  t: string;
  tags: string[];
  d: string;
}

/**
 * Three screenshots the reference serves as large PNGs (1.8 MB, 0.7 MB and 0.45 MB) are served here
 * as WebP files of the same picture (each under 120 KB), which the Lighthouse run needs. Maps our
 * path to the reference path so the parity checks still compare the same file names.
 */
const REFERENCE_PATH_OF: Readonly<Record<string, string>> = {
  '/imgs/uha-company-website.webp': '/imgs/UHA-Company website.png',
  '/imgs/medicare.webp': '/imgs/medicare.png',
  '/imgs/react-native.webp': '/imgs/ReactNative.png',
};

/** The path the reference writes for one of our asset paths (no leading slash). */
function referencePath(path: string): string {
  return (REFERENCE_PATH_OF[path] ?? path).replace(/^\//, '');
}

/** Our Project written back in the reference's field names (paths without the leading slash). */
function toRefProject(p: Project): RefProject {
  return {
    t: p.title,
    ini: p.initials,
    cat: p.category,
    k: p.filterKey,
    b: p.badge,
    img: referencePath(p.image),
    live: p.live,
    ...(p.modal ? { modal: p.modal } : {}),
    src: p.source,
    tags: [...p.tags],
    d: p.description,
  };
}

function toRefCert(c: Certificate): RefCert {
  return {
    iss: c.issuer,
    mono: c.mono,
    type: c.type,
    y: c.year,
    k: c.filterKey,
    img: referencePath(c.image),
    url: c.verifyUrl,
    t: c.title,
    tags: [...c.tags],
    d: c.description,
  };
}

function countBy<T>(items: readonly T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = { all: items.length };
  for (const item of items) out[key(item)] = (out[key(item)] ?? 0) + 1;
  return out;
}

describe('projects.ts: data parity with the reference works.js (L6862-6911)', () => {
  it('has the 14 projects of PROJECTS, in reference order, every field identical', () => {
    const ref = referenceVar<RefProject[]>('PROJECTS', '[');
    expect(ref).toHaveLength(14);
    expect(PROJECTS).toHaveLength(14);
    expect(PROJECTS.map(toRefProject)).toEqual(ref);
  });

  it('matches P_FILTERS, including the "Sass App" label', () => {
    const ref = referenceVar<[string, string][]>('P_FILTERS', '[');
    expect(PROJECT_FILTERS.map((f) => [f.key, f.label])).toEqual(ref);
    expect(PROJECT_FILTERS.find((f) => f.key === 'sassapp')?.label).toBe('Sass App');
  });

  it('matches CAT_ICON and every icon exists in the sprite', () => {
    expect({ ...CATEGORY_ICON }).toEqual(referenceVar<Record<string, string>>('CAT_ICON', '{'));
    for (const id of Object.values(CATEGORY_ICON)) {
      expect(TEXT.includes(`<symbol id="i-${id}"`), `sprite symbol i-${id}`).toBe(true);
    }
    for (const p of PROJECTS) expect(CATEGORY_ICON[p.category], p.title).toBeDefined();
  });

  it('folds HUES, the cover angle formula and RINGS into cover', () => {
    const hues = referenceVar<number[]>('HUES', '[');
    const rings = referenceVar<number[][]>('RINGS', '[');
    expect(SOURCE).toContain("--a:'+(118+(i*23)%70)+'deg");
    PROJECTS.forEach((p, i) => {
      expect(p.cover, p.title).toEqual({
        hue: hues[i],
        angle: 118 + ((i * 23) % 70),
        ring: rings[i],
      });
    });
    expect(PROJECTS.map((p) => p.cover.angle)).toEqual([
      118, 141, 164, 187, 140, 163, 186, 139, 162, 185, 138, 161, 184, 137,
    ]);
  });

  it('has the per filter counts of REFERENCE_MAP.md 11.5.11', () => {
    expect(countBy(PROJECTS, (p) => p.filterKey)).toEqual({
      all: 14,
      reactjs: 3,
      nextjs: 3,
      fullstack: 3,
      reactnative: 3,
      sassapp: 1,
      website: 1,
    });
    // 'website' (Fit For Living) has no filter button.
    expect(PROJECT_FILTERS.map((f) => f.key)).not.toContain('website');
    expect(countBy(PROJECTS, (p) => p.badge)).toEqual({
      all: 14,
      latest: 1,
      featured: 1,
      live: 12,
    });
  });

  it('keeps the reference quirks', () => {
    const byTitle = (t: string) => PROJECTS.find((p) => p.title === t)!;
    const soledeck = byTitle('Soledeck');
    expect(soledeck).toMatchObject({ badge: 'live', live: 'https://soledeckf.vercel.app/' });
    const source = readFileSync(resolve(HERE, 'projects.ts'), 'utf8');
    const block = between(source, '// 09', "title: 'Financial Fusion'");
    expect(block, 'Soledeck carries the owner flag comment').toMatch(/OWNER FLAG/);
    expect(byTitle('Echo AI').live).toBe('https://echoaai.netlify.app/');
    expect(byTitle('Smart Health Care').description).toMatch(/^A full-featured fitness tracker/);
    expect(byTitle('Medicine Store App').description).toMatch(/for animal\.$/);
    expect(PROJECTS.filter((p) => p.source?.endsWith('-')).map((p) => p.title)).toEqual([
      'GitPulse',
      'Medicine Store App',
      'DSA Tracker',
    ]);
    expect(PROJECTS[0]).toMatchObject({ title: 'PureBody', modal: 'purebody', source: null });
    expect(SOURCE).toContain(
      `'${LATEST_TITLE_PARTS[0]}<span class="serif">${LATEST_TITLE_PARTS[1]}</span>'`,
    );
  });
});

describe('certificates.ts: data parity with the reference works.js (L6913-6936, L7420)', () => {
  it('has the 7 certificates of CERTS, newest first, every field identical', () => {
    const ref = referenceVar<RefCert[]>('CERTS', '[');
    expect(ref).toHaveLength(7);
    expect(CERTIFICATES).toHaveLength(7);
    expect(CERTIFICATES.map(toRefCert)).toEqual(ref);
  });

  it('matches C_FILTERS (key "web" is labelled "Backend") and CAT_LBL', () => {
    const ref = referenceVar<[string, string][]>('C_FILTERS', '[');
    expect(CERTIFICATE_FILTERS.map((f) => [f.key, f.label])).toEqual(ref);
    expect({ ...CERTIFICATE_CATEGORY_LABEL }).toEqual(
      referenceVar<Record<string, string>>('CAT_LBL', '{'),
    );
  });

  it('has the per filter counts of REFERENCE_MAP.md 11.5.11', () => {
    expect(countBy(CERTIFICATES, (c) => c.filterKey)).toEqual({
      all: 7,
      ai: 2,
      frontend: 2,
      web: 1,
      cloud: 1,
      mobile: 1,
    });
  });

  it('has only the fields the reference has (no month, PDF or credential id)', () => {
    for (const c of CERTIFICATES) {
      expect(Object.keys(c).sort(), c.title).toEqual(
        [
          'description',
          'filterKey',
          'image',
          'issuer',
          'mono',
          'tags',
          'title',
          'type',
          'verifyUrl',
          'year',
        ].sort(),
      );
      expect(c.year, c.title).toMatch(/^\d{4}$/);
    }
  });
});

describe('projects.ts: Works hero, the orbit (HTML L4167-4265)', () => {
  it('matches the copy column', () => {
    const h = WORKS_HERO;
    const html = WORKS_HERO_HTML;
    expect(html).toContain(`<span class="eyebrow wk-a" style="--d:0ms">${h.eyebrow}</span>`);
    expect(html).toContain(`<span class="wk-wl__in" style="--d:90ms">${h.titleRowA}</span>`);
    expect(html).toContain(`<span class="serif grad-text">${h.titleRowB}</span>`);
    expect(html).toContain(
      `<span class="wk-wl__meta" aria-hidden="true">${h.titleMeta.from} <i>→</i> ${h.titleMeta.to}</span>`,
    );
    expect(html).toContain(`<p class="lead wk-wh__lead wk-a" style="--d:320ms">${h.lead}</p>`);
    expect(html).toContain(`</svg>${h.browseLabel}</button>`);
    expect(html).toContain(`</svg>${h.bookLabel}</button>`);
    expect(html).toContain(`role="group" aria-label="${h.stageAriaLabel}"`);
    expect(html).toContain(`</span>${h.cue}</button>`);
  });

  it('matches the three stats (hard coded "10+" while the data has 14)', () => {
    const stats = all(
      /<div class="wk-wh__stat wk-a" style="--d:(\d+)ms"><dt>([^<]+)<\/dt><dd><span data-wk-to="(\d+)">\d+<\/span><i>([^<]+)<\/i><\/dd><\/div>/,
      WORKS_HERO_HTML,
    ).map((m) => ({ label: m[2], value: Number(m[3]), suffix: m[4], delay: Number(m[1]) }));
    expect(WORKS_HERO.stats).toEqual(stats);
    expect(WORKS_HERO.stats[0]).toMatchObject({ label: 'Projects', value: 10 });
  });

  it('matches the phone: label, the two screens, the status time and the pill', () => {
    const { phone, pill } = WORKS_HERO;
    expect(WORKS_HERO_HTML).toContain(
      `class="wk-phn" id="wk-phn" aria-label="${phone.ariaLabel}" aria-haspopup="dialog"`,
    );
    const screens = all(
      /<img class="wk-phn__img(?: is-on)?" src="data:image\/webp;base64,<\.\.\.>" alt="" width="(\d+)" height="(\d+)" decoding="async" draggable="false">/,
      WORKS_HERO_HTML,
    ).map((m) => ({ width: Number(m[1]), height: Number(m[2]) }));
    expect(phone.screens.map(({ width, height }) => ({ width, height }))).toEqual(screens);
    expect(WORKS_HERO_HTML).toContain(
      `<span class="wk-phn__sb" aria-hidden="true"><b>${phone.statusTime}</b>`,
    );
    expect(WORKS_HERO_HTML).toContain(
      `<span class="dot-live"></span><b>${pill.name}</b><span>${pill.type}</span><span>${pill.latest}</span>`,
    );
  });

  it('matches the caption', () => {
    const { caption } = WORKS_HERO;
    expect(WORKS_HERO_HTML).toContain(
      `<p class="wk-ob__cap"><span class="wk-ob__n">${caption.count}</span><span><span class="wk-ob__d">${caption.desktop}</span><span class="wk-ob__m">${caption.phone}</span></span></p>`,
    );
  });

  it('matches the six orbit cards, in DOM order, with the section 8 screenshots', () => {
    const cards = all(
      /<button type="button" class="wk-oc( wk-oc--dk)?" data-p="([^"]+)" aria-label="([^"]+)">([\s\S]*?)<\/button>/,
      WORKS_HERO_HTML,
    ).map((m) => {
      const body = m[4]!;
      const img = one(
        /<img src="data:image\/webp;base64,<\.\.\.>" alt="" width="(\d+)" height="(\d+)" decoding="async" draggable="false">/,
        body,
      );
      const url = one(/<span class="wk-oc__url">([^<]+)<\/span>/, body);
      const lbl = one(
        /<span class="wk-oc__lbl" aria-hidden="true"><b>([^<]+)<\/b><span>([^<]+)<\/span><\/span>/,
        body,
      );
      return {
        projectTitle: m[2]!,
        ...(m[1] ? { dark: true } : {}),
        url: url[1]!,
        image: { width: Number(img[1]), height: Number(img[2]) },
        label: { name: lbl[1]!, type: lbl[2]! },
        ariaLabel: m[3]!,
      };
    });
    expect(cards).toHaveLength(6);
    expect(
      WORKS_HERO.cards.map((c) => ({
        projectTitle: c.projectTitle,
        ...(c.dark ? { dark: true } : {}),
        url: c.url,
        image: { width: c.image.width, height: c.image.height },
        label: c.label,
        ariaLabel: c.ariaLabel,
      })),
    ).toEqual(cards);
  });

  it('points every card at a project (the jump lookup byT) and a URL that matches its live link', () => {
    for (const c of WORKS_HERO.cards) {
      const project = PROJECTS.find((p) => p.title === c.projectTitle);
      expect(project, c.projectTitle).toBeDefined();
      expect(project!.live.replace(/^https?:\/\//, '').replace(/\/$/, '')).toBe(c.url);
    }
  });
});

type Template = (...args: string[]) => string;

/** Every function in an export, with its path (collectStrings skips functions). */
function collectFunctions(value: unknown, path: string, out: string[] = []): string[] {
  if (typeof value === 'function') out.push(path);
  else if (Array.isArray(value)) value.forEach((v, i) => collectFunctions(v, `${path}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collectFunctions(v, `${path}.${k}`, out);
  }
  return out;
}

/**
 * Each copy template, called with the reference's own JS expressions as arguments, must give back
 * the exact text of the reference template (works.js L6952, L7033-7050, L7120-7147, L7435-7447).
 */
const TEMPLATES: readonly { path: string; fn: Template; args: string[]; expected: string }[] = [
  {
    path: 'PROJECT_GRID_COPY.countChipAriaLabel',
    fn: PROJECT_GRID_COPY.countChipAriaLabel as unknown as Template,
    args: ["'+(counts[d[0]]||0)+'"],
    expected: `aria-label="'+(counts[d[0]]||0)+' items">`,
  },
  {
    path: 'PROJECT_GRID_COPY.card.imageAlt',
    fn: PROJECT_GRID_COPY.card.imageAlt,
    args: ["'+esc(p.t)+'"],
    expected: `alt="Screenshot of '+esc(p.t)+'"`,
  },
  {
    path: 'PROJECT_GRID_COPY.card.liveModalSr',
    fn: PROJECT_GRID_COPY.card.liveModalSr,
    args: ["'+esc(p.t)+'"],
    expected: `<span class="sr-only"> of '+esc(p.t)+'</span></button>'`,
  },
  {
    path: 'PROJECT_GRID_COPY.card.liveLinkSr',
    fn: PROJECT_GRID_COPY.card.liveLinkSr,
    args: ["'+esc(p.t)+'"],
    expected: `<span class="sr-only"> of '+esc(p.t)+', opens in a new tab</span></a>'`,
  },
  {
    path: 'PROJECT_GRID_COPY.card.sourceSr',
    fn: PROJECT_GRID_COPY.card.sourceSr,
    args: ["'+esc(p.t)+'"],
    expected: `<span class="sr-only"> code of '+esc(p.t)+' on GitHub</span></a>'`,
  },
  {
    path: 'CERTIFICATE_RAIL_COPY.countChipAriaLabel',
    fn: CERTIFICATE_RAIL_COPY.countChipAriaLabel as unknown as Template,
    args: ["'+(counts[d[0]]||0)+'"],
    expected: `aria-label="'+(counts[d[0]]||0)+' items">`,
  },
  {
    path: 'CERTIFICATE_RAIL_COPY.card.imageAlt',
    fn: CERTIFICATE_RAIL_COPY.card.imageAlt,
    args: ["'+esc(c.t)+'", "'+esc(c.iss)+'"],
    expected: `alt="'+esc(c.t)+' certificate from '+esc(c.iss)+'"`,
  },
  {
    path: 'CERTIFICATE_RAIL_COPY.card.issuerLine',
    fn: CERTIFICATE_RAIL_COPY.card.issuerLine,
    args: ["'+esc(c.type)+'", "'+esc(c.y)+'"],
    expected: `<span>'+esc(c.type)+' · '+esc(c.y)+'</span>`,
  },
  {
    path: 'CERTIFICATE_RAIL_COPY.card.viewSr',
    fn: CERTIFICATE_RAIL_COPY.card.viewSr,
    args: ["'+esc(c.t)+'"],
    expected: `<span class="sr-only"> for '+esc(c.t)+', opens in a new tab</span></a>'`,
  },
  {
    path: 'APPROVALS_HERO.deckCard.srLabel',
    fn: APPROVALS_HERO.deckCard.srLabel,
    args: ["'+esc(c.t)+'", "'+esc(c.iss)+'", "'+esc(c.y)+'"],
    expected: `<span class="sr-only">'+esc(c.t)+', '+esc(c.iss)+', '+esc(c.y)+'. Jump to this certificate.</span>'`,
  },
];

describe('copy templates (functions)', () => {
  it('checks every function in the exports', () => {
    const fns = Object.entries(EXPORTS).flatMap(([name, value]) => collectFunctions(value, name));
    expect(fns.sort()).toEqual(TEMPLATES.map((t) => t.path).sort());
  });

  it.each(TEMPLATES)('$path builds the reference template', ({ fn, args, expected }) => {
    const built = fn(...args);
    expect(expected).toContain(built);
    expect(WORKS_JS).toContain(expected);
  });

  it('matches the grid toolbar, count and empty state', () => {
    const g = PROJECT_GRID_COPY;
    expect(WORKS_BODY_HTML).toContain(`role="group" aria-label="${g.filterAriaLabel}"`);
    expect(WORKS_JS).toContain(
      `'${g.countPrefix} <b>'+vis.length+'</b> ${g.countMiddle} '+PROJECTS.length`,
    );
    expect(WORKS_BODY_HTML).toContain(`<p class="wk-empty__t">${g.empty.title}</p>`);
    expect(WORKS_BODY_HTML).toContain(`<p class="wk-empty__d">${g.empty.text}</p>`);
  });

  it('matches the card badges, actions and tag list label', () => {
    const c = PROJECT_GRID_COPY.card;
    expect(WORKS_JS).toContain(
      `<span class="dot-live" aria-hidden="true"></span>${c.badgeLatest}</span>'`,
    );
    expect(WORKS_JS).toContain(`icon('star','i--fill')+'${c.badgeFeatured}</span>'`);
    expect(WORKS_JS).toContain(
      `<span class="wk-dot" aria-hidden="true"></span>${c.badgeLive}</span>'`,
    );
    expect(WORKS_JS).toContain(`aria-haspopup="dialog">${c.livePreview}'+icon('arrow-up-right')`);
    expect(WORKS_JS).toContain(`icon('github')+'${c.source}<span class="sr-only">`);
    expect(WORKS_JS).toContain(`icon('lock')+'${c.closedSource}</span>'`);
    expect(WORKS_JS).toContain(`<ul class="tags wk-tags" aria-label="${c.tagsAriaLabel}">`);
  });

  it('matches the rail toolbar, controls, card copy and empty state', () => {
    const r = CERTIFICATE_RAIL_COPY;
    const html = AP_BODY_HTML;
    expect(html).toContain(`role="group" aria-label="${r.filterAriaLabel}"`);
    expect(html).toContain(
      `<div class="wk-railctl" aria-label="${r.controlsAriaLabel}" role="group">`,
    );
    expect(html).toContain(`id="wk-ap-prev" aria-label="${r.prevAriaLabel}"`);
    expect(html).toContain(`id="wk-ap-next" aria-label="${r.nextAriaLabel}"`);
    expect(html).toContain(`role="region" aria-label="${r.railAriaLabel}"`);
    expect(html).toContain(`<p class="wk-empty__t">${r.empty.title}</p>`);
    expect(html).toContain(`<p class="wk-empty__d">${r.empty.text}</p>`);
    expect(WORKS_JS).toContain(`<span class="wk-paper__top"><span>${r.card.paperTop}</span>`);
    expect(WORKS_JS).toContain(`icon('sparkles')+'${r.card.aiFlag}</span>'`);
    expect(WORKS_JS).toContain(`icon('check-circle')+'${r.card.verified}</span>'`);
    expect(WORKS_JS).toContain(
      `target="_blank" rel="noopener">${r.card.view}'+icon('arrow-up-right')`,
    );
  });
});

describe('certificates.ts: Approvals hero (HTML L3900-3933, deck L7420-7456)', () => {
  it('matches the copy column', () => {
    const h = APPROVALS_HERO;
    const html = AP_HERO_HTML;
    expect(html).toContain(`<span class="eyebrow wk-a" style="--d:0ms">${h.eyebrow}</span>`);
    expect(html).toContain(`<span class="wk-ln__in" style="--d:90ms">${h.titleRowA}</span>`);
    expect(html).toContain(`<span class="serif grad-text">${h.titleRowB}</span>`);
    expect(html).toContain(
      `<span class="wk-ln__meta" aria-hidden="true">${h.titleMeta.from} <i>→</i> ${h.titleMeta.to}</span>`,
    );
    expect(html).toContain(`<p class="lead wk-aph__lead wk-a" style="--d:320ms">${h.lead}</p>`);
    expect(html).toContain(`</svg>${h.browseLabel}</button>`);
    expect(html).toContain(`</svg>${h.cvLabel}</a>`);
    const b = h.issuedBy;
    expect(html).toContain(
      `<p class="wk-aph__isst">${b.before} <b>${b.boldA}</b> ${b.middle} <b>${b.boldB}</b></p>`,
    );
    expect(html).toContain(`role="group" aria-label="${h.deckAriaLabel}"`);
    expect(html).toContain(
      `<p class="wk-deck__cap"><span class="wk-deck__n">${h.caption.count}</span><span>${h.caption.text}</span></p>`,
    );
    expect(html).toContain(`</span>${h.cue}</button>`);
  });

  it('matches the three stats (hard coded "6+" while the data has 7)', () => {
    const stats = all(
      /<div class="wk-aph__stat wk-a" style="--d:(\d+)ms"><dt>([^<]+)<\/dt><dd><span data-wk-to="(\d+)">\d+<\/span><i>([^<]+)<\/i><\/dd><\/div>/,
      AP_HERO_HTML,
    ).map((m) => ({ label: m[2], value: Number(m[3]), suffix: m[4], delay: Number(m[1]) }));
    expect(APPROVALS_HERO.stats).toEqual(stats);
    expect(APPROVALS_HERO.stats[0]).toMatchObject({ label: 'Certifications', value: 6 });
  });

  it('matches the issuer chips', () => {
    const chips = all(/<i class="wk-im(?: wk-im--(a|sm))?">([^<]+)<\/i>/, AP_HERO_HTML).map(
      (m) => ({
        text: m[2],
        ...(m[1] ? { variant: m[1] } : {}),
      }),
    );
    expect(APPROVALS_HERO.issuerChips).toEqual(chips);
  });

  it('matches the seal ring and the deck card copy', () => {
    const d = APPROVALS_HERO.deckCard;
    expect(WORKS_JS).toContain(
      `<textPath href="#wk-seal-p" textLength="280">${APPROVALS_HERO.seal.ring}</textPath>`,
    );
    expect(WORKS_JS).toContain(`<span>${d.numberPrefix}'+pad(ci+1)+'</span>`);
    expect(WORKS_JS).toContain(`<span class="wk-dk__to">${d.awardedTo}<b>${d.awardee}</b></span>`);
    expect(WORKS_JS).toContain(`<span>${d.issuedBy}</span>`);
    expect(WORKS_JS).toContain(`<span>${d.year}</span>`);
    expect(WORKS_JS).toContain(`icon('check-circle')+'${d.verified}</span>`);
  });
});

describe('projects.ts: PureBody showcase modal (HTML L4493-4554)', () => {
  it('matches the head', () => {
    const s = PUREBODY_SHOWCASE;
    expect(PB_HTML).toContain(`<div class="fh-modal wk-pb" id="${s.id}" aria-hidden="true">`);
    expect(PROJECTS[0]!.modal).toBe(s.id);
    expect(PB_HTML).toContain(`data-close aria-label="${s.closeAriaLabel}">`);
    expect(PB_HTML).toContain(
      `<span class="dot-live" aria-hidden="true"></span>${s.kickerParts[0]} <i class="wk-sep" aria-hidden="true"></i> ${s.kickerParts[1]}</span>`,
    );
    expect(PB_HTML).toContain(
      `id="wk-pb-title">${s.titleParts[0]}<span class="serif grad-text">${s.titleParts[1]}</span></h2>`,
    );
    expect(PB_HTML).toContain(`<p class="wk-pb__lead">${s.lead}</p>`);
    expect(s.lead.endsWith('.')).toBe(false);
    expect(PB_HTML).toContain(
      `href="${s.fullPage.href}" target="_blank" rel="noopener">${s.fullPage.label}<span class="sr-only">${s.fullPage.srSuffix}</span></a>`,
    );
  });

  it('matches the three demo phones, in order', () => {
    const demos = all(
      /<figure class="wk-phone" style="--i:(\d)">[\s\S]*?aria-label="([^"]+)">\s*<span class="wk-phone__brand">([^<]+)<\/span>[\s\S]*?<span class="wk-phone__cap">([^<]+)<\/span>[\s\S]*?data-src="([^"]+)" aria-label="([^"]+)"><\/video>[\s\S]*?<figcaption class="wk-phone__fig">([^<]+)<\/figcaption>/,
      PB_HTML,
    );
    expect(demos).toHaveLength(3);
    for (const m of demos) expect(m[3]).toBe(PUREBODY_SHOWCASE.posterBrand);
    expect(PUREBODY_SHOWCASE.demos).toEqual(
      demos.map((m) => ({
        index: Number(m[1]),
        video: `/${m[5]}`,
        posterAriaLabel: m[2],
        posterCaption: m[4],
        videoAriaLabel: m[6],
        figcaption: m[7],
      })),
    );
  });
});

describe('assets on disk (frontend/public)', () => {
  // Content paths are stored decoded ("/imgs/Smart Gallery.webp"), so they map straight to disk.
  const onDisk = (path: string) => resolve(PUBLIC, path.slice(1));
  const paths = [
    ...PROJECTS.map((p) => p.image),
    ...CERTIFICATES.map((c) => c.image),
    ...WORKS_HERO.cards.map((c) => c.image.src),
    ...WORKS_HERO.phone.screens.map((sc) => sc.src),
    ...PUREBODY_SHOWCASE.demos.map((d) => d.video),
  ];

  it('lists 14 + 7 + 6 + 2 + 3 asset paths, all rooted at /', () => {
    expect(paths).toHaveLength(32);
    for (const p of paths) expect(p).toMatch(/^\/(imgs|images|vedioes)\/[^/]+$/);
  });

  it.each(paths)('%s exists and is not empty', (path) => {
    const file = onDisk(path);
    expect(existsSync(file), file).toBe(true);
    expect(statSync(file).size).toBeGreaterThan(0);
  });

  it('keeps the one project file name with a space (render it with encodeURI)', () => {
    const spaced = PROJECTS.filter((p) => p.image.includes(' ')).map((p) => p.image);
    expect(spaced).toEqual(['/imgs/Smart Gallery.webp']);
    expect(spaced.map((p) => encodeURI(p))).toEqual(['/imgs/Smart%20Gallery.webp']);
  });

  it('serves the three formerly large PNG screenshots as WebP (under 200 KB each)', () => {
    for (const path of [
      '/imgs/uha-company-website.webp',
      '/imgs/medicare.webp',
      '/imgs/react-native.webp',
    ]) {
      expect(statSync(onDisk(path)).size, path).toBeLessThan(200 * 1024);
    }
  });

  it('serves the hero screenshots at the intrinsic size of the section 8 table', () => {
    const shots = [...WORKS_HERO.cards.map((c) => c.image), ...WORKS_HERO.phone.screens];
    for (const d of shots) {
      const entry = IMAGES.find((x) => `/images/${x.file}` === d.src);
      expect(entry, d.src).toBeDefined();
      expect({ width: d.width, height: d.height }).toEqual({
        width: entry!.width,
        height: entry!.height,
      });
      const size = webpSize(readFileSync(onDisk(d.src)));
      expect({ width: size.width, height: size.height }, d.src).toEqual({
        width: d.width,
        height: d.height,
      });
    }
  });
});

describe('pure data modules', () => {
  it.each(SOURCE_FILES)('%s has no React, no "use client" and no component imports', (file) => {
    const source = readFileSync(resolve(HERE, file), 'utf8');
    expect(source).not.toMatch(/['"]use client['"]/);
    const imports = [
      ...source.matchAll(/^\s*(?:import|export)[^;]*?from\s+['"]([^'"]+)['"]/gm),
    ].map((m) => m[1]);
    for (const spec of imports) expect(['./projects'], `${file} imports ${spec}`).toContain(spec);
  });
});
