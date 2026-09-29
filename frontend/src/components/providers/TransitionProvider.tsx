'use client';

/**
 * Page transitions: the React port of the reference hash router (L5042-5099, REFERENCE_MAP.md
 * 11.2.14 and "Porting plan for Next.js") on top of the App Router.
 *
 * State machine: idle -> covering (0 to 560ms) -> swapping (router.push, wait for the commit) ->
 * holding (140ms from the commit) -> revealing (640ms) -> idle. While not idle a page change is
 * dropped without touching the URL (orchestrator decision); same page scrolls still run, like the
 * reference.
 *
 * - Curtain: the provider drives #curtain, #curtainNum and #curtainTitle (Curtain.tsx) with the
 *   reference's own classList calls, including the forced reflow between is-on and is-in, and puts
 *   .is-leaving on the leaving page root ([data-page]; pages are server components).
 * - Commit: when usePathname() reports the new route, jumpTop() runs before paint (layout effect),
 *   then the page show listeners run, and one frame later a synthetic window resize and
 *   refreshParallax() (L5054). The 140 and 640 are counted from the commit, so a slow commit keeps
 *   the curtain covered until it lands.
 * - Links: <TransitionLink> calls go(); raw a[href^="#"] links go through a window capture click
 *   listener ported from L5082-5092.
 * - Back and Forward: the full curtain. A capture popstate listener stops the event before the App
 *   Router's own listener, covers for 560ms, then re-dispatches it (with a pass flag) so the App
 *   Router restores the entry; hold and reveal follow the commit like a click.
 * - Old hash links (lib/hashRedirect) are handled once on mount, under the preloader.
 * - All five routes are prefetched once the preloader is done.
 *
 * Must sit inside <ModalProvider> (go() closes open modals, L5064).
 */
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

import { useModal, type ModalApi } from '@/components/providers/ModalProvider';
import { curtainNum, pageById, pages } from '@/content/site';
import { getReducedMotion } from '@/hooks/useReducedMotion';
import { whenLoaded } from '@/lib/boot';
import { applyHashRedirect } from '@/lib/hashRedirect';
import { CURTAIN, INSTANT_ANCHOR_MS, SCROLL_OFFSET } from '@/lib/motion';
import { refreshParallax } from '@/lib/parallax';
import {
  isPageId,
  normalizePath,
  pageIdOfPath,
  pathOf,
  resolveTarget,
  safeDecode,
  targetUrl,
  type PageId,
  type SitePath,
} from '@/lib/routes';
import { smoothReset, smoothTo } from '@/lib/smoothScroll';

/* ------------------------------------------------------------------ scroll helpers */

/**
 * jumpTop() (L5049): an instant scroll to the top that beats html{scroll-behavior:smooth} (still
 * active on touch devices), then the smooth wheel state is reset.
 */
export function jumpTop(): void {
  const html = document.documentElement;
  const saved = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  html.style.scrollBehavior = saved;
  smoothReset();
}

/**
 * FH.scrollToEl (L5056): scrolls so the element sits 84px (under 1024px, clears the top bar) or
 * 32px from the top, with the smooth wheel scroller when it is on, else a native smooth scroll
 * (instant with reduced motion). Does nothing for null. The element must be on the current page.
 */
export function scrollToEl(el: Element | null | undefined): void {
  if (!el) return;
  const offset =
    innerWidth < SCROLL_OFFSET.breakpoint ? SCROLL_OFFSET.mobile : SCROLL_OFFSET.desktop;
  const y = el.getBoundingClientRect().top + scrollY - offset;
  if (smoothTo(y)) return;
  window.scrollTo({ top: y, behavior: getReducedMotion() ? 'auto' : 'smooth' });
}

