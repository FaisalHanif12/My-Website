/**
 * FH.asset (reference L4569) with the base moved to the site root: the reference
 * prefixes window.FH_BASE ('https://faisalhanif.work/', L17); the rebuild serves the
 * same files from frontend/public, so the base is '/'.
 * asset('imgs/a.png') === '/imgs/a.png'. Absolute http(s) URLs pass through and a
 * leading slash is not doubled, exactly like the reference function.
 */
export const ASSET_BASE = '/';

export function asset(p: string): string {
  return /^https?:/.test(p) ? p : ASSET_BASE + p.replace(/^\//, '');
}
