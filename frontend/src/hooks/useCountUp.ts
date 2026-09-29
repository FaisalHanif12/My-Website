import { useCallback, useEffect, useRef, useState } from 'react';

import { getReducedMotion, useReducedMotion } from '@/hooks/useReducedMotion';
import { useReveal } from '@/hooks/useReveal';
import {
  COUNT_DEFAULT_MS,
  countEndText,
  countFrameText,
  countRawText,
  easeOutQuart,
} from '@/lib/motion';

export interface UseCountUpOptions {
  /** The data-count text, e.g. "10" or "2.50" (decimals come from the text). */
  to: string | number;
  prefix?: string;
  suffix?: string;
  /** data-duration in ms; parseInt(...) || 1600 like L4615. */
  duration?: string | number;
  /** Overrides the decimals taken from the `to` text. */
  decimals?: number;
  /** Explicit reveal key (see useReveal). */
  revealKey?: string;
}

export interface CountUpState<T extends Element> {
  ref: (el: T | null) => void;
  isIn: boolean;
  /** The text to render inside the counter element. */
  text: string;
}

/**
 * Port of FH.count (L4613-4618). The text starts at "0" and counts up from the
 * element's own first intersection (it does not wait for a parent's reveal delay):
 * one rAF per frame, eased 1 - (1 - p)^4, formatted pre + (to * e).toFixed(dec) + suf.
 * Reduced motion or a non number: the raw text at once. Revealed on an earlier
 * visit: the finished text from the first paint. The rAF is cancelled on unmount.
 */
export function useCountUp<T extends Element = HTMLSpanElement>(
  options: UseCountUpOptions,
): CountUpState<T> {
  const { to, prefix = '', suffix = '', duration, decimals, revealKey } = options;
  const raw = String(to);
  const reduce = useReducedMotion();
  const [text, setText] = useState('0');
  const [started, setStarted] = useState(false);
  const rafRef = useRef(0);

  const optsRef = useRef({ raw, prefix, suffix, duration, decimals });
  useEffect(() => {
    optsRef.current = { raw, prefix, suffix, duration, decimals };
  });

  const start = useCallback(() => {
    setStarted(true);
    const o = optsRef.current;
    const target = parseFloat(o.raw);
    if (getReducedMotion() || isNaN(target)) {
      setText(countRawText(o.raw, o.prefix, o.suffix));
      return;
    }
    const dur = parseInt(String(o.duration ?? ''), 10) || COUNT_DEFAULT_MS;
    let t0: number | null = null;
    const tick = (t: number): void => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      setText(countFrameText(o.raw, easeOutQuart(p), o.prefix, o.suffix, o.decimals));
      rafRef.current = p < 1 ? requestAnimationFrame(tick) : 0;
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    },
    [],
  );

  const { ref, isIn } = useReveal<T>({ revealKey, onIn: start });

  let shown = text;
  if (reduce || isNaN(parseFloat(raw))) {
    // The reference writes the raw text as soon as the counter is observed.
    shown = reduce || isIn ? countRawText(raw, prefix, suffix) : text;
  } else if (isIn && !started) {
    // Revealed on an earlier visit: the count already finished there.
    shown = countEndText(raw, prefix, suffix, decimals);
  }

  return { ref, isIn, text: shown };
}
