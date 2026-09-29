/**
 * Profile content (profile.ts, experience.ts, education.ts, skills.ts) against the reference design.
 *
 * 1. Every copy string (length >= 3) appears verbatim in the reference text, apart from a short
 *    allowlist of enum values.
 * 2. Each list is parsed back out of the reference Profile markup and compared with the data, so
 *    order, counts and every number (ring values, bar positions, delays) are proven too.
 * 3. Count checks from REFERENCE_MAP.md 11.4.12, the reference's own internal consistency, the two
 *    em dashes, and sprite ids.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { collectStrings, referenceText } from '../../tests/unit/referenceText';
import { education, type EducationEntry } from './education';
import { experience, experienceYearBox, type ExperienceRole } from './experience';
import { profileBlockHeads, profileDesk, profileHero, type HeroStat } from './profile';
import {
  coreExpertiseCard,
  languagesCard,
  skillTabs,
  skillTabsLabel,
  type CoreExpertiseChip,
  type LanguageEntry,
  type SkillTab,
} from './skills';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_FILES = ['profile.ts', 'experience.ts', 'education.ts', 'skills.ts'];

const EXPORTS = {
  profileHero,
  profileDesk,
  profileBlockHeads,
  experienceYearBox,
  experience,
  education,
  skillTabsLabel,
  skillTabs,
  languagesCard,
  coreExpertiseCard,
};

/** String leaves that are typed enum values, not copy (they never appear as text in the page). */
const ALLOWLIST: readonly RegExp[] = [
  /^profileHero\.stats\[\d+\]\.kind$/,
  /^experience\[\d+\]\.status$/,
  /^education\[\d+\]\.variant$/,
];

const TEXT = referenceText();
const TEXT_COLLAPSED = referenceText({ collapseWhitespace: true });

function between(source: string, start: string, end: string): string {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + 1);
  if (a < 0 || b < 0) throw new Error(`reference markers not found: ${start} .. ${end}`);
  return source.slice(a, b);
}

/** The Profile page markup of the reference (section#profile, HTML L3437-3797), entities decoded. */
const PROFILE = between(TEXT, '<section id="profile"', '<section id="works"');
const HERO = between(PROFILE, '<header class="page-hero pf-hero"', '</header>');
const EDU_GRID = between(PROFILE, '<div class="pf-edu-grid">', '<div class="pf-block pf-tech"');
const TECH = between(PROFILE, '<div class="pf-block pf-tech"', '</section>');

function all(re: RegExp, source: string): RegExpExecArray[] {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return [...source.matchAll(new RegExp(re.source, flags))];
}

function one(re: RegExp, source: string): RegExpExecArray {
  const found = all(re, source);
  expect(found, `exactly one match for ${re}`).toHaveLength(1);
  return found[0]!;
}

function tagsOf(chunk: string): string[] {
  return all(/<li class="tag">([^<]+)<\/li>/, chunk).map((m) => m[1]!);
}

describe('copy strings', () => {
  it('finds the Profile section in the reference', () => {
    expect(PROFILE.length).toBeGreaterThan(1000);
    expect(HERO).toContain('id="pf-hero"');
  });

  it('every copy string (length >= 3) appears verbatim in the reference', () => {
    const missing = Object.entries(EXPORTS)
      .flatMap(([name, value]) => collectStrings(value, name))
      .filter(({ path, value }) => value.length >= 3 && !ALLOWLIST.some((re) => re.test(path)))
      .filter(({ value }) => !TEXT.includes(value) && !TEXT_COLLAPSED.includes(value));
    expect(missing).toEqual([]);
  });

  it('keeps the allowlist to enum values only', () => {
    const allowed = Object.entries(EXPORTS)
      .flatMap(([name, value]) => collectStrings(value, name))
      .filter(({ path }) => ALLOWLIST.some((re) => re.test(path)))
      .map(({ value }) => value);
    expect([...new Set(allowed)].sort()).toEqual(
      ['closed', 'count', 'current', 'degree', 'featured', 'small'].sort(),
    );
  });

  it('has exactly the two em dashes of the Profile copy, written as \\u2014 escapes', () => {
    const withDash = Object.entries(EXPORTS)
      .flatMap(([name, value]) => collectStrings(value, name))
      .filter(({ value }) => value.includes('\u2014'))
      .map(({ path }) => path);
    expect(withDash).toEqual(['profileHero.lead', 'experience[0].description']);
    for (const file of SOURCE_FILES) {
      const source = readFileSync(resolve(HERE, file), 'utf8');
      expect(source.includes('\u2014'), `${file} has a raw em dash`).toBe(false);
    }
  });

  it('names only icon ids that exist in the shell sprite', () => {
    const icons = Object.entries(EXPORTS)
      .flatMap(([name, value]) => collectStrings(value, name))
      .filter(({ path }) => /icon$/i.test(path));
    expect(icons.length).toBeGreaterThan(20);
    const unknown = icons.filter(({ value }) => !TEXT.includes(`<symbol id="${value}"`));
    expect(unknown).toEqual([]);
  });
});