/** The same page "go to top" of FH.go (L5065): smooth even with reduced motion, like the reference. */
function smoothTop(): void {
  if (smoothTo(0)) return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------------ public types */

export type TransitionPhase = 'idle' | 'covering' | 'swapping' | 'holding' | 'revealing';

/** What a page show listener receives. */
export interface PageShowInfo {
  /** The page that is now shown. */
  pageId: PageId;
  /** The first show of the app (after the preloader); no curtain ran. */
  first: boolean;
  /** The show happened under the curtain (a lift follows 140ms later). */
  curtain: boolean;
}

export type PageShowListener = (info: PageShowInfo) => void;

/** A page id, element id, "#hash", route path ("/profile#pf-exp") or an element in the page. */
export type GoTarget = string | Element;

export interface NavigateApi {
  /** FH.go: route to a page (with the curtain) or scroll within the current page. */
  go(target: GoTarget): void;
  /** FH.scrollToEl. */
  scrollToEl(el: Element | null | undefined): void;
}

export interface TransitionController extends NavigateApi {
  getPhase(): TransitionPhase;
  /** The page being left while the curtain covers, else null. */
  getLeavingPage(): PageId | null;
  /** Phase and leaving page changes. */
  subscribe(listener: () => void): () => void;
  /** Every page show (see usePageShow). */
  onShow(listener: PageShowListener): () => void;
  /** Every curtain lift, or right after the show when no curtain ran (see useCurtainLift). */
  onLift(listener: PageShowListener): () => void;
}

/* ------------------------------------------------------------------ controller */

/** What the controller needs from the App Router (a subset of useRouter()). */
export interface RouterLike {
  push(href: string, options?: { scroll?: boolean }): void;
  replace(href: string, options?: { scroll?: boolean }): void;
  prefetch(href: string): void;
}

interface Deps {
  router: RouterLike | null;
  modal: ModalApi | null;
}

interface Resolved {
  pageId: PageId;
  path: SitePath;
  anchorId: string | null;
  /** The element itself when go() received one (it may have no id). */
  el: Element | null;
}

interface Pending extends Resolved {
  /** push: a link or go() call; pop: Back or Forward (the browser already moved the entry). */
  kind: 'push' | 'pop';
  mode: 'curtain' | 'instant';
}

interface InternalController extends TransitionController {
  /** Layout effect: gives the controller the current App Router and modal API. */
  attach(next: Deps): void;
  /** Layout effect on every pathname: jumpTop() before paint when the route changed. */
  layoutCommit(pathname: string): void;
  /** Passive effect on every pathname: finishes a pending transition or reports the show. */
  commit(pathname: string): void;
  /** Mount: window listeners, hash redirect, first show and prefetch. Returns the cleanup. */
  mount(): () => void;
}

/**
 * Not a reference timing: if a route change never commits (the App Router failed without a hard
 * reload), the sequence finishes anyway after this long, so the curtain never stays over the page
 * blocking clicks. Nothing changes in normal states.
 */
const COMMIT_FAILSAFE_MS = 8000;

/** The App Router's marker on the history entries it can restore (app-router.js onPopState). */
function isAppRouterState(state: unknown): boolean {
  return typeof state === 'object' && state !== null && '__NA' in state;
}

/** Sets an element's text, keeping the text node React rendered when there is one. */
function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const node = el.firstChild;
  if (node && node.nodeType === Node.TEXT_NODE && !node.nextSibling) node.nodeValue = text;
  else el.textContent = text;
}

/** Runs every listener; one that throws is reported without stopping the others. */
function notify(listeners: Set<PageShowListener>, info: PageShowInfo): void {
  Array.from(listeners).forEach((listener) => {
    try {
      listener(info);
    } catch (err) {
      queueMicrotask(() => {
        throw err;
      });
    }
  });
}

/** pageOf(el) (L5047) for an element: its page root and the anchor inside it. */
function resolveElement(el: Element): Resolved | null {
  const root = el.closest('[data-page]');
  const pageId = root?.getAttribute('data-page');
  if (!root || !pageId || !isPageId(pageId)) return null;
  if (root === el) return { pageId, path: pathOf(pageId), anchorId: null, el: null };
  return { pageId, path: pathOf(pageId), anchorId: el.id || null, el };
}

/**
 * A go() target: known pages and ids resolve without the DOM (their page may not be mounted);
 * anything else is looked up in the current page (ids rendered at run time).
 */
function resolveGoTarget(target: GoTarget): Resolved | null {
  if (typeof target !== 'string') return resolveElement(target);
  const known = resolveTarget(target);
  if (known) return { ...known, el: null };
  const id = safeDecode(target.startsWith('#') ? target.slice(1) : target);
  const el = id ? document.getElementById(id) : null;
  return el ? resolveElement(el) : null;
}

/** The page and anchor of the address bar (after Back or Forward). */
function resolveLocation(): Resolved | null {
  const pageId = pageIdOfPath(location.pathname);
  if (!pageId) return null;
  const id = safeDecode(location.hash.slice(1));
  return { pageId, path: pathOf(pageId), anchorId: id && !isPageId(id) ? id : null, el: null };
}

