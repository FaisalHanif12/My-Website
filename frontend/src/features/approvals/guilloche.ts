/**
 * The guilloche of the certificate deck (reference L8127-8132): interlaced wavy rings drawn once
 * as a symbol (#wk-guil) and reused by every card and by the seal. Pure and deterministic, so the
 * server renders the same paths the reference script builds at run time.
 */

/** One closed wavy ring: radius r0 + amp * sin(n * t + ph) around the centre, 360 steps. */
function ring(r0: number, amp: number, n: number, ph: number): string {
  const steps = 360;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = r0 + amp * Math.sin(n * t + ph);
    d += (i ? 'L' : 'M') + (r * Math.cos(t)).toFixed(2) + ' ' + (r * Math.sin(t)).toFixed(2);
  }
  return d + 'Z';
}

/** The 24 path data strings: 10 outer, 8 middle and 6 inner rings. */
export const GUILLOCHE_PATHS: readonly string[] = (() => {
  const out: string[] = [];
  for (let k = 0; k < 10; k++) out.push(ring(40, 5.5, 11, (k * Math.PI) / 10));
  for (let k = 0; k < 8; k++) out.push(ring(25, 3.6, 15, (k * Math.PI) / 8));
  for (let k = 0; k < 6; k++) out.push(ring(12, 2, 9, (k * Math.PI) / 6));
  return out;
})();
