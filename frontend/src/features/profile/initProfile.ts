/**
 * The Profile page script (reference profile.js, L7020-7381) as one imperative module: the résumé
 * desk (entrance, pointer tilt, scroll exit, jumps), the scroll-drawn timeline with the sticky
 * year, the skill tabs with animated rings, the education light sweep and the chip magnetism.
 *
 * Like the About port, it works on the mounted #profile section through classes and styles, and
 * everything it starts is disposed by the returned function. Only the current page is mounted, so
 * `onPage()` is always true; a page mounted after boot is a page show (`fh:page`, L7365), a page
 * mounted before boot is a first load on this route (L7376).
 */
import { clamp } from '@/lib/dom';

export interface ProfileEnv {
  reduce: boolean;
  fine: boolean;
  /** FH.scrollToEl. */
  scrollToEl: (el: Element | null | undefined) => void;
}

type Dispose = () => void;

const html = () => document.documentElement;
const isLoaded = () => html().classList.contains('is-loaded');
const pad = (n: number) => (n < 10 ? '0' : '') + n;
const visible = (el: HTMLElement | null) => !!(el && el.offsetParent);

export function initProfile(sec: HTMLElement, env: ProfileEnv): Dispose {
  const { reduce, fine } = env;
  const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = sec) =>
    r.querySelector<E>(s);
  const $$ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = sec) =>
    Array.from(r.querySelectorAll<E>(s));

  const disposers: Dispose[] = [];
  const add = (d: Dispose) => disposers.push(d);
  const listen = (
    target: EventTarget,
    type: string,
    fn: EventListenerOrEventListenerObject,
    opts?: AddEventListenerOptions | boolean,
  ) => {
    target.addEventListener(type, fn, opts);
    add(() => target.removeEventListener(type, fn, opts));
  };
  const timeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    add(() => clearTimeout(id));
    return id;
  };

  /** Counts el up to `to` (ease out quart), or writes the end text at once with reduced motion. */
  function countTo(el: HTMLElement, to: number, dur: number, suffix = '') {
    if (reduce) {
      el.textContent = to + suffix;
      return;
    }
    let t0: number | null = null;
    let id = 0;
    add(() => cancelAnimationFrame(id));
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e) + suffix;
      if (p < 1) id = requestAnimationFrame(tick);
    };
    tick(performance.now());
  }

  /** Waits (polling every 120ms) for the preloader to finish, like whenLoaded (L7034). */
  function whenLoaded(fn: () => void) {
    const wait = () => {
      if (isLoaded()) fn();
      else timeout(wait, 120);
    };
    wait();
  }

  /* ============ 0. HERO: the résumé as an object ============ */
  const hero = $('.pf-hero');
  const desk = $('.pf-desk');
  const tilt = $('.pf-desk__tilt');
  const sheets = $$('.pf-sheet');
  let playTimers: Array<ReturnType<typeof setTimeout>> = [];
  const clearPlay = () => {
    playTimers.forEach(clearTimeout);
    playTimers = [];
  };
  add(clearPlay);

  function resetHero() {
    if (!hero) return;
    clearPlay();
    hero.classList.remove('is-in', 'is-settled', 'is-live');
    $$('.pf-count', hero).forEach((c) => {
      c.textContent = reduce ? (c.dataset.to ?? '') : '0';
    });
  }
  function playHero() {
    if (!hero) return;
    resetHero();
    void hero.offsetWidth;
    hero.classList.add('is-in');
    heroScroll();
    if (reduce) {
      hero.classList.add('is-settled');
      $$('.pf-count', hero).forEach((c) => {
        c.textContent = c.dataset.to ?? '';
      });
      return;
    }
    playTimers.push(
      setTimeout(() => {
        $$('.pf-count', hero).forEach((c) => countTo(c, parseInt(c.dataset.to ?? '', 10), 1200));
      }, 520),
    );
    /* pages have landed: hover can fan them, and the slow float begins */
    playTimers.push(setTimeout(() => hero.classList.add('is-settled', 'is-live'), 1700));
  }
  /* Start once the curtain has begun to lift (adapts to the shell's transition timing) */
  function afterCurtain(fn: () => void) {
    const c = document.getElementById('curtain');
    const covering = () => !!c && c.classList.contains('is-on') && !c.classList.contains('is-out');
    if (!covering()) {
      playTimers.push(setTimeout(fn, 150));
      return;
    }
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      mo.disconnect();
      playTimers.push(setTimeout(fn, 150));
    };
    const mo = new MutationObserver(() => {
      if (!covering()) go();
    });
    mo.observe(c!, { attributes: true, attributeFilter: ['class'] });
    add(() => mo.disconnect());
    playTimers.push(setTimeout(go, 1600));
  }

  /* Scroll-linked exit: one variable (--sp, 0 to 1) drives every layer in CSS */
  let sRaf = 0;
  let lastSp = -1;
  add(() => cancelAnimationFrame(sRaf));
  function heroScroll() {
    sRaf = 0;
    if (!hero || !visible(hero)) return;
    const r = hero.getBoundingClientRect();
    hero.classList.toggle('is-idle', r.bottom < 0 || r.top > innerHeight);
    if (reduce) return;
    /* progress starts once the hero's bottom edge rises into the viewport, so a tall (mobile) hero never fades while it is being read */
    let p = Math.min(1, Math.max(0, (innerHeight - r.bottom) / Math.max(1, innerHeight * 0.8)));
    p = p * p * (3 - 2 * p);
    if (Math.abs(p - lastSp) < 0.001) return;
    lastSp = p;
    hero.style.setProperty('--sp', p.toFixed(4));
  }
  const kickScroll = () => {
    if (!sRaf) sRaf = requestAnimationFrame(heroScroll);
  };

  /* Pointer: the desk tilts a few degrees toward the cursor; the sheets' depth gives real parallax */
  if (hero && tilt && desk && fine && !reduce) {
    let tx = 0;
    let ty = 0;
    let gx = 0;
    let gy = 0;
    let tRaf = 0;
    add(() => cancelAnimationFrame(tRaf));
    const loop = () => {
      tx += (gx - tx) * 0.08;
      ty += (gy - ty) * 0.08;
      tilt.style.setProperty('--tx', tx.toFixed(3) + 'deg');
      tilt.style.setProperty('--ty', ty.toFixed(3) + 'deg');
      if (Math.abs(gx - tx) > 0.01 || Math.abs(gy - ty) > 0.01) tRaf = requestAnimationFrame(loop);
      else tRaf = 0;
    };
    listen(
      hero,
      'pointermove',
      ((e: PointerEvent) => {
        if (!hero.classList.contains('is-settled')) return;
        const r = desk.getBoundingClientRect();
        const px = (e.clientX - (r.left + r.width / 2)) / Math.max(1, innerWidth / 2);
        const py = (e.clientY - (r.top + r.height / 2)) / Math.max(1, innerHeight / 2);
        gy = Math.max(-1, Math.min(1, px)) * 5;
        gx = Math.max(-1, Math.min(1, py)) * -4;
        if (!tRaf) tRaf = requestAnimationFrame(loop);
      }) as EventListener,
      { passive: true },
    );
    listen(hero, 'pointerleave', () => {
      gx = gy = 0;
      if (!tRaf) tRaf = requestAnimationFrame(loop);
    });
  }

  function flash(el: HTMLElement | null) {
    if (!el) return;
    el.classList.remove('pf-flash');
    void el.offsetWidth;
    el.classList.add('pf-flash');
    timeout(() => el.classList.remove('pf-flash'), 2600);
  }
  function jumpTo(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    const card = target.classList.contains('pf-role')
      ? (target.querySelector<HTMLElement>('.pf-role__card') ?? target)
      : target;
    env.scrollToEl(target);
    /* flash the entry once it has arrived near the top of the viewport */
    const t0 = Date.now();
    const wait = () => {
      const top = target.getBoundingClientRect().top;
      if ((top > -20 && top < innerHeight * 0.35) || Date.now() - t0 > 3200) flash(card);
      else timeout(wait, 120);
    };
    wait();
  }

  if (hero) {
    sheets.forEach((s) => {
      listen(s, 'click', (e) => {
        e.preventDefault();
        jumpTo((s.getAttribute('href') ?? '').slice(1));
      });
    });
    listen(window, 'scroll', kickScroll, { passive: true });
    listen(
      window,
      'resize',
      () => {
        lastSp = -1;
        kickScroll();
      },
      { passive: true },
    );
  }

  /* ============ 1. Timeline: line draws with scroll, nodes light up ============ */
  const tl = $('.pf-tl');
  const track = $('.pf-tl__track');
  const fill = $('.pf-tl__fill');
  const roles = $$('.pf-role');
  const yearBox = $('.pf-year');
  let centers: number[] = [];
  let y0 = 0;
  let y1 = 1;
  let cur = 0;
  let target = 0;
  let running = false;
  let activeIdx = -1;
  let lastT = 0;
  let frameId = 0;
  add(() => cancelAnimationFrame(frameId));

  function layout(): boolean {
    if (!tl || !track || !roles.length || !visible(tl)) return false;
    centers = roles.map((r) => {
      const n = r.querySelector<HTMLElement>('.pf-node')!;
      return r.offsetTop + n.offsetTop + n.offsetHeight / 2;
    });
    y0 = centers[0];
    y1 = centers[centers.length - 1];
    track.style.top = y0 + 'px';
    track.style.height = Math.max(1, y1 - y0) + 'px';
    return true;
  }
  function measure(): number {
    const r = tl!.getBoundingClientRect();
    const anchorRel = innerHeight * 0.58 - r.top;
    const len = Math.max(1, y1 - y0);
    target = Math.min(1, Math.max(0, (anchorRel - y0) / len));
    return anchorRel;
  }
  function frame(t: number) {
    frameId = 0;
    if (!visible(tl)) {
      running = false;
      lastT = 0;
      return;
    }
    const anchorRel = measure();
    const dt = lastT ? Math.min(100, t - lastT) : 16.7;
    lastT = t;
    if (reduce) cur = target;
    else {
      cur += (target - cur) * (1 - Math.pow(0.86, dt / 16.7));
      if (Math.abs(target - cur) < 0.0008) cur = target;
    }
    fill!.style.transform = 'scaleY(' + cur.toFixed(4) + ')';
    const len = Math.max(1, y1 - y0);
    const fillEnd = y0 + cur * len;
    let act = 0;
    roles.forEach((role, i) => {
      const lit = fillEnd >= centers[i] - 0.5 && anchorRel >= centers[i];
      role.classList.toggle('is-on', lit);
      if (anchorRel >= centers[i]) act = i;
    });
    if (act !== activeIdx) setActive(act);
    if (cur !== target) frameId = requestAnimationFrame(frame);
    else {
      running = false;
      lastT = 0;
    }
  }
  function kick() {
    if (!running) {
      running = true;
      frameId = requestAnimationFrame(frame);
    }
  }

  /* Big sticky year: vertical crossfade with a soft blur */
  function swapLine(line: HTMLElement | null, text: string | undefined, dir: number) {
    if (!line || text === undefined) return;
    const old = line.querySelector<HTMLElement>('.is-cur');
    if (old && old.textContent === text) return;
    if (reduce || !old) {
      if (old) old.textContent = text;
      return;
    }
    const nu = document.createElement('span');
    nu.className = 'pf-year__txt ' + (dir > 0 ? 'is-enter-down' : 'is-enter-up');
    nu.textContent = text;
    line.appendChild(nu);
    void nu.offsetWidth;
    nu.className = 'pf-year__txt is-cur';
    old.className = 'pf-year__txt ' + (dir > 0 ? 'is-leave-up' : 'is-leave-down');
    timeout(() => {
      if (old.parentNode) old.parentNode.removeChild(old);
    }, 950);
  }
  let roleTimer: ReturnType<typeof setTimeout> | undefined;
  add(() => clearTimeout(roleTimer));
  function setActive(i: number) {
    const dir = i > activeIdx ? 1 : -1;
    const first = activeIdx < 0;
    activeIdx = i;
    roles.forEach((r, k) => r.classList.toggle('is-active', k === i));
    if (!yearBox) return;
    const r = roles[i];
    swapLine($('.pf-year__line--from', yearBox), r.dataset.from, dir);
    swapLine($('.pf-year__line--to', yearBox), r.dataset.to, dir);
    const n = $('.pf-year__n', yearBox);
    if (n) n.textContent = pad(i + 1);
    $$('.pf-year__ticks i', yearBox).forEach((t, k) => t.classList.toggle('is-on', k <= i));
    const roleEl = $('.pf-year__role', yearBox);
    if (!roleEl) return;
    clearTimeout(roleTimer);
    if (first || reduce) {
      roleEl.textContent = r.dataset.role ?? '';
      return;
    }
    roleEl.classList.add('is-swap');
    roleTimer = setTimeout(() => {
      roleEl.textContent = r.dataset.role ?? '';
      roleEl.classList.remove('is-swap');
    }, 240);
  }

  if (tl && track && fill && roles.length) {
    layout();
    kick();
    listen(window, 'scroll', kick, { passive: true });
    listen(
      window,
      'resize',
      () => {
        if (layout()) kick();
      },
      { passive: true },
    );
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        if (layout()) kick();
      });
      ro.observe(tl);
      add(() => ro.disconnect());
    }
    if (document.fonts && document.fonts.ready) {
      void document.fonts.ready.then(() => {
        if (layout()) kick();
      });
    }
  }

  /* ============ 2. Skill tabs: segmented control + animated rings ============ */
  const tablist = $('.pf-tabs');
  const tabs = $$('.pf-tab');
  const panels = $$('.pf-panel');
  const ind = $('.pf-tabs__ind');
  let current = 0;
  let started = false;

  function placeInd(instant: boolean) {
    if (!ind || !tablist || !tabs[current] || !visible(tablist)) return;
    const t = tabs[current];
    if (instant) ind.style.transition = 'none';
    ind.style.width = t.offsetWidth + 'px';
    ind.style.height = t.offsetHeight + 'px';
    ind.style.transform = 'translate(' + t.offsetLeft + 'px,' + t.offsetTop + 'px)';
    if (instant) {
      void ind.offsetWidth;
      ind.style.transition = '';
    }
    tablist.classList.add('is-ready');
  }
  function light(panel: HTMLElement, delay: number) {
    const skills = $$('.pf-skill', panel);
    skills.forEach((s) => {
      const bar = s.querySelector<SVGElement>('.pf-ring__bar');
      const num = s.querySelector<HTMLElement>('.pf-ring__num');
      if (!bar || !num) return;
      bar.style.transition = 'none';
      s.classList.remove('is-lit');
      num.textContent = '0%';
      s.style.setProperty('--v', s.dataset.v ?? '');
      void bar.getBoundingClientRect();
      bar.style.transition = '';
    });
    skills.forEach((s, k) => {
      const go = () => {
        s.classList.add('is-lit');
        const num = s.querySelector<HTMLElement>('.pf-ring__num');
        if (num) countTo(num, parseInt(s.dataset.v ?? '', 10), 1400, '%');
      };
      if (reduce) go();
      else timeout(go, delay + k * 90);
    });
  }
  function select(i: number, focus: boolean) {
    if (i === current && started) {
      if (focus) tabs[i].focus();
      return;
    }
    current = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
    if (focus) tabs[i].focus();
    placeInd(false);
    if (started) light(panels[i], 220);
  }

  if (tablist && tabs.length) {
    tabs.forEach((t, k) => listen(t, 'click', () => select(k, false)));
    listen(tablist, 'keydown', ((e: KeyboardEvent) => {
      const n = tabs.length;
      let i = current;
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') i = (current + 1) % n;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') i = (current - 1 + n) % n;
      else if (k === 'Home') i = 0;
      else if (k === 'End') i = n - 1;
      else return;
      e.preventDefault();
      select(i, true);
    }) as EventListener);
    placeInd(true);
    listen(window, 'resize', () => placeInd(true), { passive: true });
    if (document.fonts && document.fonts.ready)
      void document.fonts.ready.then(() => placeInd(true));

    const card = $('.pf-skills');
    const start = () => {
      if (started) return;
      started = true;
      light(panels[current], 250);
    };
    if (reduce || !('IntersectionObserver' in window) || !card) start();
    else {
      const io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              io.disconnect();
              whenLoaded(start);
            }
          });
        },
        { threshold: 0.35 },
      );
      io.observe(card);
      add(() => io.disconnect());
    }
  }

  /* ============ 3. Education: play the slow light sweep only while in view ============ */
  const feat = $('.pf-edu--feat');
  if (feat && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => feat.classList.toggle('pf-play', e.isIntersecting)),
      { threshold: 0.15 },
    );
    io.observe(feat);
    add(() => io.disconnect());
  }

  /* ============ 4. Core expertise chips: gentle field magnetism ============ */
  const chipBox = $('.pf-chips');
  const chips = $$('.pf-chip');
  if (chipBox && chips.length && fine && !reduce) {
    const st = chips.map(() => ({ x: 0, y: 0 }));
    let px = 0;
    let py = 0;
    let mRaf = 0;
    add(() => cancelAnimationFrame(mRaf));
    const pull = () => {
      mRaf = 0;
      chips.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2 - st[i].x;
        const cy = r.top + r.height / 2 - st[i].y;
        const dx = px - cx;
        const dy = py - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const R = 150;
        let tx = 0;
        let ty = 0;
        if (d < R) {
          const f = Math.pow(1 - d / R, 2) * 0.2;
          tx = clamp(dx * f, -7, 7);
          ty = clamp(dy * f, -5, 5);
        }
        if (Math.abs(tx - st[i].x) > 0.2 || Math.abs(ty - st[i].y) > 0.2) {
          st[i].x = tx;
          st[i].y = ty;
          c.style.setProperty('--tx', tx.toFixed(1) + 'px');
          c.style.setProperty('--ty', ty.toFixed(1) + 'px');
        }
      });
    };
    listen(
      chipBox,
      'pointermove',
      ((e: PointerEvent) => {
        px = e.clientX;
        py = e.clientY;
        if (!mRaf) mRaf = requestAnimationFrame(pull);
      }) as EventListener,
      { passive: true },
    );
    listen(chipBox, 'pointerleave', () => {
      chips.forEach((c, i) => {
        st[i].x = st[i].y = 0;
        c.style.setProperty('--tx', '0px');
        c.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ============ 5. Page lifecycle ============ */
  resetHero();
  if (isLoaded()) {
    /* a page show under the curtain (fh:page, L7365-7375) */
    lastSp = -1;
    const id = requestAnimationFrame(() => {
      if (layout()) {
        activeIdx = -1;
        kick();
      }
      placeInd(true);
      kickScroll();
    });
    add(() => cancelAnimationFrame(id));
    if (reduce) playHero();
    else afterCurtain(playHero);
  } else {
    /* first load on this route (L7376-7379) */
    whenLoaded(() => {
      playTimers.push(setTimeout(playHero, reduce ? 0 : 120));
    });
  }

  return () => {
    while (disposers.length) disposers.pop()?.();
  };
}
