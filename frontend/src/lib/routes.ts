/**
 * Page ids, routes and anchors: the rebuild's version of the reference router's lookups
 * (PAGES, `pageOf(el)` and `document.getElementById(hash)`, reference L5043-5048).
 *
 * In the reference all five pages live in one document, so any element id resolves to its page
 * with `closest('.page')`. In the rebuild only the current route is mounted, so the ids of every
 * page are listed here (ANCHOR_PAGE) and a target on another route can be resolved before it
 * exists in the DOM. Pure data and functions: no React, no DOM.
 */
import { pages, type PageId, type SitePath } from '@/content/site';

export type { PageId, SitePath };

/** The five page ids in reference order (PAGES, L5043). */
export const PAGE_IDS: readonly PageId[] = pages.map((p) => p.id);

/** True for "about", "profile", "works", "approvals" and "contact". */
export function isPageId(id: string): id is PageId {
  return (PAGE_IDS as readonly string[]).includes(id);
}

/** Route of a page ("/" for About). */
export function pathOf(id: PageId): SitePath {
  const page = pages.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page id: ${id}`);
  return page.path;
}

/** A pathname without its query, hash and trailing slash ("/works/" and "/works?x" give "/works"). */
export function normalizePath(pathname: string): string {
  const bare = pathname.split(/[?#]/, 1)[0] || '/';
  const trimmed = bare.length > 1 ? bare.replace(/\/+$/, '') : bare;
  return trimmed || '/';
}

/** The page shown on a route, or null for any other path. */
export function pageIdOfPath(pathname: string): PageId | null {
  const path = normalizePath(pathname);
  return pages.find((p) => p.path === path)?.id ?? null;
}

/* ------------------------------------------------------------------ anchors */

/**
 * Every element id written in each page section of the reference markup, in document order,
 * without the page roots themselves: about L3349-3803, profile L3805-4164, works L4166-4266,
 * approvals L4268-4332, contact L4334-4594. Generated once from the reference file;
 * routes.test.ts derives the list again from the file and compares.
 */
const STATIC_ANCHORS: Readonly<Record<PageId, readonly string[]>> = {
  about: [
    'ab-ic-react',
    'ab-ic-next',
    'ab-ic-node',
    'ab-ic-openai',
    'ab-ic-claude',
    'ab-ic-aws',
    'ab-ic-mongo',
    'ab-hero',
    'ab-hero-copy',
    'ab-name',
    'ab-first',
    'ab-last',
    'ab-fl-g',
    'ab-roll',
    'ab-orb-exit',
    'ab-orb',
    'ab-ring-path',
    'ab-portrait',
    'ab-know',
    'ab-time',
    'ab-state',
    'ab-daynow',
    'ab-svc-b0',
    'ab-svc-p0',
    'ab-svc-b1',
    'ab-svc-p1',
    'ab-svc-b2',
    'ab-svc-p2',
    'ab-svc-b3',
    'ab-svc-p3',
    'ab-tst-cur',
    'ab-carousel',
    'ab-slides',
  ],
  profile: [
    'pf-hero',
    'pf-title',
    'pf-seal-p',
    'pf-ring-g',
    'pf-exp',
    'pf-exp-title',
    'pf-role-techxelo',
    'pf-role-upwork',
    'pf-role-uha',
    'pf-role-viral',
    'pf-edu-title',
    'pf-edu-bs',
    'pf-edu-inter',
    'pf-edu-matric',
    'pf-tech-title',
    'pf-skills',
    'pf-tab-0',
    'pf-tab-1',
    'pf-tab-2',
    'pf-tab-3',
    'pf-panel-0',
    'pf-panel-1',
    'pf-panel-2',
    'pf-panel-3',
  ],
  works: [
    'wk-hero',
    'wk-title',
    'wk-ob',
    'wk-ob-stage',
    'wk-ob-back',
    'wk-phn',
    'wk-ob-front',
    'wk-toolbar',
    'wk-filter',
    'wk-count',
    'wk-grid',
    'wk-empty',
  ],
  approvals: [
    'wk-ap-hero',
    'wk-ap-title',
    'wk-deck',
    'wk-deck-stage',
    'wk-ap-toolbar',
    'wk-ap-filter',
    'wk-ap-cur',
    'wk-ap-tot',
    'wk-ap-prev',
    'wk-ap-next',
    'wk-rail',
    'wk-ap-track',
    'wk-ap-empty',
    'wk-ap-bar',
  ],
  contact: [
    'ct-i-copy',
    'ct-i-down',
    'ct-hero',
    'ct-hero-l',
    'ct-title',
    'ct-copy',
    'ct-hero-r',
    'ct-orb',
    'ct-orb-svg',
    'ct-clock-card',
    'ct-orb-sr',
    'ct-h-status',
    'ct-h-lhr',
    'ct-h-city',
    'ct-h-you',
    'ct-h-diff',
    'ct-h-hrs',
    'ct-ways',
    'ct-map-grid',
    'ct-map-fade',
    'ct-map-beam-g',
    'ct-map-mask',
    'ct-clock',
    'ct-map-title',
    'ct-form',
    'ct-form-inner',
    'ct-name',
    'ct-name-err',
    'ct-email',
    'ct-email-err',
    'ct-phone',
    'ct-phone-err',
    'ct-company',
    'ct-type',
    'ct-type-err',
    'ct-budget',
    'ct-details',
    'ct-details-err',
    'ct-details-count',
    'ct-details-n',
    'ct-send',
    'ct-form-status',
    'ct-done',
    'ct-done-title',
    'ct-done-msg',
    'ct-again',
    'ct-mail-direct',
  ],
};

/** "01" .. "nn", the reference pad() used for the generated title ids. */
function numbered(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => prefix + String(i + 1).padStart(2, '0'));
}

/**
 * Ids the reference scripts write into the pages at run time (they are in the live DOM, so the
 * reference router finds them too): the project titles `wk-p01`..`wk-p14` (works.js L7590, one
 * per project), the certificate titles `wk-c01`..`wk-c07` (L7671, one per certificate) and the
 * Approvals hero deck symbols `wk-guil` and `wk-seal-p` (L8132-8133). routes.test.ts checks the
 * counts against the content files.
 */
const RUNTIME_ANCHORS: Readonly<Partial<Record<PageId, readonly string[]>>> = {
  works: numbered('wk-p', 14),
  approvals: [...numbered('wk-c', 7), 'wk-guil', 'wk-seal-p'],
};

function buildAnchorPage(...lists: Readonly<Partial<Record<PageId, readonly string[]>>>[]) {
  const map: Record<string, PageId> = {};
  for (const list of lists) {
    for (const page of PAGE_IDS) {
      for (const id of list[page] ?? []) map[id] = page;
    }
  }
  return map;
}

/** Element id -> the page that holds it, for every id in the reference page markup. */
export const ANCHOR_PAGE: Readonly<Record<string, PageId>> = buildAnchorPage(STATIC_ANCHORS);

/** Element id -> page for the ids the reference scripts render at run time. */
export const RUNTIME_ANCHOR_PAGE: Readonly<Record<string, PageId>> =
  buildAnchorPage(RUNTIME_ANCHORS);

/**
 * The page an id belongs to: a page id is its own page (like `closest('.page')` on a page root),
 * any other known id maps through ANCHOR_PAGE, then RUNTIME_ANCHOR_PAGE. Null when unknown.
 */
export function pageOfId(id: string): PageId | null {
  if (isPageId(id)) return id;
  if (Object.hasOwn(ANCHOR_PAGE, id)) return ANCHOR_PAGE[id];
  if (Object.hasOwn(RUNTIME_ANCHOR_PAGE, id)) return RUNTIME_ANCHOR_PAGE[id];
  return null;
}

/* ------------------------------------------------------------------ targets */

export interface ResolvedTarget {
  /** The page to show. */
  pageId: PageId;
  /** Its route. */
  path: SitePath;
  /** Element to scroll to once the page shows, or null for the page itself (top). */
  anchorId: string | null;
}

/** decodeURIComponent that returns null instead of throwing on a malformed escape. */
export function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Resolves a link target the way the reference router does with a hash:
 * - "#works" or "works" (a page id): that page, no anchor;
 * - "#pf-exp" or "pf-exp" (an id inside a page): that page with the anchor;
 * - "/profile", "/profile#pf-exp": the route, with the anchor when the hash names one. A hash
 *   naming a known id wins over the path (the reference hash was the whole route), so the old
 *   "/#works" resolves to Works. An unknown hash on a known route is kept as the anchor, to be
 *   looked up in the DOM when the page shows.
 * Returns null for "#", "", unknown ids without a route, other paths and absolute URLs.
 */
export function resolveTarget(href: string): ResolvedTarget | null {
  const value = href.trim();
  let pathPart: string | null = null;
  let hashPart: string;
  if (value.startsWith('#')) {
    hashPart = value.slice(1);
  } else if (value.startsWith('/')) {
    if (value.startsWith('//')) return null;
    const cut = value.indexOf('#');
    pathPart = cut < 0 ? value : value.slice(0, cut);
    hashPart = cut < 0 ? '' : value.slice(cut + 1);
  } else if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
    return null;
  } else {
    hashPart = value;
  }

  const id = safeDecode(hashPart);
  if (id === null) return null;
  const routePage = pathPart === null ? null : pageIdOfPath(pathPart);
  if (pathPart !== null && !routePage) return null;

  if (id) {
    const idPage = pageOfId(id);
    if (idPage) return { pageId: idPage, path: pathOf(idPage), anchorId: isPageId(id) ? null : id };
    if (routePage) return { pageId: routePage, path: pathOf(routePage), anchorId: id };
    return null;
  }
  return routePage ? { pageId: routePage, path: pathOf(routePage), anchorId: null } : null;
}

/** The URL of a resolved target: its route, plus "#anchor" when there is one. */
export function targetUrl(target: Pick<ResolvedTarget, 'path' | 'anchorId'>): string {
  return target.anchorId ? `${target.path}#${target.anchorId}` : target.path;
}
