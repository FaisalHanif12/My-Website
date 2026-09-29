'use client';

import { useEffect, useRef } from 'react';

/**
 * span#year (reference L4600): the reference sets it to the current year at boot (L5149). The
 * server renders `initial` (the build year) and this writes the visitor's current year after
 * hydration. It writes through the ref, not state, so hydration never sees a different text.
 */
export function FooterYear({ initial }: { initial: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.textContent = String(new Date().getFullYear());
  }, []);
  return (
    <span id="year" ref={ref}>
      {initial}
    </span>
  );
}
