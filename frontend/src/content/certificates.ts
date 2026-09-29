/**
 * Approvals page content: the 7 certificates, the certificate filter, the rail copy and the
 * Approvals hero (the certificate deck).
 *
 * Source: reference works.js data L6913-6936, rail card template L7120-7152, deck L7411-7456,
 * HTML L3899-3962 (REFERENCE_MAP.md 11.5.11).
 * Pure data: no React, no component imports. Array order is data order (never sort): newest first,
 * index 0 is the top card of the deck and card "01" of the rail.
 * Not in the reference (so left out): month or day of issue, a PDF link, a credential id.
 */
import type { FilterDef } from './projects';

export type { FilterDef };

export type CertificateFilterKey = 'all' | 'ai' | 'frontend' | 'web' | 'cloud' | 'mobile';
export type CertificateKey = Exclude<CertificateFilterKey, 'all'>;
export type CertificateIssuer = 'Anthropic' | 'Google' | 'Meta' | 'IBM' | 'AWS';

export interface Certificate {
  /** iss: issuer name; lower cased it gives the chip class .wk-mono--{issuer}. */
  issuer: CertificateIssuer;
  /** mono: chip text ("A", "G", "M", "IBM", "aws"). */
  mono: string;
  /** type */
  type: string;
  /** y: year only. */
  year: string;
  /** k */
  filterKey: CertificateKey;
  /** img: served from frontend/public; render with encodeURI() like the reference img() (L6944). */
  image: string;
  /** url: issuer verify page, opened by "View Certificate". */
  verifyUrl: string;
  /** t */
  title: string;
  /** Shown upper case by the .tag CSS; keep the data case. */
  tags: readonly string[];
  /** d: word for word. */
  description: string;
}

/** C_FILTERS (L6936). Key 'web' is labelled "Backend" in the reference; keep it. */
export const CERTIFICATE_FILTERS: readonly FilterDef<CertificateFilterKey>[] = [
  { key: 'all', label: 'All Certifications' },
  { key: 'ai', label: 'AI' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'web', label: 'Backend' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'mobile', label: 'Mobile' },
];

/** CAT_LBL (L7420): the category word on the deck card spines. */
export const CERTIFICATE_CATEGORY_LABEL: Readonly<Record<CertificateKey, string>> = {
  ai: 'AI',
  frontend: 'Frontend',
  web: 'Backend',
  cloud: 'Cloud',
  mobile: 'Mobile',
};

/** CERTS (L6913-6935). Newest first. Index 0 is the top card of the deck and card "01" of the rail. */
export const CERTIFICATES: readonly Certificate[] = [
  {
    // 01
    issuer: 'Anthropic',
    mono: 'A',
    type: 'Certificate of Completion',
    year: '2026',
    filterKey: 'ai',
    image: '/imgs/Claude-Code-in-Action.webp',
    verifyUrl: 'https://verify.skilljar.com/c/ckyyu2785vdw',
    title: 'Claude Code in Action',
    tags: ['Claude Code', 'Agentic Coding', 'MCP', 'AI Workflows'],
    description:
      'Hands-on training in AI-assisted software development with Claude Code, covering agentic coding workflows, context management, custom commands, MCP servers, and hooks for automating real-world engineering tasks.',
  },
  {
    // 02
    issuer: 'Anthropic',
    mono: 'A',
    type: 'Certificate of Completion',
    year: '2026',
    filterKey: 'ai',
    image: '/imgs/Claude-101.webp',
    verifyUrl: 'https://verify.skilljar.com/c/drx9sbkavduo',
    title: 'Claude 101',
    tags: ['Claude AI', 'Prompt Engineering', 'Generative AI', 'Productivity'],
    description:
      'Foundations of working effectively with Claude, including prompting techniques, projects, artifacts, and applying AI assistance to everyday research, writing, and development workflows.',
  },
  {
    // 03
    issuer: 'Google',
    mono: 'G',
    type: 'Professional Certificate',
    year: '2024',
    filterKey: 'frontend',
    image: '/imgs/Frontend.webp',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/ZBMGZAEQPFMZ',
    title: 'Frontend Web Development Professional Certificate',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    description:
      'Comprehensive frontend development training covering HTML5, CSS3, JavaScript ES6+, responsive design, and modern frontend frameworks for building interactive web applications.',
  },
  {
    // 04
    issuer: 'Meta',
    mono: 'M',
    type: 'Professional Certificate',
    year: '2024',
    filterKey: 'frontend',
    image: '/imgs/React.webp',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/EE42JSYQPZ7D',
    title: 'React Front-End Developer Professional Certificate',
    tags: ['React', 'JSX', 'Hooks', 'Redux'],
    description:
      'Advanced React development skills including hooks, state management, component architecture, and modern React patterns for building scalable single-page applications.',
  },
  {
    // 05
    issuer: 'IBM',
    mono: 'IBM',
    type: 'Professional Certificate',
    year: '2023',
    filterKey: 'web',
    image: '/imgs/Web.webp',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/RKY4CN2NHHR3',
    title: 'Full Stack Web Development Professional Certificate',
    tags: ['Node.js', 'Express', 'MongoDB', 'APIs'],
    description:
      'Complete web development training covering both frontend and backend technologies, including databases, APIs, deployment, and modern web development best practices.',
  },
  {
    // 06
    issuer: 'AWS',
    mono: 'aws',
    type: 'Cloud Certification',
    year: '2023',
    filterKey: 'cloud',
    image: '/imgs/Data.webp',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/verify/3YLMQJ6HTBRE',
    title: 'AWS Cloud & Data Analytics Professional Certificate',
    tags: ['AWS', 'Cloud Computing', 'Data Analytics', 'Security'],
    description:
      'Foundation-level understanding of AWS cloud services, data analytics, security best practices, and deployment strategies for scalable cloud-based data solutions.',
  },
  {
    // 07
    issuer: 'Meta',
    mono: 'M',
    type: 'Professional Certificate',
    year: '2024',
    filterKey: 'mobile',
    image: '/imgs/ReactNative.png',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/BEMCRMJ7N46L',
    title: 'Meta React Native Mobile Development Certificate',
    tags: ['React Native', 'Mobile Development', 'JavaScript', 'UI/UX'],
    description:
      'Comprehensive training in building cross-platform mobile applications using React Native, covering UI/UX, navigation, state management, and deployment to app stores.',
  },
];

