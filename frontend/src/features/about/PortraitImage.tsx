'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { portrait } from '@/content/about';

/**
 * figure.ab-portrait (reference L3446-3457): the ring, the clip with the monogram fallback and the
 * photo. If the image fails, the reference adds is-fallback to the figure and removes the img
 * (`onerror`), which reveals the "FH" monogram behind it; the same is done here.
 *
 * The photo is already a compact webp, so it is served as is (`unoptimized`): re-encoding or
 * resizing it would change its pixels against the reference, which the design must match exactly.
 */
export function PortraitImage() {
  const figure = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);
  return (
    <figure className="ab-portrait" id="ab-portrait" ref={figure}>
      <span className="ab-portrait__ring" aria-hidden="true"></span>
      <span className="ab-portrait__clip">
        <span className="ab-portrait__fb" aria-hidden="true">
          <span className="ab-portrait__fh">
            {portrait.monogram.plain}
            <span className="serif">{portrait.monogram.serif}</span>
          </span>
        </span>
        {!failed && (
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            priority
            unoptimized
            onError={() => {
              figure.current?.classList.add('is-fallback');
              setFailed(true);
            }}
          />
        )}
      </span>
    </figure>
  );
}
