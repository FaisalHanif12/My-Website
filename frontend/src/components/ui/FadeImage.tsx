'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export interface FadeImageProps {
  /** A path under public/, for example "/imgs/Smart Gallery.webp". Spaces are encoded here. */
  src: string;
  alt: string;
  /** Any intrinsic size: the CSS of the card sizes the image (width and height in %). */
  width: number;
  height: number;
  className?: string;
}

/**
 * The card and certificate images of the reference: hidden (opacity 0) until they load, then
 * `.is-ok` fades them in over the cover drawn behind them; a failed image removes itself, which
 * leaves the cover (reference `onload="this.classList.add('is-ok')" onerror="this.remove()"`).
 *
 * The image may finish loading before React hydrates, when `onLoad` would never fire, so the
 * decoded state is also read from the element on mount. The file is served as is (`unoptimized`):
 * the design must match the reference pixel for pixel, so the browser scales the original.
 */
export function FadeImage({ src, alt, width, height, className }: FadeImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'idle' | 'ok' | 'failed'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (el?.complete) setState(el.naturalWidth > 0 ? 'ok' : 'failed');
  }, []);

  if (state === 'failed') return null;
  return (
    <Image
      ref={ref}
      src={encodeURI(src)}
      alt={alt}
      width={width}
      height={height}
      className={[className, state === 'ok' ? 'is-ok' : ''].filter(Boolean).join(' ') || undefined}
      draggable={false}
      unoptimized
      onLoad={() => setState('ok')}
      onError={() => setState('failed')}
    />
  );
}
