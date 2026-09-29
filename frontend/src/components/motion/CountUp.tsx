'use client';

import { useCallback, type ElementType } from 'react';

import { useCountUp } from '@/hooks/useCountUp';

import { assignRef, withIsIn, type MotionElementProps } from './shared';

export interface CountUpProps extends Omit<MotionElementProps, 'children' | 'prefix'> {
  /** data-count text; decimals come from it ("2.50" counts with 2 decimals). */
  to: string | number;
  /** data-prefix */
  prefix?: string;
  /** data-suffix */
  suffix?: string;
  /** data-duration in ms (default 1600). */
  duration?: number;
  /** Overrides the decimals taken from `to`. */
  decimals?: number;
  /** Explicit reveal key (see useReveal). */
  revealKey?: string;
}

/**
 * <span data-count data-prefix data-suffix data-duration>0</span> counting up from
 * its own first intersection (L4613-4618). Gets `is-in` like the reference, since
 * [data-count] elements are observed by the reveal observer.
 */
export function CountUp({
  as = 'span',
  to,
  prefix,
  suffix,
  duration,
  decimals,
  revealKey,
  className,
  ref,
  ...rest
}: CountUpProps) {
  const {
    ref: countRef,
    isIn,
    text,
  } = useCountUp<HTMLElement>({ to, prefix, suffix, duration, decimals, revealKey });
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      countRef(el);
      assignRef(ref, el);
    },
    [countRef, ref],
  );
  const Tag = as as ElementType;
  return (
    <Tag
      ref={setRef}
      {...rest}
      className={withIsIn(className, isIn)}
      data-count={String(to)}
      data-prefix={prefix}
      data-suffix={suffix}
      data-duration={duration}
    >
      {text}
    </Tag>
  );
}
