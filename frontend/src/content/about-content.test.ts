import { describe, expect, it } from 'vitest';
import { collectStrings, referenceText, type StringLeaf } from '../../tests/unit/referenceText';
import {
  aboutHero,
  heroRoles,
  heroStats,
  knowMe,
  knowMeHead,
  marqueeAriaLabel,
  marqueeItems,
  orbitBadges,
  orbitDots,
  orbitRings,
  orbitRingText,
  portrait,
} from './about';
import { pricingHead, pricingPlan, talkFirst } from './pricing';
import { services, servicesDefaultOpen, servicesHead } from './services';
import { socials, socialsAriaLabel } from './socials';
import { testimonials, testimonialsHead, testimonialsUi } from './testimonials';

const EM_DASH = String.fromCharCode(0x2014);
const BULLET = String.fromCharCode(0x2022);
const NBSP = String.fromCharCode(0xa0);

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

/** The reference text between two markers (the first marker's first match). */
function refSlice(start: string, end: string): string {
  const src = referenceText();
  const from = src.indexOf(start);
  if (from < 0) throw new Error(`Reference marker not found: ${start}`);
  const to = src.indexOf(end, from + start.length);
  if (to < 0) throw new Error(`Reference marker not found: ${end}`);
  return src.slice(from, to);
}

const allContent = {
  socialsAriaLabel,
  socials,
  aboutHero,
  heroRoles,
  heroStats,
  orbitRings,
  orbitBadges,
  orbitDots,
  orbitRingText,
  portrait,
  marqueeAriaLabel,
  marqueeItems,
  knowMeHead,
  knowMe,
  servicesHead,
  services,
  testimonialsHead,
  testimonialsUi,
  testimonials,
  pricingHead,
  pricingPlan,
  talkFirst,
};

describe('About content is verbatim from the reference', () => {
  it('every copy string appears in the reference', () => {
    // Derived values: rebuild routes and the extracted portrait file (the reference inlines base64).
    const allow = [
      /^portrait\.src$/,
      /^pricingPlan\.cta\.href$/,
      /^pricingPlan\.foot\.href$/,
      /^aboutHero\.cv\.href$/,
    ];
    expect(missingCopy(collectStrings(allContent), allow)).toEqual([]);
  });

  it('holds no em dash (the About copy has none)', () => {
    const leaves = collectStrings(allContent);
    expect(leaves.filter((l) => l.value.includes(EM_DASH))).toEqual([]);
  });

  it('keeps the reference CV file name (served from the same origin)', () => {
    expect(aboutHero.cv.href).toBe('/imgs/Faisal-CVS.pdf');
    expect(referenceText()).toContain(`href="https://faisalhanif.work${aboutHero.cv.href}"`);
  });
});

describe('socials', () => {
  it('lists the 5 hero socials in reference order with href, label and icon', () => {
    const block = refSlice('<ul class="ab-social"', '</ul>');
    const re =
      /<li><a href="([^"]+)" target="_blank" rel="noopener" aria-label="([^"]+)"><svg class="i" aria-hidden="true"><use href="#([\w-]+)"\/>/g;
    const fromRef = [...block.matchAll(re)].map((m) => ({ href: m[1], label: m[2], icon: m[3] }));
    expect(fromRef).toHaveLength(5);
    expect(socials.map(({ href, label, icon }) => ({ href, label, icon }))).toEqual(fromRef);
    expect(socials.map((s) => s.label)).toEqual([
      'LinkedIn',
      'X (Twitter)',
      'GitHub',
      'Quora',
      'Instagram',
    ]);
    expect(block).toContain(`aria-label="${socialsAriaLabel}"`);
  });

  it('has no WhatsApp', () => {
    expect(JSON.stringify(socials).toLowerCase()).not.toContain('whatsapp');
  });
});

