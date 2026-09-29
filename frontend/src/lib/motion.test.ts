import { createElement as h, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { splitWords, type SplitOptions } from '@/components/motion/SplitWords';
import { asset } from '@/lib/asset';
import { $, $$, clamp, lerp, matchOnce, resetMediaCache } from '@/lib/dom';
import * as M from '@/lib/motion';
import {
  clearRevealStore,
  isRevealed,
  markRevealed,
  revealKeyOf,
  subscribeRevealStore,
} from '@/lib/revealStore';
import { morphHeight, swapViews, wait } from '@/lib/viewMotion';

const split = (children: ReactNode, opts?: SplitOptions): string =>
  renderToStaticMarkup(h(Fragment, null, ...splitWords(children, opts)));

describe('motion constants (REFERENCE_MAP.md 2121-2153, never rounded)', () => {
  it('match the map exactly', () => {
    expect(M.EASE_OUT).toBe('cubic-bezier(.22,1,.36,1)');
    expect(M.EASE_IO).toBe('cubic-bezier(.65,0,.35,1)');
    expect(M.PRELOADER_HOLD_MS).toBe(1250);
    expect(M.OBSERVE_AFTER_LOAD_MS).toBe(250);
    expect(M.REVEAL_IO).toEqual({ rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    expect(M.STAGGER_DEFAULT_MS).toBe(70);
    expect(M.SPLIT_STEP_MS).toBe(55);
    expect(M.COUNT_DEFAULT_MS).toBe(1600);
    expect(M.MAGNETIC_DEFAULT).toBe(0.25);
    expect(M.TILT_DEFAULT_DEG).toBe(5);
    expect(M.TILT_PERSPECTIVE_PX).toBe(900);
    expect(M.THEME_KEY).toBe('fh-theme');
    expect(M.THEME_COLOR).toEqual({ light: '#0e6655', dark: '#050f0c' });
    expect(M.THEME_REVEAL).toEqual({ duration: 750, easing: 'cubic-bezier(.65,0,.35,1)' });
    expect(M.MODAL_FOCUS_MS).toBe(60);
    expect(M.TOAST_MS).toBe(3200);
    expect(M.TOPBAR_SCROLLED_PX).toBe(12);
    expect(M.SCROLL_OFFSET).toEqual({ mobile: 84, desktop: 32, breakpoint: 1024 });
    expect(M.CURTAIN).toEqual({ cover: 560, hold: 140, reveal: 640 });
    expect(M.INSTANT_ANCHOR_MS).toBe(60);
    expect(M.INITIAL_ANCHOR_MS).toBe(1600);
    expect(M.SMOOTH_LERP).toBe(0.11);
    expect(M.SMOOTH_STOP_PX).toBe(0.4);
    expect(M.WHEEL_LINE_PX).toBe(32);
    expect(M.PARALLAX_DEFAULT).toBe(0.1);
    expect(M.PARALLAX_MARGIN_PX).toBe(200);
    expect(M.CURSOR_LERP).toBe(0.08);
  });

  it('keep the reference media queries and view helper numbers', () => {
    expect(M.REDUCED_MOTION_QUERY).toBe('(prefers-reduced-motion: reduce)');
    expect(M.FINE_POINTER_QUERY).toBe('(pointer:fine)');
    expect(M.PARALLAX_SELECTOR).toBe('.page.is-current [data-parallax], .site > [data-parallax]');
    expect([M.MORPH_DEFAULT_MS, M.SWAP_OUT_MS, M.SWAP_IN_MS]).toEqual([560, 190, 560]);
    expect(M.SWAP_OUT_EASE).toBe('cubic-bezier(.4,0,1,1)');
    expect([M.SWAP_OFFSET_Y_PX, M.SWAP_OFFSET_X_PX]).toEqual([14, 22]);
  });
});

describe('stagger math (L4599-4602)', () => {
  const run = (stagger: string | undefined, delay: string | undefined, n: number): number[] => {
    const { step, base } = M.parseStagger(stagger, delay);
    return Array.from({ length: n }, (_, k) => M.staggerDelay(base, step, k));
  };

  it('gives the delays of every stagger parent in the reference', () => {
    expect(run('90', '600', 3)).toEqual([600, 690, 780]); // dl.ab-stats
    expect(run('90', undefined, 4)).toEqual([0, 90, 180, 270]); // ab-bento, ab-svc-list, ab-side
    expect(run('45', undefined, 10)).toEqual([0, 45, 90, 135, 180, 225, 270, 315, 360, 405]);
    expect(run('80', '80', 4)).toEqual([80, 160, 240, 320]); // ct-ledger__row
  });

  it('falls back like parseInt(...) || default', () => {
    expect(M.parseStagger('', undefined)).toEqual({ step: 70, base: 0 });
    expect(M.parseStagger('abc', 'x')).toEqual({ step: 70, base: 0 });
    expect(M.parseStagger('0', '0')).toEqual({ step: 70, base: 0 });
    expect(M.parseStagger(45, 120)).toEqual({ step: 45, base: 120 });
  });

  it('computes split delays (i * 55, contact 170 + i * 130)', () => {
    expect([0, 1, 2].map((i) => M.splitDelay(i))).toEqual([0, 55, 110]);
    expect([0, 1, 2].map((i) => M.splitDelay(i, 130, 170))).toEqual([170, 300, 430]);
  });
});

describe('count text formatting (L4614-4618)', () => {
  it('eases with 1 - (1 - p)^4', () => {
    expect(M.easeOutQuart(0)).toBe(0);
    expect(M.easeOutQuart(0.5)).toBe(0.9375);
    expect(M.easeOutQuart(1)).toBe(1);
  });

  it('takes decimals from the data-count text', () => {
    expect(M.countDecimals('3')).toBe(0);
    expect(M.countDecimals('2.50')).toBe(2);
    expect(M.countDecimals('0.125')).toBe(3);
  });

  it('formats frames as pre + (to * e).toFixed(dec) + suf', () => {
    expect(M.countFrameText('10', 0, '', '+')).toBe('0+');
    expect(M.countFrameText('10', 0.9375, '', '+')).toBe('9+');
    expect(M.countFrameText('10', 1, '', '+')).toBe('10+');
    expect(M.countFrameText('25', 0.5)).toBe('13');
    expect(M.countFrameText('2.50', 0.5, '$')).toBe('$1.25');
    expect(M.countFrameText('2.5', 0.5, '', '', 0)).toBe('1');
  });

  it('writes the raw text with reduced motion and for non numbers', () => {
    expect(M.countRawText('10', '', '+')).toBe('10+');
    expect(M.countRawText('010', '$', '')).toBe('$010');
    expect(M.countEndText('abc', '', '+')).toBe('abc+');
    expect(M.countEndText('2.50', '$')).toBe('$2.50');
    expect(M.countEndText('010', '', '+')).toBe('10+');
  });
});

describe('split words (L4572-4591)', () => {
  it('matches the reference for "Faisal" + span.serif.grad-text "Hanif"', () => {
    expect(split(['Faisal ', h('span', { className: 'serif grad-text', key: 'h' }, 'Hanif')])).toBe(
      '<span class="w"><span style="--d:0ms">Faisal</span></span> ' +
        '<span class="w"><span style="--d:55ms"><span class="serif grad-text">Hanif</span></span></span>',
    );
  });

  it('walks into the About name rows and wraps the gradient span whole', () => {
    const rows = [
      h('span', { className: 'ab-name__row', key: 1 }, 'Faisal'),
      h(
        'span',
        { className: 'ab-name__row ab-name__row--2', key: 2 },
        h('span', { className: 'serif grad-text' }, 'Hanif'),
      ),
    ];
    expect(split(rows)).toBe(
      '<span class="ab-name__row"><span class="w"><span style="--d:0ms">Faisal</span></span></span>' +
        '<span class="ab-name__row ab-name__row--2"><span class="w"><span style="--d:55ms">' +
        '<span class="serif grad-text">Hanif</span></span></span></span>',
    );
  });

  it('matches the map example "Get to Know Me"', () => {
    expect(
      split(['Get to ', h('span', { className: 'serif grad-text', key: 'k' }, 'Know Me')]),
    ).toBe(
      '<span class="w"><span style="--d:0ms">Get</span></span> ' +
        '<span class="w"><span style="--d:55ms">to</span></span> ' +
        '<span class="w"><span style="--d:110ms"><span class="serif grad-text">Know Me</span></span></span>',
    );
  });

  it('keeps whitespace runs, wraps em/strong/b whole and leaves .w alone', () => {
    const out = split([
      '  A  B ',
      h('em', { key: 'e' }, 'x y'),
      h('span', { className: 'w', key: 'w' }, 'kept'),
      h('b', { key: 'b' }, 'z'),
    ]);
    expect(out).toBe(
      '  <span class="w"><span style="--d:0ms">A</span></span>  ' +
        '<span class="w"><span style="--d:55ms">B</span></span> ' +
        '<span class="w"><span style="--d:110ms"><em>x y</em></span></span>' +
        '<span class="w">kept</span>' +
        '<span class="w"><span style="--d:165ms"><b>z</b></span></span>',
    );
  });

  it('supports the contact title delays (170 + i * 130) through <br>', () => {
    const out = split(
      [
        h('span', { className: 'ct-title__a', key: 'a' }, 'Let’s'),
        h('br', { key: 'br' }),
        h('span', { className: 'serif grad-text', key: 'c' }, 'Connect'),
      ],
      { base: 170, step: 130 },
    );
    expect(out).toBe(
      '<span class="ct-title__a"><span class="w"><span style="--d:170ms">Let’s</span></span></span>' +
        '<br/><span class="w"><span style="--d:300ms"><span class="serif grad-text">Connect</span></span></span>',
    );
  });
});

describe('revealStore', () => {
  beforeEach(() => clearRevealStore());

  it('remembers keys and notifies subscribers once per new key', () => {
    const fn = vi.fn();
    const off = subscribeRevealStore(fn);
    expect(isRevealed('about:0')).toBe(false);
    markRevealed('about:0');
    markRevealed('about:0');
    expect(isRevealed('about:0')).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    markRevealed('about:1');
    expect(fn).toHaveBeenCalledTimes(1);
    clearRevealStore();
    expect(isRevealed('about:0')).toBe(false);
  });

  it('keys elements by page id and child index path', () => {
    document.body.innerHTML =
      '<main><section data-page="about"><div></div><div><p></p><h2 id="t"></h2></div></section></main><p id="o"></p>';
    expect(revealKeyOf($('#t') as Element)).toBe('about:1.1');
    expect(revealKeyOf($('[data-page]') as Element)).toBe('about:');
    expect(revealKeyOf($('#o') as Element)).toBe(location.pathname + ':1');
    document.body.innerHTML = '';
  });
});

describe('dom helpers and asset', () => {
  afterEach(() => resetMediaCache());

  it('$, $$, lerp and clamp behave like FH', () => {
    document.body.innerHTML = '<ul><li class="a"></li><li class="a"></li></ul>';
    expect($('.a')).toBe(document.querySelector('.a'));
    expect($$('.a')).toHaveLength(2);
    expect(Array.isArray($$('.a', $('ul')))).toBe(true);
    expect(lerp(0, 10, 0.08)).toBeCloseTo(0.8);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(500, 0, 100)).toBe(100);
    document.body.innerHTML = '';
  });

  it('reads a media query once per app load', () => {
    let matches = true;
    const mm = vi.fn(() => ({ matches }) as MediaQueryList);
    vi.stubGlobal('matchMedia', mm);
    expect(matchOnce('(pointer:fine)')).toBe(true);
    matches = false;
    expect(matchOnce('(pointer:fine)')).toBe(true);
    expect(mm).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it('resolves assets from the site root', () => {
    expect(asset('imgs/faisal.png')).toBe('/imgs/faisal.png');
    expect(asset('/imgs/faisal.png')).toBe('/imgs/faisal.png');
    expect(asset('https://faisalhanif.work/sass-app.html')).toBe(
      'https://faisalhanif.work/sass-app.html',
    );
  });
});

describe('viewMotion (L5200-5225)', () => {
  afterEach(() => {
    vi.useRealTimers();
    resetMediaCache();
  });

  it('wait(ms) resolves after ms', async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    void wait(300).then(done);
    await vi.advanceTimersByTimeAsync(299);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
  });

  it('morphHeight and swapViews fall back to an instant swap without Web Animations', async () => {
    const box = document.createElement('div');
    const a = document.createElement('div');
    const b = document.createElement('div');
    b.hidden = true;
    const change = vi.fn();
    Object.defineProperty(box, 'animate', { value: undefined });
    Object.defineProperty(b, 'animate', { value: undefined });
    await morphHeight(box, change);
    expect(change).toHaveBeenCalledTimes(1);
    await swapViews(box, a, b, 1);
    expect(a.hidden).toBe(true);
    expect(b.hidden).toBe(false);
    await expect(swapViews(box, b, b, 1)).resolves.toBeUndefined();
  });

  it('swapViews animates out 190ms, then morphs and animates in 560ms', async () => {
    const calls: Array<{ el: string; frames: Keyframe[]; opts: KeyframeAnimationOptions }> = [];
    const fake = (name: string) =>
      function (this: HTMLElement, frames: Keyframe[], opts: KeyframeAnimationOptions) {
        calls.push({ el: name, frames, opts });
        return { finished: Promise.resolve(), cancel: vi.fn() } as unknown as Animation;
      };
    const box = document.createElement('div');
    const a = document.createElement('div');
    const b = document.createElement('div');
    box.getBoundingClientRect = () => ({ height: b.hidden ? 100 : 180 }) as DOMRect;
    box.animate = fake('box');
    a.animate = fake('a');
    b.animate = fake('b');
    b.hidden = true;
    await swapViews(box, a, b, 1, 'y');
    expect(calls[0]).toEqual({
      el: 'a',
      frames: [
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: 'translate3d(0,-14px,0)' },
      ],
      opts: { duration: 190, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' },
    });
    expect(calls.find((c) => c.el === 'b')).toEqual({
      el: 'b',
      frames: [
        { opacity: 0, transform: 'translate3d(0,14px,0)' },
        { opacity: 1, transform: 'none' },
      ],
      opts: { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' },
    });
    expect(calls.find((c) => c.el === 'box')).toEqual({
      el: 'box',
      frames: [{ height: '100px' }, { height: '180px' }],
      opts: { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' },
    });
    expect(box.style.overflow).toBe('');
    expect(a.hidden).toBe(true);
    expect(b.hidden).toBe(false);
  });
});
