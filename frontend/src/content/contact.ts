/**
 * Contact page content: hero, clock card and dial, methods ledger, Lahore map, form copy and the
 * time zone to place table the globe uses to guess where the visitor is.
 *
 * Pure data (no React, no DOM, no browser APIs), so the backend can import it too. Imports stay
 * relative (no @/ alias) for the same reason.
 * Source of truth: reference-design/faisalhanif-redesign.html, contact markup L3965-4225 and the
 * contact scripts L5228-5786. REFERENCE_MAP.md 11.6.9 and section 10.
 */
import { contactFacts } from './site';

/** Sprite symbol id, for example 'i-mail' or 'ct-i-down'. */
export type IconId = string;

/* ---------- facts reused by the booking modal and the chat (one source: site.ts) ---------- */

export const CONTACT_EMAIL: string = contactFacts.email;
export const CONTACT_MAILTO: string = 'mailto:' + CONTACT_EMAIL;
export const CONTACT_PHONE: { readonly display: string; readonly href: string } =
  contactFacts.phone;
export const LAHORE_MAP_URL = 'https://maps.google.com/?q=Lahore,Pakistan';

/* ---------- hero (L3972-4016, copy script L5631-5639) ---------- */

export interface HeroStat {
  label: string;
  /** Count up target (data-ct-count). */
  to: number;
  /** data-suffix; the server HTML shows to + suffix ("24h", "10+", "100%"). */
  suffix: string;
}

export interface ContactHeroContent {
  pill: string;
  /** a is the plain first line, b the serif gradient word. */
  title: { a: string; b: string };
  lead: string;
  primaryCta: { label: string; href: string; icon: IconId; magnetic: number };
  bookCta: { label: string; icon: IconId };
  emailPill: {
    label: string;
    icon: IconId;
    href: string;
    title: string;
    copyValue: string;
    copyAriaLabel: string;
    tip: string;
    tipCopied: string;
    toastPrefix: string;
    resetMs: number;
  };
  stats: HeroStat[];
  cue: { label: string; href: string; icon: IconId };
}

export const contactHero: ContactHeroContent = {
  pill: 'Available for Projects',
  title: { a: 'Let’s', b: 'Connect' },
  lead: "Ready to bring your ideas to life with AI? Whether you need an intelligent web application, an AI-powered product with LLM integration, or expert consultation, I'm here to help turn your vision into reality.",
  primaryCta: { label: 'Send a message', href: '#ct-form', icon: 'ct-i-down', magnetic: 0.18 },
  bookCta: { label: 'Book a meeting', icon: 'i-calendar' },
  emailPill: {
    label: 'Email',
    icon: 'i-mail',
    href: CONTACT_MAILTO,
    title: CONTACT_EMAIL,
    copyValue: CONTACT_EMAIL,
    copyAriaLabel: 'Copy email address ' + CONTACT_EMAIL,
    tip: 'Copy email',
    tipCopied: 'Copied',
    toastPrefix: 'Email copied: ',
    resetMs: 2200,
  },
  stats: [
    { label: 'Response Time', to: 24, suffix: 'h' },
    { label: 'Projects Completed', to: 10, suffix: '+' },
    { label: 'Client Satisfaction', to: 100, suffix: '%' },
  ],
  cue: { label: 'Scroll to reach me', href: '#ct-ways', icon: 'ct-i-down' },
};

/* ---------- clock card (L3998-4005, script L5522-5557) ---------- */

export interface ClockCardCopy {
  /** Server rendered defaults (the HTML before the script runs). */
  defaults: {
    status: string;
    lahore: string;
    you: string;
    city: string;
    diff: string;
    hours: string;
  };
  lahoreKey: string;
  lahoreTz: string;
  youKey: string;
  hoursKey: string;
  /** City text for visitors in a UTC+5 zone (L5524). */
  sameCity: string;
  /** City text for UTC, GMT and empty zones (L5253). */
  utcCity: string;
  same: string;
  /** t is hh + 'h' + (mm ? ' ' + mm + 'm' : ''). */
  behind: (t: string) => string;
  ahead: (t: string) => string;
  hoursJoin: string;
  open: string;
  backIn: (h: number, m: number) => string;
  backDay: (day: string) => string;
  /** getUTCDay() order. */
  weekdays: readonly string[];
  srLine: (hhmm: string, status: string, diff: string) => string;
}