describe('About hero', () => {
  it('matches the greeting, name rows, role chip, buttons and scroll cue', () => {
    const src = referenceText();
    expect(src).toContain(`data-delay="80">${aboutHero.greeting}</p>`);
    expect(src).toContain(`<span class="ab-name__row">${aboutHero.nameRows[0]}</span>`);
    expect(src).toContain(`<span class="serif grad-text">${aboutHero.nameRows[1]}</span>`);
    expect(src).toContain(
      `<use href="#${aboutHero.roleChip.icon}"/></svg>${aboutHero.roleChip.label}</span>`,
    );
    expect(src).toContain(`aria-hidden="true">${aboutHero.roleSlash}</span>`);
    expect(src).toContain(`<use href="#${aboutHero.cv.icon}"/></svg>${aboutHero.cv.label}\n`);
    expect(src).toContain(`<use href="#${aboutHero.book.icon}"/></svg>${aboutHero.book.label}\n`);
    expect(aboutHero.book.bookType).toBe('');
    expect(src).toContain(
      `<a class="ab-scroll" href="${aboutHero.scrollCue.href}">\n        <span class="label">${aboutHero.scrollCue.label}</span>`,
    );
  });

  it('has the 5 rolling roles of the typer, in order', () => {
    const roles = [...refSlice('var roles = [', ']').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(heroRoles).toEqual(roles);
    expect(heroRoles).toHaveLength(5);
    expect(referenceText()).toContain(`<span class="sr-only">${heroRoles.join(', ')}</span>`);
    expect(referenceText()).toContain(`id="ab-typer">${heroRoles[0]}</span>`);
  });

  it('has the 3 stats 3+ / 10+ / 3+', () => {
    const block = refSlice('<dl class="ab-stats"', '</dl>');
    const re =
      /<dt class="label">([^<]+)<\/dt>\s*<dd class="stat-num"><span data-count="(\d+)" data-suffix="([^"]*)">0<\/span><\/dd>/g;
    const fromRef = [...block.matchAll(re)].map((m) => ({
      label: m[1],
      value: Number(m[2]),
      suffix: m[3],
    }));
    expect(fromRef).toHaveLength(3);
    expect(heroStats).toEqual(fromRef);
    expect(heroStats.map((s) => `${s.value}${s.suffix}`)).toEqual(['3+', '10+', '3+']);
  });
});

describe('orbital portrait', () => {
  it('has the 8 badges with their data-a angles, icons and rings', () => {
    const re =
      /<span class="ab-sat" data-a="(\d+)"><span class="ab-sat__pill"><span class="ab-sat__ic"><svg class="i"><use href="#([\w-]+)"\/><\/svg><\/span><span class="ab-sat__txt">([^<]+)<\/span>/g;
    const fromRef = [...referenceText().matchAll(re)].map((m, i) => ({
      label: m[3],
      icon: m[2],
      ring: i < 4 ? 2 : 3,
      angleDeg: Number(m[1]),
    }));
    expect(fromRef).toHaveLength(8);
    expect(orbitBadges).toEqual(fromRef);
    expect(orbitBadges.map((b) => [b.label, b.angleDeg])).toEqual([
      ['React', 0],
      ['Node.js', 90],
      ['OpenAI', 180],
      ['AWS', 270],
      ['Next.js', 45],
      ['Claude', 135],
      ['MongoDB', 225],
      ['React Native', 315],
    ]);
    // Ring 2 holds the first four (L3085), ring 3 the last four (L3093).
    const ring2 = refSlice('data-ring="2"', 'data-ring="3"');
    for (const b of orbitBadges) {
      expect(ring2.includes(`<span class="ab-sat__txt">${b.label}</span>`)).toBe(b.ring === 2);
    }
  });

  it('has the 3 rings and the 2 ring 1 dots', () => {
    expect(orbitRings).toHaveLength(3);
    for (const r of orbitRings) {
      const drift = r.drift ? ` data-drift="${r.drift}"` : '';
      expect(referenceText()).toContain(
        `ab-orb__ring--${r.n}" data-ring="${r.n}"${drift} aria-hidden="true">`,
      );
      expect(refSlice(`data-ring="${r.n}"`, '</div>')).toContain(`r="${r.svgR}"`);
    }
    expect(orbitDots).toHaveLength(2);
    for (const d of orbitDots) {
      const cls = d.small ? 'ab-orb__dot ab-orb__dot--sm' : 'ab-orb__dot';
      expect(referenceText()).toContain(
        `<span class="${cls}" data-w="${d.lapsPer100s}" data-a="${d.angleDeg}"></span>`,
      );
    }
  });

  it('keeps the 108 character ring text with its closing no-break space', () => {
    expect(orbitRingText).toHaveLength(108);
    expect(orbitRingText.endsWith(`${BULLET}${NBSP}`)).toBe(true);
    expect(orbitRingText.split(BULLET)).toHaveLength(11);
    expect(referenceText()).toContain(`lengthAdjust="spacing">${orbitRingText}</textPath>`);
  });

  it('describes the portrait image and its fallback monogram', () => {
    expect(referenceText()).toContain(
      `alt="${portrait.alt}" width="${portrait.width}" height="${portrait.height}"`,
    );
    expect(referenceText()).toContain(
      `<span class="ab-portrait__fh">${portrait.monogram.plain}<span class="serif">${portrait.monogram.serif}</span></span>`,
    );
  });
});

