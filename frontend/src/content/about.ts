/**
 * About page content (route /): the hero (greeting, name, rolling role, CV and Book buttons,
 * stats, orbital portrait), the tech stack marquee and the "Get to Know Me" bento. Every value is
 * copied from the reference (HTML L3004-3208, about.js L4787-5174). The socials live in
 * socials.ts, the services, testimonials and pricing sections in their own files.
 * Pure data: no React, no side effects.
 *
 * Label text is kept in its source case; `.label` and `.eyebrow` uppercase it in CSS.
 */
import type { SectionHead } from './services';
import { contactFacts, site } from './site';

/* ------------------------------------------------------------------ hero copy */

export interface AboutHero {
  /** p.ab-hello (L3023). */
  greeting: string;
  /** h1.ab-name rows (L3026-3027): row 1 plain, row 2 wrapped in span.serif.grad-text. */
  nameRows: [string, string];
  /** span.ab-role__chip: icon, then the label (L3031). */
  roleChip: { label: string; icon: 'i-code' };
  /** span.ab-role__slash (aria-hidden) before the rolling role (L3033). */
  roleSlash: string;
  /** Download CV link (L3040-3042): download, data-cv, data-magnetic; icon before the label. */
  cv: { label: string; icon: 'i-download'; href: string };
  /** Book Meeting button (L3043-3045): data-book="" opens Quick Chat; icon before the label. */
  book: { label: string; icon: 'i-calendar'; bookType: '' };
  /** a.ab-scroll (L3121-3124): span.label, then the i-arrow-right button. */
  scrollCue: { label: string; href: string };
}

/** The Book Meeting button of the hero and of the availability card (data-book="", Quick Chat). */
const bookMeeting = { label: 'Book Meeting', icon: 'i-calendar', bookType: '' } as const;

export const aboutHero: AboutHero = {
  greeting: "Hi there! I'm",
  nameRows: ['Faisal', 'Hanif'],
  roleChip: { label: site.role, icon: 'i-code' },
  roleSlash: '/',
  cv: { label: 'Download CV', icon: 'i-download', href: site.cvPath },
  book: bookMeeting,
  scrollCue: { label: 'Scroll to explore', href: '#ab-know' },
};

/**
 * Rolling role words in order (about.js L4818). The first is the static text of #ab-typer (L3034)
 * and the sr-only line is heroRoles.join(', ') (L3035).
 */
export const heroRoles: readonly string[] = [
  'Frontend Development',
  'Backend Development',
  'Database Management',
  'System Design',
  'Cloud Orchestration',
];

/* ------------------------------------------------------------------ hero stats */

/**
 * dl.ab-stats (L3056-3069): dt.label, then dd.stat-num with
 * `<span data-count={value} data-suffix={suffix}>0</span>`. No data-duration, so the count up uses
 * its default duration.
 */
export interface HeroStat {
  label: string;
  value: number;
  suffix: string;
}

/** Kept as the reference states them (orchestrator decision). */
export const heroStats: readonly HeroStat[] = [
  { label: 'Years Coding', value: 3, suffix: '+' },
  { label: 'Projects', value: 10, suffix: '+' },
  { label: 'Companies', value: 3, suffix: '+' },
];

/* ------------------------------------------------------------------ orbital portrait */

/** Symbols of the badge icons: the About page sprite (L3007-3017) plus i-phone-dev (shell sprite). */
export type OrbitIcon =
  | 'ab-ic-react'
  | 'ab-ic-node'
  | 'ab-ic-openai'
  | 'ab-ic-aws'
  | 'ab-ic-next'
  | 'ab-ic-claude'
  | 'ab-ic-mongo'
  | 'i-phone-dev';

/** div.ab-orb__ring--{n} (data-ring, L3079-3099). */
export interface OrbitRing {
  n: 1 | 2 | 3;
  /** r attribute of the SVG circle; the CSS `r` property overrides it (map note). */
  svgR: string;
  /** data-drift: dash offset per unit of t (pathLength 360). 0 = no data-drift attribute. */
  drift: number;
}

/** span.ab-sat on ring 2 or 3: pill with the icon and span.ab-sat__txt. */
export interface OrbitBadge {
  label: string;
  icon: OrbitIcon;
  ring: 2 | 3;
  /** data-a in degrees; 0 = 3 o'clock, positive = clockwise. */
  angleDeg: number;
}