function createTransitionController(): InternalController {
  const deps: Deps = { router: null, modal: null };
  let phase: TransitionPhase = 'idle';
  let busy = false;
  let leavingPage: PageId | null = null;
  /** Last committed pathname (normalized), seen by the passive and the layout effect. */
  let committed: string | null = null;
  let laidOut: string | null = null;
  let pending: Pending | null = null;
  let shows = 0;
  let passingPop = false;
  let deferredPop = false;
  let frame = 0;
  let failsafe: ReturnType<typeof setTimeout> | undefined;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const stateListeners = new Set<() => void>();
  const showListeners = new Set<PageShowListener>();
  const liftListeners = new Set<PageShowListener>();

  const later = (fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      fn();
    }, ms);
    timers.add(timer);
    return timer;
  };

  const emitState = () => {
    Array.from(stateListeners).forEach((listener) => listener());
  };

  const setPhase = (next: TransitionPhase) => {
    if (phase === next) return;
    phase = next;
    emitState();
  };

  const setLeaving = (next: PageId | null) => {
    if (leavingPage === next) return;
    leavingPage = next;
    emitState();
  };

  const currentPage = (): PageId | null => pageIdOfPath(committed ?? location.pathname);

  const curtainEl = () => document.getElementById('curtain');

  const closeModals = () => {
    if (deps.modal?.isOpen()) deps.modal.close();
  };

  /** show(id) (L5050-5055) minus the parts React does (classes, title, nav): listeners, then resize. */
  const show = (info: PageShowInfo) => {
    shows += 1;
    document.querySelectorAll('[data-page].is-leaving').forEach((el) => {
      el.classList.remove('is-leaving');
    });
    notify(showListeners, info);
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      window.dispatchEvent(new Event('resize'));
      refreshParallax();
    });
  };

  const lift = (info: PageShowInfo) => {
    notify(liftListeners, info);
  };

  /** Re-runs a Back or Forward that arrived while busy, now that the transition is over. */
  const flushDeferredPop = () => {
    if (!deferredPop) return;
    deferredPop = false;
    if (normalizePath(location.pathname) === committed) return;
    later(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
    }, 0);
  };

  const scrollToAnchor = (p: Resolved) => {
    scrollToEl(p.el?.isConnected ? p.el : p.anchorId ? document.getElementById(p.anchorId) : null);
  };

  const finish = (p: Pending) => {
    pending = null;
    busy = false;
    setPhase('idle');
    if (p.anchorId || p.el) {
      if (p.mode === 'instant') later(() => scrollToAnchor(p), INSTANT_ANCHOR_MS);
      else scrollToAnchor(p);
    }
    flushDeferredPop();
  };

  /** The new route committed: show, then hold 140ms and reveal 640ms (or finish at once). */
  const onCommit = () => {
    const p = pending;
    if (!p) return;
    if (failsafe !== undefined) clearTimeout(failsafe);
    failsafe = undefined;
    setLeaving(null);
    const info: PageShowInfo = {
      pageId: currentPage() ?? p.pageId,
      first: false,
      curtain: p.mode === 'curtain',
    };
    if (p.mode === 'instant') {
      show(info);
      lift(info);
      finish(p);
      return;
    }
    setPhase('holding');
    show(info);
    const c = curtainEl();
    later(() => {
      c?.classList.add('is-out');
      c?.classList.remove('is-in');
      setPhase('revealing');
      lift(info);
      later(() => {
        c?.classList.remove('is-on', 'is-out');
        finish(p);
      }, CURTAIN.reveal);
    }, CURTAIN.hold);
  };

  const armFailsafe = () => {
    if (failsafe !== undefined) clearTimeout(failsafe);
    failsafe = setTimeout(() => {
      failsafe = undefined;
      if (phase === 'swapping') onCommit();
    }, COMMIT_FAILSAFE_MS);
  };

  /** T = 0 of the curtain (L5068-5071): label, is-on, reflow, is-in, and the leaving page. */
  const cover = (pageId: PageId) => {
    const page = pageById(pageId);
    setText('curtainNum', curtainNum(page));
    setText('curtainTitle', page.title);
    const c = curtainEl();
    if (c) {
      c.classList.remove('is-out');
      c.classList.add('is-on');
      void (c as HTMLElement).offsetWidth;
      c.classList.add('is-in');
    }
    document.querySelector('[data-page]')?.classList.add('is-leaving');
    setLeaving(currentPage());
    setPhase('covering');
  };

  /** T = 560: ask the App Router for the new route (push, or let the held popstate through). */
  const navigate = (p: Pending) => {
    setPhase('swapping');
    armFailsafe();
    if (p.kind === 'push') {
      deps.router?.push(targetUrl(p), { scroll: false });
      return;
    }
    const state: unknown = history.state;
    if (isAppRouterState(state)) {
      passingPop = true;
      try {
        window.dispatchEvent(new PopStateEvent('popstate', { state }));
      } finally {
        passingPop = false;
      }
    } else {
      // An entry the App Router did not write: sync it through the router instead.
      deps.router?.replace(location.pathname + location.search + location.hash, { scroll: false });
    }
    // The entry changed again during the cover and is back on the shown route: nothing commits.
    if (normalizePath(location.pathname) === committed) {
      jumpTop();
      onCommit();
    }
  };

  /** Starts a page change (the target is another page and nothing is running). */
  const start = (t: Resolved, kind: Pending['kind']) => {
    busy = true;
    const p: Pending = { ...t, kind, mode: getReducedMotion() ? 'instant' : 'curtain' };
    pending = p;
    if (p.mode === 'instant') {
      // Reduced motion (L5067): no curtain; a pop is already on its way to the App Router.
      setPhase('swapping');
      armFailsafe();
      if (kind === 'push') deps.router?.push(targetUrl(p), { scroll: false });
      return;
    }
    cover(p.pageId);
    later(() => navigate(p), CURTAIN.cover);
  };

  /** Pushes a same page URL (the reference pushes its hash, L5063), never inside an iframe. */
  const pushSamePage = (t: Resolved) => {
    if (window.top !== window.self) return;
    const url = t.path + location.search + (t.anchorId ? '#' + t.anchorId : '');
    if (location.pathname + location.search + location.hash === url) return;
    try {
      history.pushState(null, '', url);
    } catch {
      /* ignored, like the reference */
    }
  };

  /** FH.go (L5058-5080). */
  const go = (target: GoTarget) => {
    const t = resolveGoTarget(target);
    if (!t) return;
    const same = t.pageId === currentPage();
    const anchor = t.el ?? (t.anchorId ? document.getElementById(t.anchorId) : null);
    // On the current page the anchor must exist (the reference stops when getElementById fails).
    if (same && t.anchorId && !anchor) return;
    closeModals();
    if (same) {
      pushSamePage(t);
      if (anchor) scrollToEl(anchor);
      else smoothTop();
      return;
    }
    if (busy) return;
    start(t, 'push');
  };

  /** popstate (L5093), capture phase so it runs before the App Router's listener. */
  const onPopState = (e: PopStateEvent) => {
    if (passingPop) return;
    const t = resolveLocation();
    if (!t) return;
    if (busy) {
      // Held until the running transition ends, then replayed against the live address.
      e.stopImmediatePropagation();
      deferredPop = true;
      return;
    }
    closeModals();
    if (t.pageId === currentPage()) {
      // A hash entry on the shown route: the App Router keeps the page; scroll like FH.go.
      const anchor = t.anchorId ? document.getElementById(t.anchorId) : null;
      if (anchor) scrollToEl(anchor);
      else if (!t.anchorId) smoothTop();
      return;
    }
    if (!getReducedMotion()) e.stopImmediatePropagation();
    start(t, 'pop');
  };

  /** The capture click listener for raw a[href^="#"] links (L5082-5092). */
  const onClick = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const origin = e.target;
    const a = origin instanceof Element ? origin.closest('a[href^="#"]') : null;
    if (!a) return;
    // Never let the browser perform a hash jump; a part's own handler "claims" the click by
    // calling preventDefault() again (for example the Profile hero sheets).
    const nativePreventDefault = e.preventDefault;
    let handled = false;
    nativePreventDefault.call(e);
    e.preventDefault = () => {
      handled = true;
      nativePreventDefault.call(e);
    };
    if (a.matches('.rail__link,.rail__logo') && e.detail && a instanceof HTMLElement) a.blur();
    const id = safeDecode((a.getAttribute('href') ?? '').slice(1));
    if (!id || a.hasAttribute('data-no-route')) return;
    const el = document.getElementById(id);
    if (!el && !resolveTarget('#' + id)) return;
    later(() => {
      if (handled) return;
      if (el && el.isConnected && !el.closest('[data-page]')) scrollToEl(el);
      else go(el && el.isConnected ? el : id);
    }, 0);
  };

  const reset = () => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    if (failsafe !== undefined) clearTimeout(failsafe);
    failsafe = undefined;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    // Never leave the curtain up or the router busy after an unmount.
    curtainEl()?.classList.remove('is-on', 'is-in', 'is-out');
    document.querySelectorAll('[data-page].is-leaving').forEach((el) => {
      el.classList.remove('is-leaving');
    });
    pending = null;
    busy = false;
    deferredPop = false;
    passingPop = false;
    leavingPage = null;
    phase = 'idle';
    emitState();
  };

  return {
    attach(next) {
      deps.router = next.router;
      deps.modal = next.modal;
    },
    go,
    scrollToEl,
    getPhase: () => phase,
    getLeavingPage: () => leavingPage,
    subscribe(listener) {
      stateListeners.add(listener);
      return () => {
        stateListeners.delete(listener);
      };
    },
    onShow(listener) {
      showListeners.add(listener);
      return () => {
        showListeners.delete(listener);
      };
    },
    onLift(listener) {
      liftListeners.add(listener);
      return () => {
        liftListeners.delete(listener);
      };
    },
    layoutCommit(pathname) {
      const path = normalizePath(pathname);
      if (laidOut !== null && laidOut !== path) jumpTop();
      laidOut = path;
    },
    commit(pathname) {
      const path = normalizePath(pathname);
      if (path === committed) return;
      const first = committed === null;
      committed = path;
      if (first) return;
      if (pending && phase === 'swapping') {
        onCommit();
        return;
      }
      // A route change nobody routed (an old hash redirect, a direct router call): report the
      // show once the app has booted; the boot reports the first one itself.
      const pageId = pageIdOfPath(path);
      if (phase !== 'idle' || shows === 0 || !pageId) return;
      const info: PageShowInfo = { pageId, first: false, curtain: false };
      show(info);
      lift(info);
    },
    mount() {
      window.addEventListener('click', onClick, true);
      window.addEventListener('popstate', onPopState, true);
      const cancelRedirect = applyHashRedirect(location, {
        replace: (url) => deps.router?.replace(url, { scroll: false }),
        scrollToEl,
      });
      const stopBoot = whenLoaded(() => {
        const pageId = currentPage();
        if (shows === 0 && pageId) {
          const info: PageShowInfo = { pageId, first: true, curtain: false };
          show(info);
          lift(info);
        }
        pages.forEach((p) => deps.router?.prefetch(p.path));
      });
      return () => {
        window.removeEventListener('click', onClick, true);
        window.removeEventListener('popstate', onPopState, true);
        cancelRedirect();
        stopBoot();
        reset();
      };
    },
  };
}

