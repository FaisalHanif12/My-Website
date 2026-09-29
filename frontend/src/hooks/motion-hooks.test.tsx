import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CountUp, GlobalMotion, Reveal, RevealGroup, SplitWords } from '@/components/motion';
import { useCanHover } from '@/hooks/useCanHover';
import { useFinePointer } from '@/hooks/useFinePointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { onView, resetRevealObserver } from '@/hooks/useReveal';
import { bindMotion, heldTransformCount, installSpotlight } from '@/lib/bindMotion';
import {
  getBootState,
  markLoaded,
  resetBootState,
  useBootState,
  whenLoaded,
  whenMotionReady,
} from '@/lib/boot';
import { $, resetMediaCache } from '@/lib/dom';
import { REVEAL_IO } from '@/lib/motion';
import { installParallax, refreshParallax } from '@/lib/parallax';
import { clearRevealStore } from '@/lib/revealStore';
import { installSmoothScroll, isSmoothOn, smoothReset, smoothTo } from '@/lib/smoothScroll';

/* ---- Test doubles ---- */

class MockIO {
  static instances: MockIO[] = [];
  observed = new Set<Element>();
  constructor(
    public cb: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    MockIO.instances.push(this);
  }
  observe(el: Element): void {
    this.observed.add(el);
  }
  unobserve(el: Element): void {
    this.observed.delete(el);
  }
  disconnect(): void {
    this.observed.clear();
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  trigger(el: Element): void {
    this.cb(
      [{ target: el, isIntersecting: true } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

const REDUCE = '(prefers-reduced-motion: reduce)';
const FINE = '(pointer:fine)';
let media: Record<string, boolean> = {};

function setMedia(next: Record<string, boolean>): void {
  media = next;
  resetMediaCache();
}

function io(): MockIO {
  const last = MockIO.instances[MockIO.instances.length - 1];
  if (!last) throw new Error('no IntersectionObserver was created');
  return last;
}

function boot(): void {
  act(() => {
    markLoaded();
    vi.advanceTimersByTime(250);
  });
}

function rect(left: number, top: number, width: number, height: number): () => DOMRect {
  return () =>
    ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
    }) as DOMRect;
}

function pointer(type: string, target: Element, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, ...init }));
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
    ],
  });
  setMedia({});
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: !!media[q], media: q }) as MediaQueryList);
  vi.stubGlobal('IntersectionObserver', MockIO);
  MockIO.instances = [];
  resetBootState();
  clearRevealStore();
  resetRevealObserver();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.body.className = '';
});

/* ---- Reveal ---- */

