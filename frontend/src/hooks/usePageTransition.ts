/**
 * Page facing hooks of the TransitionProvider (the port of what page scripts read from the
 * reference core: FH.go, FH.scrollToEl, FH.current, `fh:page` and the curtain classes; see
 * REFERENCE_MAP.md 11.2.22 and "What each page subscribes to").
 *
 * Only the current page is mounted, so a page's listeners only ever hear its own shows. Pages
 * mounted by a transition subscribe in their mount effects, which run before the provider reports
 * the commit, so they receive the show that mounted them.
 */
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useRef, useSyncExternalStore } from 'react';

import {
  TransitionContext,
  type NavigateApi,
  type PageShowListener,
  type TransitionPhase,
} from '@/components/providers/TransitionProvider';
import { pageIdOfPath, type PageId } from '@/lib/routes';

export type {
  GoTarget,
  NavigateApi,
  PageShowInfo,
  PageShowListener,
  TransitionPhase,
} from '@/components/providers/TransitionProvider';

/** { go(target), scrollToEl(el) }: FH.go and FH.scrollToEl. Stable for the life of the app. */
export function useNavigate(): NavigateApi {
  return useContext(TransitionContext);
}

/** Keeps the latest callback in a ref so subscriptions never need to be renewed. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * Runs cb on every show of the page that uses it:
 * - first load: once the preloader is done (useBootState().loaded), with `first: true`;
 * - later visits: at the commit under the curtain (T = 560ms from the click), with
 *   `curtain: true`, or at once with reduced motion (`curtain: false`).
 * The scroll is already at the top; one frame later the provider dispatches a window resize.
 */
export function usePageShow(cb: PageShowListener): void {
  const { onShow } = useContext(TransitionContext);
  const latest = useLatest(cb);
  useEffect(() => onShow((info) => latest.current(info)), [onShow, latest]);
}

/**
 * Runs cb when the curtain starts to lift (is-out added, commit + 140ms, T = 700ms from the
 * click), or right after the show when no curtain ran (first load, reduced motion). The pages'
 * own waits (Profile 150ms, Works and Approvals 120ms) are counted from here.
 */
export function useCurtainLift(cb: PageShowListener): void {
  const { onLift } = useContext(TransitionContext);
  const latest = useLatest(cb);
  useEffect(() => onLift((info) => latest.current(info)), [onLift, latest]);
}

/** The page of the current route, or null on any other path. */
export function usePageId(): PageId | null {
  const pathname = usePathname();
  return pageIdOfPath(pathname ?? '/');
}

/** True while the page that uses it is being covered by the curtain (its root is .is-leaving). */
export function useIsLeaving(): boolean {
  const { subscribe, getLeavingPage } = useContext(TransitionContext);
  const leaving = useSyncExternalStore(subscribe, getLeavingPage, () => null);
  const page = usePageId();
  return leaving !== null && leaving === page;
}

/** The transition phase: idle, covering, swapping, holding or revealing. */
export function useTransitionPhase(): TransitionPhase {
  const { subscribe, getPhase } = useContext(TransitionContext);
  return useSyncExternalStore(subscribe, getPhase, () => 'idle');
}
