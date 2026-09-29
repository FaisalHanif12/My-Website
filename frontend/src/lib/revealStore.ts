/**
 * Revealed keys that survive route changes. In the reference every page stays in
 * the DOM, so an element that got `.is-in` keeps it when its page is shown again
 * (reveals never replay, REFERENCE_MAP.md note 18). React remounts a page on every
 * visit, so the reveal hooks remember what already revealed here.
 *
 * Key = page + stable id. React's useId() is NOT stable across client remounts (it
 * is a global counter outside hydration), so the default id is the element's DOM
 * position inside its page root: `<data-page>:<child index path>` (see revealKeyOf).
 * A caller can pass an explicit key instead (unique across the app).
 */

const revealed = new Set<string>();
const listeners = new Set<() => void>();

export function isRevealed(key: string): boolean {
  return revealed.has(key);
}

export function markRevealed(key: string): void {
  if (revealed.has(key)) return;
  revealed.add(key);
  Array.from(listeners).forEach((l) => l());
}

export function subscribeRevealStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Stable key of an element: the id of its page root (`[data-page]`, falling back to
 * location.pathname outside a page) plus the child index path from that root down to
 * the element. Page markup renders the same on every visit, so the path is the same.
 */
export function revealKeyOf(el: Element): string {
  const root = el.closest('[data-page]');
  const stop = root ?? el.ownerDocument.body;
  const path: number[] = [];
  let node: Element | null = el;
  while (node && node !== stop) {
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    path.unshift(Array.prototype.indexOf.call(parent.children, node) as number);
    node = parent;
  }
  const page = root ? root.getAttribute('data-page') : el.ownerDocument.location?.pathname;
  return (page || '') + ':' + path.join('.');
}

/** Test only: forget every revealed key. */
export function clearRevealStore(): void {
  revealed.clear();
}
