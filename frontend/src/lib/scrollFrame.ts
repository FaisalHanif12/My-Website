/**
 * The shared scroll frame of the reference core (L5034-5037): ONE passive window scroll listener,
 * throttled to one requestAnimationFrame by a ticking flag, that runs every subscriber in that
 * frame. ScrollProgress writes the #progress transform and the top bar toggles is-scrolled from it.
 *
 * The listener is added with the first subscriber and removed (pending frame cancelled) with the
 * last. Not updated on resize, like the reference. flush() is the boot call onScroll() (L5149):
 * AppShell runs it once after hydration.
 */

/** Gets window.scrollY at the time of the frame. */
export type ScrollFrameCallback = (scrollY: number) => void;

const subscribers = new Set<ScrollFrameCallback>();
let frame = 0;
let ticking = false;

function run(): void {
  frame = 0;
  const y = window.scrollY;
  Array.from(subscribers).forEach((cb) => cb(y));
  ticking = false;
}

function onScroll(): void {
  if (!ticking) {
    frame = requestAnimationFrame(run);
    ticking = true;
  }
}

/** Runs cb in the scroll frame from now on. Returns the unsubscribe. */
export function subscribe(cb: ScrollFrameCallback): () => void {
  subscribers.add(cb);
  if (subscribers.size === 1) window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    if (!subscribers.delete(cb) || subscribers.size) return;
    window.removeEventListener('scroll', onScroll);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    ticking = false;
  };
}

/** Runs every subscriber now, synchronously (the boot onScroll() call). */
export function flush(): void {
  const y = window.scrollY;
  Array.from(subscribers).forEach((cb) => cb(y));
}
