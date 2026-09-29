/**
 * Site wide content: identity, head metadata, the five pages (routes, curtain and next page data,
 * nav labels and icons, document titles), the shell copy (rail, top bar, dock, preloader, footer)
 * and the contact facts shared by the About, Contact, booking and chat parts.
 *
 * Every literal is copied from the reference (reference-design/faisalhanif-redesign.html, line
 * numbers in the comments). Values the reference builds at runtime (document titles, curtain
 * numbers, next page labels) are derived here with the reference's own formula, so each value is
 * written once. Pure data: no React, no side effects.
 */

/* ------------------------------------------------------------------ identity */

export interface SiteInfo {
  /** Full name (top bar brand L2989, chat, SEO). */
  name: string;
  /** Monogram: rail logo (L2974), top bar logo (L2989), preloader mark (L2951). */
  initials: string;
  /** Job title (About role chip L3031). */
  role: string;
  /**
   * CV file. The reference links https://faisalhanif.work/imgs/Faisal-CVS.pdf (L3040, L4807); the
   * rebuild serves it from the same origin (orchestrator decision) so `download` works.
   */
  cvPath: string;
}

export const site: SiteInfo = {
  name: 'Faisal Hanif',
  initials: 'FH',
  role: 'Software Engineer',
  cvPath: '/imgs/Faisal-CVS.pdf',
};

/* ------------------------------------------------------------------ contact facts */

/**
 * Contact facts shared by the About bento (L3152-3194), the Contact page, the booking modal and the
 * chat knowledge. No WhatsApp: the reference has none.
 */
export interface ContactFacts {
  email: string;
  phone: { display: string; href: string };
  location: string;
  city: string;
  /** IANA zone used by the Contact clocks (L5533, L5648) and the booking modal (L5812). */
  timeZone: 'Asia/Karachi';
  /** PKT, UTC+5, no DST (L4996, L5234). */
  utcOffsetMinutes: 300;
  tzAbbr: 'PKT';
  /** Clock zone label (About L3186, Contact L4037, L4053). */
  gmtLabel: 'GMT+5';
  /** getUTCDay() numbering on the Lahore clock: 1..5 = Monday..Friday (L5005, L5545). */
  workingDays: readonly number[];
  /** Minutes after midnight, Lahore time: 09:00 (L5005 `h>=9`, L5545 `mins >= 540`). */
  workStartMinutes: number;
  /** Exclusive end, Lahore time: 18:00 (L5005 `h<18`, L5545 `mins < 1080`). */
  workEndMinutes: number;
}

export const contactFacts: ContactFacts = {
  email: 'mehrfaisal111@gmail.com',
  phone: { display: '+92 314 8166354', href: 'tel:+923148166354' },
  location: 'Lahore, Pakistan',
  city: 'Lahore',
  timeZone: 'Asia/Karachi',
  utcOffsetMinutes: 300,
  tzAbbr: 'PKT',
  gmtLabel: 'GMT+5',
  workingDays: [1, 2, 3, 4, 5],
  workStartMinutes: 540,
  workEndMinutes: 1080,
};

/* ------------------------------------------------------------------ head metadata */

export interface SiteMeta {
  /** html lang (L2). */
  lang: string;
  /** Head title (L6) and the About document title (L4683). */
  defaultTitle: string;
  /** Joined after the page title on every other page: `${title}${docTitleSuffix}` (L4683). */
  docTitleSuffix: string;
  /** meta description (L7). */
  description: string;
  /** meta theme-color: light at load (L8) and both values of setTheme (L4640). */
  themeColor: { light: string; dark: string };
  /** window.FH_BASE (L17): the live site origin. */
  baseUrl: string;
  /** localStorage key of the theme (L13, L4639). */
  themeStorageKey: string;
}

export const siteMeta: SiteMeta = {
  lang: 'en',
  defaultTitle: 'Faisal Hanif · Software Engineer',
  docTitleSuffix: ' · Faisal Hanif',
  description:
    'Faisal Hanif, software engineer in Lahore building AI-powered web and mobile products with React, Next.js, Node.js and LLMs.',
  themeColor: { light: '#0e6655', dark: '#050f0c' },
  baseUrl: 'https://faisalhanif.work/',
  themeStorageKey: 'fh-theme',
};

/* ------------------------------------------------------------------ pages */

/** Reference PAGES order (L4674). */
export type PageId = 'about' | 'profile' | 'works' | 'approvals' | 'contact';

/** Rebuild routes (PRD "Routes"); the reference used #about, #profile, ... */
export type SitePath = '/' | '/profile' | '/works' | '/approvals' | '/contact';

/** Rail and dock icons (shell sprite ids, L2977-2981 and L2996-3000). */
export type NavIconId = 'i-user' | 'i-file' | 'i-briefcase' | 'i-trophy' | 'i-chat';

export interface SitePage {
  id: PageId;
  path: SitePath;
  /** META[id].n (L4675): curtain number and next page number. */
  n: string;
  /**
   * META[id].t (L4675). Also the rail and dock label (L2977-2981, L2996-3000), the curtain title
   * (L4701) and the next page word (L4735).
   */
  title: string;
  /** document.title (L4683): About uses siteMeta.defaultTitle, the others `${title} · Faisal Hanif`. */
  docTitle: string;
  navIcon: NavIconId;
}

