import { useSyncExternalStore } from 'react';

import { getReducedMotion } from '@/hooks/useReducedMotion';
import { OBSERVE_AFTER_LOAD_MS } from '@/lib/motion';

/**
 * Boot state, the port of the reference preloader `done()` (L4782):
 * - loaded: the preloader is done and html.is-loaded is set (fe-12 calls markLoaded()).
 * - motionReady: 250ms later (0 with reduced motion), when the reference runs
 *   FH.observe(document) and FH.bind(document). Reveals and magnetic/tilt start then.
 */
export interface BootState {
  readonly loaded: boolean;
  readonly motionReady: boolean;
}

const SERVER_STATE: BootState = { loaded: false, motionReady: false };

let state: BootState = SERVER_STATE;
let readyTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function setState(next: BootState): void {
  state = next;
  Array.from(listeners).forEach((l) => l());
}

export function getBootState(): BootState {
  return state;
}

export function subscribeBoot(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Marks the preloader as done. motionReady follows after OBSERVE_AFTER_LOAD_MS
 * (a 0ms timer with reduced motion, like `setTimeout(fn, reduce ? 0 : 250)`).
 * Calling it again does nothing.
 */
export function markLoaded(): void {
  if (state.loaded) return;
  setState({ loaded: true, motionReady: false });
  readyTimer = setTimeout(
    () => {
      readyTimer = undefined;
      setState({ loaded: true, motionReady: true });
    },
    getReducedMotion() ? 0 : OBSERVE_AFTER_LOAD_MS,
  );
}

function when(pick: (s: BootState) => boolean, cb: () => void): () => void {
  if (pick(state)) {
    cb();
    return () => {};
  }
  const listener = (): void => {
    if (!pick(state)) return;
    listeners.delete(listener);
    cb();
  };
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Runs cb once the preloader is done (at once if it already is). Returns an unsubscribe. */
export function whenLoaded(cb: () => void): () => void {
  return when((s) => s.loaded, cb);
}

/** Runs cb once motionReady is true (at once if it already is). Returns an unsubscribe. */
export function whenMotionReady(cb: () => void): () => void {
  return when((s) => s.motionReady, cb);
}

/** { loaded, motionReady } for components. Both false during SSR and hydration. */
export function useBootState(): BootState {
  return useSyncExternalStore(subscribeBoot, getBootState, () => SERVER_STATE);
}

/** Test only: back to the not loaded state, pending timer cancelled. */
export function resetBootState(): void {
  if (readyTimer !== undefined) clearTimeout(readyTimer);
  readyTimer = undefined;
  state = SERVER_STATE;
  listeners.clear();
}