export const clockCard: ClockCardCopy = {
  defaults: {
    status: 'Checking hours',
    lahore: '--:--:--',
    you: '--:--',
    city: 'Local',
    diff: 'Same time zone as Lahore',
    hours: '09:00 to 18:00',
  },
  lahoreKey: 'Lahore',
  lahoreTz: 'PKT',
  youKey: 'You',
  hoursKey: 'My hours, your time',
  sameCity: 'Lahore',
  utcCity: 'UTC',
  same: 'Same time zone as Lahore',
  behind: (t) => "You're " + t + ' behind Lahore',
  ahead: (t) => "You're " + t + ' ahead of Lahore',
  hoursJoin: ' to ',
  open: 'In working hours now',
  backIn: (h, m) => 'Offline, back in ' + (h ? h + 'h ' : '') + m + 'm',
  backDay: (day) => 'Offline, back ' + day + ' 9AM',
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  srLine: (hhmm, status, diff) =>
    'Live clock. Lahore time ' + hhmm + ' PKT. ' + status + '. ' + diff + '.',
};

/* ---------- globe and dial (L5326-5370) ---------- */

export const orbCopy = {
  /** Two en dashes and a middle dot, exactly as L5339. */
  dialLabel: 'Mon\u2013Fri \u00b7 9AM\u20136PM PKT',
  /** pad(h) for the quarter ticks h = 0, 6, 12, 18 (L5331). */
  hourLabels: ['00', '06', '12', '18'],
  you: 'You',
  /** L5370. */
  youWithCity: (city: string) => 'You \u00b7 ' + city,
  lahore: 'Lahore',
} as const;

/* ---------- kicker and methods ledger (L4019-4058) ---------- */

export const contactKicker = { number: '05', text: 'Ways to reach me' } as const;

export type MethodCta =
  | { kind: 'link'; label: string; href: string; external?: boolean }
  /** button[data-book] with no preset type. */
  | { kind: 'book'; label: string };

export interface ContactMethod {
  no: string;
  icon: IconId;
  title: string;
  description: string;
  /** With href the value is a link (a.ct-method__v), else p.ct-method__v. */
  value: { text: string; href?: string };
  note: { icon: IconId; text: string };
  cta: MethodCta;
}

/** Every CTA ends with the icon below. external: true means target="_blank" rel="noopener". */
export const contactMethodCtaIcon: IconId = 'i-arrow-up-right';

/** The response time texts differ between places; each one is kept as the reference writes it. */
export const contactMethods: ContactMethod[] = [
  {
    no: '01',
    icon: 'i-mail',
    title: 'Email Me',
    description: 'Best for detailed project discussions',
    value: { text: CONTACT_EMAIL, href: CONTACT_MAILTO },
    note: { icon: 'i-clock', text: 'Usually responds within 2-4 hours' },
    cta: { kind: 'link', label: 'Send Email', href: CONTACT_MAILTO },
  },
  {
    no: '02',
    icon: 'i-phone',
    title: 'Call Me',
    description: 'For urgent matters and quick consultations',
    value: { text: CONTACT_PHONE.display, href: CONTACT_PHONE.href },
    note: { icon: 'i-clock', text: 'Available Mon-Fri, 9AM-6PM (GMT+5)' },
    cta: { kind: 'link', label: 'Call Now', href: CONTACT_PHONE.href },
  },
  {
    no: '03',
    icon: 'i-calendar',
    title: 'Schedule Meeting',
    description: 'Book a free consultation at your convenience',
    value: { text: 'Video Call or Phone' },
    note: { icon: 'i-video', text: '30 or 60 minute sessions available' },
    cta: { kind: 'book', label: 'Book Meeting' },
  },
  {
    no: '04',
    icon: 'i-pin',
    title: 'Location',
    description: 'Based in Pakistan, serving clients worldwide',
    value: { text: 'Lahore, Pakistan' },
    note: { icon: 'i-globe', text: 'Timezone: GMT+5 (PKT)' },
    cta: { kind: 'link', label: 'View Map', href: LAHORE_MAP_URL, external: true },
  },
];

/* ---------- Lahore map aside (L4061-4119, clock script L5645-5655) ---------- */

