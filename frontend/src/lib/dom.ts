/**
 * DOM helpers ported from the reference core (FH.$, FH.$$, FH.lerp, L4566-4570),
 * plus clamp and the read once media query cache behind FH.reduce and FH.fine.
 */

/** FH.$: first match of selector s inside r (default document). */
export function $<E extends Element = HTMLElement>(s: string, r?: ParentNode | null): E | null {
  return (r || document).querySelector<E>(s);
}

/** FH.$$: every match of selector s inside r (default document), as an array. */
export function $$<E extends Element = HTMLElement>(s: string, r?: ParentNode | null): E[] {
  return Array.prototype.slice.call((r || document).querySelectorAll<E>(s)) as E[];
}

/** FH.lerp: a + (b - a) * t. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamps v into [min, max] the way the reference writes it: Math.max(min, Math.min(max, v)). */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

const mediaCache = new Map<string, boolean>();

/**
 * Reads a media query ONCE per app load and caches the answer, like FH.reduce and
 * FH.fine (L4565, L4627): the reference never listens for changes. Returns false
 * on the server and where matchMedia is missing.
 */
export function matchOnce(query: string): boolean {
  const hit = mediaCache.get(query);
  if (hit !== undefined) return hit;
  if (typeof window === 'undefined') return false;
  const value = typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
  mediaCache.set(query, value);
  return value;
}

/** Test only: forget the cached media answers so the next read queries again. */
export function resetMediaCache(): void {
  mediaCache.clear();
}