/** span.ab-orb__dot on ring 1. */
export interface OrbitDot {
  ring: 1;
  /** data-a in degrees. */
  angleDeg: number;
  /** data-w: laps per 100 s. */
  lapsPer100s: number;
  /** Adds the class ab-orb__dot--sm. */
  small: boolean;
}

export const orbitRings: readonly OrbitRing[] = [
  { n: 1, svgR: '34.5%', drift: 0 },
  { n: 2, svgR: '41.5%', drift: -2 },
  { n: 3, svgR: '49.5%', drift: 0 },
];

/** Badges in markup order (L3087-3090 on ring 2, L3095-3098 on ring 3). */
export const orbitBadges: readonly OrbitBadge[] = [
  { label: 'React', icon: 'ab-ic-react', ring: 2, angleDeg: 0 },
  { label: 'Node.js', icon: 'ab-ic-node', ring: 2, angleDeg: 90 },
  { label: 'OpenAI', icon: 'ab-ic-openai', ring: 2, angleDeg: 180 },
  { label: 'AWS', icon: 'ab-ic-aws', ring: 2, angleDeg: 270 },
  { label: 'Next.js', icon: 'ab-ic-next', ring: 3, angleDeg: 45 },
  { label: 'Claude', icon: 'ab-ic-claude', ring: 3, angleDeg: 135 },
  { label: 'MongoDB', icon: 'ab-ic-mongo', ring: 3, angleDeg: 225 },
  { label: 'React Native', icon: 'i-phone-dev', ring: 3, angleDeg: 315 },
];

/** Ring 1 dots (L3081-3082). */
export const orbitDots: readonly OrbitDot[] = [
  { ring: 1, angleDeg: -60, lapsPer100s: 1.4, small: false },
  { ring: 1, angleDeg: 120, lapsPer100s: 1.4, small: true },
];

/**
 * Rotating text band (textPath on #ab-ring-path, L3104; textLength 5529.2, lengthAdjust spacing).
 * 108 characters: bullets are U+2022 and the last one is followed by U+00A0 (&#160;), not a space.
 */
export const orbitRingText =
  'SOFTWARE ENGINEER \u2022 AI / LLM \u2022 WEB \u2022 MOBILE \u2022 CLOUD \u2022 SOFTWARE ENGINEER \u2022 AI / LLM \u2022 WEB \u2022 MOBILE \u2022 CLOUD \u2022\u00a0';

/** figure.ab-portrait (L3106-3115). */
export const portrait = {
  /** The base64 webp of L3112, extracted to public/images (fe-06). */
  src: '/images/portrait-faisal.webp',
  alt: 'Portrait of Faisal Hanif',
  width: 498,
  height: 696,
  /** span.ab-portrait__fh under the image, seen when it fails to load: "F" + span.serif "H" (L3110). */
  monogram: { plain: 'F', serif: 'H' },
} as const;

/* ------------------------------------------------------------------ marquee */

export interface MarqueeItem {
  label: string;
  /** Rendered as span.serif in the visual set (every second item). */
  serif: boolean;
}

/** aria-label of div.ab-marquee (L3129). */
export const marqueeAriaLabel = 'Tech stack';

/**
 * One set, in order (L3131 sr-only list, L3135 visual set). The track renders the set twice
 * (L3133-3140, both sets identical), each item followed by an empty <i>.
 */
export const marqueeItems: readonly MarqueeItem[] = [
  { label: 'React.js', serif: false },
  { label: 'Next.js', serif: true },
  { label: 'TypeScript', serif: false },
  { label: 'Node.js', serif: true },
  { label: 'Express.js', serif: false },
  { label: 'MongoDB', serif: true },
  { label: 'SQL', serif: false },
  { label: 'React Native', serif: true },
  { label: 'Expo', serif: false },
  { label: 'OpenAI', serif: true },
  { label: 'Claude', serif: false },
  { label: 'LangChain', serif: true },
  { label: 'LangGraph', serif: false },
  { label: 'AWS', serif: true },
  { label: 'Docker', serif: false },
  { label: 'Vercel', serif: true },
  { label: 'Tailwind CSS', serif: false },
];

