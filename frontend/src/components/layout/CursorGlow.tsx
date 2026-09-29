'use client';

import { useEffect, useRef } from 'react';

import { getFinePointer } from '@/hooks/useFinePointer';
import { getReducedMotion } from '@/hooks/useReducedMotion';
import { lerp } from '@/lib/dom';
import { CURSOR_LERP } from '@/lib/motion';

/** The inline transform the reference writes each frame (L5144). */
function glowTransform(x: number, y: number): string {
  return 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
}

/**
 * div.cursor-glow#cursorGlow (reference L3315) and the lerped glow of cursor() (L5141-5144).
 *
 * Fine pointer and no reduced motion only (both read once). Starts at the viewport centre with one
 * synchronous frame like the reference loop, adds html.has-pointer on every pointermove (the CSS
 * fades it in), and eases x and y towards the pointer by .08 per frame.
 *
 * Orchestrator decision: the loop stops once it has settled and restarts on the next pointermove.
 * It stops only when x and y have reached their floating point fixed points (one more lerp step
 * would not change them). From then on the reference loop keeps writing the very same values, so
 * both the pixels and the internal x and y (the start of the next glide) are identical.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = ref.current;
    if (!g || !getFinePointer() || getReducedMotion()) return;
    const root = document.documentElement;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const loop = (): void => {
      x = lerp(x, tx, CURSOR_LERP);
      y = lerp(y, ty, CURSOR_LERP);
      g.style.transform = glowTransform(x, y);
      const settled = lerp(x, tx, CURSOR_LERP) === x && lerp(y, ty, CURSOR_LERP) === y;
      raf = settled ? 0 : requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent): void => {
      tx = e.clientX;
      ty = e.clientY;
      root.classList.add('has-pointer');
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    loop();
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
  }, []);

  return <div className="cursor-glow" id="cursorGlow" aria-hidden="true" ref={ref}></div>;
}