describe('profile.ts: hero copy column (L3443-3467, L3559-3563)', () => {
  it('matches the eyebrow, the two title lines and the lead', () => {
    const { eyebrow, titleLineA, titleLineB, lead } = profileHero;
    expect(HERO).toContain(`<span class="eyebrow pf-hi" style="--i:0">${eyebrow}</span>`);
    expect(HERO).toContain(`<span class="pf-ln__in" style="--i:1">${titleLineA}</span>`);
    expect(HERO).toContain(
      `<span class="pf-ln__in" style="--i:2"><span class="serif grad-text">${titleLineB}</span></span>`,
    );
    expect(HERO).toContain(`<p class="lead pf-hero__lead pf-hi" style="--i:4">${lead}</p>`);
  });

  it('matches the two CTAs and the scroll cue', () => {
    const { cvCta, experienceCta, cue } = profileHero;
    expect(HERO).toContain(
      `<a class="btn btn--primary pf-cv" href="https://faisalhanif.work/${cvCta.assetPath}" download data-magnetic><svg class="i" aria-hidden="true"><use href="#${cvCta.icon}"/></svg>${cvCta.label}</a>`,
    );
    // profile.js L6623 rewrites the href to FH.asset(path): the rebuild renders asset(assetPath).
    expect(TEXT).toContain(`cv.href = FH.asset('${cvCta.assetPath}')`);
    expect(HERO).toContain(
      `<a class="btn btn--ghost pf-goexp" href="${experienceCta.href}"><svg class="i" aria-hidden="true"><use href="#${experienceCta.icon}"/></svg>${experienceCta.label}</a>`,
    );
    expect(HERO).toContain(`<a class="pf-cue pf-hi" style="--i:9" href="${cue.href}">`);
    expect(HERO).toContain(`<span class="label">${cue.label}</span></a>`);
    expect(PROFILE).toContain(`id="${experienceCta.href.slice(1)}"`);
  });

  it('matches the three stats in order', () => {
    const parsed = all(
      /<dt class="pf-hstat__label">([^<]+)<\/dt>\s*<dd class="pf-hstat__val">(.*?)<\/dd>/,
      HERO,
    ).map((m) => [m[1], m[2]]);
    const rendered = profileHero.stats.map((s: HeroStat) => [
      s.label,
      s.kind === 'count'
        ? `<span class="pf-count" data-to="${s.to}">${s.to}</span><span class="pf-hstat__suf">${s.suffix}</span>`
        : `${s.text}<span class="serif grad-text pf-hstat__se">${s.serifText}</span>`,
    ]);
    expect(rendered).toEqual(parsed);
  });
});

