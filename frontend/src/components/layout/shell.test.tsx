/**
 * The static shell pieces (fe-12) against the reference (reference-design/faisalhanif-redesign.html):
 *
 * 1. fonts.ts asks next/font for exactly the decided weights and styles (no variable range).
 * 2. The theme boot script (L12-16 plus the js class of L3226 and the dark theme-color decision):
 *    stored theme, dark preference, default, blocked storage, a late theme-color meta.
 * 3. ThemeProvider and ThemeToggle (L5007-5016): data-theme, fh-theme storage, theme-color,
 *    aria-pressed, the circular reveal with the View Transitions API.
 * 4. IconSprite (L3229-3292): pl-g plus the 59 symbols, byte for byte, in reference order.
 * 5. Preloader, ambient, cursor glow, progress and toggle markup match the reference attribute for
 *    attribute (order included).
 * 6. AppShell boot (L5146-5153): first scroll frame, the 1250ms preloader timer (at once with
 *    reduced motion), is-done, html.is-loaded, markLoaded and motionReady 250ms later, cleanup.
 * 7. scrollFrame and ScrollProgress (L5034-5037), CursorGlow (L5141-5144).
 *
 * Reference blocks are found by markers, not by line numbers, so an edit above them does not
 * break the test.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fontVariables } from '@/app/fonts';
import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { CursorGlow } from '@/components/layout/CursorGlow';
import { Preloader } from '@/components/layout/Preloader';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { AppShell, finishPreloader } from '@/components/providers/AppShell';
import { ThemeProvider, setTheme, useTheme } from '@/components/providers/ThemeProvider';
import { Icon } from '@/components/ui/Icon';
import { ICON_IDS, IconSprite, SPRITE_MARKUP } from '@/components/ui/IconSprite';
import { getBootState, resetBootState } from '@/lib/boot';
import { resetMediaCache } from '@/lib/dom';
import { flush, subscribe } from '@/lib/scrollFrame';
import { THEME_BOOT_SCRIPT } from '@/lib/themeBoot';

const fontCalls = vi.hoisted(() => ({}) as Record<string, unknown>);

vi.mock('next/font/google', () => {
  const make = (name: string) => (options: unknown) => {
    fontCalls[name] = options;
    return { className: name + '-class', variable: name + '-var', style: { fontFamily: name } };
  };
  return {
    Plus_Jakarta_Sans: make('Plus_Jakarta_Sans'),
    Instrument_Serif: make('Instrument_Serif'),
    JetBrains_Mono: make('JetBrains_Mono'),
  };
});

const HERE = dirname(fileURLToPath(import.meta.url));
const REFERENCE = resolve(HERE, '../../../../reference-design/faisalhanif-redesign.html');
const refLines = readFileSync(REFERENCE, 'utf8').split('\n');

/** 0-based index of the first reference line containing marker, at or after `from`. */
function refIndex(marker: string, from = 0): number {
  const i = refLines.findIndex((l, k) => k >= from && l.includes(marker));
  if (i < 0) throw new Error('reference marker not found: ' + marker);
  return i;
}

/** Reference lines from the one holding `start` through the one holding `end` (inclusive). */
function refBlock(start: string, end = start): string {
  const a = refIndex(start);
  const b = refIndex(end, a);
  return refLines.slice(a, b + 1).join('\n');
}

function parse(html: string): Element {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild;
  if (!el) throw new Error('nothing parsed');
  return el;
}

/** Tag, attributes in order, then the children (text trimmed, whitespace only text dropped). */
function shape(el: Element, skipAttrs: readonly string[] = []): string {
  const attrs = Array.from(el.attributes)
    .filter((a) => !skipAttrs.includes(a.name))
    .map((a) => `${a.name}="${a.value}"`)
    .join(' ');
  const kids = Array.from(el.childNodes)
    .map((n) => {
      if (n.nodeType === 1) return shape(n as Element, skipAttrs);
      const t = (n.textContent ?? '').trim();
      return t ? JSON.stringify(t) : '';
    })
    .filter(Boolean)
    .join('');
  return `<${el.tagName.toLowerCase()} ${attrs}>${kids}</${el.tagName.toLowerCase()}>`;
}

type MediaAnswers = Partial<Record<string, boolean>>;

