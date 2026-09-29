import { useSyncExternalStore } from 'react';

import { matchOnce } from '@/lib/dom';
import { CAN_HOVER_QUERY } from '@/lib/motion';

const subscribe = (): (() => void) => () => {};
const serverValue = (): boolean => false;

/** '(hover:hover)', read once per app load (same rule as FH.reduce and FH.fine). */
export function getCanHover(): boolean {
  return matchOnce(CAN_HOVER_QUERY);
}

/**
 * Hover capability, read ONCE per app load. False during SSR and hydration, so
 * never use it to change server markup.
 */
export function useCanHover(): boolean {
  return useSyncExternalStore(subscribe, getCanHover, serverValue);
}