describe('profile.ts: hero desk sheets (L3470-3556)', () => {
  const { education: edu, experience: xp, expertise: skl, seal, hint } = profileDesk;

  it('matches the desk label and the hint', () => {
    expect(HERO).toContain(
      `<div class="pf-desk" role="group" aria-label="${profileDesk.ariaLabel}">`,
    );
    expect(HERO).toContain(
      `<p class="pf-desk__hint"><span class="pf-desk__n">${hint.count}</span>${hint.text}</p>`,
    );
  });

  it('keeps the sheet links, labels and DOM order (Education, Experience, Expertise)', () => {
    const sheets = all(
      /<a class="pf-sheet pf-sheet--(\w+)" href="([^"]+)" aria-label="([^"]+)">/,
      HERO,
    ).map((m) => [m[1], m[2], m[3]]);
    expect(sheets).toEqual([
      ['edu', edu.href, edu.ariaLabel],
      ['exp', xp.href, xp.ariaLabel],
      ['skl', skl.href, skl.ariaLabel],
    ]);
    const numbers = all(/<span class="pf-sh__no">(\d+) <i>\/<\/i> ([^<]+)<\/span>/, HERO).map(
      (m) => [m[1], m[2]],
    );
    expect(numbers).toEqual([
      [edu.number, edu.label],
      [xp.number, xp.label],
      [skl.number, skl.label],
    ]);
    for (const { href } of [edu, xp, skl]) expect(PROFILE).toContain(`id="${href.slice(1)}"`);
  });

  it('matches the Education sheet', () => {
    expect(HERO).toContain(
      `<span class="pf-sh__ic"><svg class="i" aria-hidden="true"><use href="#${edu.icon}"/></svg></span>`,
    );
    expect(HERO).toContain(`<span class="pf-ed__big serif">${edu.big}</span>`);
    expect(HERO).toContain(`<span class="pf-ed__t">${edu.title}</span>`);
    expect(HERO).toContain(`<span class="pf-ed__u">${edu.university}</span>`);
    expect(HERO).toContain(`<span class="pf-ed__y">${edu.years}</span>`);
    const rows = all(
      /<span class="pf-ed__row"><span>([^<]+) <em>([^<]+)<\/em><\/span><span>([^<]+)<\/span><\/span>/,
      HERO,
    ).map((m) => ({ level: m[1], subject: m[2], years: m[3] }));
    expect(rows).toEqual(edu.rows);
  });

  it('matches the Experience (CV) sheet rows, bars and axis', () => {
    expect(HERO).toContain(`<span class="pf-sh__mono">${xp.mono}</span>`);
    expect(HERO).toContain(
      `<span class="pf-sh__cv"><span class="serif">${xp.cvTitle}</span><span class="pf-sh__who">${xp.who}</span></span>`,
    );
    expect(HERO).toContain(
      `<span class="pf-sh__range">${xp.rangeFrom} <i>→</i> ${xp.rangeTo}</span>`,
    );
    const rows = all(
      /<span class="pf-xp__row( is-cur)?" style="--a:([\d.]+);--b:([\d.]+);--k:(\d+)">\s*<span class="pf-xp__yr">([^<]+)<\/span>\s*<span class="pf-xp__t"><b>([^<]+)<\/b><span>([^<]+)<\/span><\/span>\s*(?:<span class="pf-xp__now"><span class="dot-live"><\/span>([^<]+)<\/span>)?/,
      HERO,
    );
    expect(rows.map((m) => Number(m[4]))).toEqual(xp.rows.map((_, i) => i));
    expect(
      rows.map((m) => ({
        year: m[5],
        title: m[6],
        company: m[7],
        barStart: Number(m[2]),
        barEnd: Number(m[3]),
        current: m[1] !== undefined,
      })),
    ).toEqual(xp.rows);
    expect(rows.flatMap((m) => (m[8] ? [m[8]] : []))).toEqual([xp.currentLabel]);
    const axis = one(/<span class="pf-xp__axis">((?:<span>[^<]*<\/span>)+)<\/span>/, HERO)[1]!;
    expect(all(/<span>([^<]*)<\/span>/, axis).map((m) => m[1])).toEqual(xp.axis);
  });

  it('matches the Expertise sheet rings, chip and "+9 more"', () => {
    const rings = all(
      /<span class="pf-mr__i" data-v="(\d+)" style="--k:(\d+)">.*?style="--v:(\d+)"\/><\/svg><b class="pf-mr__n">(\d+)<\/b><\/span><span class="pf-mr__l">([^<]+)<\/span><\/span>/,
      HERO,
    );
    rings.forEach((m, i) => {
      expect(Number(m[2])).toBe(i);
      // data-v, the inline --v and the static number agree in the reference.
      expect(new Set([m[1], m[3], m[4]]).size).toBe(1);
    });
    expect(rings.map((m) => ({ value: Number(m[1]), label: m[5] }))).toEqual(skl.rings);
    expect(HERO).toContain(
      `<span class="pf-sk__chip"><svg class="i" aria-hidden="true"><use href="#${skl.chip.icon}"/></svg>${skl.chip.label}</span><span class="pf-sk__more">${skl.more}</span>`,
    );
  });

  it('matches the seal', () => {
    expect(HERO).toContain(
      `<textPath href="#pf-seal-p" textLength="280">${seal.ringText}</textPath>`,
    );
    expect(HERO).toContain(
      `<text class="pf-seal__fh" x="60" y="68" text-anchor="middle">${seal.mark}</text>`,
    );
  });
});

