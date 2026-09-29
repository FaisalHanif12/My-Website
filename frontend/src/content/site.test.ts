import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { collectStrings, referenceText, type StringLeaf } from '../../tests/unit/referenceText';
import {
  contactFacts,
  curtainNum,
  footerCopy,
  nextPageCopy,
  nextPageLinks,
  nextPageOf,
  pageById,
  pages,
  preloader,
  shellCopy,
  site,
  siteMeta,
} from './site';

const HERE = dirname(fileURLToPath(import.meta.url));

/** True when the value appears verbatim in the reference (entities and JS escapes decoded). */
function inReference(value: string): boolean {
  return (
    referenceText().includes(value) || referenceText({ collapseWhitespace: true }).includes(value)
  );
}

/** Copy strings (length >= 3) that are not in the reference, skipping allowlisted derived values. */
function missingCopy(leaves: StringLeaf[], allow: readonly RegExp[] = []): string[] {
  return leaves
    .filter((leaf) => leaf.value.length >= 3)
    .filter((leaf) => !allow.some((re) => re.test(leaf.path)))
    .filter((leaf) => !inReference(leaf.value))
    .map((leaf) => `${leaf.path}: ${JSON.stringify(leaf.value)}`);
}

/** The first capture group of a regex run on the raw reference text. */
function refMatch(re: RegExp): string {
  const m = referenceText().match(re);
  if (!m?.[1]) throw new Error(`Reference pattern not found: ${re}`);
  return m[1];
}

describe('site.ts copy is verbatim from the reference', () => {
  it('every copy string appears in the reference', () => {
    const leaves = [
      ...collectStrings(site, 'site'),
      ...collectStrings(contactFacts, 'contactFacts'),
      ...collectStrings(siteMeta, 'siteMeta'),
      ...collectStrings(pages, 'pages'),
      ...collectStrings(shellCopy, 'shellCopy'),
      ...collectStrings(preloader, 'preloader'),
      ...collectStrings(footerCopy, 'footerCopy'),
      ...collectStrings(nextPageCopy, 'nextPageCopy'),
    ];
    // Derived values: rebuild routes and titles the reference builds at run time (checked below).
    const allow = [/^pages\[\d\]\.path$/, /^pages\[\d\]\.docTitle$/];
    expect(missingCopy(leaves, allow)).toEqual([]);
  });

  it('holds no em dash (the shell copy has none)', () => {
    const leaves = collectStrings({ site, contactFacts, siteMeta, pages, shellCopy, footerCopy });
    expect(leaves.filter((l) => l.value.includes(String.fromCharCode(0x2014)))).toEqual([]);
  });
});

describe('pages', () => {
  it('lists the five pages in the reference PAGES order with META numbers and titles', () => {
    const order = refMatch(/var PAGES=\[([^\]]+)\]/)
      .split(',')
      .map((s) => s.replace(/'/g, ''));
    expect(pages.map((p) => p.id)).toEqual(order);
    expect(pages).toHaveLength(5);

    const meta = refMatch(/var META=(\{.+?\}\});/);
    for (const p of pages) {
      expect(meta).toContain(`${p.id}:{n:'${p.n}',t:'${p.title}'}`);
    }
  });

  it('matches the rail and dock links (label, icon, order)', () => {
    const re =
      /<a class="rail__link" href="#(\w+)" data-nav="\w+"><svg class="i"><use href="#([\w-]+)"\/><\/svg><span>(\w+)<\/span><\/a>/g;
    const links = [...referenceText().matchAll(re)].map((m) => ({
      id: m[1],
      navIcon: m[2],
      title: m[3],
    }));
    expect(links).toHaveLength(10); // rail L2977-2981 + dock L2996-3000
    const expected = pages.map(({ id, navIcon, title }) => ({ id, navIcon, title }));
    expect(links.slice(0, 5)).toEqual(expected);
    expect(links.slice(5)).toEqual(expected);
  });

  it('uses the rebuild routes', () => {
    expect(pages.map((p) => p.path)).toEqual(['/', '/profile', '/works', '/approvals', '/contact']);
    expect(pageById('works').path).toBe('/works');
  });

  it('builds the document titles like L4683', () => {
    expect(pages.map((p) => p.docTitle)).toEqual([
      'Faisal Hanif · Software Engineer',
      'Profile · Faisal Hanif',
      'Works · Faisal Hanif',
      'Approvals · Faisal Hanif',
      'Contact · Faisal Hanif',
    ]);
    expect(referenceText()).toContain(
      "document.title=(id==='about'?'Faisal Hanif · Software Engineer':META[id].t+' · Faisal Hanif')",
    );
    expect(refMatch(/<title>([^<]+)<\/title>/)).toBe(siteMeta.defaultTitle);
  });

  it('builds the curtain number like L4701 ("02 / 05")', () => {
    expect(pages.map(curtainNum)).toEqual(['01 / 05', '02 / 05', '03 / 05', '04 / 05', '05 / 05']);
    expect(referenceText()).toContain("FH.$('#curtainNum').textContent=META[page].n+' / 05'");
  });
});

