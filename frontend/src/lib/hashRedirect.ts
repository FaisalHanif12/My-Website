/**
 * Old hash links (the reference was one page with hash routes): the port of the reference's
 * initial page step (L5097-5099) plus the orchestrator decision on old links.
 * - "/#about" goes to "/"; "/#profile", "/#works", "/#approvals", "/#contact" go to their routes
 *   (no curtain, like the reference's first show()).
 * - Any other known id goes to the route of the page that holds it ("/#pf-exp" becomes
 *   "/profile#pf-exp"), and an id already on the current route stays.
 * - When the hash names an element inside a page (not the page itself), the element is scrolled
 *   to 1600ms after boot (L5099, a fixed delay, not tied to the preloader).
 * - Unknown ids stay on the current route with no scroll.
 */
import { INITIAL_ANCHOR_MS } from '@/lib/motion';
import { isPageId, pageIdOfPath, pageOfId, pathOf, safeDecode } from '@/lib/routes';

export type HashRedirectPlan =
  /** Nothing to do (no hash, an unknown id, or a path that is not a page). */
  | { type: 'none' }
  /** The id is inside the current route: stay, scroll to it later. */
  | { type: 'stay'; anchorId: string }
  /** The hash names the current page itself ("/#about"): drop the hash. */
  | { type: 'clean'; url: string }
  /** The id belongs to another route: replace the URL with it (anchorId set for elements). */
  | { type: 'replace'; url: string; anchorId: string | null };

/**
 * What to do with the address on first load. `search` (with its "?") is kept on the new URL.
 * Pure: reads nothing but its arguments.
 */
export function planHashRedirect(pathname: string, hash: string, search = ''): HashRedirectPlan {
  const current = pageIdOfPath(pathname);
  if (!current) return { type: 'none' };
  const id = safeDecode(hash.startsWith('#') ? hash.slice(1) : hash);
  if (!id) return { type: 'none' };
  const page = pageOfId(id);
  if (!page) return { type: 'none' };
  const path = pathOf(page);

  if (isPageId(id)) {
    return page === current
      ? { type: 'clean', url: path + search }
      : { type: 'replace', url: path + search, anchorId: null };
  }
  if (page === current) return { type: 'stay', anchorId: id };
  return { type: 'replace', url: `${path}${search}#${id}`, anchorId: id };
}

/** The anchor a plan scrolls to after INITIAL_ANCHOR_MS, if any. */
export function planAnchor(plan: HashRedirectPlan): string | null {
  if (plan.type === 'stay') return plan.anchorId;
  if (plan.type === 'replace') return plan.anchorId;
  return null;
}

export interface HashRedirectDeps {
  /**
   * Replaces the current history entry through the router (router.replace(url, { scroll: false })),
   * so the App Router's own URL stays in step with the address bar.
   */
  replace(url: string): void;
  /** FH.scrollToEl: does nothing for null. */
  scrollToEl(el: Element | null): void;
}

/**
 * Runs the plan for the current address: replaces the URL when needed and schedules the anchor
 * scroll. Returns a cancel function that clears the pending scroll.
 */
export function applyHashRedirect(
  loc: Pick<Location, 'pathname' | 'hash' | 'search'>,
  deps: HashRedirectDeps,
): () => void {
  const plan = planHashRedirect(loc.pathname, loc.hash, loc.search);
  if (plan.type === 'clean' || plan.type === 'replace') deps.replace(plan.url);
  const anchorId = planAnchor(plan);
  if (!anchorId) return () => {};
  const timer = setTimeout(() => {
    deps.scrollToEl(document.getElementById(anchorId));
  }, INITIAL_ANCHOR_MS);
  return () => clearTimeout(timer);
}
