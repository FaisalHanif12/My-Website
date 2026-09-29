import { useLayoutEffect, type RefObject } from 'react';

/**
 * Adds `is-in` to an element through classList, like the reference does (L4595), instead of merging
 * it into the React `className` prop.
 *
 * Many revealed elements are also toggled by the page scripts (is-open, is-focus, is-live, is-auto,
 * is-off, flash classes ...). If `is-in` travelled through `className`, React would rewrite the whole
 * class list the moment it flips and silently drop those classes. With classList React never sees
 * the change, and a later re-render with the same `className` prop leaves the DOM alone.
 *
 * A layout effect, so on a client navigation to a page that was already revealed the class is on
 * the element before the first paint.
 */
export function useIsInClass(ref: RefObject<Element | null>, isIn: boolean): void {
  useLayoutEffect(() => {
    if (isIn) ref.current?.classList.add('is-in');
  }, [ref, isIn]);
}
