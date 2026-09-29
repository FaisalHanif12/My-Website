'use client';

import { useEffect, type ReactNode } from 'react';

import { getReducedMotion } from '@/hooks/useReducedMotion';
import { getBootState, markLoaded } from '@/lib/boot';
import { PRELOADER_HOLD_MS } from '@/lib/motion';
import { flush } from '@/lib/scrollFrame';

/**
 * The preloader done() of the reference boot (L5150): is-done on #preloader (its clip-path wipe
 * is CSS, L256-257), html.is-loaded, then the boot store (markLoaded starts the 250ms motionReady
 * timer, 0 with reduced motion, like the setTimeout around FH.observe and FH.bind). Both classes
 * are added through classList only, never from React state, so hydration never sees them.
 */
export function finishPreloader(): void {
  document.getElementById('preloader')?.classList.add('is-done');
  document.documentElement.classList.add('is-loaded');
  markLoaded();
}

/**
 * The boot of the reference core (L5146-5153), run once after hydration:
 * 1. The first scroll frame (onScroll() at L5149): the progress bar and the top bar state, through
 *    the shared scrollFrame subscribers (child effects run first, so they are subscribed by now).
 * 2. The preloader: done() after 1250ms, or at once with reduced motion (read once), exactly like
 *    `if(reduce) done(); else setTimeout(done, 1250)`.
 *
 * AppShell sits in the root layout, which persists across client navigation, so the preloader is
 * shown on the first load only. If it ever remounts after boot, it finishes at once instead of
 * showing the preloader again. The pending timer is cleared on unmount.
 */
export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    flush();
    if (getBootState().loaded || getReducedMotion()) {
      finishPreloader();
      return;
    }
    const timer = setTimeout(finishPreloader, PRELOADER_HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