describe('Reveal', () => {
  it('renders data-reveal="" for the default variant (never "true") and --d in ms', () => {
    render(
      <>
        <Reveal data-testid="a">A</Reveal>
        <Reveal as="article" className="card" variant="fade" delay={150} data-testid="b">
          B
        </Reveal>
      </>,
    );
    const a = screen.getByTestId('a');
    expect(a.outerHTML).toContain('data-reveal=""');
    expect(a.getAttribute('data-reveal')).toBe('');
    expect(a.hasAttribute('data-delay')).toBe(false);
    expect(a.style.getPropertyValue('--d')).toBe('');
    const b = screen.getByTestId('b');
    expect(b.tagName).toBe('ARTICLE');
    expect(b.getAttribute('data-reveal')).toBe('fade');
    expect(b.getAttribute('data-delay')).toBe('150');
    expect(b.style.getPropertyValue('--d')).toBe('150ms');
    expect(b.className).toBe('card');
  });

  it('observes only from motionReady, adds is-in on intersect and keeps it on re-render', () => {
    const ui = (text: string) => (
      <section data-page="about">
        <Reveal className="x" data-testid="r">
          {text}
        </Reveal>
      </section>
    );
    const { rerender } = render(ui('A'));
    const el = screen.getByTestId('r');
    act(() => markLoaded());
    act(() => vi.advanceTimersByTime(249));
    expect(MockIO.instances).toHaveLength(0);
    act(() => vi.advanceTimersByTime(1));
    expect(io().options).toEqual(REVEAL_IO);
    expect(io().observed.has(el)).toBe(true);
    expect(el).not.toHaveClass('is-in');
    act(() => io().trigger(el));
    expect(el.className).toBe('x is-in');
    expect(io().observed.has(el)).toBe(false);
    rerender(ui('B'));
    expect(el.className).toBe('x is-in');
  });

  it('observes at once on pages mounted after motionReady, and before it when eager', () => {
    render(<Reveal eager data-testid="e" />);
    expect(io().observed.has(screen.getByTestId('e'))).toBe(true);
    boot();
    render(<Reveal data-testid="late" />);
    expect(io().observed.has(screen.getByTestId('late'))).toBe(true);
  });

  it('renders is-in at once with reduced motion and observes nothing', () => {
    setMedia({ [REDUCE]: true });
    render(<Reveal className="x" data-testid="r" />);
    expect(screen.getByTestId('r').className).toBe('x is-in');
    boot();
    expect(MockIO.instances).toHaveLength(0);
  });

  it('restores revealed keys on a revisit from the first render, without replaying', () => {
    boot();
    const page = () => (
      <section data-page="about">
        <div />
        <Reveal data-testid="seen">A</Reveal>
        <Reveal data-testid="unseen">B</Reveal>
      </section>
    );
    const first = render(page());
    act(() => io().trigger(screen.getByTestId('seen')));
    first.unmount();
    expect(io().observed.size).toBe(0);
    render(page());
    expect(screen.getByTestId('seen')).toHaveClass('is-in');
    expect(io().observed.has(screen.getByTestId('seen'))).toBe(false);
    expect(screen.getByTestId('unseen')).not.toHaveClass('is-in');
    expect(io().observed.has(screen.getByTestId('unseen'))).toBe(true);
  });

  it('uses an explicit revealKey when given', () => {
    boot();
    const first = render(<Reveal revealKey="works:cell:soledeck" data-testid="k" />);
    act(() => io().trigger(screen.getByTestId('k')));
    first.unmount();
    render(
      <div>
        <p />
        <Reveal revealKey="works:cell:soledeck" data-testid="k" />
      </div>,
    );
    expect(screen.getByTestId('k')).toHaveClass('is-in');
  });

  it('stops observing on unmount (cleanup)', () => {
    boot();
    const { unmount } = render(<Reveal data-testid="r" />);
    const el = screen.getByTestId('r');
    expect(io().observed.has(el)).toBe(true);
    unmount();
    expect(io().observed.size).toBe(0);
  });

  it('reveals at once without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    resetRevealObserver();
    boot();
    render(<Reveal data-testid="r" />);
    expect(screen.getByTestId('r')).toHaveClass('is-in');
  });

  it('shares one element between a Reveal and an onView without dropping either', () => {
    boot();
    render(
      <>
        <Reveal className="x" data-testid="both" />
        <Reveal className="y" data-testid="kept" />
      </>,
    );
    const both = screen.getByTestId('both');
    const fn = vi.fn();
    onView(both, fn);
    act(() => io().trigger(both));
    expect(both.className).toBe('x is-in');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(io().observed.has(both)).toBe(false);

    const kept = screen.getByTestId('kept');
    const dropped = vi.fn();
    const off = onView(kept, dropped);
    off();
    off();
    expect(io().observed.has(kept)).toBe(true);
    act(() => io().trigger(kept));
    expect(kept.className).toBe('y is-in');
    expect(dropped).not.toHaveBeenCalled();
  });

  it('forwards a caller ref to the element', () => {
    let seen: HTMLElement | null = null;
    render(
      <Reveal
        ref={(el) => {
          seen = el;
        }}
        data-testid="r"
      />,
    );
    expect(seen).toBe(screen.getByTestId('r'));
  });
});

/* ---- RevealGroup ---- */

