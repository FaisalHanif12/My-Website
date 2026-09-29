import { useSyncExternalStore } from 'react';

import { matchOnce } from '@/lib/dom';
import { REDUCED_MOTION_QUERY } from '@/lib/motion';

const subscribe = (): (() => void) => () => {};
const serverValue = (): boolean => false;

/** FH.reduce (L4565): '(prefers-reduced-motion: reduce)', read once per app load. */
export function getReducedMotion(): boolean {
  return matchOnce(REDUCED_MOTION_QUERY);
}

/**
 * Reduced motion, read ONCE per app load like the reference (it never listens for
 * changes). False during SSR and hydration, so never use it to change server markup.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getReducedMotion, serverValue);
}
