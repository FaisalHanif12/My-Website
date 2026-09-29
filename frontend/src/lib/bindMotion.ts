import { getFinePointer } from '@/hooks/useFinePointer';
import { getReducedMotion } from '@/hooks/useReducedMotion';
import { MAGNETIC_DEFAULT, TILT_DEFAULT_DEG, TILT_LIFT, TILT_PERSPECTIVE_PX } from '@/lib/motion';

type Styled = Element & ElementCSSInlineStyle & HTMLOrSVGElement;

function isStyled(n: Element): n is Styled {
  return 'style' in n && 'dataset' in n;
}

/* ---- Spotlight (L4620-4624) ---- */

function onSpotlightMove(e: PointerEvent): void {
  const t = e.target as Element | null;
  const c = t && typeof t.closest === 'function' ? t.closest('[data-spotlight]') : null;
  if (!c || !isStyled(c)) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', e.clientX - r.left + 'px');
  c.style.setProperty('--my', e.clientY - r.top + 'px');
}

/**
 * One passive document pointermove listener that writes --mx/--my on the closest
 * [data-spotlight] (no rounding). Every pointer type, and with reduced motion too,
 * like the reference. Returns the uninstaller.
 */
export function installSpotlight(): () => void {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('pointermove', onSpotlightMove, { passive: true });
  return () => document.removeEventListener('pointermove', onSpotlightMove);
}

/* ---- Magnetic and tilt (L4626-4636) ---- */

/** Inline transform for magnetic strength s (L4630). */
export function magneticTransform(r: DOMRect, clientX: number, clientY: number, s: number): string {
  const x = (clientX - r.left - r.width / 2) * s;
  const y = (clientY - r.top - r.height / 2) * s;
  return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
}

/** Inline transform for tilt max angle m (L4634). */
export function tiltTransform(r: DOMRect, clientX: number, clientY: number, m: number): string {
  const px = (clientX - r.left) / r.width - 0.5;
  const py = (clientY - r.top) / r.height - 0.5;
  return (
    'perspective(' +
    TILT_PERSPECTIVE_PX +
    'px) rotateX(' +
    (-py * m).toFixed(2) +
    'deg) rotateY(' +
    (px * m).toFixed(2) +
    'deg) ' +
    TILT_LIFT
  );
}

/**
 * Elements that carry a transform we wrote, so the uninstaller can clear it. Nodes
 * removed from the DOM while the pointer was on them never get their own pointerout,
 * so they are pruned on every event; the set never holds a detached subtree alive.
 */
const moved = new Set<Styled>();
let bound = false;

function pruneDetached(): void {
  moved.forEach((n) => {
    if (!n.isConnected) moved.delete(n);
  });
}

/** Test only: how many elements the delegated handlers still hold. */
export function heldTransformCount(): number {
  return moved.size;
}

function onMove(e: PointerEvent): void {
  pruneDetached();
  // The reference binds pointermove on each element; with bubbling, the target's
  // own element fires first, then its ancestors, magnetic before tilt on each.
  for (let n = e.target as Element | null; n; n = n.parentElement) {
    if (!isStyled(n)) continue;
    if (n.hasAttribute('data-magnetic')) {
      const s = parseFloat(n.dataset.magnetic ?? '') || MAGNETIC_DEFAULT;
      n.style.transform = magneticTransform(n.getBoundingClientRect(), e.clientX, e.clientY, s);
      moved.add(n);
    }
    if (n.hasAttribute('data-tilt')) {
      const m = parseFloat(n.dataset.tilt ?? '') || TILT_DEFAULT_DEG;
      n.style.transform = tiltTransform(n.getBoundingClientRect(), e.clientX, e.clientY, m);
      moved.add(n);
    }
  }
}

function onOut(e: PointerEvent): void {
  pruneDetached();
  // pointerleave does not bubble: an element is left when the pointer goes out of
  // it (or a descendant) to something it does not contain.
  const to = e.relatedTarget as Node | null;
  for (let n = e.target as Element | null; n; n = n.parentElement) {
    if (!isStyled(n) || (!n.hasAttribute('data-magnetic') && !n.hasAttribute('data-tilt'))) {
      continue;
    }
    if (to && n.contains(to)) continue;
    n.style.transform = '';
    moved.delete(n);
  }
}

/**
 * FH.bind by document delegation: [data-magnetic] (strength parseFloat(value) || .25)
 * and [data-tilt] (max parseFloat(value) || 5) write the reference's inline
 * transform on pointermove and clear it on leave. No easing is added; the element's
 * CSS transition smooths it. Nothing is bound unless the pointer is fine and motion
 * is not reduced (read once). GlobalMotion calls it at motionReady, as the reference
 * binds at preloader done + 250ms. Returns the uninstaller, which also clears any
 * transform it left behind on elements still in the document (detached ones are
 * dropped, not touched).
 */
export function bindMotion(): () => void {
  if (typeof document === 'undefined' || bound || !getFinePointer() || getReducedMotion()) {
    return () => {};
  }
  bound = true;
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });
  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerout', onOut);
    moved.forEach((n) => {
      if (n.isConnected) n.style.transform = '';
    });
    moved.clear();
    bound = false;
  };
}