describe('RevealGroup', () => {
  it('gives direct [data-reveal] children base + k * step, own delay wins, grandchildren skipped', () => {
    render(
      <RevealGroup as="dl" className="ab-stats" stagger={90} delay={600} data-testid="g">
        <Reveal data-testid="c0">a</Reveal>
        <Reveal data-testid="c1">b</Reveal>
        <div>
          <Reveal data-testid="nested">n</Reveal>
        </div>
        <Reveal data-testid="c2" delay={50}>
          c
        </Reveal>
        <Reveal data-testid="c3">d</Reveal>
      </RevealGroup>,
    );
    const g = screen.getByTestId('g');
    expect(g.tagName).toBe('DL');
    expect(g.getAttribute('data-stagger')).toBe('90');
    expect(g.getAttribute('data-delay')).toBe('600');
    const d = (id: string) => screen.getByTestId(id).style.getPropertyValue('--d');
    expect([d('c0'), d('c1'), d('c2'), d('c3')]).toEqual(['600ms', '690ms', '50ms', '870ms']);
    expect(d('nested')).toBe('');
  });

  it('defaults to a 70ms step and a 0 base', () => {
    render(
      <RevealGroup data-testid="g">
        <Reveal data-testid="c0" />
        <Reveal data-testid="c1" />
      </RevealGroup>,
    );
    expect(screen.getByTestId('g').getAttribute('data-stagger')).toBe('');
    expect(screen.getByTestId('g').hasAttribute('data-delay')).toBe(false);
    expect(screen.getByTestId('c0').style.getPropertyValue('--d')).toBe('0ms');
    expect(screen.getByTestId('c1').style.getPropertyValue('--d')).toBe('70ms');
  });
});

/* ---- SplitWords ---- */

describe('SplitWords', () => {
  it('renders data-split="" with span.w > span words and gets is-in on itself', () => {
    boot();
    render(
      <SplitWords as="h2" className="sec-title" data-testid="s">
        Get to <span className="serif grad-text">Know Me</span>
      </SplitWords>,
    );
    const s = screen.getByTestId('s');
    expect(s.tagName).toBe('H2');
    expect(s.getAttribute('data-split')).toBe('');
    expect(s.innerHTML).toBe(
      '<span class="w"><span style="--d: 0ms;">Get</span></span> ' +
        '<span class="w"><span style="--d: 55ms;">to</span></span> ' +
        '<span class="w"><span style="--d: 110ms;"><span class="serif grad-text">Know Me</span></span></span>',
    );
    expect(io().observed.has(s)).toBe(true);
    act(() => io().trigger(s));
    expect(s.className).toBe('sec-title is-in');
  });

  it('splits without data-split or an observer when observe is false', () => {
    boot();
    render(
      <SplitWords as="h2" className="hero-title ct-title" observe={false} base={170} step={130}>
        <span className="ct-title__a">Let&rsquo;s</span>
        <br />
        <span className="serif grad-text">Connect</span>
      </SplitWords>,
    );
    const h2 = $('h2') as HTMLElement;
    expect(h2.hasAttribute('data-split')).toBe(false);
    expect(h2.className).toBe('hero-title ct-title');
    expect(
      Array.from(h2.querySelectorAll('.w > span')).map((s) => s.getAttribute('style')),
    ).toEqual(['--d: 170ms;', '--d: 300ms;']);
    expect(MockIO.instances).toHaveLength(0);
  });
});

/* ---- CountUp ---- */

