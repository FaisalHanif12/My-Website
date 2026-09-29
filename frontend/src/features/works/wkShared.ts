/**
 * Helpers shared by the Works and Approvals scripts (reference works.js L7469-7554 and L7794-7854):
 * the segmented filter control, the FLIP filtering, the flash, the stat count up and the page hero
 * controller. Everything works on markup React already rendered, and returns disposers.
 */

export const EASE = 'cubic-bezier(.22,1,.36,1)';

export type Dispose = () => void;

const html = () => document.documentElement;
export const isLoaded = () => html().classList.contains('is-loaded');

export const pad = (n: number) => (n < 10 ? '0' : '') + n;

/** Collects disposers; call the returned function to run them all, last first. */
export function disposer() {
  const list: Dispose[] = [];
  return {
    add(d: Dispose) {
      list.push(d);
    },
    listen(
      target: EventTarget,
      type: string,
      fn: EventListenerOrEventListenerObject,
      opts?: AddEventListenerOptions | boolean,
    ) {
      target.addEventListener(type, fn, opts);
      list.push(() => target.removeEventListener(type, fn, opts));
    },
    timeout(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      list.push(() => clearTimeout(id));
      return id;
    },
    run() {
      while (list.length) list.pop()?.();
    },
  };
}

/** A cell that the FLIP filter animates: the element plus the animations it currently runs. */
export type FlipCell<T> = HTMLElement & { __wkA?: Animation[]; __data?: T };

/**
 * makeFilter (L7482-7513): wires the segmented pills, the sliding indicator, aria-pressed, the
 * fade edges when the pills scroll, and calls onChange(key) when the selection changes. The buttons
 * and their counts are server markup.
 */
export function makeFilter(
  root: HTMLElement,
  reduce: boolean,
  onChange: (key: string) => void,
  d: ReturnType<typeof disposer>,
) {
  const ind = root.querySelector<HTMLElement>('.wk-filter__ind');
  const btns = Array.from(root.querySelectorAll<HTMLElement>('.wk-fbtn'));
  let cur = 'all';
  const place = (instant: boolean) => {
    const b = root.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!b || !ind) return;
    if (instant) ind.style.transition = 'none';
    ind.style.width = b.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + b.offsetLeft + 'px)';
    if (instant) {
      ind.getBoundingClientRect();
      ind.style.transition = '';
    }
  };
  const edges = () => {
    const max = root.scrollWidth - root.clientWidth;
    root.style.setProperty('--fl', root.scrollLeft > 2 ? '28px' : '0px');
    root.style.setProperty('--fr', root.scrollLeft < max - 2 ? '28px' : '0px');
  };
  const select = (b: HTMLElement) => {
    const k = b.dataset.k ?? '';
    if (k === cur) return;
    cur = k;
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    place(false);
    if (root.scrollWidth > root.clientWidth) {
      root.scrollTo({
        left: b.offsetLeft - (root.clientWidth - b.offsetWidth) / 2,
        behavior: reduce ? 'auto' : 'smooth',
      });
    }
    onChange(k);
  };
  btns.forEach((b) => d.listen(b, 'click', () => select(b)));
  d.listen(root, 'scroll', edges, { passive: true });
  const sync = () => {
    place(true);
    edges();
  };
  d.listen(window, 'resize', sync);
  if (document.fonts && document.fonts.ready) void document.fonts.ready.then(sync);
  sync();
  d.timeout(sync, 400);
  return {
    sync,
    get: () => cur,
    set(k: string) {
      const b = root.querySelector<HTMLElement>(`.wk-fbtn[data-k="${k}"]`);
      if (b) select(b);
    },
  };
}

/**
 * makeFlip (L7518-7554): filtering in three beats: the leaving cards fade and shrink out (260ms),
 * then the layout runs and the staying cards glide from where they were (FLIP, 620ms) while the new
 * ones fade in one after another (560ms), and the container height eases if it shrinks.
 */