/* ------------------------------------------------------------------ Get to Know Me (bento) */

/** div.sec-head.ab-head-split of div.ab-block#ab-know (L3145-3149): the only numbered eyebrow. */
export const knowMeHead: SectionHead = {
  eyebrowNum: '01',
  eyebrow: 'About',
  titleText: 'Get to',
  titleAccent: 'Know Me',
  lead: 'The quickest ways to reach me, and where I am right now.',
};

/** A card action link: a.ab-act, the label, a space, then the icon. */
export interface KnowMeAction {
  label: string;
  href: string;
  icon: 'i-arrow-up-right';
}

export interface KnowMeContent {
  /** article.ab-kc--email (L3152-3164). */
  email: {
    label: string;
    icon: 'i-mail';
    /** p.ab-kc__value--email renders `{valueLocal}<wbr>{valueDomain}`. */
    valueLocal: string;
    valueDomain: string;
    action: KnowMeAction;
    /**
     * button.ab-copy: data-copy={value}, aria-label, icon, then span {label}. On success the toast
     * says {toast}; when copying fails the toast shows the address itself (L5013-5022).
     */
    copy: { label: string; ariaLabel: string; value: string; icon: 'i-file'; toast: string };
  };
  /** article.ab-kc--phone (L3166-3175). */
  phone: {
    label: string;
    icon: 'i-phone';
    value: string;
    action: KnowMeAction;
  };
  /** article.ab-kc--loc with the live Lahore clock (L3177-3194, clock script L4996-5009). */
  location: {
    label: string;
    icon: 'i-pin';
    value: string;
    /** span.label in the clock zone. */
    zoneLabel: string;
    /** Server text of #ab-time and #ab-state before the first tick. */
    initialTime: string;
    initialState: string;
    /** #ab-state text inside and outside working hours. */
    stateWorking: string;
    stateOff: string;
    /** #ab-time renders `{h}:{mm}<small>{AM|PM}</small>` (hour without a leading zero). */
    meridiem: { am: string; pm: string };
    /** #ab-time aria-label: `${timeAriaPrefix}${h}:${mm} ${AM|PM}`. */
    timeAriaPrefix: string;
    /** div.ab-day__ticks spans (aria-hidden). */
    ticks: string[];
  };
  /** article.ab-kc--avail (L3196-3208). */
  availability: {
    label: string;
    icon: 'i-calendar';
    /** Renders `<span>{valueText} <span class="serif">{valueSerif}</span></span>` after span.ab-live. */
    valueText: string;
    valueSerif: string;
    /** button.btn.ab-btn-light with data-book="" (Quick Chat); icon before the label. */
    book: { label: string; icon: 'i-calendar'; bookType: '' };
  };
}

const emailAt = contactFacts.email.indexOf('@');

export const knowMe: KnowMeContent = {
  email: {
    label: 'Email',
    icon: 'i-mail',
    valueLocal: contactFacts.email.slice(0, emailAt),
    valueDomain: contactFacts.email.slice(emailAt),
    action: {
      label: 'Send Email',
      href: `mailto:${contactFacts.email}`,
      icon: 'i-arrow-up-right',
    },
    copy: {
      label: 'Copy',
      ariaLabel: 'Copy email address',
      value: contactFacts.email,
      icon: 'i-file',
      toast: 'Email copied to clipboard',
    },
  },
  phone: {
    label: 'Phone',
    icon: 'i-phone',
    value: contactFacts.phone.display,
    action: { label: 'Call Now', href: contactFacts.phone.href, icon: 'i-arrow-up-right' },
  },
  location: {
    label: 'Location',
    icon: 'i-pin',
    value: contactFacts.location,
    zoneLabel: contactFacts.gmtLabel,
    initialTime: '--:--',
    initialState: 'Local time',
    stateWorking: 'In working hours',
    stateOff: 'Outside working hours',
    meridiem: { am: 'AM', pm: 'PM' },
    timeAriaPrefix: 'Local time in Lahore ',
    ticks: ['00', '06', '12', '18', '24'],
  },
  availability: {
    label: 'Availability',
    icon: 'i-calendar',
    valueText: 'Open to',
    valueSerif: 'Work',
    book: bookMeeting,
  },
};