describe('marquee', () => {
  it('has the 17 items of the sr-only list in order', () => {
    const list = refSlice('<ul class="sr-only">\n      <li>React.js', '</ul>');
    const fromRef = [...list.matchAll(/<li>([^<]+)<\/li>/g)].map((m) => m[1]);
    expect(fromRef).toHaveLength(17);
    expect(marqueeItems.map((m) => m.label)).toEqual(fromRef);
    expect(referenceText()).toContain(`<div class="ab-marquee" aria-label="${marqueeAriaLabel}">`);
  });

  it('marks the serif items exactly like the visual set', () => {
    const set = refSlice('<div class="ab-marquee__set">', '</div>');
    const fromRef = [...set.matchAll(/<span( class="serif")?>([^<]+)<\/span><i><\/i>/g)].map(
      (m) => ({ label: m[2], serif: Boolean(m[1]) }),
    );
    expect(marqueeItems).toEqual(fromRef);
  });
});

describe('Get to Know Me bento', () => {
  it('matches the section head (the only numbered eyebrow)', () => {
    const src = referenceText();
    expect(src).toContain(
      `<span class="eyebrow"><b>${knowMeHead.eyebrowNum}</b> ${knowMeHead.eyebrow}</span>`,
    );
    expect(src).toContain(
      `data-split>${knowMeHead.titleText} <span class="serif grad-text">${knowMeHead.titleAccent}</span></h2>`,
    );
    expect(src).toContain(`<p class="lead" data-reveal>${knowMeHead.lead}</p>`);
    for (const head of [servicesHead, testimonialsHead, pricingHead]) {
      expect(head.eyebrowNum).toBeUndefined();
      expect(src).toContain(`<span class="eyebrow">${head.eyebrow}</span>`);
      expect(src).toContain(
        `data-split>${head.titleText} <span class="serif grad-text">${head.titleAccent}</span></h2>`,
      );
      expect(src).toContain(`<p class="lead" data-reveal>${head.lead}</p>`);
    }
  });

  it('matches the four cards', () => {
    const src = referenceText();
    const { email, phone, location, availability } = knowMe;
    expect(src).toContain(
      `<p class="ab-kc__value ab-kc__value--email">${email.valueLocal}<wbr>${email.valueDomain}</p>`,
    );
    expect(src).toContain(
      `<a class="ab-act" href="${email.action.href}">${email.action.label} <svg class="i" aria-hidden="true"><use href="#${email.action.icon}"/>`,
    );
    expect(src).toContain(
      `data-copy="${email.copy.value}" aria-label="${email.copy.ariaLabel}">\n            <svg class="i" aria-hidden="true"><use href="#${email.copy.icon}"/></svg><span>${email.copy.label}</span>`,
    );
    expect(src).toContain(`FH.toast('${email.copy.toast}')`);
    expect(src).toContain(
      `<a class="ab-act" href="${phone.action.href}">${phone.action.label} <svg`,
    );
    expect(src).toContain(
      `id="ab-time" aria-live="off">${location.initialTime}</span>\n            <span class="ab-clock__zone"><span class="label">${location.zoneLabel}</span><span class="ab-clock__state" id="ab-state">${location.initialState}</span>`,
    );
    expect(src).toContain(
      `st.textContent = working ? '${location.stateWorking}' : '${location.stateOff}';`,
    );
    expect(src).toContain(`ap = h<12 ? '${location.meridiem.am}' : '${location.meridiem.pm}'`);
    expect(src).toContain(`t.setAttribute('aria-label', '${location.timeAriaPrefix}' + hm`);
    expect(location.ticks).toHaveLength(5);
    expect(src).toContain(location.ticks.map((t) => `<span>${t}</span>`).join(''));
    expect(src).toContain(
      `<span>${availability.valueText} <span class="serif">${availability.valueSerif}</span></span>`,
    );
    expect(availability.book).toBe(aboutHero.book);
    for (const icon of [email.icon, phone.icon, location.icon, availability.icon]) {
      expect(src).toContain(`<use href="#${icon}"/></svg></span>`);
    }
  });
});