export function makeFlip<T>(
  container: HTMLElement,
  cells: FlipCell<T>[],
  layout: (next: FlipCell<T>[]) => void,
  afterFn: (next: FlipCell<T>[]) => void,
  reduce: boolean,
  d: ReturnType<typeof disposer>,
) {
  let token = 0;
  return (test: (c: FlipCell<T>) => boolean) => {
    const run = ++token;
    cells.forEach((c) => {
      (c.__wkA ?? []).forEach((a) => a.cancel());
      c.__wkA = [];
      c.classList.add('is-in');
      c.style.setProperty('--d', '0ms');
    });
    const prev = cells.filter((c) => !c.hidden);
    const next = cells.filter(test);
    const leaving = prev.filter((c) => next.indexOf(c) < 0);
    const entering = next.filter((c) => prev.indexOf(c) < 0);
    const staying = next.filter((c) => prev.indexOf(c) >= 0);
    if (reduce) {
      cells.forEach((c) => {
        c.hidden = next.indexOf(c) < 0;
      });
      layout(next);
      afterFn(next);
      return;
    }
    leaving.forEach((c) => {
      c.__wkA!.push(
        c.animate(
          [
            { opacity: 1, transform: 'none' },
            { opacity: 0, transform: 'scale(.95)' },
          ],
          { duration: 260, easing: EASE, fill: 'forwards' },
        ),
      );
    });
    d.timeout(
      () => {
        if (run !== token) return;
        const first = staying.map((c) => c.getBoundingClientRect());
        const h0 = container.offsetHeight;
        leaving.forEach((c) => {
          c.hidden = true;
          c.__wkA!.forEach((a) => a.cancel());
          c.__wkA = [];
        });
        entering.forEach((c) => {
          c.hidden = false;
        });
        layout(next);
        afterFn(next);
        const h1 = container.offsetHeight;
        staying.forEach((c, i) => {
          const a = first[i];
          const b = c.getBoundingClientRect();
          const dx = a.left - b.left;
          const dy = a.top - b.top;
          const s = Math.max(
            0.85,
            Math.min(1.15, Math.min(a.width / b.width, a.height / b.height)),
          );
          const resized = Math.abs(a.width - b.width) > 2;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && !resized) return;
          c.__wkA!.push(
            c.animate(
              [
                {
                  transformOrigin: '0 0',
                  transform:
                    'translate(' + dx + 'px,' + dy + 'px) scale(' + (resized ? s : 1) + ')',
                  opacity: resized ? 0.55 : 1,
                },
                { transformOrigin: '0 0', transform: 'none', opacity: 1 },
              ],
              { duration: 620, easing: EASE },
            ),
          );
        });
        entering.forEach((c, i) => {
          c.__wkA!.push(
            c.animate(
              [
                { opacity: 0, transform: 'translateY(18px) scale(.97)' },
                { opacity: 1, transform: 'none' },
              ],
              { duration: 560, delay: 60 + i * 55, easing: EASE, fill: 'backwards' },
            ),
          );
        });
        if (h1 < h0 - 2) {
          container.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], {
            duration: 620,
            easing: EASE,
          });
        }
      },
      leaving.length ? 250 : 0,
    );
  };
}

/** flash (L7797): the highlight ring on a card that was jumped to. */
export function flash(
  el: Element | null | undefined,
  reduce: boolean,
  d: ReturnType<typeof disposer>,
) {
  if (!el || reduce) return;
  el.classList.remove('wk-flash');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('wk-flash');
  d.timeout(() => el.classList.remove('wk-flash'), 2600);
}

/** countUp (L7799-7805): a hero stat counts up (ease out quart, 1500ms) after `delay`. */
export function countUp(
  el: HTMLElement,
  delay: number,
  reduce: boolean,
  d: ReturnType<typeof disposer>,
) {
  const to = +(el.dataset.wkTo ?? 0);
  const suf = el.dataset.wkSuf ?? '';
  if (reduce) {
    el.textContent = to + suf;
    return;
  }
  el.textContent = '0' + suf;
  d.timeout(() => {
    let t0: number | null = null;
    let id = 0;
    d.add(() => cancelAnimationFrame(id));
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / 1500);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) id = requestAnimationFrame(tick);
    };
    tick(performance.now());
  }, delay);
}

/** whenLoaded (L7806-7809): runs at once when loaded, else polls every 50ms (at most 80 times). */
export function whenLoaded(fn: () => void, d: ReturnType<typeof disposer>) {
  if (isLoaded()) {
    fn();
    return;
  }
  let n = 0;
  const iv = setInterval(() => {
    if (isLoaded() || ++n > 80) {
      clearInterval(iv);
      fn();
    }
  }, 50);
  d.add(() => clearInterval(iv));
}