describe('CountUp', () => {
  it('renders the reference attributes and the initial "0"', () => {
    render(
      <>
        <CountUp to={10} suffix="+" data-testid="a" />
        <CountUp className="ab-plan__amt" to={25} duration={1400} data-testid="b" />
      </>,
    );
    const a = screen.getByTestId('a');
    expect(a.tagName).toBe('SPAN');
    expect(a.getAttribute('data-count')).toBe('10');
    expect(a.getAttribute('data-suffix')).toBe('+');
    expect(a.hasAttribute('data-prefix')).toBe(false);
    expect(a.hasAttribute('data-duration')).toBe(false);
    expect(a.textContent).toBe('0');
    const b = screen.getByTestId('b');
    expect(b.className).toBe('ab-plan__amt');
    expect(b.getAttribute('data-duration')).toBe('1400');
    expect(b.textContent).toBe('0');
  });

  it('counts from its own intersect with the quart ease, one rAF per frame', () => {
    boot();
    render(
      <section data-page="about">
        <CountUp to={10} suffix="+" data-testid="c" />
      </section>,
    );
    const c = screen.getByTestId('c');
    act(() => io().trigger(c));
    expect(c).toHaveClass('is-in');
    expect(c.textContent).toBe('0');
    act(() => vi.advanceTimersByTime(16));
    expect(c.textContent).toBe('0+');
    act(() => vi.advanceTimersByTime(800));
    expect(c.textContent).toBe('9+');
    act(() => vi.advanceTimersByTime(800));
    expect(c.textContent).toBe('10+');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels its rAF on unmount and shows the finished text on a revisit', () => {
    boot();
    const page = () => (
      <section data-page="about">
        <CountUp to="2.50" prefix="$" duration={1400} data-testid="c" />
      </section>
    );
    const first = render(page());
    act(() => io().trigger(screen.getByTestId('c')));
    act(() => vi.advanceTimersByTime(300));
    expect(vi.getTimerCount()).toBe(1);
    first.unmount();
    expect(vi.getTimerCount()).toBe(0);
    render(page());
    const c = screen.getByTestId('c');
    expect(c.textContent).toBe('$2.50');
    expect(c).toHaveClass('is-in');
  });

  it('writes the raw text at once with reduced motion', () => {
    setMedia({ [REDUCE]: true });
    render(<CountUp to="010" suffix="+" data-testid="c" />);
    expect(screen.getByTestId('c').textContent).toBe('010+');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows the raw text for a non number once it intersects', () => {
    boot();
    render(<CountUp to="n/a" data-testid="c" />);
    const c = screen.getByTestId('c');
    expect(c.textContent).toBe('0');
    act(() => io().trigger(c));
    expect(c.textContent).toBe('n/a');
  });
});

/* ---- Magnetic and tilt (document delegation) ---- */

describe('bindMotion (magnetic and tilt)', () => {
  function fixture(): {
    btn: HTMLElement;
    inner: HTMLElement;
    m2: HTMLElement;
    card: HTMLElement;
    out: HTMLElement;
  } {
    document.body.innerHTML =
      '<a class="btn" data-magnetic><span id="in">x</span></a>' +
      '<div id="m2" data-magnetic="0.15"></div>' +
      '<article id="card" data-tilt="2.5"><p>x</p></article><div id="out"></div>';
    const btn = $('.btn') as HTMLElement;
    btn.getBoundingClientRect = rect(100, 50, 200, 100);
    const m2 = $('#m2') as HTMLElement;
    m2.getBoundingClientRect = rect(0, 0, 100, 40);
    const card = $('#card') as HTMLElement;
    card.getBoundingClientRect = rect(0, 0, 400, 200);
    return { btn, inner: $('#in') as HTMLElement, m2, card, out: $('#out') as HTMLElement };
  }

  it('writes the reference transforms on fine pointers and clears them on leave', () => {
    setMedia({ [FINE]: true });
    const { btn, inner, m2, card, out } = fixture();
    const off = bindMotion();
    pointer('pointermove', inner, { clientX: 250, clientY: 80 });
    expect(btn.style.transform).toBe('translate(12.5px,-5.0px)');
    pointer('pointerout', inner, { relatedTarget: btn });
    expect(btn.style.transform).toBe('translate(12.5px,-5.0px)');
    pointer('pointerout', btn, { relatedTarget: out });
    expect(btn.style.transform).toBe('');
    pointer('pointermove', m2, { clientX: 100, clientY: 0 });
    expect(m2.style.transform).toBe('translate(7.5px,-3.0px)');
    pointer('pointermove', card.firstElementChild as Element, { clientX: 280, clientY: 40 });
    expect(card.style.transform).toBe(
      'perspective(900px) rotateX(0.75deg) rotateY(0.50deg) translateY(-4px)',
    );
    pointer('pointerout', card.firstElementChild as Element, { relatedTarget: null });
    expect(card.style.transform).toBe('');
    off();
  });

  it('removes its listeners and clears leftover transforms on cleanup', () => {
    setMedia({ [FINE]: true });
    const { btn, inner } = fixture();
    const off = bindMotion();
    pointer('pointermove', inner, { clientX: 250, clientY: 80 });
    expect(btn.style.transform).not.toBe('');
    off();
    expect(btn.style.transform).toBe('');
    pointer('pointermove', inner, { clientX: 250, clientY: 80 });
    expect(btn.style.transform).toBe('');
  });

  it('drops an element removed from the DOM under the pointer and never touches it again', () => {
    setMedia({ [FINE]: true });
    const { btn, inner, m2, out } = fixture();
    const off = bindMotion();
    pointer('pointermove', inner, { clientX: 250, clientY: 80 });
    pointer('pointermove', m2, { clientX: 100, clientY: 0 });
    expect(heldTransformCount()).toBe(2);
    btn.remove();
    pointer('pointermove', out, { clientX: 0, clientY: 0 });
    expect(heldTransformCount()).toBe(1);
    m2.remove();
    const setBtn = vi.fn();
    const setM2 = vi.fn();
    Object.defineProperty(btn.style, 'transform', { configurable: true, set: setBtn });
    Object.defineProperty(m2.style, 'transform', { configurable: true, set: setM2 });
    off();
    expect(setBtn).not.toHaveBeenCalled();
    expect(setM2).not.toHaveBeenCalled();
    expect(heldTransformCount()).toBe(0);
  });

  it('binds nothing on coarse pointers or with reduced motion', () => {
    const { btn, inner } = fixture();
    const offCoarse = bindMotion();
    pointer('pointermove', inner, { clientX: 250, clientY: 80 });
    expect(btn.style.transform).toBe('');
    offCoarse();
    setMedia({ [FINE]: true, [REDUCE]: true });
    const offReduced = bindMotion();
    pointer('pointermove', inner, { clientX: 250, clientY: 80 });
    expect(btn.style.transform).toBe('');
    offReduced();
  });
});

