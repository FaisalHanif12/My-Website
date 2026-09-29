/**
 * Modal and toast system (fe-09) against the reference core (L4649-4663) and markup
 * (L4240-4243, L4494-4497, L4557).
 *
 * 1. Rendered shells match the reference attribute for attribute (order included).
 * 2. Click delegation: [data-close], [data-open], [data-book] ("deep" payload), first match wins.
 * 3. Esc, body.modal-open, the 60ms first focus, focus return only after a real close.
 * 4. Focus trap cycling (lib/focusTrap).
 * 5. Toast text, is-on, the 3200ms timer and a new text node per call (repeats are announced).
 * 6. No document listener or timer survives unmount.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ModalProvider,
  useModal,
  useModalOpen,
  type ModalApi,
} from '@/components/providers/ModalProvider';
import { ToastProvider, useToast } from '@/components/providers/ToastProvider';
import { Modal, type ModalProps } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { getTabbable, trapTab } from '@/lib/focusTrap';

const HERE = dirname(fileURLToPath(import.meta.url));
const REFERENCE = resolve(HERE, '../../../../reference-design/faisalhanif-redesign.html');
const refLines = readFileSync(REFERENCE, 'utf8').split('\n');

/** Reference lines a..b (1-based, inclusive). */
function ref(a: number, b = a): string {
  return refLines.slice(a - 1, b).join('\n');
}

function parse(html: string): Element {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild;
  if (!el) throw new Error('nothing parsed');
  return el;
}

/** Tag, attributes in order, and element children (text ignored). */
function shape(el: Element): string {
  const attrs = Array.from(el.attributes)
    .map((a) => `${a.name}="${a.value}"`)
    .join(' ');
  const kids = Array.from(el.children).map(shape).join('');
  return `<${el.tagName.toLowerCase()} ${attrs}>${kids}</${el.tagName.toLowerCase()}>`;
}

const BOOKING: ModalProps = {
  id: 'booking',
  className: 'ct-bk',
  labelledBy: 'ct-bk-t1',
  closeLabel: 'Close booking',
  panelProps: { className: 'ct-bk__panel', 'data-native-scroll': '' },
};

const PUREBODY: ModalProps = {
  id: 'purebody',
  className: 'wk-pb',
  labelledBy: 'wk-pb-title',
  closeLabel: 'Close PureBody showcase',
};

function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ModalProvider>{children}</ModalProvider>
    </ToastProvider>
  );
}

let api: ModalApi;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.className = '';
});

describe('Modal markup', () => {
  it('reference lines are where the brief says', () => {
    expect(ref(4240)).toContain('<div class="fh-modal ct-bk" id="booking" aria-hidden="true">');
    expect(ref(4494)).toContain('<div class="fh-modal wk-pb" id="purebody" aria-hidden="true">');
    expect(ref(4557)).toContain('<div class="toast" id="toast"');
  });

  it('booking shell matches L4240-4243 attribute for attribute (+ data-native-scroll, L5794)', () => {
    const { container } = render(
      <Providers>
        <Modal {...BOOKING} />
      </Providers>,
    );
    const expected = parse(`${ref(4240, 4243)}</div></div>`);
    // The booking script adds this at run time (L5794); it lands after aria-labelledby.
    expected.querySelector('.fh-modal__panel')?.setAttribute('data-native-scroll', '');
    const actual = container.querySelector('#booking');
    expect(actual).not.toBeNull();
    expect(shape(actual as Element)).toBe(shape(expected));
  });

  it('PureBody shell matches L4494-4497 attribute for attribute', () => {
    const { container } = render(
      <Providers>
        <Modal {...PUREBODY} />
      </Providers>,
    );
    const expected = parse(`${ref(4494, 4497)}</div></div>`);
    expect(shape(container.querySelector('#purebody') as Element)).toBe(shape(expected));
  });

  it('server markup is the closed reference shell', () => {
    const html = renderToStaticMarkup(
      <Providers>
        <Modal {...PUREBODY}>
          <p>kept</p>
        </Modal>
        <Toast />
      </Providers>,
    );
    expect(html).toBe(
      '<div class="fh-modal wk-pb" id="purebody" aria-hidden="true">' +
        '<div class="fh-modal__scrim" data-close=""></div>' +
        '<div class="fh-modal__panel" role="dialog" aria-modal="true" aria-labelledby="wk-pb-title">' +
        '<button type="button" class="fh-modal__close" data-close="" aria-label="Close PureBody showcase">' +
        '<svg class="i"><use href="#i-close"></use></svg></button><p>kept</p></div></div>' +
        '<div class="toast" id="toast" role="status" aria-live="polite"></div>',
    );
  });

  it('children stay mounted while closed', () => {
    render(
      <Providers>
        <Modal {...PUREBODY}>
          <p>inside</p>
        </Modal>
      </Providers>,
    );
    expect(screen.getByText('inside')).toBeInTheDocument();
    expect(document.getElementById('purebody')).toHaveAttribute('aria-hidden', 'true');
  });
});