describe('profile.ts: body block heads (L3578-3582, L3659-3664, L3708-3713)', () => {
  it('matches the three heads in page order', () => {
    const heads = all(
      /<span class="label pf-bhead__idx" data-reveal="fade">([^<]+)<\/span>\s*<h3 class="pf-bhead__title" id="([^"]+)" data-split>(\S+) <span class="serif grad-text">([^<]+)<\/span><\/h3>(?:\s*<\/div>)?\s*<p class="pf-bhead__sub" data-reveal data-delay="150">([^<]+)<\/p>/,
      PROFILE,
    ).map((m) => ({ index: m[1], titleId: m[2], title: m[3], titleAccent: m[4], sub: m[5] }));
    expect(heads).toEqual([
      profileBlockHeads.experience,
      profileBlockHeads.education,
      profileBlockHeads.tech,
    ]);
  });
});

describe('experience.ts: timeline and sticky year (L3575-3655)', () => {
  it('matches every role, in reference order', () => {
    const chunks = PROFILE.split('<li class="pf-role" ')
      .slice(1)
      .map((c) => c.slice(0, c.indexOf('</article>')));
    const parsed = chunks.map((c): ExperienceRole => {
      const head = one(
        /^id="([^"]+)" data-from="([^"]+)" data-to="([^"]+)" data-role="([^"]+)">/,
        c,
      );
      const badges = all(
        /<span class="pf-badge pf-badge--(live|closed)"><span class="[^"]+" aria-hidden="true"><\/span>([^<]+)<\/span>/,
        c,
      );
      expect(badges.length).toBeLessThanOrEqual(1);
      const badge = badges[0];
      const co = one(
        /<span class="pf-co-ic" aria-hidden="true"><svg class="i"><use href="#([^"]+)"\/><\/svg><\/span>([^<]+)<\/p>/,
        c,
      );
      return {
        id: head[1]!,
        number: one(
          /<span class="pf-node" aria-hidden="true"><span>([^<]+)<\/span><\/span>/,
          c,
        )[1]!,
        from: head[2]!,
        to: head[3]!,
        dateLabel: one(/<use href="#i-calendar"\/><\/svg>([^<]+)<\/span>/, c)[1]!,
        title: one(/<h4 class="pf-role__title">([^<]+)<\/h4>/, c)[1]!,
        company: co[2]!,
        companyIcon: co[1]! as ExperienceRole['companyIcon'],
        status: badge ? (badge[1] === 'live' ? 'current' : 'closed') : null,
        statusLabel: badge ? badge[2]! : null,
        yearBoxRole: head[4]!,
        description: one(/<p class="pf-role__desc">([^<]+)<\/p>/, c)[1]!,
        tags: tagsOf(c),
      };
    });
    expect(parsed).toEqual(experience);
  });

  it('matches the sticky year box start state (role 01) and its fixed total', () => {
    const first = experience[0]!;
    const box = between(PROFILE, '<div class="pf-year"', '<div class="pf-tl">');
    expect(box).toContain(
      `<div class="pf-year__line pf-year__line--from"><span class="pf-year__txt is-cur">${first.from}</span></div>`,
    );
    expect(box).toContain(
      `<div class="pf-year__line pf-year__line--to"><span class="pf-year__txt is-cur">${first.to}</span></div>`,
    );
    expect(box).toContain(
      `<span class="pf-year__count"><b class="pf-year__n">${first.number}</b> / ${experienceYearBox.total}</span>`,
    );
    expect(box).toContain(`<span class="pf-year__role">${first.yearBoxRole}</span>`);
    const ticks = one(/<div class="pf-year__ticks">((?:<i[^>]*><\/i>)+)<\/div>/, box)[1]!;
    expect(all(/<i[^>]*><\/i>/, ticks)).toHaveLength(experience.length);
  });
});