describe('services', () => {
  it('has the 4 rows in order with their titles, kickers and index labels', () => {
    const src = referenceText();
    const titles = [
      ...src.matchAll(
        /<span class="ab-svc__num" aria-hidden="true">(\d+)<\/span>\s*<span class="ab-svc__titles"><span class="label">([^<]+)<\/span><span class="ab-svc__title">([^<]+)<\/span>/g,
      ),
    ].map((m) => ({ num: m[1], kicker: m[2], title: m[3] }));
    expect(titles).toHaveLength(4);
    expect(services.map(({ num, kicker, title }) => ({ num, kicker, title }))).toEqual(titles);
    const index = [
      ...refSlice('<ol class="ab-svc-index"', '</ol>').matchAll(/<li data-i="\d">([^<]+)<\/li>/g),
    ].map((m) => m[1]);
    expect(services.map((s) => s.indexLabel)).toEqual(index);
    expect(servicesDefaultOpen).toBe(0);
    expect(src).toContain('<article class="ab-svc is-open" data-spotlight data-reveal>');
  });

  it('has the descriptions, features and tags of each row', () => {
    const src = referenceText();
    const descs = [...src.matchAll(/<p class="ab-svc__desc">([^<]+)<\/p>/g)].map((m) => m[1]);
    expect(services.map((s) => s.description)).toEqual(descs);
    const feats = [...src.matchAll(/<ul class="ab-feats">([\s\S]*?)<\/ul>/g)].map((m) =>
      [...(m[1] ?? '').matchAll(/<\/svg>([^<]+)<\/li>/g)].map((f) => f[1]),
    );
    expect(services.map((s) => s.features)).toEqual(feats);
    expect(services.map((s) => s.features.length)).toEqual([3, 3, 3, 3]);
    const svcBlock = refSlice('<div class="ab-svc-list"', '<!-- ============ TESTIMONIALS');
    const tags = [...svcBlock.matchAll(/<div class="tags">(.*?)<\/div>/g)].map((m) =>
      [...(m[1] ?? '').matchAll(/<span class="tag">([^<]+)<\/span>/g)].map((t) => t[1]),
    );
    expect(services.map((s) => s.tags)).toEqual(tags);
    expect(services.map((s) => s.tags.length)).toEqual([9, 9, 6, 5]);
  });

  it('marks only row 3 as the AI variant', () => {
    expect(services.map((s) => s.variant)).toEqual([undefined, undefined, 'ai', undefined]);
    expect(referenceText().split('<article class="ab-svc ab-svc--ai"')).toHaveLength(2);
  });
});

describe('testimonials', () => {
  it('has the 3 slides in order', () => {
    const block = refSlice('<div class="ab-slides"', '<div class="ab-dots"');
    const quotes = [...block.matchAll(/<blockquote class="ab-quote">([^<]+)<\/blockquote>/g)].map(
      (m) => m[1],
    );
    const authors = [
      ...block.matchAll(
        /<span class="ab-avatar" aria-hidden="true">(\w+)<\/span>\s*<span class="ab-author__txt"><strong>([^<]+)<\/strong><span>([^<]+)<\/span>/g,
      ),
    ].map((m) => ({ initials: m[1], name: m[2], role: m[3] }));
    const tags = [...block.matchAll(/<div class="tags">(.*?)<\/div>/g)].map((m) =>
      [...(m[1] ?? '').matchAll(/<span class="tag">([^<]+)<\/span>/g)].map((t) => t[1]),
    );
    expect(testimonials).toHaveLength(3);
    expect(testimonials.map((t) => t.quote)).toEqual(quotes);
    expect(testimonials.map(({ initials, name, role }) => ({ initials, name, role }))).toEqual(
      authors,
    );
    expect(testimonials.map((t) => t.tags)).toEqual(tags);
  });

  it('flags Sarah Johnson (TechCorp) and Emily Rodriguez (AppSolutions) for confirmation', () => {
    expect(testimonials.filter((t) => t.needsConfirmation).map((t) => t.name)).toEqual([
      'Sarah Johnson',
      'Emily Rodriguez',
    ]);
  });

  it('keeps the carousel labels and the " / 03" counter', () => {
    const src = referenceText();
    expect(testimonialsUi.counterTotal).toBe(' / 03');
    expect(testimonialsUi.counterTotal).toBe(` / ${String(testimonials.length).padStart(2, '0')}`);
    expect(src).toContain(`<b id="ab-tst-cur">01</b>${testimonialsUi.counterTotal}</span>`);
    expect(src).toContain(`data-tst="prev" aria-label="${testimonialsUi.prevLabel}"`);
    expect(src).toContain(`data-tst="next" aria-label="${testimonialsUi.nextLabel}"`);
    expect(src).toContain(
      `role="region" aria-roledescription="${testimonialsUi.carouselRole}" aria-label="${testimonialsUi.carouselLabel}"`,
    );
    expect(src).toContain(`data-parallax="0.07">${testimonialsUi.quoteMark}</span>`);
    testimonials.forEach((_, i) => {
      expect(src).toContain(
        `role="group" aria-roledescription="${testimonialsUi.slideRole}" aria-label="${i + 1}${testimonialsUi.slideLabelJoin}${testimonials.length}"`,
      );
      expect(src).toContain(`aria-label="${testimonialsUi.dotLabelPrefix}${i + 1}"`);
    });
    expect(src).toContain(
      `<div class="ab-dots" role="group" aria-label="${testimonialsUi.dotsLabel}">`,
    );
  });
});

