/**
 * Profile page content (route /profile): the hero copy column, the three résumé sheets on the hero
 * desk and the heads of the three body blocks. Every value is copied from the reference
 * (HTML L3437-3564, L3578-3582, L3659-3664, L3708-3713). Pure data: no React, no side effects.
 *
 * The experience roles, education cards and skill tabs of the body live in experience.ts,
 * education.ts and skills.ts. The desk sheets repeat some of those facts as their own copy, exactly
 * like the reference does; profile-content.test.ts checks that the two stay consistent.
 */

/** Shell sprite symbol ids (reference L2884-2947) named by the Profile content modules. */
export type ProfileIconId =
  | 'i-briefcase'
  | 'i-building'
  | 'i-check-circle'
  | 'i-cloud'
  | 'i-code'
  | 'i-cpu'
  | 'i-download'
  | 'i-eye'
  | 'i-globe'
  | 'i-grad'
  | 'i-grid'
  | 'i-layers'
  | 'i-phone-dev'
  | 'i-pin'
  | 'i-rocket'
  | 'i-server'
  | 'i-sparkles'
  | 'i-zap';

/* ------------------------------------------------------------------ hero copy column */

/** A counted stat: `<span class="pf-count" data-to={to}>{to}</span><span class="pf-hstat__suf">{suffix}</span>`. */
export interface HeroCountStat {
  kind: 'count';
  /** dt.pf-hstat__label */
  label: string;
  /** data-to, and the markup text before and after the count up. */
  to: number;
  /** span.pf-hstat__suf */
  suffix: string;
}

/** The degree stat: `{text}<span class="serif grad-text pf-hstat__se">{serifText}</span>`. */
export interface HeroDegreeStat {
  kind: 'degree';
  /** dt.pf-hstat__label */
  label: string;
  /** Plain part of dd.pf-hstat__val. */
  text: string;
  /** span.serif.grad-text.pf-hstat__se */
  serifText: string;
}

export type HeroStat = HeroCountStat | HeroDegreeStat;

export interface ProfileHero {
  /** span.eyebrow.pf-hi (L3444). */
  eyebrow: string;
  /** h1#pf-title line A, span.pf-ln--a (L3446). */
  titleLineA: string;
  /** h1#pf-title line B, inside span.serif.grad-text (L3447). */
  titleLineB: string;
  /** p.lead.pf-hero__lead (L3449). Holds one of the reference's em dashes. */
  lead: string;
  /**
   * a.btn.btn--primary.pf-cv (L3451). The link is rendered with href = asset(assetPath), plus the
   * `download` and `data-magnetic` attributes, like profile.js L6622-6623.
   */
  cvCta: { label: string; assetPath: string; icon: ProfileIconId };
  /** a.btn.btn--ghost.pf-goexp (L3452). */
  experienceCta: { label: string; href: string; icon: ProfileIconId };
  /** dl.pf-hstats, in order (L3454-3467). */
  stats: readonly HeroStat[];
  /** a.pf-cue in the hero foot (L3561). */
  cue: { label: string; href: string };
}

export const profileHero: ProfileHero = {
  eyebrow: 'Professional Journey',
  titleLineA: 'My Professional',
  titleLineB: 'Profile',
  lead: 'A comprehensive overview of my experience, education, and technical expertise in software engineering and AI/LLM integration \u2014 building intelligent, production-ready applications.',
  cvCta: { label: 'Download CV', assetPath: 'imgs/Faisal-CVS.pdf', icon: 'i-download' },
  experienceCta: { label: 'View experience', href: '#pf-exp', icon: 'i-briefcase' },
  stats: [
    { kind: 'count', label: 'Years Coding', to: 3, suffix: '+' },
    { kind: 'degree', label: 'Degree', text: 'BS', serifText: '-SE' },
    { kind: 'count', label: 'Companies', to: 3, suffix: '+' },
  ],
  cue: { label: 'Scroll to explore', href: '#pf-exp' },
};