const captureApi = (a: ModalApi) => {
  api = a;
};

/** Captures the modal API from inside the provider. */
function ApiProbe({ onApi }: { onApi: (a: ModalApi) => void }) {
  onApi(useModal());
  return null;
}

function OpenFlag({ id }: { id?: string }) {
  const open = useModalOpen(id);
  return <output data-testid={`flag-${id ?? 'any'}`}>{open ? 'open' : 'closed'}</output>;
}

interface HarnessProps {
  onOpen?: ModalProps['onOpen'];
  onClose?: ModalProps['onClose'];
  extra?: ReactNode;
}

function Harness({ onOpen, onClose, extra }: HarnessProps) {
  return (
    <Providers>
      <ApiProbe onApi={captureApi} />
      <button type="button" data-book="">
        Book
      </button>
      <button type="button" data-book="deep">
        Deep
      </button>
      <button type="button" data-book="other">
        Other
      </button>
      <button type="button" data-book="">
        <svg data-testid="book-icon">
          <use href="#i-calendar" />
        </svg>
      </button>
      <a href="#x" data-open="purebody">
        Live
      </a>
      <button type="button" data-open="purebody" data-book="deep">
        Open beats book
      </button>
      <button type="button" data-close="" data-book="">
        Close beats book
      </button>
      <button type="button">Plain</button>
      <OpenFlag id="booking" />
      <OpenFlag />
      {extra}
      <Modal {...BOOKING} onOpen={onOpen} onClose={onClose}>
        <input aria-label="Email" />
        <button type="button">Inner last</button>
      </Modal>
      <Modal {...PUREBODY}>
        <a href="#y">PB link</a>
      </Modal>
    </Providers>
  );
}

const booking = () => document.getElementById('booking') as HTMLElement;
const purebody = () => document.getElementById('purebody') as HTMLElement;
const closeButton = (modal: HTMLElement) =>
  modal.querySelector('.fh-modal__close') as HTMLButtonElement;

