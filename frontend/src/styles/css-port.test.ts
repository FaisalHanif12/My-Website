// @vitest-environment node
/**
 * fe-02: proves the 9 global CSS files are a verbatim port of the reference <style> block.
 *
 * 1. Rule multiset: every rule of reference L22-3222 (at-rule chain + selector + declarations,
 *    whitespace normalised) appears in the 9 files exactly as often as in the reference, and
 *    nothing else does. The only allowed edit is the value of the three font tokens in :root.
 * 2. Order check: for every pair of rules whose relative order changed because a block moved to
 *    another file, the two rules must not share a property (same property family, see
 *    propFamily) AND a class or id token in their last compound selector, unless the pair is in
 *    ORDER_ALLOWLIST with the reason it cannot flip the cascade. Selector pairs scoped under two
 *    different page or overlay roots (DISJOINT_ROOTS) are skipped: they never match one element.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import postcss, { type ChildNode, type Container, type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';

const STYLES_DIR = fileURLToPath(new URL('./', import.meta.url));
const REF_FILE = fileURLToPath(
  new URL('../../../reference-design/faisalhanif-redesign.html', import.meta.url),
);

/** Global import order in app/layout.tsx. */
const FILES = [
  'tokens.css',
  'base.css',
  'layout.css',
  'about.css',
  'contact.css',
  'overlays.css',
  'profile.css',
  'works.css',
  'approvals.css',
  'heroes.css',
] as const;

/** Reference lines holding the <style> content (1-based, inclusive). */
const REF_FIRST = 22;
const REF_LAST = 3222;

/** The only edit allowed by the brief: the font tokens read the next/font variables (fe-12). */
const FONT_TOKENS: Record<string, { ref: string; app: string }> = {
  '--font-sans': {
    ref: "'Plus Jakarta Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
    app: "var(--ff-jakarta),ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
  },
  '--font-serif': {
    ref: "'Instrument Serif',ui-serif,Georgia,'Times New Roman',serif",
    app: "var(--ff-instrument),ui-serif,Georgia,'Times New Roman',serif",
  },
  '--font-mono': {
    ref: "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace",
    app: 'var(--ff-jetbrains),ui-monospace,SFMono-Regular,Menlo,monospace',
  },
};

/**
 * Page and overlay roots. They are disjoint subtrees in the reference markup (the five page
 * sections inside main, then the #booking and #purebody modals after it), so a selector scoped
 * under one of them can never match the same element as a selector scoped under another.
 */
const DISJOINT_ROOTS = [
  '#about',
  '#profile',
  '#works',
  '#approvals',
  '#contact',
  '#booking',
  '#purebody',
];

/**
 * Reordered pairs that share a property and a last-compound token but cannot flip the cascade.
 * Each entry names both selectors exactly (normalised) and why the order does not matter.
 */
const ORDER_ALLOWLIST: ReadonlyArray<{ a: string; b: string; why: string }> = [
  {
    a: '.wk-cue__c .i',
    b: '#purebody .wk-phone__play .i',
    why: 'the PureBody modal has no .wk-cue__c, and the #purebody rule (1,2,0) outranks (0,2,0) in any order',
  },
  {
    a: '.wk-sec .wk-empty .i',
    b: '#purebody .wk-phone__play .i',
    why: 'the PureBody modal sits outside every .wk-sec, and the #purebody rule (1,2,0) outranks (0,3,0) in any order',
  },
];

type FlatRule = {
  file: string;
  /** Enclosing at-rules, outermost first, e.g. ["@media (max-width:639px)"]. */
  chain: string[];
  selector: string;
  selectors: string[];
  decls: string[];
  props: string[];
  key: string;
};

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim();

function makeRule(rule: Rule, chain: string[], file: string): FlatRule {
  const decls: string[] = [];
  const props: string[] = [];
  rule.each((child) => {
    if (child.type === 'decl') {
      decls.push(`${child.prop}:${norm(child.value)}${child.important ? '!important' : ''}`);
      props.push(child.prop);
    } else if (child.type !== 'comment') {
      throw new Error(`${file}: unexpected ${child.type} inside "${rule.selector}"`);
    }
  });
  const selector = norm(rule.selector);
  return {
    file,
    chain,
    selector,
    selectors: rule.selectors.map(norm),
    decls,
    props,
    key: '',
  };
}

