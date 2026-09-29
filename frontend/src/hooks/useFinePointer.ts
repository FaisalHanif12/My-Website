import { useSyncExternalStore } from 'react';

import { matchOnce } from '@/lib/dom';
import { FINE_POINTER_QUERY } from '@/lib/motion';

const subscribe = (): (() => void) => () => {};
const serverValue = (): boolean => false;

/** FH.fine (L4627): '(pointer:fine)', read once per app load. */
export function getFinePointer(): boolean {
  return matchOnce(FINE_POINTER_QUERY);
}

/**
 * Fine pointer, read ONCE per app load like the reference. False during SSR and
 * hydration, so never use it to change server markup.
 */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getFinePointer, serverValue);
}