/** Installs window.matchMedia answering from `answers` (false for anything else). */
function mockMedia(answers: MediaAnswers): void {
  resetMediaCache();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: answers[query] === true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function removeMedia(): void {
  resetMediaCache();
  // Back to jsdom's default (no matchMedia), so matchOnce answers false.
  delete (window as { matchMedia?: unknown }).matchMedia;
}

function addThemeColorMeta(): HTMLMetaElement {
  const m = document.createElement('meta');
  m.setAttribute('name', 'theme-color');
  m.setAttribute('content', '#0e6655');
  document.head.appendChild(m);
  return m;
}

function resetDocument(): void {
  const html = document.documentElement;
  html.setAttribute('data-theme', 'light');
  html.classList.remove('js', 'is-loaded', 'has-pointer');
  document.head.querySelectorAll('meta[name=theme-color]').forEach((m) => m.remove());
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
}

function runBootScript(): void {
  // The same text the root layout inlines in <head>; run it like the browser would.
  new Function(THEME_BOOT_SCRIPT)();
}

beforeEach(() => {
  resetDocument();
  removeMedia();
  resetBootState();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  resetDocument();
  removeMedia();
  resetBootState();
});

describe('fonts.ts', () => {
  it('loads exactly the decided weights and styles, with --ff-* variables', () => {
    expect(fontCalls.Plus_Jakarta_Sans).toEqual({
      weight: ['400', '500', '600', '700', '800'],
      style: 'normal',
      subsets: ['latin'],
      display: 'swap',
      variable: '--ff-jakarta',
    });
    expect(fontCalls.Instrument_Serif).toEqual({
      weight: '400',
      style: ['italic'],
      subsets: ['latin'],
      display: 'swap',
      variable: '--ff-instrument',
    });
    expect(fontCalls.JetBrains_Mono).toEqual({
      weight: ['400', '500'],
      style: 'normal',
      subsets: ['latin'],
      display: 'swap',
      variable: '--ff-jetbrains',
    });
    expect(fontVariables).toBe('Plus_Jakarta_Sans-var Instrument_Serif-var JetBrains_Mono-var');
  });

  it('matches the families of the reference Google Fonts link', () => {
    const link = refLines[refIndex('fonts.googleapis.com/css2')];
    expect(link).toContain('family=Instrument+Serif');
    expect(link).toContain('family=JetBrains+Mono:wght@400;500');
    expect(link).toContain('family=Plus+Jakarta+Sans:wght@400;500;600;700;800');
  });
});

describe('theme boot script', () => {
  const DARK_QUERY = '(prefers-color-scheme: dark)';

  it('keeps the reference boot (L12-16) word for word', () => {
    const boot = refBlock(
      '(function(){var t=null;',
      "document.documentElement.setAttribute('data-theme',t)})();",
    );
    expect(boot).toContain("try{t=localStorage.getItem('fh-theme')}catch(e){}");
    expect(THEME_BOOT_SCRIPT).toContain("try{t=localStorage.getItem('fh-theme')}catch(e){}");
    expect(THEME_BOOT_SCRIPT).toContain(
      "if(!t){t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}",
    );
    expect(
      refLines[refIndex("<script>document.documentElement.classList.add('js')</script>")],
    ).toBe("<script>document.documentElement.classList.add('js')</script>");
  });

  it('uses the stored theme over the system preference', () => {
    localStorage.setItem('fh-theme', 'light');
    mockMedia({ [DARK_QUERY]: true });
    const meta = addThemeColorMeta();
    runBootScript();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('js')).toBe(true);
    expect(meta.getAttribute('content')).toBe('#0e6655');
  });

  it('uses a stored dark theme and sets the dark theme-color', () => {
    localStorage.setItem('fh-theme', 'dark');
    const meta = addThemeColorMeta();
    runBootScript();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(meta.getAttribute('content')).toBe('#050f0c');
  });

  it('falls back to a dark system preference', () => {
    mockMedia({ [DARK_QUERY]: true });
    const meta = addThemeColorMeta();
    runBootScript();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(meta.getAttribute('content')).toBe('#050f0c');
  });

  it('defaults to light (no storage, no dark preference, no matchMedia)', () => {
    const meta = addThemeColorMeta();
    runBootScript();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    mockMedia({});
    runBootScript();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('js')).toBe(true);
    expect(meta.getAttribute('content')).toBe('#0e6655');
  });

  it('survives blocked storage and uses the preference', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    mockMedia({ [DARK_QUERY]: true });
    expect(runBootScript).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('sets a theme-color meta parsed after the script at DOMContentLoaded', () => {
    localStorage.setItem('fh-theme', 'dark');
    runBootScript();
    const meta = addThemeColorMeta();
    expect(meta.getAttribute('content')).toBe('#0e6655');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(meta.getAttribute('content')).toBe('#050f0c');
  });
});