function withKey(r: FlatRule): FlatRule {
  return { ...r, key: `${r.chain.join(' > ')} {{ ${r.selector} }} ${r.decls.join('; ')}` };
}

/** Flattens a stylesheet into its rules, in source order, with their at-rule chain. */
function flatten(css: string, file: string): FlatRule[] {
  const out: FlatRule[] = [];
  const visit = (container: Container, chain: string[]) => {
    container.each((node: ChildNode) => {
      if (node.type === 'rule') {
        out.push(makeRule(node, chain, file));
      } else if (node.type === 'atrule') {
        const at = norm(`@${node.name} ${node.params}`);
        if (!node.nodes) {
          out.push({ file, chain, selector: at, selectors: [], decls: [], props: [], key: '' });
          return;
        }
        // Declarations directly inside an at-rule (@property, @font-face) form one entry.
        const own = node.nodes.flatMap((d) =>
          d.type === 'decl' ? [`${d.prop}:${norm(d.value)}${d.important ? '!important' : ''}`] : [],
        );
        if (own.length)
          out.push({ file, chain, selector: at, selectors: [], decls: own, props: [], key: '' });
        visit(node, [...chain, at]);
      } else if (node.type === 'decl' && container.type === 'root') {
        throw new Error(`${file}: top level declaration ${node.prop}`);
      }
    });
  };
  visit(postcss.parse(css, { from: file }), []);
  return out;
}

/** Replaces the three font token values in the top level :root rule; returns what it found. */
function maskFontTokens(rules: FlatRule[]): { rules: FlatRule[]; found: Record<string, string> } {
  const found: Record<string, string> = {};
  const masked = rules.map((r) => {
    if (r.chain.length || r.selector !== ':root') return withKey(r);
    const decls = r.decls.map((d) => {
      const i = d.indexOf(':');
      const prop = d.slice(0, i);
      if (!(prop in FONT_TOKENS)) return d;
      found[prop] = d.slice(i + 1);
      return `${prop}:<next/font token>`;
    });
    return withKey({ ...r, decls });
  });
  return { rules: masked, found };
}

function readReferenceCss(): string {
  const lines = readFileSync(REF_FILE, 'utf8').split('\n');
  if (lines[REF_FIRST - 2]?.trim() !== '<style>' || lines[REF_LAST]?.trim() !== '</style>') {
    throw new Error('reference <style> block is not at L21-2878 any more');
  }
  return lines.slice(REF_FIRST - 1, REF_LAST).join('\n');
}

const readApp = (file: string): string => readFileSync(`${STYLES_DIR}${file}`, 'utf8');

/** The compound selector after the last top level combinator. */
function lastCompound(selector: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && (c === ' ' || c === '>' || c === '+' || c === '~')) start = i + 1;
  }
  return selector.slice(start).trim();
}

