import { getReducedMotion } from '@/hooks/useReducedMotion';
import { $$ } from '@/lib/dom';
import { PARALLAX_DEFAULT, PARALLAX_MARGIN_PX, PARALLAX_SELECTOR } from '@/lib/motion';

/**
 * Parallax, ported from the reference (L4760-4770). Off with reduced motion (read
 * once). Elements with data-parallax in the current page move by
 * (r.top + r.height / 2 - vh / 2) * -speed (speed = parseFloat(value) || .1, so "0"
 * becomes .1 like the reference), written to style.translate (not transform) so it
 * stacks with the element's own transform, scale and Web Animations. Elements more
 * than 200px outside the viewport keep their last value. The rect is measured with
 * the previous translate applied, as the reference does.
 */

let installed = false;
let raf = 0;

function upd(): void {
  raf = 0;
  const vh = innerHeight;
  $$<HTMLElement | SVGElement>(PARALLAX_SELECTOR).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -PARALLAX_MARGIN_PX || r.top > vh + PARALLAX_MARGIN_PX) return;
    const sp = parseFloat(el.dataset.parallax ?? '') || PARALLAX_DEFAULT;
    const off = (r.top + r.height / 2 - vh / 2) * -sp;
    el.style.translate = '0 ' + off.toFixed(1) + 'px';
  });
}

function schedule(): void {
  if (!raf) raf = requestAnimationFrame(upd);
}

/** Subscribes to scroll (passive) and resize, one rAF each. Returns the uninstaller. */
export function installParallax(): () => void {
  if (typeof window === 'undefined' || installed || getReducedMotion()) return () => {};
  installed = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    installed = false;
  };
}

/**
 * FH._parallax (L4766): update now. Called at boot and one frame after every page
 * show. Does nothing when parallax is off (reduced motion), like the reference.
 */
export function refreshParallax(): void {
  if (!installed) return;
  if (raf) cancelAnimationFrame(raf);
  upd();
}