/* ---- Spotlight ---- */

describe('installSpotlight', () => {
  it('writes --mx/--my on the closest [data-spotlight], unrounded, even with reduced motion', () => {
    setMedia({ [REDUCE]: true });
    document.body.innerHTML = '<div class="card" data-spotlight><p id="p">x</p></div>';
    const card = $('.card') as HTMLElement;
    card.getBoundingClientRect = rect(10, 20, 300, 200);
    const off = installSpotlight();
    pointer('pointermove', $('#p') as Element, { clientX: 110.5, clientY: 70 });
    expect(card.style.getPropertyValue('--mx')).toBe('100.5px');
    expect(card.style.getPropertyValue('--my')).toBe('50px');
    off();
    pointer('pointermove', $('#p') as Element, { clientX: 20, clientY: 30 });
    expect(card.style.getPropertyValue('--mx')).toBe('100.5px');
  });
});

/* ---- GlobalMotion ---- */

describe('GlobalMotion', () => {
  it('installs spotlight and smooth scroll at once, magnetic from motionReady, and cleans up', () => {
    setMedia({ [FINE]: true });
    document.body.innerHTML =
      '<a class="btn" data-magnetic id="btn">x</a><div class="card" data-spotlight id="card"></div>';
    const btn = $('#btn') as HTMLElement;
    btn.getBoundingClientRect = rect(0, 0, 100, 40);
    const card = $('#card') as HTMLElement;
    card.getBoundingClientRect = rect(0, 0, 100, 100);
    const view = render(<GlobalMotion />);
    expect(document.documentElement).toHaveClass('smooth-on');
    pointer('pointermove', card, { clientX: 5, clientY: 6 });
    expect(card.style.getPropertyValue('--mx')).toBe('5px');
    pointer('pointermove', btn, { clientX: 100, clientY: 40 });
    expect(btn.style.transform).toBe('');
    boot();
    pointer('pointermove', btn, { clientX: 100, clientY: 40 });
    expect(btn.style.transform).toBe('translate(12.5px,5.0px)');
    view.unmount();
    expect(document.documentElement).not.toHaveClass('smooth-on');
    expect(btn.style.transform).toBe('');
    pointer('pointermove', btn, { clientX: 100, clientY: 40 });
    pointer('pointermove', card, { clientX: 50, clientY: 60 });
    expect(btn.style.transform).toBe('');
    expect(card.style.getPropertyValue('--mx')).toBe('5px');
  });
});