describe('education.ts: education cards (L3666-3704)', () => {
  it('matches the featured card and the two small cards, in reference order', () => {
    const chunks = EDU_GRID.split('<article class="card ')
      .slice(1)
      .map((c) => c.slice(0, c.indexOf('</article>')));
    const parsed = chunks.map((c): EducationEntry => {
      const head = one(
        /^(?:card--hover )?pf-edu pf-edu--(feat|sm)" id="([^"]+)" data-spotlight data-reveal(?:="fade")?(?: data-delay="(\d+)")?>/,
        c,
      );
      const title = one(
        /<h4 class="pf-edu__title">([^<]+) <span class="serif">([^<]+)<\/span><\/h4>/,
        c,
      );
      const inst = one(
        /<p class="pf-edu__inst"><svg class="i" aria-hidden="true"><use href="#([^"]+)"\/><\/svg><span>([^<]+)<\/span><\/p>/,
        c,
      );
      const base = {
        id: head[2]!,
        badge: one(/<span class="pf-badge(?: pf-badge--onbrand)?">([^<]+)<\/span>/, c)[1]!,
        years: one(/class="pf-edu__yrs(?: pf-edu__yrs--big)?">([^<]+)</, c)[1]!,
        title: title[1]!,
        titleSerif: title[2]!,
        institution: inst[2]!,
        institutionIcon: inst[1]! as EducationEntry['institutionIcon'],
        description: one(/<p class="pf-edu__desc">([^<]+)<\/p>/, c)[1]!,
        tags: tagsOf(c),
      };
      if (head[1] === 'feat') {
        expect(head[3]).toBeUndefined();
        return {
          ...base,
          variant: 'featured',
          watermark: one(/<span class="pf-edu__mark" aria-hidden="true">([^<]+)<\/span>/, c)[1]!,
          icon: one(
            /<span class="pf-edu__ic" aria-hidden="true"><svg class="i"><use href="#([^"]+)"\/><\/svg><\/span>/,
            c,
          )[1]! as EducationEntry['institutionIcon'],
        };
      }
      return { ...base, variant: 'small', revealDelay: Number(head[3]) };
    });
    expect(parsed).toEqual(education);
  });
});

describe('skills.ts: tabs, rings, languages and core chips (L3716-3790)', () => {
  it('matches the tablist label, the tabs and their panels, in order', () => {
    expect(TECH).toContain(`<div class="pf-tabs" role="tablist" aria-label="${skillTabsLabel}">`);
    const tabs = all(
      /<button class="pf-tab" role="tab" id="([^"]+)" aria-controls="([^"]+)" aria-selected="(?:true|false)" tabindex="-?\d"><svg class="i" aria-hidden="true"><use href="#([^"]+)"\/><\/svg><span>([^<]+)<\/span><\/button>/,
      TECH,
    );
    const panels = TECH.split('role="tabpanel" ')
      .slice(1)
      .map((c) => {
        const head = one(/^id="([^"]+)" aria-labelledby="([^"]+)" tabindex="0">/, c);
        const skills = all(
          /<li class="pf-skill" data-v="(\d+)">.*?<span class="pf-skill__name">([^<]+)<span class="sr-only">: (\d+)%<\/span><\/span><\/li>/,
          c,
        );
        // data-v and the sr-only percentage agree in the reference.
        skills.forEach((m) => expect(m[3]).toBe(m[1]));
        return {
          panelId: head[1]!,
          tabId: head[2]!,
          skills: skills.map((m) => ({ name: m[2]!, value: Number(m[1]) })),
        };
      });
    expect(panels).toHaveLength(tabs.length);
    const parsed = tabs.map((t, i): SkillTab => {
      expect(panels[i]!.panelId).toBe(t[2]);
      expect(panels[i]!.tabId).toBe(t[1]);
      return {
        tabId: t[1]!,
        panelId: t[2]!,
        label: t[4]!,
        icon: t[3]! as SkillTab['icon'],
        skills: panels[i]!.skills,
      };
    });
    expect(parsed).toEqual(skillTabs);
  });

  const CARD_HEAD =
    /<span class="icon-tile icon-tile--soft" aria-hidden="true"><svg class="i"><use href="#([^"]+)"\/><\/svg><\/span>\s*<h4 class="pf-card-head__title">([^<]+)<\/h4>/;

  it('matches the Languages card', () => {
    const card = between(TECH, '<article class="card pf-lang"', '</article>');
    const head = one(CARD_HEAD, card);
    expect([head[1], head[2]]).toEqual([languagesCard.icon, languagesCard.title]);
    const rows = all(
      /<li class="pf-lang__row"><span class="pf-lang__mono" aria-hidden="true">([^<]+)<\/span><span class="pf-lang__name">([^<]+)<\/span><span class="pf-lang__lvl( pf-lang__lvl--native)?">([^<]+)<\/span><\/li>/,
      card,
    ).map((m): LanguageEntry => ({
      mono: m[1]!,
      name: m[2]!,
      level: m[4]!,
      native: m[3] !== undefined,
    }));
    expect(rows).toEqual(languagesCard.items);
  });

  it('matches the Core Expertise card and its 10 chips', () => {
    const card = between(TECH, '<article class="card pf-core"', '</article>');
    const head = one(CARD_HEAD, card);
    expect([head[1], head[2]]).toEqual([coreExpertiseCard.icon, coreExpertiseCard.title]);
    const chips = all(
      /<li class="pf-chipw" data-reveal><span class="pf-chip"><svg class="i" aria-hidden="true"><use href="#([^"]+)"\/><\/svg>([^<]+)<\/span><\/li>/,
      card,
    ).map((m): CoreExpertiseChip => ({ icon: m[1]! as CoreExpertiseChip['icon'], label: m[2]! }));
    expect(chips).toEqual(coreExpertiseCard.chips);
  });
});

