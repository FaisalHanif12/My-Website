import { getReducedMotion } from '@/hooks/useReducedMotion';
import {
  EASE_OUT,
  MORPH_DEFAULT_MS,
  SWAP_IN_MS,
  SWAP_OFFSET_X_PX,
  SWAP_OFFSET_Y_PX,
  SWAP_OUT_EASE,
  SWAP_OUT_MS,
} from '@/lib/motion';

/**
 * View helpers of the contact form, booking and chat, ported exactly from the
 * reference (L5200-5225). Reduced motion is read once, like the reference's
 * `reduce = !!FH.reduce`.
 */

/** Resolves after ms (0 with reduced motion) (L5200). */
export function wait(ms: number): Promise<void> {
  return new Promise((r) => {
    setTimeout(r, getReducedMotion() ? 0 : ms);
  });
}

/**
 * Animates el's height across a DOM change (L5203-5213). A dur of 0 falls back to
 * 560 like the reference's `dur || 560`. Changes under 2px are not animated.
 */
export function morphHeight(
  el: HTMLElement,
  change: () => void,
  dur: number = MORPH_DEFAULT_MS,
): Promise<void> {
  if (getReducedMotion() || !el.animate) {
    change();
    return Promise.resolve();
  }
  const h0 = el.getBoundingClientRect().height;
  change();
  const h1 = el.getBoundingClientRect().height;
  if (Math.abs(h1 - h0) < 2) return Promise.resolve();
  const prev = el.style.overflow;
  el.style.overflow = 'hidden';
  const a = el.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], {
    duration: dur || MORPH_DEFAULT_MS,
    easing: EASE_OUT,
  });
  const done = (): void => {
    el.style.overflow = prev;
  };
  return a.finished.then(done, done);
}

/**
 * Swaps two sibling views with a slide and fade plus a height morph on the
 * container (L5215-5225). dir is the direction sign (1 or -1); axis 'y' slides 14px
 * vertically, anything else 22px horizontally.
 */
export function swapViews(
  container: HTMLElement,
  from: HTMLElement | null | undefined,
  to: HTMLElement,
  dir: number,
  axis?: 'x' | 'y',
): Promise<void> {
  if (from === to) return Promise.resolve();
  if (getReducedMotion() || !to.animate || !from) {
    if (from) from.hidden = true;
    to.hidden = false;
    return Promise.resolve();
  }
  const off = (d: number): string =>
    axis === 'y'
      ? 'translate3d(0,' + d * SWAP_OFFSET_Y_PX + 'px,0)'
      : 'translate3d(' + d * SWAP_OFFSET_X_PX + 'px,0,0)';
  const out = from.animate(
    [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: off(-dir) },
    ],
    { duration: SWAP_OUT_MS, easing: SWAP_OUT_EASE, fill: 'forwards' },
  );
  return out.finished.then(
    () => {
      const p = morphHeight(
        container,
        () => {
          from.hidden = true;
          out.cancel();
          to.hidden = false;
        },
        SWAP_IN_MS,
      );
      const inn = to.animate(
        [
          { opacity: 0, transform: off(dir) },
          { opacity: 1, transform: 'none' },
        ],
        { duration: SWAP_IN_MS, easing: EASE_OUT },
      );
      return Promise.all([p, inn.finished.catch(() => {})]).then(() => undefined);
    },
    () => {
      from.hidden = true;
      to.hidden = false;
    },
  );
}