/* ---- Smooth wheel scroll ---- */

describe('smooth wheel scroll', () => {
  function wheel(target: Element, init: WheelEventInit): WheelEvent {
    const e = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(e);
    return e;
  }

  it('lerps the wheel on fine pointers and keeps native scroll where the reference does', () => {
    setMedia({ [FINE]: true });
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 5000,
    });
    document.body.innerHTML = '<div id="a">x</div><div data-native-scroll><p id="n">x</p></div>';
    const off = installSmoothScroll();
    expect(isSmoothOn()).toBe(true);
    expect(document.documentElement).toHaveClass('smooth-on');

    expect(wheel($('#n') as Element, { deltaY: 100 }).defaultPrevented).toBe(false);
    expect(wheel($('#a') as Element, { deltaY: 100, ctrlKey: true }).defaultPrevented).toBe(false);
    expect(wheel($('#a') as Element, { deltaY: 10, deltaX: 40 }).defaultPrevented).toBe(false);
    document.body.classList.add('modal-open');
    expect(wheel($('#a') as Element, { deltaY: 100 }).defaultPrevented).toBe(false);
    document.body.classList.remove('modal-open');

    expect(wheel($('#a') as Element, { deltaY: 100 }).defaultPrevented).toBe(true);
    act(() => vi.advanceTimersByTime(16));
    expect(scrollTo).toHaveBeenLastCalledWith(0, 11);
    act(() => vi.advanceTimersByTime(2000));
    expect(scrollTo).toHaveBeenLastCalledWith(0, 100);
    expect(vi.getTimerCount()).toBe(0);

    // Lines are 32px; the target keeps accumulating like the reference (no scroll event
    // resynced it, since scrollTo is a stub here): 100 + 3 * 32.
    wheel($('#a') as Element, { deltaY: 3, deltaMode: 1 });
    act(() => vi.advanceTimersByTime(2000));
    expect(scrollTo).toHaveBeenLastCalledWith(0, 196);

    expect(smoothTo(99999)).toBe(true);
    act(() => vi.advanceTimersByTime(16));
    smoothReset();
    expect(vi.getTimerCount()).toBe(0);

    off();
    expect(isSmoothOn()).toBe(false);
    expect(document.documentElement).not.toHaveClass('smooth-on');
    expect(smoothTo(10)).toBe(false);
    expect(wheel($('#a') as Element, { deltaY: 100 }).defaultPrevented).toBe(false);
  });

  it('is not installed on coarse pointers or with reduced motion', () => {
    const off = installSmoothScroll();
    expect(isSmoothOn()).toBe(false);
    off();
    setMedia({ [FINE]: true, [REDUCE]: true });
    const off2 = installSmoothScroll();
    expect(isSmoothOn()).toBe(false);
    expect(document.documentElement).not.toHaveClass('smooth-on');
    off2();
  });
});

/* ---- Parallax ---- */

