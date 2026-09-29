'use client';

/**
 * Toast: the React port of FH.toast (L4662-4663, REFERENCE_MAP.md 11.2.12).
 * toast(msg) replaces the text at once, adds is-on and restarts the 3200ms hide timer. The text is
 * not cleared on hide. The #toast element itself is ui/Toast (always mounted, last in the layout).
 *
 * seq counts toast(msg) calls. The reference runs `t.textContent=msg` on every call, which always
 * swaps in a new Text node, even for the same message, so the polite live region announces a
 * repeated message again. React leaves an identical string alone, so ui/Toast keys the text on seq
 * to get a fresh node per call. Hiding keeps text and seq, so the node is not touched on hide.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { TOAST_MS } from '@/lib/motion';

export interface ToastState {
  text: string;
  on: boolean;
  /** Number of toast(msg) calls so far; ui/Toast keys the text node on it. */
  seq: number;
}

interface ToastStore {
  get(): ToastState;
  subscribe(listener: () => void): () => void;
  show(msg: string): void;
  dispose(): void;
}

const INITIAL: ToastState = { text: '', on: false, seq: 0 };

function createToastStore(): ToastStore {
  let state = INITIAL;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  const set = (next: ToastState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  return {
    get: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    show(msg) {
      set({ text: msg, on: true, seq: state.seq + 1 });
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        set({ ...state, on: false });
      }, TOAST_MS);
    },
    dispose() {
      clearTimeout(timer);
      timer = undefined;
    },
  };
}

const ToastContext = createContext<ToastStore | null>(null);

function useToastStore(): ToastStore {
  const store = useContext(ToastContext);
  if (!store) throw new Error('Toast hooks must be used inside <ToastProvider>.');
  return store;
}

/** Wraps the app once (root layout). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createToastStore);

  useEffect(() => () => store.dispose(), [store]);

  return <ToastContext value={store}>{children}</ToastContext>;
}

/** Returns toast(msg), stable for the life of the provider. */
export function useToast(): (msg: string) => void {
  return useToastStore().show;
}

/** Current text and visibility, for ui/Toast. */
export function useToastState(): ToastState {
  const store = useToastStore();
  return useSyncExternalStore(store.subscribe, store.get, () => INITIAL);
}
