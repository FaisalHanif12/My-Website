'use client';

/**
 * Theme: the React port of FH.setTheme and the theme toggle with circular reveal (reference
 * L5007-5016, REFERENCE_MAP.md 11.2.10).
 *
 * data-theme on <html> is the single source of truth (the head boot script sets it before paint,
 * see lib/themeBoot). React reads it through a tiny external store, so the server snapshot is
 * "light" (the server HTML, L2) and components catch up right after hydration without a mismatch.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { getReducedMotion } from '@/hooks/useReducedMotion';
import { THEME_COLOR, THEME_KEY, THEME_REVEAL } from '@/lib/motion';

/** The two themes the toggle writes. The boot script writes whatever is stored, like L15. */
export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The current data-theme on <html> (null when missing). */
export function getTheme(): string | null {
  return document.documentElement.getAttribute('data-theme');
}

const serverTheme = (): string | null => 'light';

/** Writes content on every meta[name=theme-color]: dark gets #050f0c, anything else #0e6655. */
function writeThemeColor(t: string | null): void {
  const color = t === 'dark' ? THEME_COLOR.dark : THEME_COLOR.light;
  document.querySelectorAll('meta[name=theme-color]').forEach((m) => {
    m.setAttribute('content', color);
  });
}

/**
 * FH.setTheme (L5008-5009): data-theme on <html>, localStorage fh-theme (in try/catch), the
 * theme-color meta, then the fh:theme event on document (detail = theme; the reference dispatches
 * it and nothing listens). Then React subscribers re-read the theme.
 */
export function setTheme(t: Theme): void {
  document.documentElement.setAttribute('data-theme', t);
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    // Storage blocked (private mode, disabled cookies): the theme still switches.
  }
  writeThemeColor(t);
  document.dispatchEvent(new CustomEvent('fh:theme', { detail: t }));
  Array.from(listeners).forEach((l) => l());
}

/**
 * The toggle click (L5010-5016). next is the other theme. Without the View Transitions API, or with
 * reduced motion (read once), the swap is instant. Otherwise the new theme grows as a circle from
 * the centre of the clicked button to the farthest viewport corner: 750ms, cubic-bezier(.65,0,.35,1)
 * on ::view-transition-new(root).
 */
export function toggleTheme(from: Element): void {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  if (typeof document.startViewTransition !== 'function' || getReducedMotion()) {
    setTheme(next);
    return;
  }
  const r = from.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(() => {
    setTheme(next);
  });
  vt.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            'circle(0px at ' + x + 'px ' + y + 'px)',
            'circle(' + R + 'px at ' + x + 'px ' + y + 'px)',
          ],
        },
        {
          duration: THEME_REVEAL.duration,
          easing: THEME_REVEAL.easing,
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    // A skipped transition rejects ready; the theme is already set, so there is nothing to do
    // (this only keeps an unhandled rejection out of the console).
    .catch(() => {});
}

interface ThemeContextValue {
  /** The current data-theme ("light" during SSR and hydration). */
  theme: string | null;
  setTheme: (t: Theme) => void;
  toggle: (from: Element) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Wraps the app once (root layout). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, serverTheme);

  // The boot script already set the meta for a dark first visit. This repeats it after hydration
  // in case React inserted its own theme-color meta while hydrating <head>. Nothing visible.
  useEffect(() => {
    if (getTheme() === 'dark') writeThemeColor('dark');
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle: toggleTheme }),
    [theme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

/** { theme, setTheme, toggle(fromEl) } from the nearest ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return ctx;
}