describe('counts (REFERENCE_MAP.md 11.4.12)', () => {
  it('has the list sizes of the reference', () => {
    expect(profileHero.stats).toHaveLength(3);
    expect(profileDesk.education.rows).toHaveLength(2);
    expect(profileDesk.experience.rows).toHaveLength(4);
    expect(profileDesk.experience.axis).toHaveLength(5);
    expect(profileDesk.expertise.rings).toHaveLength(3);
    expect(Object.keys(profileBlockHeads)).toEqual(['experience', 'education', 'tech']);
    expect(experience).toHaveLength(4);
    expect(experience.map((r) => r.tags.length)).toEqual([5, 3, 3, 3]);
    expect(education).toHaveLength(3);
    expect(education.map((e) => e.variant)).toEqual(['featured', 'small', 'small']);
    expect(education.map((e) => e.tags.length)).toEqual([4, 3, 3]);
    expect(skillTabs).toHaveLength(4);
    expect(skillTabs.map((t) => t.skills.length)).toEqual([4, 4, 4, 4]);
    expect(languagesCard.items).toHaveLength(2);
    expect(coreExpertiseCard.chips).toHaveLength(10);
  });
});

describe('consistency inside the reference (map 11.4.12 notes)', () => {
  it('numbers the roles 01 to 04 and keeps each badge label in step with its status', () => {
    experience.forEach((role, i) => {
      expect(role.number).toBe(String(i + 1).padStart(2, '0'));
      expect(role.statusLabel).toBe(role.status === null ? null : role.status.toUpperCase());
      expect(role.dateLabel).toBe(`${role.from} - ${role.to}`);
    });
    expect(experienceYearBox.total).toBe(String(experience.length).padStart(2, '0'));
  });

  it('the CV sheet rows repeat the four roles, with bars at (year - 2022) / 4', () => {
    const sheet = profileDesk.experience;
    const first = Number(sheet.axis[0]);
    const span = Number(sheet.axis[sheet.axis.length - 1]) - first;
    expect(sheet.rows).toEqual(
      experience.map((r) => ({
        year: r.from,
        title: r.title,
        company: r.company,
        barStart: (Number(r.from) - first) / span,
        barEnd: (Number(r.to) - first) / span,
        current: r.status === 'current',
      })),
    );
    expect(sheet.href).toBe(`#${experience[0]!.id}`);
    expect([sheet.rangeFrom, sheet.rangeTo]).toEqual([sheet.axis[0], sheet.axis[4]]);
  });

  it('the Education sheet repeats the three education cards', () => {
    const [feat, ...small] = education;
    const sheet = profileDesk.education;
    expect(feat!.variant).toBe('featured');
    if (feat!.variant !== 'featured') return;
    expect(sheet.href).toBe(`#${feat!.id}`);
    expect(sheet.big).toBe(feat!.watermark);
    expect(sheet.icon).toBe(feat!.icon);
    expect(sheet.title).toBe(feat!.title);
    expect(sheet.university).toBe(feat!.institution);
    expect(sheet.years).toBe(feat!.years);
    expect(sheet.rows).toEqual(
      small.map((e) => ({ level: e.titleSerif.slice(1, -1), subject: e.title, years: e.years })),
    );
  });

  it('the Expertise sheet matches the tab values, the first core chip and the 10 chips', () => {
    const values = new Map(skillTabs.flatMap((t) => t.skills.map((s) => [s.name, s.value])));
    for (const ring of profileDesk.expertise.rings) expect(values.get(ring.label)).toBe(ring.value);
    expect(profileDesk.expertise.chip).toEqual(coreExpertiseCard.chips[0]);
    const more = Number(/^\+(\d+) more$/.exec(profileDesk.expertise.more)?.[1]);
    expect(1 + more).toBe(coreExpertiseCard.chips.length);
  });

  it('keeps the tab and panel ids paired by index', () => {
    skillTabs.forEach((tab, i) => {
      expect(tab.tabId).toBe(`pf-tab-${i}`);
      expect(tab.panelId).toBe(`pf-panel-${i}`);
    });
  });
});