type PageBase = Omit<SitePage, 'docTitle'>;

const PAGE_BASE: readonly PageBase[] = [
  { id: 'about', path: '/', n: '01', title: 'About', navIcon: 'i-user' },
  { id: 'profile', path: '/profile', n: '02', title: 'Profile', navIcon: 'i-file' },
  { id: 'works', path: '/works', n: '03', title: 'Works', navIcon: 'i-briefcase' },
  { id: 'approvals', path: '/approvals', n: '04', title: 'Approvals', navIcon: 'i-trophy' },
  { id: 'contact', path: '/contact', n: '05', title: 'Contact', navIcon: 'i-chat' },
];

/** The five pages in reference order (never sort). The home route (About) keeps the default title. */
export const pages: readonly SitePage[] = PAGE_BASE.map((p) => ({
  ...p,
  docTitle: p.path === '/' ? siteMeta.defaultTitle : `${p.title}${siteMeta.docTitleSuffix}`,
}));

/** The page record for an id. */
export function pageById(id: PageId): SitePage {
  const page = pages.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page id: ${id}`);
  return page;
}

/** Curtain number (L4701): `${n} / 05`, for example "02 / 05" (two digit total). */
export function curtainNum(page: SitePage): string {
  return `${page.n} / ${String(pages.length).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ shell copy */

export interface ShellCopy {
  /** aria-label of the rail aside (L2973) and the dock nav (L2995). */
  navLabel: string;
  /** Text of the rail logo link (L2974) and the top bar logo span (L2989). */
  logoText: string;
  /** aria-label of the rail logo link (L2974). */
  logoAriaLabel: string;
  /** Text after the logo in the top bar brand link (L2989). */
  brandName: string;
  /** aria-label of both theme buttons (L2984, L2991). */
  themeToggleAriaLabel: string;
  /** Top bar Book button text (L2992). */
  bookButton: string;
}

export const shellCopy: ShellCopy = {
  navLabel: 'Section navigation',
  logoText: site.initials,
  logoAriaLabel: 'Faisal Hanif, back to top',
  brandName: site.name,
  themeToggleAriaLabel: 'Switch light or dark theme',
  bookButton: 'Book',
};

/** Preloader copy (L2951-2952): the SVG text mark and the label under it. */
export const preloader = {
  mark: site.initials,
  label: 'Faisal Hanif · Portfolio',
} as const;

export interface FooterCopy {
  /** div.footer__big (aria-hidden): plain word, then span.serif (L4230). */
  bigPlain: string;
  bigSerif: string;
  /**
   * Before span#year (L4232). The year itself is not copy: the reference writes the current year
   * at run time (the static "2026" in the HTML is replaced).
   */
  copyright: string;
  /** After span#year, with its leading space (L4232). */
  line: string;
  /** Back to top link text (L4233), followed by a space and the i-arrow-up-right icon. */
  backToTop: string;
}

export const footerCopy: FooterCopy = {
  bigPlain: 'Faisal',
  bigSerif: 'Hanif',
  copyright: '© ',
  line: ' Faisal Hanif · Software Engineer · Lahore, Pakistan',
  backToTop: 'Back to top',
};

/* ------------------------------------------------------------------ next page link */

/** The literal pieces the reference joins into the next page link (L4733-4735). */
export interface NextPageCopy {
  /** nav.page-next aria-label. */
  ariaLabel: string;
  /** Left label on pages 1 to 4. */
  nextLabel: string;
  /** Left label on the last page (links back to About). */
  lastLabel: string;
  /** Between the left label and the target page number. */
  numberJoin: string;
  /** After the CURRENT page position on the right label (one digit total, unlike the curtain). */
  positionTotal: string;
}

export const nextPageCopy: NextPageCopy = {
  ariaLabel: 'Next page',
  nextLabel: 'Next page',
  lastLabel: 'Back to the start',
  numberJoin: ' · ',
  positionTotal: ' / 5',
};

export interface NextPageLinkData {
  from: PageId;
  to: PageId;
  /** Route of the target page (the reference linked `#${to}`). */
  href: SitePath;
  /** Left label, for example "Next page · 02" or "Back to the start · 01". */
  label: string;
  /** Right label: position of the CURRENT page, for example "1 / 5". */
  position: string;
  /** Target title without its last two letters: META[to].t.slice(0, -2), for example "Profi". */
  wordHead: string;
  /** Last two letters, rendered in span.serif: META[to].t.slice(-2), for example "le". */
  wordTail: string;
}

/** Next page link data for a page, built exactly like L4733-4735. */
export function nextPageOf(from: PageId): NextPageLinkData {
  const i = pages.findIndex((p) => p.id === from);
  if (i < 0) throw new Error(`Unknown page id: ${from}`);
  const last = i === pages.length - 1;
  const next = pages[(i + 1) % pages.length];
  return {
    from,
    to: next.id,
    href: next.path,
    label: `${last ? nextPageCopy.lastLabel : nextPageCopy.nextLabel}${nextPageCopy.numberJoin}${next.n}`,
    position: `${i + 1}${nextPageCopy.positionTotal}`,
    wordHead: next.title.slice(0, -2),
    wordTail: next.title.slice(-2),
  };
}

/** One entry per page, in page order. */
export const nextPageLinks: readonly NextPageLinkData[] = pages.map((p) => nextPageOf(p.id));