/* ------------------------------------------------------------------ hero desk (three sheets) */

/** One line of the education sheet list: `<span>{level} <em>{subject}</em></span><span>{years}</span>`. */
export interface DeskEducationRow {
  level: string;
  subject: string;
  years: string;
}

/** Back sheet, a.pf-sheet.pf-sheet--edu (L3475-3491). */
export interface DeskEducationSheet {
  href: string;
  /** The link's aria-label (replaces the inner text for screen readers). */
  ariaLabel: string;
  /** span.pf-sh__no: `{number} <i>/</i> {label}`. */
  number: string;
  label: string;
  /** Icon in span.pf-sh__ic. */
  icon: ProfileIconId;
  /** span.pf-ed__big.serif */
  big: string;
  /** span.pf-ed__t */
  title: string;
  /** span.pf-ed__u */
  university: string;
  /** span.pf-ed__y */
  years: string;
  /** span.pf-ed__list rows, in order. */
  rows: readonly DeskEducationRow[];
}

/** One row of the CV sheet's mini timeline, span.pf-xp__row (L3502-3522). */
export interface DeskXpRow {
  /** span.pf-xp__yr */
  year: string;
  /** b inside span.pf-xp__t */
  title: string;
  /** span inside span.pf-xp__t */
  company: string;
  /** Inline --a: bar start on the 2022 to 2026 axis (0 to 1). */
  barStart: number;
  /** Inline --b: bar end on the 2022 to 2026 axis (0 to 1). */
  barEnd: number;
  /** Adds .is-cur and the span.pf-xp__now pill (dot-live + currentLabel). */
  current: boolean;
}

/** Middle sheet (the CV), a.pf-sheet.pf-sheet--exp (L3493-3526). */
export interface DeskExperienceSheet {
  href: string;
  ariaLabel: string;
  /** span.pf-sh__mono */
  mono: string;
  /** span.serif inside span.pf-sh__cv */
  cvTitle: string;
  /** span.pf-sh__who */
  who: string;
  /** span.pf-sh__no: `{number} <i>/</i> {label}`. */
  number: string;
  label: string;
  /** span.pf-sh__range: `{rangeFrom} <i>&rarr;</i> {rangeTo}`. */
  rangeFrom: string;
  rangeTo: string;
  /** Text of span.pf-xp__now on the current row (CSS shows it upper case). */
  currentLabel: string;
  rows: readonly DeskXpRow[];
  /** span.pf-xp__axis labels, left to right. */
  axis: readonly string[];
}

/** One ring on the expertise sheet, span.pf-mr__i (L3535-3537). */
export interface DeskRing {
  /** data-v, the bar circle's inline --v and the static b.pf-mr__n text ("%" comes from CSS). */
  value: number;
  /** span.pf-mr__l */
  label: string;
}

/** Front sheet, a.pf-sheet.pf-sheet--skl (L3528-3541). */
export interface DeskExpertiseSheet {
  href: string;
  ariaLabel: string;
  /** span.pf-sh__no: `{number} <i>/</i> {label}`. */
  number: string;
  label: string;
  rings: readonly DeskRing[];
  /** span.pf-sk__chip */
  chip: { icon: ProfileIconId; label: string };
  /** span.pf-sk__more */
  more: string;
}

/** span.pf-seal (L3543-3551). */
export interface DeskSeal {
  /** textPath text on the ring. */
  ringText: string;
  /** text.pf-seal__fh */
  mark: string;
}

export interface ProfileDesk {
  /** div.pf-desk[role="group"] aria-label. */
  ariaLabel: string;
  /** p.pf-desk__hint: `<span class="pf-desk__n">{count}</span>{text}`. */
  hint: { count: string; text: string };
  education: DeskEducationSheet;
  experience: DeskExperienceSheet;
  expertise: DeskExpertiseSheet;
  seal: DeskSeal;
}