describe('next page links', () => {
  it('match the reference labels, counters and serif split (map 11.2 note 3)', () => {
    expect(nextPageLinks).toEqual([
      {
        from: 'about',
        to: 'profile',
        href: '/profile',
        label: 'Next page · 02',
        position: '1 / 5',
        wordHead: 'Profi',
        wordTail: 'le',
      },
      {
        from: 'profile',
        to: 'works',
        href: '/works',
        label: 'Next page · 03',
        position: '2 / 5',
        wordHead: 'Wor',
        wordTail: 'ks',
      },
      {
        from: 'works',
        to: 'approvals',
        href: '/approvals',
        label: 'Next page · 04',
        position: '3 / 5',
        wordHead: 'Approva',
        wordTail: 'ls',
      },
      {
        from: 'approvals',
        to: 'contact',
        href: '/contact',
        label: 'Next page · 05',
        position: '4 / 5',
        wordHead: 'Conta',
        wordTail: 'ct',
      },
      {
        from: 'contact',
        to: 'about',
        href: '/',
        label: 'Back to the start · 01',
        position: '5 / 5',
        wordHead: 'Abo',
        wordTail: 'ut',
      },
    ]);
    expect(nextPageOf('works')).toEqual(nextPageLinks[2]);
  });

  it('uses the literal pieces of the reference builder (L4735)', () => {
    const src = referenceText();
    expect(src).toContain(
      `'+(last?'${nextPageCopy.lastLabel}':'${nextPageCopy.nextLabel}')+'${nextPageCopy.numberJoin}'+m.n+'`,
    );
    expect(src).toContain(`'+(i+1)+'${nextPageCopy.positionTotal}</span>`);
    expect(src).toContain(`<nav class="page-next" aria-label="${nextPageCopy.ariaLabel}"`);
  });
});