/** The SVG art itself is static markup and lives in the map component, not here. */
export const lahoreMap = {
  chip: 'My Location',
  timeSrLabel: 'Local time in Lahore:',
  timePlaceholder: '--:--',
  tz: 'PKT',
  title: 'Lahore, Pakistan',
  coords: '31.5204° N, 74.3587° E',
  cta: { label: 'View Map', href: LAHORE_MAP_URL, icon: 'i-arrow-up-right' },
  svgLabels: { towns: ['Gujranwala', 'Sheikhupura', 'Kasur'], river: 'RAVI', pin: 'Lahore' },
} as const;

/* ---------- form (markup L4123-4221, script L5658-5786) ---------- */

export interface ProjectTypeOption {
  /** Radio value (name="type"), also the payload projectType. */
  value: string;
  title: string;
  subtitle: string;
  icon: IconId;
}

export interface BudgetOption {
  /** Radio value (name="budget"), also the payload budget. */
  value: string;
  amount: string;
  subtitle: string;
}

export const projectTypes: ProjectTypeOption[] = [
  {
    value: 'App Development',
    title: 'App Development',
    subtitle: 'Mobile apps, cross-platform solutions, custom applications',
    icon: 'i-phone-dev',
  },
  {
    value: 'Web Application',
    title: 'Web Application',
    subtitle: 'Complex web apps, dashboards, SaaS platforms',
    icon: 'i-code',
  },
  {
    value: 'E-commerce',
    title: 'E-commerce',
    subtitle: 'Online stores, payment integration, inventory',
    icon: 'i-cart',
  },
  {
    value: 'Maintenance & Support',
    title: 'Maintenance & Support',
    subtitle: 'Bug fixes, updates, performance optimization',
    icon: 'i-wrench',
  },
  {
    value: 'Consultation',
    title: 'Consultation',
    subtitle: 'Technical advice, code review, architecture',
    icon: 'i-message',
  },
  {
    value: 'Other',
    title: 'Other',
    subtitle: 'Custom requirements, unique projects',
    icon: 'i-sparkles',
  },
];

export const budgets: BudgetOption[] = [
  { value: 'Under $1,000', amount: 'Under $1,000', subtitle: 'Small projects, basic websites' },
  { value: '$1,000 - $5,000', amount: '$1,000 - $5,000', subtitle: 'Medium complexity projects' },
  { value: '$5,000 - $10,000', amount: '$5,000 - $10,000', subtitle: 'Complex web applications' },
  { value: '$10,000+', amount: '$10,000+', subtitle: 'Enterprise solutions' },
];

export interface FieldCopy {
  label: string;
  required: boolean;
  /** maxlength attribute. */
  maxLength: number;
  /** Field icon (the details textarea has none). */
  icon?: IconId;
}

export const contactFormCopy = {
  headIcon: 'i-send',
  title: 'Send Me a Message',
  sub: "Tell me about your project and let's discuss how I can help bring your vision to life.",
  fields: {
    name: { label: 'Full Name', required: true, maxLength: 120, icon: 'i-user' },
    email: { label: 'Email Address', required: true, maxLength: 160, icon: 'i-mail' },
    phone: { label: 'Phone Number', required: false, maxLength: 40, icon: 'i-phone' },
    company: { label: 'Company/Organization', required: false, maxLength: 120, icon: 'i-building' },
    details: { label: 'Project Details', required: true, maxLength: 2000 },
  } satisfies Record<string, FieldCopy>,
  requiredMark: '*',
  /**
   * placeholder attribute of every input and the textarea: one space, so the floating labels can
   * use :placeholder-shown (a real or an empty placeholder breaks them).
   */
  placeholder: ' ',
  /** Followed by the required mark. */
  typeLegend: 'What type of project are you interested in?',
  budgetLegend: 'Project Budget Range',
  detailsMax: 2000,
  /** #ct-details-count gets .is-near when the length is above this. */
  detailsNearAt: 1800,
  /** After the live count span: "<n> / 2000". */
  counterSuffix: ' / 2000',
  send: {
    idle: 'Send Message',
    idleIcon: 'i-send',
    /** Markup default of .ct-send__ok span; replaced by okSent or okMail before it shows. */
    okDefault: 'Done',
    okSent: 'Sent',
    okMail: 'Ready',
    okIcon: 'i-check',
  },
  notes: [
    {
      icon: 'i-shield',
      text: 'Your information is secure and will never be shared with third parties',
    },
    { icon: 'i-clock', text: "I'll respond within 24 hours with next steps" },
  ],
  done: {
    /** Markup default of #ct-done-title. */
    titleDefault: 'Thanks!',
    /** first = name.trim().split(/\s+/)[0] (L5728). */
    title: (first: string) => 'Thanks, ' + first + '!',
    /** Hook (API) path. */
    message: (email: string) =>
      'Your message is on its way. I will get back to you at ' + email + ' within 24 hours.',
    /** Mailto path. */
    mailMessage:
      'Your email app should now be open with your message filled in. Press send there and I will get back to you within 24 hours.',
    again: { label: 'Write another message', icon: 'i-message' },
    /** Shown only on the mailto path. */
    direct: { label: 'Email directly', icon: 'i-mail', href: CONTACT_MAILTO },
  },
} as const;