describe('parallax', () => {
  function fixture(): Record<string, HTMLElement> {
    document.body.innerHTML =
      '<main class="site"><section class="page is-current" data-page="about">' +
      '<span id="p" data-parallax="0.07"></span><span id="z" data-parallax="0"></span>' +
      '<span id="far" data-parallax="-0.08"></span></section>' +
      '<section class="page" data-page="profile"><span id="h" data-parallax></span></section></main>';
    const els: Record<string, HTMLElement> = {};
    ['p', 'z', 'far', 'h'].forEach((id) => (els[id] = $('#' + id) as HTMLElement));
    els.p.getBoundingClientRect = rect(0, 500, 10, 100);
    els.z.getBoundingClientRect = rect(0, 484, 10, 0);
    els.far.getBoundingClientRect = rect(0, innerHeight + 201, 10, 10);
    els.h.getBoundingClientRect = rect(0, 0, 10, 10);
    return els;
  }

  it('writes style.translate on the current page, "0" becomes .1, far elements stay frozen', () => {
    const els = fixture();
    const off = installParallax();
    refreshParallax();
    const center = innerHeight / 2;
    expect(els.p.style.translate).toBe('0 ' + ((550 - center) * -0.07).toFixed(1) + 'px');
    expect(els.z.style.translate).toBe('0 ' + ((484 - center) * -0.1).toFixed(1) + 'px');
    expect(els.far.style.translate).toBe('');
    expect(els.h.style.translate).toBe('');
    expect(els.p.style.transform).toBe('');

    els.p.getBoundingClientRect = rect(0, 300, 10, 100);
    window.dispatchEvent(new Event('scroll'));
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(16));
    expect(els.p.style.translate).toBe('0 ' + ((350 - center) * -0.07).toFixed(1) + 'px');

    off();
    els.p.getBoundingClientRect = rect(0, 100, 10, 100);
    window.dispatchEvent(new Event('scroll'));
    expect(vi.getTimerCount()).toBe(0);
    refreshParallax();
    expect(els.p.style.translate).toBe('0 ' + ((350 - center) * -0.07).toFixed(1) + 'px');
  });

  it('is off with reduced motion', () => {
    setMedia({ [REDUCE]: true });
    const els = fixture();
    const off = installParallax();
    refreshParallax();
    expect(els.p.style.translate).toBe('');
    off();
  });
});

/* ---- Boot store ---- */

describe('boot store', () => {
  it('sets loaded, then motionReady 250ms later', () => {
    const loaded = vi.fn();
    const ready = vi.fn();
    whenLoaded(loaded);
    const offReady = whenMotionReady(ready);
    expect(getBootState()).toEqual({ loaded: false, motionReady: false });
    markLoaded();
    expect(getBootState()).toEqual({ loaded: true, motionReady: false });
    expect(loaded).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(249);
    expect(ready).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(getBootState()).toEqual({ loaded: true, motionReady: true });
    expect(ready).toHaveBeenCalledTimes(1);
    offReady();
    markLoaded();
    const late = vi.fn();
    whenMotionReady(late);
    expect(late).toHaveBeenCalledTimes(1);
  });

  it('uses a 0ms timer with reduced motion and lets callers unsubscribe', () => {
    setMedia({ [REDUCE]: true });
    const ready = vi.fn();
    const off = whenMotionReady(ready);
    off();
    markLoaded();
    expect(getBootState().motionReady).toBe(false);
    vi.advanceTimersByTime(0);
    expect(getBootState().motionReady).toBe(true);
    expect(ready).not.toHaveBeenCalled();
  });

  it('re-renders components through useBootState', () => {
    function Probe() {
      const s = useBootState();
      return <p data-testid="b">{String(s.loaded) + ',' + String(s.motionReady)}</p>;
    }
    render(<Probe />);
    expect(screen.getByTestId('b').textContent).toBe('false,false');
    boot();
    expect(screen.getByTestId('b').textContent).toBe('true,true');
  });
});

/* ---- Media hooks and onView ---- */

describe('media hooks and onView', () => {
  function Probe() {
    return <p>{[useReducedMotion(), useFinePointer(), useCanHover()].map(String).join(',')}</p>;
  }

  it('are false during SSR and read the query once on the client', () => {
    setMedia({ [REDUCE]: true, [FINE]: true, '(hover:hover)': true });
    expect(renderToString(<Probe />)).toBe('<p>false,false,false</p>');
    render(<Probe />);
    expect(screen.getByText('true,true,true')).toBeInTheDocument();
    media = {};
    render(<Probe />);
    expect(screen.getAllByText('true,true,true')).toHaveLength(2);
  });

  it('onView runs once on intersect, or at once with reduced motion', () => {
    const el = document.createElement('div');
    const fn = vi.fn();
    const off = onView(el, fn);
    expect(io().observed.has(el)).toBe(true);
    io().trigger(el);
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    setMedia({ [REDUCE]: true });
    const fn2 = vi.fn();
    onView(el, fn2);
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});