/* ------------------------------------------------------------------ context and provider */

/** Used without a provider (isolated renders, tests of single parts): plain navigation. */
function createDetachedController(): TransitionController {
  const noop = () => () => {};
  return {
    go(target) {
      const t = resolveGoTarget(target);
      if (t) window.location.assign(targetUrl(t));
    },
    scrollToEl,
    getPhase: () => 'idle',
    getLeavingPage: () => null,
    subscribe: noop,
    onShow: noop,
    onLift: noop,
  };
}

export const TransitionContext = createContext<TransitionController>(createDetachedController());

/**
 * Wraps the app once in the root layout, inside <ModalProvider>. Render <Curtain /> anywhere in
 * the shell; the provider finds it by id.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const modal = useModal();
  const pathname = usePathname() ?? '/';
  const [controller] = useState(createTransitionController);

  // The controller only reads the router and the modal API from events and timers.
  useLayoutEffect(() => {
    controller.attach({ router, modal });
  }, [controller, router, modal]);

  useLayoutEffect(() => {
    controller.layoutCommit(pathname);
  }, [controller, pathname]);

  useEffect(() => {
    controller.commit(pathname);
  }, [controller, pathname]);

  useEffect(() => controller.mount(), [controller]);

  return <TransitionContext value={controller}>{children}</TransitionContext>;
}