/** afterCurtain (L7843-7851): runs fn once the page curtain has started to lift, or right away. */
export function afterCurtain(fn: () => void, d: ReturnType<typeof disposer>) {
  const c = document.getElementById('curtain');
  const covering = () => !!c && c.classList.contains('is-on') && !c.classList.contains('is-out');
  if (!covering()) {
    d.timeout(fn, 120);
    return;
  }
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    mo.disconnect();
    d.timeout(fn, 120);
  };
  const mo = new MutationObserver(() => {
    if (!covering()) go();
  });
  mo.observe(c!, { attributes: true, attributeFilter: ['class'] });
  d.add(() => mo.disconnect());
  d.timeout(go, 1800);
}

export interface PageHeroOptions {
  /** Waits for the curtain to lift before entering (both heroes). */
  sync: boolean;
  reset?: () => void;
  enter?: () => void;
  /** Called with true while the hero is entered, in view, and the tab visible. */
  run?: (on: boolean) => void;
  scroll?: (p: number) => void;
}

/**
 * pageHero (L7810-7841): the entrance controller both heroes share. `is-on` starts the CSS
 * entrance and the stat count ups; --p (0 to 1) follows the scroll for the exit; `run(active)` tells
 * the hero when its loops may run. A page mounted after boot is a page show (L7833-7838), a page
 * mounted before boot is the first load on this route (L7840).
 */
export function pageHero(
  el: HTMLElement,
  reduce: boolean,
  o: PageHeroOptions,
  d: ReturnType<typeof disposer>,
) {
  let t: ReturnType<typeof setTimeout> | undefined;
  let entered = false;
  let inView = true;
  let lastP = -1;
  d.add(() => clearTimeout(t));
  const active = () => entered && inView && !document.hidden;
  const run = () => o.run?.(active());
  const scroll = () => {
    if (reduce) return;
    const p = Math.max(0, Math.min(1, scrollY / (el.offsetHeight * 0.85)));
    if (Math.abs(p - lastP) < 0.001) return;
    lastP = p;
    el.style.setProperty('--p', p.toFixed(3));
    o.scroll?.(p);
  };
  const enter = (delay: number) => {
    clearTimeout(t);
    entered = false;
    el.classList.remove('is-on');
    o.reset?.();
    void el.offsetWidth;
    const go = () => {
      el.classList.add('is-on');
      entered = true;
      el.querySelectorAll<HTMLElement>('[data-wk-to]').forEach((n) => {
        const s = n.closest<HTMLElement>('.wk-a');
        countUp(n, (parseInt(s?.style.getPropertyValue('--d') ?? '', 10) || 0) + 200, reduce, d);
      });
      o.enter?.();
      run();
      scroll();
    };
    if (reduce) go();
    else t = setTimeout(go, delay);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      inView = es[0].isIntersecting;
      run();
    });
    io.observe(el);
    d.add(() => io.disconnect());
  }
  d.listen(document, 'visibilitychange', run);
  d.listen(window, 'scroll', scroll, { passive: true });
  if (isLoaded()) {
    /* a page show */
    lastP = -1;
    el.style.setProperty('--p', '0');
    if (o.sync && !reduce) {
      clearTimeout(t);
      entered = false;
      el.classList.remove('is-on');
      o.reset?.();
      afterCurtain(() => enter(0), d);
    } else {
      const c = document.getElementById('curtain');
      enter(c && c.classList.contains('is-on') ? 340 : 60);
    }
  } else {
    /* the first load on this route */
    whenLoaded(() => enter(90), d);
  }
}

/** cueBind (L7852-7854): buttons with data-wk-cue scroll to the element with that id. */
export function cueBind(
  root: HTMLElement,
  scrollToEl: (el: Element | null | undefined) => void,
  d: ReturnType<typeof disposer>,
) {
  root.querySelectorAll<HTMLElement>('[data-wk-cue]').forEach((b) => {
    d.listen(b, 'click', () => scrollToEl(document.getElementById(b.dataset.wkCue ?? '')));
  });
}
