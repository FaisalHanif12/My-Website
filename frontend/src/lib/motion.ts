/**
 * Motion constants and small pure helpers copied from the reference core script
 * (reference-design/faisalhanif-redesign.html, window.FH, L4559-4786) and the
 * contact helpers (L5200-5225). Values are copied as written, never rounded.
 * The list follows REFERENCE_MAP.md 2121-2153; the extra constants below it are
 * the other numbers the ported helpers need.
 */

export const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';
export const EASE_IO = 'cubic-bezier(.65,0,.35,1)';

export const PRELOADER_HOLD_MS = 1250; // L4783
export const OBSERVE_AFTER_LOAD_MS = 250; // L4782 (0 with reduced motion)
export const REVEAL_IO: IntersectionObserverInit = {
  rootMargin: '0px 0px -8% 0px',
  threshold: 0.12,
}; // L4596
export const STAGGER_DEFAULT_MS = 70; // L4600
export const SPLIT_STEP_MS = 55; // L4581, L4585
export const COUNT_DEFAULT_MS = 1600; // L4615
export const MAGNETIC_DEFAULT = 0.25; // L4629
export const TILT_DEFAULT_DEG = 5; // L4633
export const TILT_PERSPECTIVE_PX = 900; // L4634
export const THEME_KEY = 'fh-theme'; // L14, L4639
export const THEME_COLOR = { light: '#0e6655', dark: '#050f0c' } as const; // L4640
export const THEME_REVEAL = { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)' } as const; // L4646
export const MODAL_FOCUS_MS = 60; // L4652
export const TOAST_MS = 3200; // L4663
export const TOPBAR_SCROLLED_PX = 12; // L4667
export const SCROLL_OFFSET = { mobile: 84, desktop: 32, breakpoint: 1024 } as const; // L4687
export const CURTAIN = { cover: 560, hold: 140, reveal: 640 } as const; // L4704-4710
export const INSTANT_ANCHOR_MS = 60; // L4698
export const INITIAL_ANCHOR_MS = 1600; // L4730
export const SMOOTH_LERP = 0.11; // L4746
export const SMOOTH_STOP_PX = 0.4; // L4746
export const WHEEL_LINE_PX = 32; // L4752
export const PARALLAX_DEFAULT = 0.1; // L4765
export const PARALLAX_MARGIN_PX = 200; // L4765
export const CURSOR_LERP = 0.08; // L4775

/* ---- Extra numbers used by the ported helpers ---- */

/** Media queries, written exactly as the reference reads them (L4565, L4627). */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const FINE_POINTER_QUERY = '(pointer:fine)';
export const CAN_HOVER_QUERY = '(hover:hover)';

/** Split words: delay base (L4581; contact overrides it with 170 + i * 130, L5566). */
export const SPLIT_BASE_MS = 0;
/** Magnetic and tilt: tilt lift written with the rotation (L4634). */
export const TILT_LIFT = 'translateY(-4px)';
/** Parallax targets (L4764). The `.site > [data-parallax]` part matches nothing, kept as is. */
export const PARALLAX_SELECTOR = '.page.is-current [data-parallax], .site > [data-parallax]';
/** Contact view helpers (L5199-5225). */
export const MORPH_DEFAULT_MS = 560; // L5210
export const SWAP_OUT_MS = 190; // L5219
export const SWAP_OUT_EASE = 'cubic-bezier(.4,0,1,1)'; // L5219
export const SWAP_IN_MS = 560; // L5221-5222
export const SWAP_OFFSET_Y_PX = 14; // L5218
export const SWAP_OFFSET_X_PX = 22; // L5218

/* ---- Pure helpers ---- */

/** Stagger delay in ms for the k-th direct [data-reveal] child: base + k * step (L4601). */
export function staggerDelay(base: number, step: number, k: number): number {
  return base + k * step;
}

/** Reads a stagger parent's attributes like L4600: parseInt(...) || default. */
export function parseStagger(
  stagger: string | number | null | undefined,
  delay: string | number | null | undefined,
): { step: number; base: number } {
  return {
    step: parseInt(String(stagger ?? ''), 10) || STAGGER_DEFAULT_MS,
    base: parseInt(String(delay ?? ''), 10) || 0,
  };
}

/** Split word delay in ms: base + i * step (L4581, L4585; contact L5566). */
export function splitDelay(i: number, step = SPLIT_STEP_MS, base = SPLIT_BASE_MS): number {
  return base + i * step;
}

/** Ease out quart used by every counter (L4617): 1 - (1 - p)^4. */
export function easeOutQuart(p: number): number {
  return 1 - Math.pow(1 - p, 4);
}

/** Decimal places copied from the data-count text (L4615). */
export function countDecimals(raw: string): number {
  return (String(raw).split('.')[1] || '').length;
}

/** Counter text for eased progress e (0 to 1): pre + (to * e).toFixed(dec) + suf (L4617). */
export function countFrameText(
  raw: string,
  e: number,
  prefix = '',
  suffix = '',
  decimals: number = countDecimals(raw),
): string {
  return prefix + (parseFloat(raw) * e).toFixed(decimals) + suffix;
}

/** Counter text with reduced motion or a non number: the raw attribute text (L4616). */
export function countRawText(raw: string, prefix = '', suffix = ''): string {
  return prefix + raw + suffix;
}

/** Counter text a finished count leaves in the DOM (the last frame, p = 1). */
export function countEndText(raw: string, prefix = '', suffix = '', decimals?: number): string {
  return isNaN(parseFloat(raw))
    ? countRawText(raw, prefix, suffix)
    : countFrameText(raw, 1, prefix, suffix, decimals);
}
