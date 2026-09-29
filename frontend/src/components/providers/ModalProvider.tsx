'use client';

/**
 * Modal system: the React port of FH.openModal / FH.closeModal, the core click delegation and the
 * Esc handler (reference L4649-4660, REFERENCE_MAP.md 11.2.11), plus FH.openBooking's entry point
 * (contact.js L6166-6172: any data-book value other than "deep" opens Quick Chat).
 *
 * Markup keeps the reference attributes: [data-close] closes the modal around it, [data-open="id"]
 * opens #id, [data-book] / [data-book="deep"] opens the booking modal with a payload.
 *
 * Differences from the reference, none of them visible (orchestrator decisions and map note 9):
 * - Tab and Shift+Tab stay inside the open panel (lib/focusTrap).
 * - Focus goes back to the opener (or opts.returnFocus) only when a modal really closed, so Esc
 *   with nothing open no longer moves focus.
 * - The pending 60ms first focus is cancelled when its modal closes, and every timer and document
 *   listener is removed on unmount.
 * - onClose runs only for a modal that was open (the reference also fires fh:close on a closed
 *   modal when closeModal(id) names it; no caller does that).
 * - Opening a modal that is already open keeps the first opener as the focus return target.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { SessionTypeId } from '@/content/booking';
import { trapTab } from '@/lib/focusTrap';
import { MODAL_FOCUS_MS } from '@/lib/motion';

/** First focus target inside an opened modal (L4652). For both modals it is the close button. */
const FIRST_FOCUS_SELECTOR = '[autofocus],button,input,select,textarea,a[href]';

/** The booking modal id (L4240). */
export const BOOKING_MODAL_ID = 'booking';

export interface ModalOpenOptions {
  /** Data for the modal, read with payloadOf(id) or received by the Modal's onOpen. */
  payload?: unknown;
  /** Element that gets focus back when the modal closes (defaults to document.activeElement). */
  returnFocus?: HTMLElement | null;
}

/** Payload of open('booking') from a [data-book] button (L4658, L6167). */
export interface BookingPayload {
  type: SessionTypeId;
}

