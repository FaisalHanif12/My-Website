/**
 * Keyboard focus trap for dialogs (orchestrator decision: the modals and the chat panel keep Tab
 * inside while open; the reference has no trap, so nothing visible changes).
 *
 * Only the two ends are handled: Tab on the last tabbable element goes to the first, Shift+Tab on
 * the first goes to the last, and Tab while focus sits outside the container moves it in. Every
 * other Tab is left to the browser, so the native order (radio groups, tabindex, hidden screens)
 * stays exactly as it is.
 */

/** Everything that can take keyboard focus. Filtered further by `isTabbable`. */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

type Disableable = HTMLElement & { disabled?: boolean };

/** True when the element and its ancestors are rendered and not visibility hidden. */
function isRendered(el: HTMLElement): boolean {
  if (typeof el.checkVisibility === 'function') {
    return el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true });
  }
  // Fallback (older browsers and jsdom): walk the ancestors for display:none.
  const view = el.ownerDocument.defaultView;
  if (!view) return true;
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (view.getComputedStyle(node).display === 'none') return false;
  }
  return view.getComputedStyle(el).visibility !== 'hidden';
}

/** A named radio is tabbable only when it is the checked one of its group (or the first when none is). */
function isTabbableRadio(el: HTMLInputElement, container: HTMLElement): boolean {
  if (!el.name) return true;
  const group = Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
  ).filter((r) => r.name === el.name && r.form === el.form);
  const checked = group.find((r) => r.checked);
  return checked ? checked === el : group[0] === el;
}

function isTabbable(el: HTMLElement, container: HTMLElement): boolean {
  if (el.tabIndex < 0) return false;
  if ((el as Disableable).disabled) return false;
  if (el instanceof HTMLInputElement && el.type === 'hidden') return false;
  if (el.closest('[inert]')) return false;
  if (el instanceof HTMLInputElement && el.type === 'radio' && !isTabbableRadio(el, container)) {
    return false;
  }
  return isRendered(el);
}

/** The tabbable elements inside `container`, in document order. */
export function getTabbable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) =>
    isTabbable(el, container),
  );
}

/**
 * Handle one keydown for the trap. Returns true when it moved focus (and prevented the default).
 * Call it from a keydown listener while the dialog is open.
 */
export function trapTab(event: KeyboardEvent, container: HTMLElement): boolean {
  if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return false;
  const items = getTabbable(container);
  if (items.length === 0) {
    // Nothing to focus inside: keep focus from leaving the dialog.
    event.preventDefault();
    return true;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = container.ownerDocument.activeElement;
  const inside = active instanceof Node && container.contains(active);

  let target: HTMLElement | null = null;
  if (!inside) target = event.shiftKey ? last : first;
  else if (event.shiftKey && (active === first || active === container)) target = last;
  else if (!event.shiftKey && active === last) target = first;

  if (!target) return false;
  event.preventDefault();
  target.focus();
  return true;
}
