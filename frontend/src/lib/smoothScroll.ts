import { getFinePointer } from '@/hooks/useFinePointer';
import { getReducedMotion } from '@/hooks/useReducedMotion';
import { SMOOTH_LERP, SMOOTH_STOP_PX, WHEEL_LINE_PX } from '@/lib/motion';

/**
 * Smooth wheel scrolling, ported from the reference (L4738-4758). Only with a fine
 * pointer and no reduced motion (both read once; width does not matter). Adds
 * html.smooth-on. The wheel is lerped (.11 per frame, stops under .4px); native
 * scroll is kept for ctrl (pinch), horizontal gestures, while body.modal-open,
 * inside [data-native-scroll] and inside inner areas that can still scroll.
 */

let installed = false;
let cur = 0;
let tgt = 0;
let run = false;
let raf = 0;

function max(): number {
  return document.documentElement.scrollHeight - innerHeight;
}

function canScroll(start: EventTarget | null, dy: number): boolean {
  let el = start instanceof Element ? start : null;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.hasAttribute('data-native-scroll')) return true;
    const cs = getComputedStyle(el);
    if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) {
      if (dy < 0 && el.scrollTop > 0) return true;
      if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
    }
    el = el.parentElement;
  }
  return false;
}

function loop(): void {
  cur += (tgt - cur) * SMOOTH_LERP;
  if (Math.abs(tgt - cur) < SMOOTH_STOP_PX) {
    cur = tgt;
    run = false;
  }
  window.scrollTo(0, cur);
  raf = run ? requestAnimationFrame(loop) : 0;
}

function kick(): void {
  if (!run) {
    run = true;
    raf = requestAnimationFrame(loop);
  }
}

function onWheel(e: WheelEvent): void {
  if (
    e.ctrlKey ||
    document.body.classList.contains('modal-open') ||
    Math.abs(e.deltaX) > Math.abs(e.deltaY)
  ) {
    return;
  }
  if (canScroll(e.target, e.deltaY)) return;
  e.preventDefault();
  if (!run) cur = scrollY;
  const d = e.deltaY * (e.deltaMode === 1 ? WHEEL_LINE_PX : e.deltaMode === 2 ? innerHeight : 1);
  tgt = Math.max(0, Math.min(max(), tgt + d));
  kick();
}

function onScroll(): void {
  if (!run) cur = tgt = scrollY;
}

/** Installs the smooth scroller when allowed. Returns the uninstaller. */
export function installSmoothScroll(): () => void {
  if (typeof window === 'undefined' || installed || getReducedMotion() || !getFinePointer()) {
    return () => {};
  }
  installed = true;
  document.documentElement.classList.add('smooth-on');
  cur = tgt = scrollY;
  run = false;
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    run = false;
    installed = false;
    document.documentElement.classList.remove('smooth-on');
  };
}

/** True when the smooth scroller is installed (the reference's `if (FH._smoothTo)`). */
export function isSmoothOn(): boolean {
  return installed;
}

/**
 * FH._smoothTo (L4756): glide to y (clamped to the page). Returns false and does
 * nothing when smooth scrolling is off; the caller then uses
 * window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }) like L4687.
 */
export function smoothTo(y: number): boolean {
  if (!installed) return false;
  cur = scrollY;
  tgt = Math.max(0, Math.min(max(), y));
  kick();
  return true;
}

/** FH._smoothReset (L4757): stop gliding and sync to the current scroll position. */
export function smoothReset(): void {
  if (!installed) return;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  run = false;
  cur = tgt = scrollY;
}
