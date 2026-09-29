'use client';

import { useCallback, useLayoutEffect, useRef, type ElementType } from 'react';

import { useReveal } from '@/hooks/useReveal';
import { $$ } from '@/lib/dom';
import { parseStagger, staggerDelay } from '@/lib/motion';

import { assignRef, withIsIn, type MotionElementProps, type RevealVariant } from './shared';

export interface InViewProps extends MotionElementProps {
  /** Explicit reveal key, unique across the app (default: page id + DOM path). */
  revealKey?: string;
  /** Observe before motionReady (works grid and certificate cards only, L7108, L7153). */
  eager?: boolean;
}

/**
 * An element that gets `is-in` (React state merged into className) the first time
 * it enters view. Used by Reveal and SplitWords; see useReveal for the gating.
 */
export function InView({ as = 'div', revealKey, eager, className, ref, ...rest }: InViewProps) {
  const { ref: revealRef, isIn } = useReveal<HTMLElement>({ revealKey, eager });
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      revealRef(el);
      assignRef(ref, el);
    },
    [revealRef, ref],
  );
  const Tag = as as ElementType;
  return <Tag ref={setRef} className={withIsIn(className, isIn)} {...rest} />;
}

export interface RevealProps extends InViewProps {
  /** data-reveal value; '' (the default) renders data-reveal="". */
  variant?: RevealVariant;
  /** data-delay in ms; also written as --d, overriding a RevealGroup stagger (L4604). */
  delay?: number;
}

/**
 * <Reveal as variant delay>: renders data-reveal (empty string for the default
 * variant, never "true"), data-delay and --d, and adds `is-in` once it enters view.
 */
export function Reveal({ variant = '', delay, style, ...rest }: RevealProps) {
  const s = delay === undefined ? style : { ...style, '--d': delay + 'ms' };
  return <InView data-reveal={variant} data-delay={delay} style={s} {...rest} />;
}

export interface RevealGroupProps extends MotionElementProps {
  /** data-stagger: ms between direct [data-reveal] children (parseInt || 70). */
  stagger?: number;
  /** data-delay: the stagger base in ms (parseInt || 0). */
  delay?: number;
}

/**
 * A [data-stagger] parent (L4599-4602). Its DIRECT [data-reveal] children get
 * --d = base + k * step (k counts those children only) unless they already carry an
 * inline --d, which is how a child's own delay wins. Written to the DOM the way the
 * reference does it, so children rendered by other components are counted too.
 */
export function RevealGroup({ as = 'div', stagger, delay, ref, ...rest }: RevealGroupProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      elRef.current = el;
      assignRef(ref, el);
    },
    [ref],
  );

  useLayoutEffect(() => {
    const p = elRef.current;
    if (!p) return;
    const { step, base } = parseStagger(p.dataset.stagger, p.dataset.delay);
    $$(':scope > [data-reveal]', p).forEach((c, k) => {
      if (!c.style.getPropertyValue('--d')) {
        c.style.setProperty('--d', staggerDelay(base, step, k) + 'ms');
      }
    });
  });

  const Tag = as as ElementType;
  return <Tag ref={setRef} data-stagger={stagger ?? ''} data-delay={delay} {...rest} />;
}