/** Toolbar, rail, empty state and card copy of the Approvals body (HTML L3940-3961, JS L7120-7152). */
export const CERTIFICATE_RAIL_COPY = {
  filterAriaLabel: 'Filter certifications by area',
  /** Count chip aria-label: "{n} items" (also "1 items", as in the reference). */
  countChipAriaLabel: (n: number) => `${n} items`,
  controlsAriaLabel: 'Certificate carousel controls',
  prevAriaLabel: 'Previous certificate',
  nextAriaLabel: 'Next certificate',
  railAriaLabel: 'Certificates, scroll horizontally',
  empty: {
    title: 'No certifications found',
    text: 'Try selecting a different category to see more certifications.',
  },
  card: {
    paperTop: 'Certificate',
    imageAlt: (title: string, issuer: string) => `${title} certificate from ${issuer}`,
    aiFlag: 'AI',
    /** Issuer sub line: "{type} · {year}" */
    issuerLine: (type: string, year: string) => `${type} · ${year}`,
    tagsAriaLabel: 'Technologies',
    verified: 'Verified Certificate',
    view: 'View Certificate',
    viewSr: (title: string) => ` for ${title}, opens in a new tab`,
  },
} as const;

export interface ApprovalsHeroStat {
  label: string;
  value: number;
  suffix: '+';
  /** --d of its .wk-a wrapper in ms; the count up starts at delay + 200. */
  delay: number;
}

/** Approvals hero, the certificate deck (HTML L3900-3933, deck JS L7411-7456). */
export const APPROVALS_HERO = {
  eyebrow: 'Professional Certifications',
  titleRowA: 'My',
  titleRowB: 'Certifications',
  /** Rendered as: 2023 <i>&rarr;</i> 2026 */
  titleMeta: { from: '2023', to: '2026' },
  lead: 'Professional certifications and learning achievements in web development, cloud computing, and modern programming technologies that validate my expertise.',
  browseLabel: 'Browse certificates',
  /** href: the site CV path (reference: https://faisalhanif.work/imgs/Faisal-CVS.pdf, rewritten to FH.asset('imgs/Faisal-CVS.pdf')). */
  cvLabel: 'Download CV',
  /** Hard coded in the reference: "6+" certifications while the data has 7. Copy as is. */
  stats: [
    { label: 'Certifications', value: 6, suffix: '+', delay: 480 },
    { label: 'Learning Hours', value: 200, suffix: '+', delay: 540 },
    { label: 'Video Tutorials', value: 15, suffix: '+', delay: 600 },
  ] as readonly ApprovalsHeroStat[],
  /** Issuer chips: <i class="wk-im[ wk-im--a| wk-im--sm]">{text}</i> */
  issuerChips: [
    { text: 'A', variant: 'a' },
    { text: 'G' },
    { text: 'M' },
    { text: 'IBM', variant: 'sm' },
    { text: 'aws', variant: 'sm' },
  ] as readonly { text: string; variant?: 'a' | 'sm' }[],
  /** Rendered as: Issued by <b>Anthropic, Google, Meta, IBM</b> and <b>AWS</b> */
  issuedBy: {
    before: 'Issued by',
    boldA: 'Anthropic, Google, Meta, IBM',
    middle: 'and',
    boldB: 'AWS',
  },
  deckAriaLabel: 'Certificate deck. Choose one to jump to it.',
  /** Hard coded in the reference (not computed from the data). */
  caption: { count: '07', text: 'Certificates, newest on top. Pick one to jump to it.' },
  seal: { ring: 'VERIFIED CREDENTIALS · 2023 - 2026 ·' },
  deckCard: {
    numberPrefix: 'No. ',
    awardedTo: 'Awarded to',
    awardee: 'Faisal Hanif',
    issuedBy: 'Issued by',
    year: 'Year',
    verified: 'Verified',
    /** sr-only: "{title}, {issuer}, {year}. Jump to this certificate." */
    srLabel: (title: string, issuer: string, year: string) =>
      `${title}, ${issuer}, ${year}. Jump to this certificate.`,
  },
  cue: 'Scroll to explore',
} as const;