describe('ThemeProvider and ThemeToggle', () => {
  function Probe() {
    const { theme } = useTheme();
    return <output data-testid="theme">{String(theme)}</output>;
  }

  function renderToggles() {
    return render(
      <ThemeProvider>
        <ThemeToggle variant="rail" />
        <ThemeToggle variant="topbar" />
        <Probe />
      </ThemeProvider>,
    );
  }

  it('toggles instantly without View Transitions: data-theme, storage, theme-color, aria-pressed', () => {
    const meta = addThemeColorMeta();
    const events: string[] = [];
    const onTheme = (e: Event) => events.push(String((e as CustomEvent<string>).detail));
    document.addEventListener('fh:theme', onTheme);
    renderToggles();
    const [rail, top] = screen.getAllByRole('button', { name: 'Switch light or dark theme' });
    expect(rail).toHaveAttribute('aria-pressed', 'false');
    expect(top).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(rail);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('fh-theme')).toBe('dark');
    expect(meta.getAttribute('content')).toBe('#050f0c');
    expect(rail).toHaveAttribute('aria-pressed', 'true');
    expect(top).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    fireEvent.click(top);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('fh-theme')).toBe('light');
    expect(meta.getAttribute('content')).toBe('#0e6655');
    expect(rail).toHaveAttribute('aria-pressed', 'false');
    expect(events).toEqual(['dark', 'light']);
    document.removeEventListener('fh:theme', onTheme);
  });

  it('reads the theme the boot script set (dark first visit)', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const meta = addThemeColorMeta();
    renderToggles();
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'true');
    expect(meta.getAttribute('content')).toBe('#050f0c');
  });

  it('still switches when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => setTheme('dark')).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('runs the circular reveal from the clicked button with View Transitions', async () => {
    const animate = vi.fn();
    Object.defineProperty(document.documentElement, 'animate', {
      configurable: true,
      value: animate,
    });
    const start = vi.fn((cb: () => void) => {
      cb();
      return { ready: Promise.resolve(), finished: Promise.resolve() };
    });
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start });
    try {
      renderToggles();
      const btn = screen.getAllByRole('button')[0];
      vi.spyOn(btn, 'getBoundingClientRect').mockReturnValue({
        left: 30,
        top: 400,
        width: 42,
        height: 42,
        right: 72,
        bottom: 442,
        x: 30,
        y: 400,
        toJSON: () => ({}),
      });
      await act(async () => {
        fireEvent.click(btn);
        await Promise.resolve();
      });
      expect(start).toHaveBeenCalledTimes(1);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      const x = 51;
      const y = 421;
      const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      expect(animate).toHaveBeenCalledWith(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
        {
          duration: 750,
          easing: 'cubic-bezier(.65,0,.35,1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    } finally {
      delete (document as { startViewTransition?: unknown }).startViewTransition;
      delete (document.documentElement as { animate?: unknown }).animate;
    }
  });

  it('swaps instantly with reduced motion even when View Transitions exist', () => {
    mockMedia({ '(prefers-reduced-motion: reduce)': true });
    const start = vi.fn();
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start });
    try {
      renderToggles();
      fireEvent.click(screen.getAllByRole('button')[0]);
      expect(start).not.toHaveBeenCalled();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    } finally {
      delete (document as { startViewTransition?: unknown }).startViewTransition;
    }
  });
});