/** Class and id tokens of a compound, ignoring anything inside (...) or [...]. */
function tokens(compound: string): string[] {
  let s = compound;
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/\([^()]*\)/g, '').replace(/\[[^\]]*\]/g, '');
  }
  return s.match(/[.#][A-Za-z_-][\w-]*/g) ?? [];
}

/**
 * Property family, so shorthands and longhands count as the same property:
 * vendor prefix dropped, then the part before the first dash (margin-top -> margin),
 * with the box sides folded into inset and the alignment properties into one family.
 */
function propFamily(prop: string): string {
  if (prop.startsWith('--')) return prop;
  const p = prop.replace(/^-(webkit|moz|ms|o)-/, '');
  if (/^(top|right|bottom|left|inset)(-|$)/.test(p)) return 'inset';
  if (/^(row-gap|column-gap|gap)$/.test(p)) return 'gap';
  if (/^(align|justify|place)-/.test(p)) return 'align';
  return p.split('-')[0];
}

function sharedProps(a: FlatRule, b: FlatRule): string[] {
  const fb = new Set(b.props.map(propFamily));
  return [...new Set(a.props.map(propFamily))].filter((f) => fb.has(f));
}

const rootsOf = (selector: string): string[] =>
  tokens(selector).filter((t) => DISJOINT_ROOTS.includes(t));

/** True when the two selectors sit under two different page or overlay roots. */
function disjointRoots(sa: string, sb: string): boolean {
  const ra = rootsOf(sa);
  const rb = rootsOf(sb);
  return ra.length > 0 && rb.length > 0 && !ra.some((r) => rb.includes(r));
}

/** Class and id tokens shared by the last compounds of any selector pair that can overlap. */
function sharedTokens(a: FlatRule, b: FlatRule): string[] {
  const hits = new Set<string>();
  for (const sa of a.selectors) {
    for (const sb of b.selectors) {
      if (disjointRoots(sa, sb)) continue;
      const tb = tokens(lastCompound(sb));
      for (const t of tokens(lastCompound(sa))) if (tb.includes(t)) hits.add(t);
    }
  }
  return [...hits];
}

const isAllowlisted = (a: FlatRule, b: FlatRule): boolean =>
  ORDER_ALLOWLIST.some(
    (e) => (e.a === a.selector && e.b === b.selector) || (e.a === b.selector && e.b === a.selector),
  );

const reference = maskFontTokens(flatten(readReferenceCss(), 'reference'));
const app = maskFontTokens(FILES.flatMap((f) => flatten(readApp(f), f)));

describe('CSS port of the reference <style> block', () => {
  it('each file starts with a one line comment naming its reference line ranges', () => {
    for (const f of FILES) {
      const first = readApp(f).split('\n')[0];
      expect(first, f).toMatch(
        new RegExp(`^/\\* ${f.replace('.', '\\.')}: reference L\\d+.*\\*/$`),
      );
    }
  });

  it('keeps the reference font tokens and builds them from the next/font variables', () => {
    const expectedRef = Object.fromEntries(Object.entries(FONT_TOKENS).map(([k, v]) => [k, v.ref]));
    const expectedApp = Object.fromEntries(Object.entries(FONT_TOKENS).map(([k, v]) => [k, v.app]));
    expect(reference.found).toEqual(expectedRef);
    expect(app.found).toEqual(expectedApp);
  });

  it('has exactly the reference rule multiset (at-rule chain + selector + declarations)', () => {
    const count = (rules: FlatRule[]) => {
      const m = new Map<string, number>();
      for (const r of rules) m.set(r.key, (m.get(r.key) ?? 0) + 1);
      return m;
    };
    const ref = count(reference.rules);
    const got = count(app.rules);
    const missing: string[] = [];
    const extra: string[] = [];
    for (const [k, n] of ref) if ((got.get(k) ?? 0) < n) missing.push(k);
    for (const [k, n] of got) if ((ref.get(k) ?? 0) < n) extra.push(k);
    expect({ missing: missing.slice(0, 20), extra: extra.slice(0, 20) }).toEqual({
      missing: [],
      extra: [],
    });
    expect(app.rules.length).toBe(reference.rules.length);
  });

  it('moves no rule past another rule it could flip in the cascade', () => {
    // Pair each app rule with its reference occurrence (k-th same key -> k-th same key).
    const queues = new Map<string, number[]>();
    reference.rules.forEach((r, i) => {
      const q = queues.get(r.key) ?? [];
      q.push(i);
      queues.set(r.key, q);
    });
    // Unmatched rules (the multiset test reports them) have no position and are skipped.
    const appPos: Array<number | undefined> = new Array(reference.rules.length);
    app.rules.forEach((r, j) => {
      const i = queues.get(r.key)?.shift();
      if (i !== undefined) appPos[i] = j;
    });

    const checked = (r: FlatRule) =>
      r.selectors.length > 0 && !r.chain.some((c) => c.startsWith('@keyframes'));
    const where = (pos: number, r: FlatRule) =>
      `[${app.rules[pos].file}] ${[...r.chain, r.selector].join(' ')}`;

    const conflicts: string[] = [];
    let moved = 0;
    const n = reference.rules.length;
    for (let i = 0; i < n; i++) {
      const a = reference.rules[i];
      const pa = appPos[i];
      if (pa === undefined || !checked(a)) continue;
      for (let k = i + 1; k < n; k++) {
        const pb = appPos[k];
        if (pb === undefined || pb > pa) continue;
        const b = reference.rules[k];
        moved++;
        if (!checked(b) || a.key === b.key) continue;
        const props = sharedProps(a, b);
        if (!props.length) continue;
        const toks = sharedTokens(a, b);
        if (!toks.length || isAllowlisted(a, b)) continue;
        conflicts.push(
          `${where(pa, a)}  <->  ${where(pb, b)}  (props: ${props.join(',')}; tokens: ${toks.join(',')})`,
        );
      }
    }
    expect(moved).toBeGreaterThan(0);
    expect(conflicts).toEqual([]);
  });
});
