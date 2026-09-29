'use client';

import { useEffect } from 'react';

import { whenMotionReady } from '@/lib/boot';
import { bindMotion, installSpotlight } from '@/lib/bindMotion';
import { installParallax, refreshParallax } from '@/lib/parallax';
import { installSmoothScroll } from '@/lib/smoothScroll';

/**
 * The app wide motion listeners of the reference core, mounted ONCE by the root
 * layout: spotlight (L4620-4624, at once, every pointer type, reduced motion too),
 * smooth wheel scrolling (L4738-4758) and parallax (L4760-4770, plus one update at
 * boot like L4781), and magnetic and tilt (L4626-4636) from motionReady on, like
 * FH.bind(document) at preloader done + 250ms. Everything is removed on unmount.
 */
export function GlobalMotion(): null {
  useEffect(() => {
    const offSpotlight = installSpotlight();
    const offSmooth = installSmoothScroll();
    const offParallax = installParallax();
    refreshParallax();
    const unbind: Array<() => void> = [];
    const offReady = whenMotionReady(() => {
      unbind.push(bindMotion());
    });
    return () => {
      offReady();
      unbind.forEach((off) => off());
      offParallax();
      offSmooth();
      offSpotlight();
    };
  }, []);
  return null;
}
