'use client';

import { useEffect, useRef } from 'react';

import { subscribe } from '@/lib/scrollFrame';

/**
 * div.progress#progress (reference L3306), the 2px gradient bar on top. In the scroll frame
 * (L5036) it writes transform scaleX(scrollY / (scrollHeight - innerHeight)), unrounded, or
 * scaleX(0) when the page does not scroll. Written through a ref (no React state per frame). Not
 * updated on resize (reference quirk: the bar keeps its value until the next scroll).
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (y: number): void => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    };
    // Its own first update, so it does not depend on AppShell's flush() running after this effect.
    update(window.scrollY);
    return subscribe(update);
  }, []);

  return <div className="progress" id="progress" ref={ref}></div>;
}