describe('pricing', () => {
  it('matches the plan card and its $25 count up', () => {
    const src = referenceText();
    expect(src).toContain(`<h3 class="ab-plan__name">${pricingPlan.name}</h3>`);
    expect(src).toContain(`<p class="ab-plan__kicker label">${pricingPlan.kicker}</p>`);
    expect(src).toContain(
      `<span class="ab-plan__cur">${pricingPlan.currency}</span><span class="ab-plan__amt" data-count="${pricingPlan.amount}" data-duration="${pricingPlan.countDurationMs}">0</span><span class="ab-plan__per">${pricingPlan.per}</span>`,
    );
    expect(pricingPlan.amount).toBe(25);
    const list = [
      ...refSlice('<ul class="ab-plan__list">', '</ul>').matchAll(/<\/svg>([^<]+)<\/li>/g),
    ].map((m) => m[1]);
    expect(pricingPlan.features).toEqual(list);
    expect(pricingPlan.features).toHaveLength(7);
    expect(src).toContain(
      `data-magnetic="${pricingPlan.cta.magnetic}">${pricingPlan.cta.label} <svg class="i" aria-hidden="true"><use href="#${pricingPlan.cta.icon}"/>`,
    );
    expect(src).toContain(
      `<p class="ab-plan__foot">${pricingPlan.foot.text}<a href="#contact">${pricingPlan.foot.linkLabel}</a></p>`,
    );
    expect(pricingPlan.cta.href).toBe('/contact');
    expect(pricingPlan.foot.href).toBe('/contact');
  });

  it('matches the Talk first aside: 2 sessions, 3 mini stats, 2 notes', () => {
    const aside = refSlice('<aside class="ab-side"', '</aside>');
    expect(aside).toContain(`aria-label="${talkFirst.ariaLabel}"`);
    expect(aside).toContain(`<span class="label">${talkFirst.label}</span>`);
    expect(aside).toContain(`<p class="ab-side__title">${talkFirst.title}</p>`);

    const sessions = [
      ...aside.matchAll(
        /<button class="card card--hover ab-sess" type="button" data-book(?:="(\w+)")? data-spotlight data-reveal>\s*<span class="ab-sess__time"><b>(\d+)<\/b><span>(\w+)<\/span><\/span>\s*<span class="ab-sess__txt"><strong>([^<]+)<\/strong><span>([^<]+)<\/span><\/span>\s*<span class="ab-sess__price">([^<]+)<span>([^<]+)<\/span><\/span>/g,
      ),
    ].map((m) => ({
      bookType: m[1] ?? '',
      minutes: m[2],
      unit: m[3],
      name: m[4],
      description: m[5],
      price: m[6],
      priceNote: m[7],
    }));
    expect(sessions).toHaveLength(2);
    expect(talkFirst.sessions).toEqual(sessions);

    const mini = [
      ...aside.matchAll(/<div><dt class="label">([^<]+)<\/dt><dd>([^<]+)<\/dd><\/div>/g),
    ].map((m) => ({ label: m[1], value: m[2] }));
    expect(mini).toHaveLength(3);
    expect(talkFirst.mini).toEqual(mini);

    const notes = [
      ...aside.matchAll(
        /<li><svg class="i" aria-hidden="true"><use href="#([\w-]+)"\/><\/svg>([^<]+)<\/li>/g,
      ),
    ].map((m) => ({ icon: m[1], text: m[2] }));
    expect(notes).toHaveLength(2);
    expect(talkFirst.notes).toEqual(notes);
  });

  it('keeps the sessions in line with the booking modal TYPES (L5798-5801)', () => {
    const src = referenceText();
    const [quick, deep] = talkFirst.sessions;
    expect(quick?.bookType).toBe('');
    expect(deep?.bookType).toBe('deep');
    for (const [key, s] of [
      ['quick', quick],
      ['deep', deep],
    ] as const) {
      expect(s).toBeDefined();
      if (!s) continue;
      expect(src).toMatch(
        new RegExp(
          `${key}:\\s*\\{ name:'${s.name}', dur:'${s.minutes} minutes', mins:${s.minutes}, price:${s.price.slice(1)},`,
        ),
      );
    }
  });
});