describe('IconSprite and Icon', () => {
  const spriteStart = refIndex('<!-- ICON SPRITE');
  const spriteOpen = refIndex(
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true">',
    spriteStart,
  );
  const spriteClose = refIndex('</svg>', spriteOpen);
  const refInner = refLines.slice(spriteOpen + 1, spriteClose).join('\n');

  it('is the reference sprite byte for byte', () => {
    expect(SPRITE_MARKUP).toBe('\n' + refInner + '\n');
  });

  it('renders the hidden svg with pl-g and all 59 symbols in reference order', () => {
    const { container } = render(<IconSprite />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(
      shape(svg!).startsWith(
        '<svg width="0" height="0" style="position: absolute;" aria-hidden="true" focusable="false">',
      ),
    ).toBe(true);
    const grad = svg!.querySelector('defs > linearGradient#pl-g');
    expect(grad).not.toBeNull();
    expect(grad!.querySelectorAll('stop')).toHaveLength(2);
    const ids = Array.from(svg!.querySelectorAll('defs > symbol')).map((s) => s.id);
    const refIds = Array.from(refInner.matchAll(/<symbol id="([^"]+)"/g), (m) => m[1]);
    expect(ids).toHaveLength(59);
    expect(ids).toEqual(refIds);
    expect([...ICON_IDS]).toEqual(refIds);
    expect(new Set(ids).size).toBe(59);
  });

  it('Icon renders <svg class="i"><use href="#..."/></svg> like the reference', () => {
    const html = renderToStaticMarkup(
      <>
        <Icon name="i-arrow-right" />
        <Icon name="i-play" fill aria-hidden="true" />
        <Icon name="i-moon" className="i-moon" />
      </>,
    );
    expect(html).toBe(
      '<svg class="i"><use href="#i-arrow-right"></use></svg>' +
        '<svg class="i i--fill" aria-hidden="true"><use href="#i-play"></use></svg>' +
        '<svg class="i i-moon"><use href="#i-moon"></use></svg>',
    );
  });
});

describe('shell markup matches the reference attribute for attribute', () => {
  /** The reference element that starts on the line holding marker and spans `count` lines. */
  function refElement(marker: string, count: number): Element {
    const a = refIndex(marker);
    return parse(refLines.slice(a, a + count).join('\n'));
  }

  it('Preloader (L3294-3299)', () => {
    const refEl = refElement('<div class="preloader" id="preloader"', 6);
    expect(refEl.querySelector('.pl-txt')?.textContent).toBe('FH');
    expect(shape(parse(renderToStaticMarkup(<Preloader />)))).toBe(shape(refEl));
  });

  it('AmbientBackground (L3308-3314)', () => {
    const refEl = refElement('<div class="ambient" aria-hidden="true">', 7);
    expect(refEl.children).toHaveLength(5);
    expect(shape(parse(renderToStaticMarkup(<AmbientBackground />)))).toBe(shape(refEl));
  });

  it('CursorGlow (L3315) and ScrollProgress (L3306)', () => {
    const glow = parse(refLines[refIndex('id="cursorGlow"')]);
    const progress = parse(refLines[refIndex('<div class="progress" id="progress">')]);
    expect(shape(parse(renderToStaticMarkup(<CursorGlow />)))).toBe(shape(glow));
    expect(shape(parse(renderToStaticMarkup(<ScrollProgress />)))).toBe(shape(progress));
  });

  it('ThemeToggle rail (L3329) and top bar (L3336), plus aria-pressed only', () => {
    const rail = refIndex('<aside class="rail"');
    const railBtn = parse(refLines[refIndex('data-theme-toggle', rail)].trim());
    const top = refIndex('<header class="topbar"');
    const topBtn = parse(refLines[refIndex('data-theme-toggle', top)].trim());
    for (const [variant, refBtn] of [
      ['rail', railBtn],
      ['topbar', topBtn],
    ] as const) {
      const el = parse(
        renderToStaticMarkup(
          <ThemeProvider>
            <ThemeToggle variant={variant} />
          </ThemeProvider>,
        ),
      );
      expect(el.getAttribute('aria-pressed')).toBe('false');
      expect(shape(el, ['aria-pressed'])).toBe(shape(refBtn));
    }
  });
});

/** Manual requestAnimationFrame: frames run only when step() is called. */
function mockRaf() {
  const queue = new Map<number, FrameRequestCallback>();
  let id = 0;
  const raf = vi.fn((cb: FrameRequestCallback) => {
    id += 1;
    queue.set(id, cb);
    return id;
  });
  const caf = vi.fn((h: number) => {
    queue.delete(h);
  });
  vi.stubGlobal('requestAnimationFrame', raf);
  vi.stubGlobal('cancelAnimationFrame', caf);
  return {
    raf,
    caf,
    pending: () => queue.size,
    step: () => {
      const cbs = Array.from(queue.values());
      queue.clear();
      cbs.forEach((cb) => cb(0));
    },
  };
}

/** Sets window.scrollY and documentElement.scrollHeight; returns the restore. */
function setScroll(y: number, scrollHeight: number): () => void {
  const html = document.documentElement;
  const yDesc = Object.getOwnPropertyDescriptor(window, 'scrollY');
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  Object.defineProperty(html, 'scrollHeight', { configurable: true, value: scrollHeight });
  return () => {
    if (yDesc) Object.defineProperty(window, 'scrollY', yDesc);
    else delete (window as { scrollY?: number }).scrollY;
    delete (html as { scrollHeight?: number }).scrollHeight;
  };
}

describe('AppShell boot', () => {
  function renderShell(strict = false) {
    const tree = (
      <>
        <Preloader />
        <AppShell>
          <p>page</p>
        </AppShell>
      </>
    );
    return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
  }

  const preloaderEl = () => document.getElementById('preloader') as HTMLElement;
  const html = () => document.documentElement;

  it('finishes the preloader 1250ms after hydration, then motionReady 250ms later', () => {
    vi.useFakeTimers();
    renderShell();
    expect(screen.getByText('page')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1249));
    expect(preloaderEl()).not.toHaveClass('is-done');
    expect(html()).not.toHaveClass('is-loaded');
    expect(getBootState()).toEqual({ loaded: false, motionReady: false });
    act(() => vi.advanceTimersByTime(1));
    expect(preloaderEl()).toHaveClass('preloader', 'is-done');
    expect(html()).toHaveClass('is-loaded');
    expect(getBootState()).toEqual({ loaded: true, motionReady: false });
    act(() => vi.advanceTimersByTime(249));
    expect(getBootState().motionReady).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(getBootState()).toEqual({ loaded: true, motionReady: true });
  });

  it('finishes at once with reduced motion (motionReady on a 0ms timer)', () => {
    mockMedia({ '(prefers-reduced-motion: reduce)': true });
    vi.useFakeTimers();
    renderShell();
    expect(preloaderEl()).toHaveClass('is-done');
    expect(html()).toHaveClass('is-loaded');
    expect(getBootState()).toEqual({ loaded: true, motionReady: false });
    act(() => vi.advanceTimersByTime(0));
    expect(getBootState().motionReady).toBe(true);
  });

  it('runs one timer under StrictMode and clears it on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = renderShell(true);
    act(() => vi.advanceTimersByTime(1250));
    expect(getBootState().loaded).toBe(true);
    unmount();
    resetBootState();
    html().classList.remove('is-loaded');

    const second = renderShell();
    act(() => vi.advanceTimersByTime(600));
    second.unmount();
    act(() => vi.advanceTimersByTime(5000));
    expect(getBootState().loaded).toBe(false);
    expect(html()).not.toHaveClass('is-loaded');
  });

  it('never shows the preloader again once booted (a remount finishes at once)', () => {
    vi.useFakeTimers();
    const first = renderShell();
    act(() => vi.advanceTimersByTime(1500));
    expect(getBootState().motionReady).toBe(true);
    first.unmount();
    renderShell();
    expect(preloaderEl()).toHaveClass('is-done');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('runs the first scroll frame (progress and top bar) after hydration', () => {
    const restore = setScroll(40, 2768);
    const seen: number[] = [];
    const off = subscribe((y) => seen.push(y));
    try {
      vi.useFakeTimers();
      render(
        <AppShell>
          <ScrollProgress />
        </AppShell>,
      );
      expect(seen).toEqual([40]);
      expect(document.getElementById('progress')!.style.transform).toBe('scaleX(0.02)');
    } finally {
      off();
      restore();
    }
  });

  it('finishPreloader is safe without a preloader and idempotent', () => {
    expect(() => {
      finishPreloader();
      finishPreloader();
    }).not.toThrow();
    expect(html()).toHaveClass('is-loaded');
    expect(getBootState().loaded).toBe(true);
  });
});

describe('scrollFrame and ScrollProgress (L5034-5037)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses one passive listener and one frame per burst of scroll events', () => {
    const frames = mockRaf();
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const restore = setScroll(120, 3000);
    const a = vi.fn();
    const b = vi.fn();
    const offA = subscribe(a);
    const offB = subscribe(b);
    try {
      const scrollAdds = add.mock.calls.filter((c) => c[0] === 'scroll');
      expect(scrollAdds).toHaveLength(1);
      expect(scrollAdds[0][2]).toEqual({ passive: true });
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      expect(frames.raf).toHaveBeenCalledTimes(1);
      expect(a).not.toHaveBeenCalled();
      frames.step();
      expect(a).toHaveBeenCalledExactlyOnceWith(120);
      expect(b).toHaveBeenCalledExactlyOnceWith(120);
      window.dispatchEvent(new Event('scroll'));
      expect(frames.raf).toHaveBeenCalledTimes(2);
      flush();
      expect(a).toHaveBeenCalledTimes(2);
    } finally {
      offA();
      offB();
      restore();
    }
    expect(remove.mock.calls.filter((c) => c[0] === 'scroll')).toHaveLength(1);
    expect(frames.pending()).toBe(0);
  });

  it('writes scaleX(scrollY / (scrollHeight - innerHeight)) unrounded, 0 when nothing scrolls', () => {
    const frames = mockRaf();
    const h = window.innerHeight;
    let restore = setScroll(0, h + 3000);
    render(<ScrollProgress />);
    const bar = document.getElementById('progress') as HTMLElement;
    expect(bar.style.transform).toBe('scaleX(0)');
    restore();
    restore = setScroll(1000, h + 3000);
    window.dispatchEvent(new Event('scroll'));
    frames.step();
    expect(bar.style.transform).toBe('scaleX(' + 1000 / 3000 + ')');
    expect(bar.style.transform).toBe('scaleX(0.3333333333333333)');

    // No resize update (reference quirk): the value waits for the next scroll.
    restore();
    restore = setScroll(1000, h + 2000);
    window.dispatchEvent(new Event('resize'));
    frames.step();
    expect(bar.style.transform).toBe('scaleX(0.3333333333333333)');
    window.dispatchEvent(new Event('scroll'));
    frames.step();
    expect(bar.style.transform).toBe('scaleX(0.5)');

    restore();
    restore = setScroll(0, h);
    window.dispatchEvent(new Event('scroll'));
    frames.step();
    expect(bar.style.transform).toBe('scaleX(0)');
    restore();
  });
});