export interface ModalApi {
  /** FH.openModal(id): does nothing when no <Modal id> is mounted (like `if(!m) return`). */
  open(id: string, opts?: ModalOpenOptions): void;
  /** FH.closeModal(id?): closes that modal, or every open one when no id is given. */
  close(id?: string): void;
  /** Whether that modal is open; with no id, whether any modal is open. */
  isOpen(id?: string): boolean;
  /** The payload of the last open(id) call. */
  payloadOf<T = unknown>(id: string): T | undefined;
  /** Runs `listener` after every open or close. Returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
}

/** What a mounted <Modal> hands to the provider. */
export interface ModalHandle {
  root(): HTMLElement | null;
  panel(): HTMLElement | null;
  onOpen(payload: unknown): void;
  onClose(): void;
}

interface ModalController {
  api: ModalApi;
  register(id: string, handle: ModalHandle): () => void;
  onClick(e: MouseEvent): void;
  onKeydown(e: KeyboardEvent): void;
  dispose(): void;
}

/** data-book value to the booking payload (L6167: only "deep" is deep). */
export function bookingPayload(value: string | undefined): BookingPayload {
  return { type: value === 'deep' ? 'deep' : 'quick' };
}

type FocusTarget = HTMLElement | SVGElement;

function focusedElement(): FocusTarget | null {
  const el = document.activeElement;
  return el instanceof HTMLElement || el instanceof SVGElement ? el : null;
}

function createModalController(): ModalController {
  const handles = new Map<string, ModalHandle>();
  /** Open modal ids in opening order; the last one is on top and holds the focus trap. */
  const openIds: string[] = [];
  const payloads = new Map<string, unknown>();
  const focusTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const listeners = new Set<() => void>();
  /** The reference's single `lastFocus` (L4650). */
  let lastFocus: FocusTarget | null = null;

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const clearFocusTimer = (id: string) => {
    const timer = focusTimers.get(id);
    if (timer === undefined) return;
    clearTimeout(timer);
    focusTimers.delete(id);
  };

  const syncBodyClass = () => {
    if (openIds.length === 0) document.body.classList.remove('modal-open');
  };

  const open: ModalApi['open'] = (id, opts = {}) => {
    const handle = handles.get(id);
    if (!handle || !handle.root()) return;
    const wasOpen = openIds.includes(id);
    lastFocus = opts.returnFocus ?? (wasOpen ? lastFocus : focusedElement());
    if (wasOpen) openIds.splice(openIds.indexOf(id), 1);
    openIds.push(id);
    payloads.set(id, opts.payload);
    document.body.classList.add('modal-open');
    clearFocusTimer(id);
    focusTimers.set(
      id,
      setTimeout(() => {
        focusTimers.delete(id);
        const first = handle.root()?.querySelector<FocusTarget>(FIRST_FOCUS_SELECTOR);
        first?.focus({ preventScroll: true });
      }, MODAL_FOCUS_MS),
    );
    emit();
    handle.onOpen(opts.payload);
  };

  const close: ModalApi['close'] = (id) => {
    const ids = id ? [id] : openIds.slice();
    let closed = false;
    for (const modalId of ids) {
      const index = openIds.indexOf(modalId);
      if (index < 0) continue;
      openIds.splice(index, 1);
      clearFocusTimer(modalId);
      closed = true;
      emit();
      handles.get(modalId)?.onClose();
    }
    syncBodyClass();
    if (closed) lastFocus?.focus({ preventScroll: true });
  };

  const api: ModalApi = {
    open,
    close,
    isOpen: (id) => (id === undefined ? openIds.length > 0 : openIds.includes(id)),
    payloadOf: <T,>(id: string) => payloads.get(id) as T | undefined,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return {
    api,
    register(id, handle) {
      handles.set(id, handle);
      return () => {
        if (handles.get(id) !== handle) return;
        handles.delete(id);
        // A modal that unmounts while open must not leave the page scroll locked.
        const index = openIds.indexOf(id);
        if (index < 0) return;
        openIds.splice(index, 1);
        clearFocusTimer(id);
        syncBodyClass();
        emit();
      };
    },
    // Core click delegation (L4655-4659), bubble phase, first match wins.
    onClick(e) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const closer = target.closest('[data-close]');
      if (closer) {
        close(closer.closest('.fh-modal')?.id || undefined);
        return;
      }
      const opener = target.closest<FocusTarget>('[data-open]');
      if (opener) {
        e.preventDefault();
        open(opener.dataset.open ?? '');
        return;
      }
      const book = target.closest<FocusTarget>('[data-book]');
      if (book) {
        e.preventDefault();
        open(BOOKING_MODAL_ID, { payload: bookingPayload(book.dataset.book) });
      }
    },
    // Esc closes every open modal (L4660); Tab stays inside the top panel (decision).
    onKeydown(e) {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab' || openIds.length === 0) return;
      const panel = handles.get(openIds[openIds.length - 1])?.panel();
      if (panel) trapTab(e, panel);
    },
    dispose() {
      focusTimers.forEach((timer) => clearTimeout(timer));
      focusTimers.clear();
      if (openIds.length > 0) {
        openIds.length = 0;
        syncBodyClass();
      }
    },
  };
}

const ModalContext = createContext<ModalController | null>(null);

function useModalController(): ModalController {
  const controller = useContext(ModalContext);
  if (!controller) throw new Error('Modal hooks must be used inside <ModalProvider>.');
  return controller;
}

/** Wraps the app once (root layout). Owns the document click and keydown listeners. */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(createModalController);

  useEffect(() => {
    document.addEventListener('click', controller.onClick);
    document.addEventListener('keydown', controller.onKeydown);
    return () => {
      document.removeEventListener('click', controller.onClick);
      document.removeEventListener('keydown', controller.onKeydown);
      controller.dispose();
    };
  }, [controller]);

  return <ModalContext value={controller}>{children}</ModalContext>;
}

/** { open, close, isOpen, payloadOf, subscribe }. Stable for the life of the provider. */
export function useModal(): ModalApi {
  return useModalController().api;
}

/** Re-renders when that modal (or, with no id, any modal) opens or closes. */
export function useModalOpen(id?: string): boolean {
  const { api } = useModalController();
  return useSyncExternalStore(
    api.subscribe,
    () => api.isOpen(id),
    () => false,
  );
}

/** For ui/Modal only: registers a mounted modal shell. Returns the unregister function. */
export function useModalRegistry(): ModalController['register'] {
  return useModalController().register;
}
