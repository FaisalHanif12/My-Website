import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { getReducedMotion, useReducedMotion } from '@/hooks/useReducedMotion';
import { useBootState } from '@/lib/boot';
import { REVEAL_IO } from '@/lib/motion';
import { isRevealed, markRevealed, revealKeyOf, subscribeRevealStore } from '@/lib/revealStore';

/* ---- One shared, one shot IntersectionObserver (reference L4594-4596) ---- */

let io: IntersectionObserver | null | undefined;
/**
 * Every callback waiting on an element. An element can carry several (a <Reveal>
 * plus an onView on the same node): the reference adds is-in to every observed
 * target independently of __onIn (L4595), so no registration may drop another.
 */
const callbacks = new Map<Element, Set<() => void>>();

function observer(): IntersectionObserver | null {
  if (io !== undefined) return io;
  io =
    typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const set = callbacks.get(e.target);
            callbacks.delete(e.target);
            io?.unobserve(e.target);
            set?.forEach((cb) => cb());
          });
        }, REVEAL_IO)
      : null;
  return io;
}

/**
 * Runs cb once, the first time el intersects (rootMargin '0px 0px -8% 0px',
 * threshold .12), then stops watching el. Several callers may wait on the same
 * element; one intersect runs them all. Without IntersectionObserver cb runs at
 * once, like the reference. Returns a disposer that removes only this cb, and stops
 * watching el when no other callback is left on it.
 */
export function observeOnce(el: Element, cb: () => void): () => void {
  const obs = observer();
  if (!obs) {
    cb();
    return () => {};
  }
  let set = callbacks.get(el);
  if (!set) {
    set = new Set();
    callbacks.set(el, set);
  }
  set.add(cb);
  obs.observe(el);
  return () => {
    const current = callbacks.get(el);
    if (!current || !current.delete(cb) || current.size > 0) return;
    callbacks.delete(el);
    obs.unobserve(el);
  };
}

/**
 * FH.onView (L4611): run fn once when el first enters view; at once with reduced
 * motion or without IntersectionObserver. Returns a disposer.
 */
export function onView(el: Element | null, fn: () => void): () => void {
  if (!el) return () => {};
  if (getReducedMotion()) {
    fn();
    return () => {};
  }
  return observeOnce(el, fn);
}

/** Test only: drop the shared observer so the next observe creates a new one. */
export function resetRevealObserver(): void {
  io?.disconnect();
  io = undefined;
  callbacks.clear();
}

/**
 * Finishes the CSS transitions an already revealed element may have started when it
 * got `.is-in` on mount (a layout read earlier in the same commit can give it a
 * hidden "before" style). CSS animations are left alone, so the ones the reference
 * replays on page show still replay.
 */
function settleTransitions(el: Element): void {
  if (typeof el.getAnimations !== 'function') return;
  el.getAnimations({ subtree: true }).forEach((a) => {
    if ('transitionProperty' in a) a.finish();
  });
}

export interface UseRevealOptions {
  /** Explicit key, unique across the app. Default: page id + DOM path (revealKeyOf). */
  revealKey?: string;
  /**
   * Observe at once, before motionReady. The reference does this only for the works
   * grid and certificate cards, which works.js observes at script run (L7108, L7153).
   */
  eager?: boolean;
  /**
   * Runs once, only on a real first intersect in this session. Unlike the reference's
   * el.__onIn (L4606), it is NOT called with reduced motion and NOT called when the
   * key is restored from revealStore (the element is then `is-in` from the first
   * paint and never observed). Callers must handle those two cases themselves, the
   * way useCountUp writes its final text at once in both.
   */
  onIn?: () => void;
}

export interface RevealState<T extends Element> {
  ref: (el: T | null) => void;
  /** True once revealed; merge `is-in` into the className from it. */
  isIn: boolean;
}

/**
 * Port of the reveal part of FH.observe (L4593-4611). The element gets `is-in` the
 * first time it intersects, one shot. Observation starts once motionReady is true
 * (first load: preloader done + 250ms; pages mounted later observe at once). With
 * reduced motion, or when its key was revealed on an earlier visit, it is `is-in`
 * from the first paint, and a key restored from an earlier visit does not replay.
 */
export function useReveal<T extends Element = HTMLElement>(
  options: UseRevealOptions = {},
): RevealState<T> {
  const { revealKey, eager = false, onIn } = options;
  const reduce = useReducedMotion();
  const { motionReady } = useBootState();

  const elRef = useRef<T | null>(null);
  const intersectedRef = useRef(false);
  const onInRef = useRef(onIn);
  const [domKey, setDomKey] = useState<string | null>(null);
  const key = revealKey ?? domKey;

  const revealed = useSyncExternalStore(
    subscribeRevealStore,
    () => key !== null && isRevealed(key),
    () => false,
  );
  const isIn = reduce || revealed;

  useEffect(() => {
    onInRef.current = onIn;
  });

  const ref = useCallback(
    (el: T | null) => {
      elRef.current = el;
      if (el && revealKey === undefined) setDomKey(revealKeyOf(el));
    },
    [revealKey],
  );

  // Revealed on an earlier visit: shown from the first paint, with no replay.
  useLayoutEffect(() => {
    if (!revealed || intersectedRef.current || !elRef.current) return;
    settleTransitions(elRef.current);
  }, [revealed]);

  useEffect(() => {
    if (isIn || key === null || (!eager && !motionReady)) return;
    const el = elRef.current;
    if (!el) return;
    return observeOnce(el, () => {
      intersectedRef.current = true;
      markRevealed(key);
      onInRef.current?.();
    });
  }, [isIn, key, eager, motionReady]);

  return { ref, isIn };
}