/** Validation rules (L5665-5670). Lengths count the trimmed value. */
export const contactFormRules = {
  nameMin: 2,
  detailsMin: 20,
  /** Optional phone, checked only when filled. */
  phonePattern: /^[+()\d\s.\-]{7,24}$/,
} as const;

/** Every message, status and toast the form shows (L5665-5785, REFERENCE_MAP.md section 10). */
export const contactFormMessages = {
  errors: {
    nameEmpty: 'Please add your name so I know who I am talking to.',
    nameShort: 'That name looks a little short.',
    emailEmpty: 'I need an email address to reply to you.',
    emailBad: 'That email looks off. Try something like name@company.com.',
    phoneBad: 'Use digits, spaces and + only, for example +1 555 123 4567.',
    detailsEmpty: 'Tell me a little about your project.',
    detailsShort: 'A bit more detail helps. Aim for at least 20 characters.',
    type: 'Pick the option that fits best.',
  },
  /** #ct-form-status (sr-only live region). */
  status: {
    invalid: 'Some fields need a quick fix before sending.',
    sending: 'Sending your message.',
    sent: 'Message sent.',
    mail: 'Your email app is opening with the message.',
    failed: 'Sending failed. Please try again.',
  },
  toasts: {
    sent: 'Message sent. Talk soon!',
    mail: 'Opening your email app with your message',
    failed: 'That did not go through. Please try again or email me directly.',
  },
} as const;

/** The form payload (FH_HOOKS.onContact, L5754): trimmed strings, '' when not given. */
export interface ContactMailData {
  name: string;
  email: string;
  phone: string;
  company: string;
  projectType: string;
  budget: string;
  details: string;
}

/** Mailto subject (L5760). */
export function contactMailSubject(d: Pick<ContactMailData, 'name' | 'projectType'>): string {
  return 'New project enquiry: ' + d.projectType + ' from ' + d.name;
}

/** Mailto body, exactly summary() at L5719-5725. */
export function contactMailBody(d: ContactMailData): string {
  return (
    'Hi Faisal,\n\n' +
    d.details +
    '\n\n---\n' +
    'Name: ' +
    d.name +
    '\nEmail: ' +
    d.email +
    (d.phone ? '\nPhone: ' + d.phone : '') +
    (d.company ? '\nCompany: ' + d.company : '') +
    '\nProject type: ' +
    d.projectType +
    (d.budget ? '\nBudget: ' + d.budget : '') +
    '\n\nSent from faisalhanif.work'
  );
}

/* ---------- globe: where the visitor is (hero script L5234-5259) ---------- */

/** A point on the globe in degrees. */
export interface GeoPoint {
  lat: number;
  lon: number;
}

/** The globe's Lahore point (LHR, L5234). The map panel prints 31.5204, 74.3587; both are kept. */
export const lahoreGlobe: GeoPoint = { lat: 31.52, lon: 74.36 };

/** PKT offset in minutes (PKT, L5234); the visitor is "same" when its offset equals this. */
export const lahoreOffsetMinutes: number = contactFacts.utcOffsetMinutes;

/**
 * Time zone to [lat, lon] (PLACES, L5239-5251): 62 zones, the reference's rounded city positions.
 * Object order is the reference order.
 */
