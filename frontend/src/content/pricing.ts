/**
 * About page, "Investment Plans" (div.ab-price, reference L3374-3433): the section head, the plan
 * card with its $25 count up and the "Talk first" aside with its two session buttons and side card.
 * Pure data: no React, no side effects.
 *
 * Content kept as the reference has it (orchestrator decision): "Projects Completed 10+" repeats the
 * hero "Projects 10+", and "Response Time 24h" is one of several response time texts on the site
 * (Contact also says "2-4 hours" and "24 hours").
 */
import type { SectionHead } from './services';
import { pageById, type SitePath } from './site';

export interface PricingPlan {
  /** h3.ab-plan__name */
  name: string;
  /** p.ab-plan__kicker.label */
  kicker: string;
  /** icon-tile symbol. */
  icon: 'i-zap';
  /** span.ab-plan__cur */
  currency: string;
  /** data-count of span.ab-plan__amt (the markup text is 0 until the count up runs). */
  amount: number;
  /** data-duration of the count up in ms (L3391). */
  countDurationMs: number;
  /** span.ab-plan__per */
  per: string;
  /** ul.ab-plan__list items, each after an i-check icon. */
  features: string[];
  /**
   * a.btn.btn--primary.ab-plan__cta with data-magnetic (L3401). The label is uppercase in the source
   * itself; it is followed by a space and the icon. The reference linked "#contact".
   */
  cta: { label: string; href: SitePath; icon: 'i-arrow-right'; magnetic: number };
  /** p.ab-plan__foot: text (with its trailing space), then the link (L3402). */
  foot: { text: string; linkLabel: string; href: SitePath };
}

export const pricingHead: SectionHead = {
  eyebrow: 'Pricing',
  titleText: 'Investment',
  titleAccent: 'Plans',
  lead: 'One clear hourly rate for full stack and AI work.',
};

const contactPath = pageById('contact').path;

export const pricingPlan: PricingPlan = {
  name: 'Professional',
  kicker: 'Full Stack + AI Power',
  icon: 'i-zap',
  currency: '$',
  amount: 25,
  countDurationMs: 1400,
  per: '/hour',
  features: [
    'AI/LLM Integration',
    'Frontend',
    'Backend API',
    'Database',
    'Performance',
    'Cloud',
    'Maintenance',
  ],
  cta: { label: 'GET STARTED', href: contactPath, icon: 'i-arrow-right', magnetic: 0.15 },
  foot: {
    text: 'Need a custom solution? ',
    linkLabel: "Let's discuss your project",
    href: contactPath,
  },
};

/* ------------------------------------------------------------------ Talk first aside */

/**
 * button.card.card--hover.ab-sess (L3411-3420). Same sessions as the booking modal TYPES
 * (L5798-5801: Quick Chat 30 minutes $15, Technical Deep Dive 60 minutes $25); about-content.test.ts
 * checks that they match.
 */
export interface TalkFirstSession {
  /** Value of data-book: '' opens Quick Chat, 'deep' opens Technical Deep Dive. */
  bookType: '' | 'deep';
  /** span.ab-sess__time: <b>{minutes}</b><span>{unit}</span> */
  minutes: string;
  unit: string;
  /** span.ab-sess__txt: <strong>{name}</strong><span>{description}</span> */
  name: string;
  description: string;
  /** span.ab-sess__price: {price}<span>{priceNote}</span> */
  price: string;
  priceNote: string;
}

/** One dl.ab-mini item: dt.label then dd (L3423-3425). */
export interface MiniStat {
  label: string;
  value: string;
}

/** One ul.ab-side__notes item: icon then text (L3428-3429). */
export interface TalkFirstNote {
  icon: 'i-video' | 'i-globe';
  text: string;
}

export interface TalkFirst {
  /** aria-label of aside.ab-side (L3406). */
  ariaLabel: string;
  /** div.ab-side__head: span.label, then p.ab-side__title (L3408-3409). */
  label: string;
  title: string;
  sessions: TalkFirstSession[];
  mini: MiniStat[];
  notes: TalkFirstNote[];
}

export const talkFirst: TalkFirst = {
  ariaLabel: 'Talk first',
  label: 'Prefer to talk first?',
  title: 'Book a session and we can plan it together.',
  sessions: [
    {
      bookType: '',
      minutes: '30',
      unit: 'min',
      name: 'Quick Chat',
      description: 'Perfect for initial discussions and project exploration',
      price: '$15',
      priceNote: 'per session',
    },
    {
      bookType: 'deep',
      minutes: '60',
      unit: 'min',
      name: 'Technical Deep Dive',
      description: 'Comprehensive discussion for complex projects',
      price: '$25',
      priceNote: 'per session',
    },
  ],
  mini: [
    { label: 'Response Time', value: '24h' },
    { label: 'Projects Completed', value: '10+' },
    { label: 'Client Satisfaction', value: '100%' },
  ],
  notes: [
    { icon: 'i-video', text: 'Video Call or Phone' },
    { icon: 'i-globe', text: 'Based in Pakistan, serving clients worldwide' },
  ],
};