describe('CursorGlow (L5141-5144)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const glow = () => document.getElementById('cursorGlow') as HTMLElement;
  const move = (x: number, y: number) =>
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y }));
  const text = (x: number, y: number) =>
    'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';

  it('does nothing without a fine pointer or with reduced motion', () => {
    const frames = mockRaf();
    mockMedia({});
    const first = render(<CursorGlow />);
    move(10, 10);
    expect(glow().style.transform).toBe('');
    expect(document.documentElement).not.toHaveClass('has-pointer');
    first.unmount();

    mockMedia({ '(pointer:fine)': true, '(prefers-reduced-motion: reduce)': true });
    render(<CursorGlow />);
    move(10, 10);
    expect(glow().style.transform).toBe('');
    expect(document.documentElement).not.toHaveClass('has-pointer');
    expect(frames.raf).not.toHaveBeenCalled();
  });

  it('starts at the viewport centre, eases by .08 per frame like the reference, then stops', () => {
    const frames = mockRaf();
    mockMedia({ '(pointer:fine)': true });
    const { unmount } = render(<CursorGlow />);
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    expect(glow().style.transform).toBe(text(x, y));
    // Settled at the centre: no idle loop.
    expect(frames.pending()).toBe(0);

    move(100, 50);
    move(101, 51);
    expect(document.documentElement).toHaveClass('has-pointer');
    expect(frames.raf).toHaveBeenCalledTimes(1);

    // The reference loop, frame by frame: x = lerp(x, tx, .08), written with toFixed(1).
    let n = 0;
    while (frames.pending() && n < 2000) {
      frames.step();
      x = x + (101 - x) * 0.08;
      y = y + (51 - y) * 0.08;
      expect(glow().style.transform).toBe(text(x, y));
      n += 1;
    }
    expect(n).toBeGreaterThan(10);
    expect(n).toBeLessThan(2000);
    expect(glow().style.transform).toBe('translate3d(101.0px,51.0px,0)');
    // Stopped at the floating point fixed point: every later reference frame keeps x and y (and so
    // the written text) exactly as they are.
    expect(x + (101 - x) * 0.08).toBe(x);
    expect(y + (51 - y) * 0.08).toBe(y);

    // The next move restarts the loop; unmount cancels it and removes the listener.
    move(400, 300);
    expect(frames.pending()).toBe(1);
    unmount();
    expect(frames.pending()).toBe(0);
    const calls = frames.raf.mock.calls.length;
    move(10, 10);
    expect(frames.raf.mock.calls.length).toBe(calls);
  });
});