describe('ModalProvider click delegation', () => {
  it('[data-book] opens booking (quick), prevents default, runs onOpen synchronously', () => {
    const onOpen = vi.fn();
    render(<Harness onOpen={onOpen} />);
    const notPrevented = fireEvent.click(screen.getByText('Book'));
    expect(notPrevented).toBe(false);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith({ type: 'quick' });
    expect(booking().className).toBe('fh-modal ct-bk is-open');
    expect(booking()).toHaveAttribute('aria-hidden', 'false');
    expect(document.body).toHaveClass('modal-open');
    expect(api.isOpen('booking')).toBe(true);
    expect(api.isOpen()).toBe(true);
    expect(api.payloadOf('booking')).toEqual({ type: 'quick' });
    expect(screen.getByTestId('flag-booking')).toHaveTextContent('open');
    expect(screen.getByTestId('flag-any')).toHaveTextContent('open');
  });

  it('[data-book="deep"] sends the deep payload; any other value is quick', () => {
    const onOpen = vi.fn();
    render(<Harness onOpen={onOpen} />);
    fireEvent.click(screen.getByText('Deep'));
    expect(onOpen).toHaveBeenLastCalledWith({ type: 'deep' });
    expect(api.payloadOf('booking')).toEqual({ type: 'deep' });
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByText('Other'));
    expect(onOpen).toHaveBeenLastCalledWith({ type: 'quick' });
  });

  it('a click on the icon inside a Book button still opens booking', () => {
    render(<Harness />);
    fireEvent.click(screen.getByTestId('book-icon'));
    expect(api.isOpen('booking')).toBe(true);
  });

  it('[data-open] opens that modal and prevents default', () => {
    render(<Harness />);
    const notPrevented = fireEvent.click(screen.getByText('Live'));
    expect(notPrevented).toBe(false);
    expect(purebody().className).toBe('fh-modal wk-pb is-open');
    expect(api.isOpen('booking')).toBe(false);
    expect(api.payloadOf('purebody')).toBeUndefined();
  });

  it('first match wins: data-close, then data-open, then data-book', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Open beats book'));
    expect(api.isOpen('purebody')).toBe(true);
    expect(api.isOpen('booking')).toBe(false);
    // data-close outside any modal closes every open modal and opens nothing.
    fireEvent.click(screen.getByText('Close beats book'));
    expect(api.isOpen()).toBe(false);
    expect(document.body).not.toHaveClass('modal-open');
  });

  it('the scrim and the close button close their own modal only', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(screen.getByText('Live'));
    fireEvent.click(purebody().querySelector('.fh-modal__scrim') as Element);
    expect(api.isOpen('purebody')).toBe(false);
    expect(api.isOpen('booking')).toBe(true);
    expect(document.body).toHaveClass('modal-open');
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(closeButton(booking()).querySelector('use') as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(booking().className).toBe('fh-modal ct-bk');
    expect(booking()).toHaveAttribute('aria-hidden', 'true');
    expect(document.body).not.toHaveClass('modal-open');
    expect(screen.getByTestId('flag-any')).toHaveTextContent('closed');
  });

  it('Esc closes every open modal', () => {
    render(<Harness />);
    act(() => {
      api.open('booking');
      api.open('purebody');
    });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(api.isOpen()).toBe(false);
    expect(document.body).not.toHaveClass('modal-open');
  });

  it('open() on an id with no mounted Modal does nothing', () => {
    render(<Harness />);
    act(() => api.open('nope'));
    expect(api.isOpen()).toBe(false);
    expect(document.body).not.toHaveClass('modal-open');
  });

  it('StrictMode double effects leave one set of listeners', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    render(
      <StrictMode>
        <Harness onOpen={onOpen} onClose={onClose} />
      </StrictMode>,
    );
    fireEvent.click(screen.getByText('Book'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(api.isOpen('booking')).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(api.isOpen()).toBe(false);
  });

  it('onOpen and onClose use the latest callbacks', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Harness onClose={first} />);
    rerender(<Harness onClose={second} />);
    fireEvent.click(screen.getByText('Book'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe('ModalProvider focus', () => {
  it('focuses the first focusable (the close button) after 60ms without scrolling', () => {
    render(<Harness />);
    const opener = screen.getByText('Book');
    opener.focus();
    const spy = vi.spyOn(HTMLElement.prototype, 'focus');
    fireEvent.click(opener);
    act(() => vi.advanceTimersByTime(59));
    expect(document.activeElement).toBe(opener);
    act(() => vi.advanceTimersByTime(1));
    expect(document.activeElement).toBe(closeButton(booking()));
    expect(spy).toHaveBeenLastCalledWith({ preventScroll: true });
    spy.mockRestore();
  });

  it('returns focus to the opener when a modal really closes', () => {
    render(<Harness />);
    const opener = screen.getByText('Book');
    opener.focus();
    fireEvent.click(opener);
    act(() => vi.advanceTimersByTime(60));
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(document.activeElement).toBe(opener);
  });

  it('Esc or close() with nothing open does not move focus (map note 9)', () => {
    render(<Harness />);
    const opener = screen.getByText('Book');
    opener.focus();
    fireEvent.click(opener);
    fireEvent.keyDown(document, { key: 'Escape' });
    const other = screen.getByText('Plain');
    other.focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(other);
    act(() => api.close('booking'));
    expect(document.activeElement).toBe(other);
  });

  it('opts.returnFocus wins over the focused element (chat Book action)', () => {
    render(<Harness extra={<button type="button">Chat FAB</button>} />);
    const fab = screen.getByText('Chat FAB');
    screen.getByText('Plain').focus();
    act(() => api.open('booking', { payload: { type: 'deep' }, returnFocus: fab }));
    act(() => vi.advanceTimersByTime(60));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(fab);
  });

  it('closing before 60ms cancels the first focus', () => {
    render(<Harness />);
    const opener = screen.getByText('Book');
    opener.focus();
    fireEvent.click(opener);
    act(() => vi.advanceTimersByTime(30));
    fireEvent.keyDown(document, { key: 'Escape' });
    act(() => vi.advanceTimersByTime(100));
    expect(document.activeElement).toBe(opener);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('focus trap', () => {
  it('Tab on the last element wraps to the close button, Shift+Tab wraps back', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Book'));
    act(() => vi.advanceTimersByTime(60));
    const first = closeButton(booking());
    const last = screen.getByText('Inner last');
    expect(document.activeElement).toBe(first);

    expect(fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(last);
    expect(fireEvent.keyDown(last, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(first);
  });

  it('Tab in the middle of the panel is left to the browser', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Book'));
    const input = screen.getByLabelText('Email');
    input.focus();
    expect(fireEvent.keyDown(input, { key: 'Tab' })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'Tab', shiftKey: true })).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  it('Tab while focus is outside the open panel moves it in', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Book'));
    const outside = screen.getByText('Plain');
    outside.focus();
    expect(fireEvent.keyDown(outside, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(closeButton(booking()));
    outside.focus();
    fireEvent.keyDown(outside, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText('Inner last'));
  });

  it('traps in the modal opened last, and not at all when none is open', () => {
    render(<Harness />);
    const plain = screen.getByText('Plain');
    plain.focus();
    expect(fireEvent.keyDown(plain, { key: 'Tab' })).toBe(true);
    act(() => {
      api.open('booking');
      api.open('purebody');
    });
    const link = screen.getByText('PB link');
    link.focus();
    fireEvent.keyDown(link, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton(purebody()));
  });

  it('getTabbable skips hidden, disabled, inert, negative tabindex and unchecked radios', () => {
    const { container } = render(
      <div>
        <button type="button">a</button>
        <button type="button" disabled>
          disabled
        </button>
        <div hidden>
          <button type="button">hidden</button>
        </div>
        <div style={{ display: 'none' }}>
          <input aria-label="none" />
        </div>
        <span style={{ visibility: 'hidden' }}>
          <a href="#h">invisible</a>
        </span>
        <div inert>
          <button type="button">inert</button>
        </div>
        <span tabIndex={-1}>minus</span>
        <input type="hidden" />
        <input type="radio" name="t" value="1" aria-label="r1" />
        <input type="radio" name="t" value="2" aria-label="r2" defaultChecked />
        <input type="radio" name="u" value="1" aria-label="u1" />
        <input type="radio" name="u" value="2" aria-label="u2" />
        <span tabIndex={0}>zero</span>
        <a href="#z">z</a>
      </div>,
    );
    const names = getTabbable(container.firstElementChild as HTMLElement).map(
      (el) => el.getAttribute('aria-label') ?? el.textContent,
    );
    expect(names).toEqual(['a', 'r2', 'u1', 'zero', 'z']);
  });

  it('trapTab ignores other keys and keeps focus in an empty container', () => {
    const { container } = render(<div tabIndex={-1} />);
    const box = container.firstElementChild as HTMLElement;
    const other = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    expect(trapTab(other, box)).toBe(false);
    const tab = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    expect(trapTab(tab, box)).toBe(true);
    expect(tab.defaultPrevented).toBe(true);
  });
});

function ToastButton({ msg }: { msg: string }) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast(msg)}>
      {`say ${msg}`}
    </button>
  );
}

function ToastHarness() {
  return (
    <Providers>
      <ToastButton msg="Email copied to clipboard" />
      <ToastButton msg="Booking did not go through. Please try again." />
      <Toast />
    </Providers>
  );
}

const toastEl = () => document.getElementById('toast') as HTMLElement;

describe('Toast', () => {
  it('is always mounted with the reference markup (L4557), empty and hidden', () => {
    render(<ToastHarness />);
    expect(shape(toastEl())).toBe(shape(parse(ref(4557))));
    expect(toastEl().className).toBe('toast');
    expect(toastEl()).toHaveTextContent('');
  });

  it('shows the text with is-on and hides after 3200ms, keeping the text', () => {
    render(<ToastHarness />);
    fireEvent.click(screen.getByText('say Email copied to clipboard'));
    expect(toastEl().className).toBe('toast is-on');
    expect(toastEl()).toHaveTextContent('Email copied to clipboard');
    act(() => vi.advanceTimersByTime(3199));
    expect(toastEl()).toHaveClass('is-on');
    act(() => vi.advanceTimersByTime(1));
    expect(toastEl().className).toBe('toast');
    expect(toastEl()).toHaveTextContent('Email copied to clipboard');
  });

  it('a new toast replaces the text at once and restarts the timer', () => {
    render(<ToastHarness />);
    fireEvent.click(screen.getByText('say Email copied to clipboard'));
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.click(screen.getByText('say Booking did not go through. Please try again.'));
    expect(toastEl()).toHaveTextContent('Booking did not go through. Please try again.');
    act(() => vi.advanceTimersByTime(3199));
    expect(toastEl()).toHaveClass('is-on');
    act(() => vi.advanceTimersByTime(1));
    expect(toastEl()).not.toHaveClass('is-on');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a repeated identical toast swaps in a new text node (L4663 textContent=msg); hide keeps it', () => {
    render(<ToastHarness />);
    const say = () => fireEvent.click(screen.getByText('say Email copied to clipboard'));
    say();
    const first = toastEl().firstChild;
    expect(first).toBeInstanceOf(Text);
    act(() => vi.advanceTimersByTime(1000));
    say();
    const second = toastEl().firstChild;
    expect(second).toBeInstanceOf(Text);
    expect(second).not.toBe(first);
    expect(toastEl().textContent).toBe('Email copied to clipboard');
    expect(toastEl().childNodes.length).toBe(1);
    expect(toastEl().className).toBe('toast is-on');

    act(() => vi.advanceTimersByTime(3200));
    expect(toastEl().className).toBe('toast');
    expect(toastEl().firstChild).toBe(second);
    expect(toastEl().textContent).toBe('Email copied to clipboard');
    expect(toastEl().childNodes.length).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('useToast outside the provider throws a clear error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<ToastButton msg="x" />)).toThrow('inside <ToastProvider>');
    error.mockRestore();
  });
});

describe('cleanup on unmount', () => {
  it('removes every document listener, clears timers and unlocks the body', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(
      <>
        <Harness />
        <ToastHarness />
      </>,
    );
    const added = add.mock.calls.filter(([type]) => type === 'click' || type === 'keydown');
    expect(added.map(([type]) => type).sort()).toEqual(['click', 'click', 'keydown', 'keydown']);

    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(screen.getByText('say Email copied to clipboard'));
    expect(vi.getTimerCount()).toBe(2);
    expect(document.body).toHaveClass('modal-open');

    unmount();
    for (const [type, listener] of added) {
      expect(remove).toHaveBeenCalledWith(type, listener);
    }
    expect(vi.getTimerCount()).toBe(0);
    expect(document.body).not.toHaveClass('modal-open');

    // Nothing reacts after unmount.
    const stray = document.createElement('button');
    stray.setAttribute('data-book', '');
    document.body.appendChild(stray);
    expect(fireEvent.click(stray)).toBe(true);
    expect(document.body).not.toHaveClass('modal-open');
    stray.remove();
    add.mockRestore();
    remove.mockRestore();
  });

  it('a Modal that unmounts while open unlocks the body and drops its timer', () => {
    function Toggle({ show }: { show: boolean }) {
      return (
        <Providers>
          <ApiProbe onApi={captureApi} />
          <OpenFlag />
          {show && <Modal {...BOOKING} />}
        </Providers>
      );
    }
    const { rerender } = render(<Toggle show />);
    act(() => api.open('booking'));
    expect(document.body).toHaveClass('modal-open');
    rerender(<Toggle show={false} />);
    expect(document.body).not.toHaveClass('modal-open');
    expect(api.isOpen()).toBe(false);
    expect(screen.getByTestId('flag-any')).toHaveTextContent('closed');
    expect(vi.getTimerCount()).toBe(0);
  });
});