export const visitorPlaces: Readonly<Record<string, readonly [number, number]>> = {
  'America/New_York': [40.7, -74],
  'America/Toronto': [43.7, -79.4],
  'America/Chicago': [41.9, -87.6],
  'America/Denver': [39.7, -105],
  'America/Phoenix': [33.4, -112],
  'America/Los_Angeles': [34, -118.2],
  'America/Vancouver': [49.3, -123.1],
  'America/Mexico_City': [19.4, -99.1],
  'America/Sao_Paulo': [-23.5, -46.6],
  'America/Bogota': [4.7, -74.1],
  'America/Argentina/Buenos_Aires': [-34.6, -58.4],
  'America/Lima': [-12, -77],
  'Pacific/Honolulu': [21.3, -157.9],
  'Europe/London': [51.5, -0.1],
  'Europe/Dublin': [53.3, -6.3],
  'Europe/Lisbon': [38.7, -9.1],
  'Europe/Madrid': [40.4, -3.7],
  'Europe/Paris': [48.9, 2.35],
  'Europe/Amsterdam': [52.4, 4.9],
  'Europe/Brussels': [50.8, 4.4],
  'Europe/Berlin': [52.5, 13.4],
  'Europe/Zurich': [47.4, 8.5],
  'Europe/Rome': [41.9, 12.5],
  'Europe/Stockholm': [59.3, 18.1],
  'Europe/Oslo': [59.9, 10.7],
  'Europe/Warsaw': [52.2, 21],
  'Europe/Athens': [38, 23.7],
  'Europe/Istanbul': [41, 29],
  'Europe/Moscow': [55.8, 37.6],
  'Europe/Kiev': [50.5, 30.5],
  'Europe/Kyiv': [50.5, 30.5],
  'Africa/Cairo': [30, 31.2],
  'Africa/Lagos': [6.5, 3.4],
  'Africa/Nairobi': [-1.3, 36.8],
  'Africa/Johannesburg': [-26.2, 28],
  'Africa/Casablanca': [33.6, -7.6],
  'Asia/Riyadh': [24.7, 46.7],
  'Asia/Qatar': [25.3, 51.5],
  'Asia/Dubai': [25.2, 55.3],
  'Asia/Tehran': [35.7, 51.4],
  'Asia/Kabul': [34.5, 69.2],
  'Asia/Karachi': [24.9, 67],
  'Asia/Tashkent': [41.3, 69.3],
  'Asia/Kolkata': [22.6, 88.4],
  'Asia/Calcutta': [22.6, 88.4],
  'Asia/Kathmandu': [27.7, 85.3],
  'Asia/Dhaka': [23.8, 90.4],
  'Asia/Bangkok': [13.8, 100.5],
  'Asia/Jakarta': [-6.2, 106.8],
  'Asia/Singapore': [1.35, 103.8],
  'Asia/Kuala_Lumpur': [3.1, 101.7],
  'Asia/Shanghai': [31.2, 121.5],
  'Asia/Hong_Kong': [22.3, 114.2],
  'Asia/Taipei': [25, 121.5],
  'Asia/Manila': [14.6, 121],
  'Asia/Seoul': [37.6, 127],
  'Asia/Tokyo': [35.7, 139.7],
  'Australia/Perth': [-31.9, 115.9],
  'Australia/Brisbane': [-27.5, 153],
  'Australia/Sydney': [-33.9, 151.2],
  'Australia/Melbourne': [-37.8, 145],
  'Pacific/Auckland': [-36.8, 174.8],
};

/** UTC style zones (L5253). These, and an empty zone, get the city text 'UTC' (clockCard.utcCity). */
export const utcZonePattern = /^(Etc\/)?(UTC|GMT|UCT|Universal|Zulu)$/;

/** Where a UTC visitor is drawn: London (L5256). */
export const utcPlace: GeoPoint = { lat: 51.5, lon: -0.1 };

/** Latitude by the first zone segment for zones not in visitorPlaces (L5257). */
export const regionLatitudes: Readonly<Record<string, number>> = {
  America: 35,
  Europe: 48,
  Africa: 5,
  Australia: -30,
  Pacific: -15,
  Asia: 28,
};

/** Latitude when the first segment is not in regionLatitudes (L5258). */
export const defaultRegionLatitude = 30;

/**
 * Longitude of an unknown zone: offset minutes / 4, clamped to +-170 (L5258):
 * Math.max(-lonLimit, Math.min(lonLimit, offsetMinutes / 4)).
 */
export const unknownZoneLonLimit = 170;