export const profileDesk: ProfileDesk = {
  ariaLabel: 'Résumé pages. Choose one to jump to that section.',
  hint: { count: '03', text: 'Three pages, one career. Pick one to jump to it.' },
  education: {
    href: '#pf-edu-bs',
    ariaLabel:
      'Education: Software Engineering (BS-SE), University of Management and Technology, Lahore, 2020 to 2024. Jump to education.',
    number: '02',
    label: 'Education',
    icon: 'i-grad',
    big: 'BS-SE',
    title: 'Software Engineering',
    university: 'University of Management & Technology, Lahore',
    years: '2020 - 2024',
    rows: [
      { level: 'Inter', subject: 'Computer Science', years: '2018 - 2020' },
      { level: 'Matric', subject: 'Computer Science', years: '2016 - 2018' },
    ],
  },
  experience: {
    href: '#pf-role-techxelo',
    ariaLabel:
      'Experience: four roles from 2022 to 2026, currently Software Engineer at TechXelo. Jump to experience.',
    mono: 'FH',
    cvTitle: 'Curriculum Vitae',
    who: 'Faisal Hanif · Software Engineer',
    number: '01',
    label: 'Experience',
    rangeFrom: '2022',
    rangeTo: '2026',
    currentLabel: 'Current',
    rows: [
      {
        year: '2024',
        title: 'Software Engineer',
        company: 'TechXelo',
        barStart: 0.5,
        barEnd: 1,
        current: true,
      },
      {
        year: '2023',
        title: 'Freelance Developer',
        company: 'Upwork Platform',
        barStart: 0.25,
        barEnd: 0.5,
        current: false,
      },
      {
        year: '2023',
        title: 'Outsourcing Engineer',
        company: 'UHA International',
        barStart: 0.25,
        barEnd: 0.5,
        current: false,
      },
      {
        year: '2022',
        title: 'React Native Developer',
        company: 'Viral Square',
        barStart: 0,
        barEnd: 0.25,
        current: false,
      },
    ],
    axis: ['2022', '2023', '2024', '2025', '2026'],
  },
  expertise: {
    href: '#pf-skills',
    ariaLabel:
      'Expertise: React.js 95%, JavaScript 90%, OpenAI API 85%, and ten core areas. Jump to technical expertise.',
    number: '03',
    label: 'Expertise',
    rings: [
      { value: 95, label: 'React.js' },
      { value: 90, label: 'JavaScript' },
      { value: 85, label: 'OpenAI API' },
    ],
    chip: { icon: 'i-sparkles', label: 'AI/LLM Integration' },
    more: '+9 more',
  },
  seal: { ringText: 'SOFTWARE ENGINEER · LAHORE · 2026 ·', mark: 'FH' },
};

/* ------------------------------------------------------------------ body block heads */

export type ProfileBlockId = 'experience' | 'education' | 'tech';

/**
 * div.pf-bhead of a body block: span.label.pf-bhead__idx, then
 * `<h3 id={titleId} data-split>{title} <span class="serif grad-text">{titleAccent}</span></h3>`,
 * then p.pf-bhead__sub.
 */
export interface BlockHead {
  index: string;
  titleId: string;
  /** Plain first word of the h3. */
  title: string;
  /** span.serif.grad-text part of the h3. */
  titleAccent: string;
  sub: string;
}

export const profileBlockHeads: Readonly<Record<ProfileBlockId, BlockHead>> = {
  experience: {
    index: '02.1',
    titleId: 'pf-exp-title',
    title: 'Professional',
    titleAccent: 'Experience',
    sub: 'My journey through the tech industry',
  },
  education: {
    index: '02.2',
    titleId: 'pf-edu-title',
    title: 'Educational',
    titleAccent: 'Background',
    sub: 'My academic foundation and learning journey',
  },
  tech: {
    index: '02.3',
    titleId: 'pf-tech-title',
    title: 'Technical',
    titleAccent: 'Expertise',
    sub: 'My technical skills and proficiency levels',
  },
};