describe('shell copy', () => {
  it('matches the rail, top bar, preloader and footer markup', () => {
    const src = referenceText();
    expect(src).toContain(
      `<aside class="rail" aria-label="${shellCopy.navLabel}">\n  <a class="rail__logo" href="#about" aria-label="${shellCopy.logoAriaLabel}">${shellCopy.logoText}</a>`,
    );
    expect(src).toContain(`<nav class="dock" aria-label="${shellCopy.navLabel}"`);
    expect(src).toContain(
      `<a class="topbar__brand" href="#about"><span class="rail__logo">${shellCopy.logoText}</span>${shellCopy.brandName}</a>`,
    );
    expect(src.split(`aria-label="${shellCopy.themeToggleAriaLabel}"`)).toHaveLength(3);
    expect(src).toContain(`<use href="#i-calendar"/></svg>${shellCopy.bookButton}</button>`);
    expect(src).toContain(`y="54" text-anchor="middle">${preloader.mark}</text>`);
    expect(src).toContain(`<span class="label">${preloader.label}</span>`);
    expect(src).toContain(
      `<div class="footer__big" aria-hidden="true">${footerCopy.bigPlain} <span class="serif">${footerCopy.bigSerif}</span></div>`,
    );
    expect(src).toContain(
      `<span>${footerCopy.copyright}<span id="year">2026</span>${footerCopy.line}</span>`,
    );
    expect(src).toContain(`<a class="link-arrow" href="#about">${footerCopy.backToTop} <svg`);
  });

  it('matches the head metadata', () => {
    expect(refMatch(/<meta name="description" content="([^"]+)">/)).toBe(siteMeta.description);
    expect(refMatch(/<meta name="theme-color" content="([^"]+)">/)).toBe(siteMeta.themeColor.light);
    expect(referenceText()).toContain(
      `t==='dark'?'${siteMeta.themeColor.dark}':'${siteMeta.themeColor.light}'`,
    );
    expect(refMatch(/window\.FH_BASE='([^']+)'/)).toBe(siteMeta.baseUrl);
    expect(refMatch(/<html lang="(\w+)"/)).toBe(siteMeta.lang);
    expect(refMatch(/localStorage\.getItem\('([^']+)'\)/)).toBe(siteMeta.themeStorageKey);
  });
});

describe('contact facts', () => {
  it('match the About bento and the reference clocks', () => {
    const src = referenceText();
    expect(src).toContain(`href="mailto:${contactFacts.email}"`);
    expect(src).toContain(`<p class="ab-kc__value">${contactFacts.phone.display}</p>`);
    expect(src).toContain(`href="${contactFacts.phone.href}"`);
    expect(src).toContain(`<p class="ab-kc__value">${contactFacts.location}</p>`);
    expect(src).toContain(`<span class="label">${contactFacts.gmtLabel}</span>`);
    expect(src).toContain(`PKT = ${contactFacts.utcOffsetMinutes}`);
    expect(src).toContain(
      `open = wk && mins >= ${contactFacts.workStartMinutes} && mins < ${contactFacts.workEndMinutes}`,
    );
    expect(src).toContain('var working = wd>=1 && wd<=5 && h>=9 && h<18;');
    expect(contactFacts.workingDays).toEqual([1, 2, 3, 4, 5]);
    expect(src).toContain(`timeZone:'${contactFacts.timeZone}'`);
  });

  it('has no WhatsApp', () => {
    expect(JSON.stringify(contactFacts).toLowerCase()).not.toContain('whatsapp');
  });
});

describe('site.ts holds each value once', () => {
  it('writes no string literal twice in its data', () => {
    const source = readFileSync(resolve(HERE, 'site.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
      .replace(/^\s*\/\/.*$/gm, '') // line comments
      .replace(/^(export )?interface \w+ \{[\s\S]*?\n\}\n/gm, '') // interfaces
      .replace(/^(export )?type \w+ =[\s\S]*?;\n/gm, ''); // type aliases
    // "Next page" is written twice in the reference builder too (L4735): the nav aria-label and the
    // left label are separate literals there, so they stay separate fields here.
    const twiceInReference = new Set(['Next page']);
    const literals = [...source.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)]
      .map((m) => m[1] ?? m[2] ?? '')
      .filter((v) => v.length >= 3 && !twiceInReference.has(v));
    // The scan sees the data literals (guards against a regex that strips too much).
    expect(literals).toEqual(
      expect.arrayContaining(['mehrfaisal111@gmail.com', 'Profile', '#0e6655']),
    );
    const seen = new Set<string>();
    const dupes = literals.filter((v) => (seen.has(v) ? true : (seen.add(v), false)));
    expect(dupes).toEqual([]);
  });

  it('exports a single page table', () => {
    expect(pages).toHaveLength(5);
    expect(new Set(pages.map((p) => p.id)).size).toBe(5);
  });
});
