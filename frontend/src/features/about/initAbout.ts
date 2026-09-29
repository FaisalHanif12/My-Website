/**
 * The About page script (reference about.js, L5156-5646) as one imperative module.
 *
 * The reference toggles classes and writes styles on server-rendered markup, so this port does the
 * same on the mounted #about section (nothing here goes through React state). Only the current
 * page is mounted in the rebuild, so the reference's `isCur()` is always true and its page show
 * listeners (`pageFns`) collapse into the mount itself: a page mounted after boot is a page show
 * (the curtain is covering), a page mounted before boot is the first load.
 *
 * Every listener, timer, observer and animation frame is registered for disposal.
 */
import { clamp } from '@/lib/dom';

export interface AboutEnv {
  /** FH.reduce: prefers-reduced-motion, read once. */
  reduce: boolean;
  /** FH.fine: (pointer:fine), read once. */
  fine: boolean;
  /** FH.toast. */
  toast: (message: string) => void;
}

type Dispose = () => void;

const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode): E | null =>
  r.querySelector<E>(s);
const $$ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode): E[] =>
  Array.from(r.querySelectorAll<E>(s));

const html = () => document.documentElement;
const isLoaded = () => html().classList.contains('is-loaded');

/** Runs cb once when <html> gets is-loaded (the preloader is done). Returns the disposer. */
function onceLoaded(cb: () => void): Dispose {
  const mo = new MutationObserver(() => {
    if (isLoaded()) {
      mo.disconnect();
      cb();
    }
  });
  mo.observe(html(), { attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
}

export function initAbout(root: HTMLElement, env: AboutEnv): Dispose {
  const { reduce, fine } = env;
  const disposers: Dispose[] = [];
  const add = (d: Dispose) => disposers.push(d);
  const listen = <T extends EventTarget>(
    target: T,
    type: string,
    fn: EventListenerOrEventListenerObject,
    opts?: AddEventListenerOptions | boolean,
  ) => {
    target.addEventListener(type, fn, opts);
    add(() => target.removeEventListener(type, fn, opts));
  };

  /* Hero visibility (used to idle loops off screen), L5178-5182 */
  const hero = $('#ab-hero', root);
  let heroVisible = true;
  const heroFns: Array<() => void> = [];
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (es) => {
        heroVisible = es[0].isIntersecting;
        heroFns.forEach((f) => f());
      },
      { threshold: 0 },
    );
    io.observe(hero);
    add(() => io.disconnect());
  }

  /* ================= HERO LEFT COLUMN (L5189-5315) ================= */
  (function leftColumn() {
    const lc = $('.ab-lc', root);
    if (!lc || !hero) return;
    const roll = $('#ab-roll', lc);
    const words = roll ? $$('.ab-roll__w', roll) : [];
    const role = $('.ab-role', lc);
    const nums = $$('.ab-num', lc);
    const first = $('#ab-first', lc);
    const last = $('#ab-last', lc);
    let timers: Array<ReturnType<typeof setTimeout>> = [];
    let idx = 0;
    let rollT: ReturnType<typeof setTimeout> | undefined;
    const later = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const clearAll = () => {
      timers.forEach(clearTimeout);
      timers = [];
      clearTimeout(rollT);
      rollT = undefined;
    };
    add(clearAll);
    const idle = () => !heroVisible || document.hidden;

    /* each change: the connector redraws and its dot lands, then the next focus rolls up into place */
    function show(k: number) {
      const prev = words[idx];
      idx = (k + words.length) % words.length;
      const cur = words[idx];
      if (!prev || prev === cur) return;
      prev.classList.remove('is-on');
      prev.classList.add('is-out');
      cur.classList.remove('is-out');
      void cur.offsetWidth;
      cur.classList.add('is-on');
      later(() => {
        if (prev !== words[idx]) prev.classList.remove('is-out');
      }, 900);
      if (role && !reduce) {
        role.classList.remove('is-hop');
        void role.offsetWidth;
        role.classList.add('is-hop');
      }
    }
    function tick() {
      clearTimeout(rollT);
      rollT = setTimeout(() => {
        if (!idle() && !(role && role.matches(':hover'))) show(idx + 1);
        tick();
      }, 3000);
    }
    function resetRoll() {
      words.forEach((w, i) => {
        w.classList.remove('is-out');
        w.classList.toggle('is-on', i === 0);
      });
      idx = 0;
      role?.classList.remove('is-hop');
    }
    let countRafs: number[] = [];
    add(() => countRafs.forEach(cancelAnimationFrame));
    function countUp() {
      nums.forEach((n) => {
        const to = parseInt(n.dataset.to ?? '', 10) || 0;
        if (reduce) {
          n.textContent = String(to);
          return;
        }
        let t0 = 0;
        const dur = 1300;
        n.textContent = String(to);
        n.style.minWidth = '';
        n.style.minWidth = n.offsetWidth + 'px'; /* no "+" jump while counting */
        n.textContent = '0';
        const step = (t: number) => {
          if (!t0) t0 = t;
          const p = Math.min(1, (t - t0) / dur);
          const e = 1 - Math.pow(1 - p, 4);
          n.textContent = String(Math.round(to * e));
          if (p < 1) countRafs.push(requestAnimationFrame(step));
        };
        step(performance.now());
      });
    }
    function reset() {
      clearAll();
      countRafs.forEach(cancelAnimationFrame);
      countRafs = [];
      lc!.classList.remove('is-in', 'is-rolling', 'is-settled');
      resetRoll();
      if (!reduce) nums.forEach((n) => (n.textContent = '0'));
    }
    function play() {
      reset();
      void lc!.offsetWidth;
      lc!.classList.add('is-in');
      if (reduce) {
        lc!.classList.add('is-rolling', 'is-settled');
        countUp();
        tick();
        return;
      }
      later(countUp, 1000);
      later(() => lc!.classList.add('is-settled'), 1900);
      later(() => {
        lc!.classList.add('is-rolling');
        tick();
      }, 2400);
    }
    /* start once the curtain has begun to lift */
    function afterCurtain(fn: () => void) {
      const c = document.getElementById('curtain');
      const covering = () => !!c && c.classList.contains('is-on') && !c.classList.contains('is-out');
      if (!covering()) {
        later(fn, 120);
        return;
      }
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        mo.disconnect();
        later(fn, 120);
      };
      const mo = new MutationObserver(() => {
        if (!covering()) go();
      });
      mo.observe(c!, { attributes: true, attributeFilter: ['class'] });
      add(() => mo.disconnect());
      later(go, 1600);
    }

    reset();
    if (reduce) play();
    else if (isLoaded()) afterCurtain(play);
    else add(onceLoaded(() => later(play, 420)));

    /* the green mark on the stats rule glides to the stat under the pointer */
    const stats = $('.ab-stats', lc);
    if (stats && fine && !reduce) {
      const centred = matchMedia('(max-width:900px)');
      $$('.ab-stat', stats).forEach((st) => {
        listen(st, 'pointerenter', () => {
          if (centred.matches) return;
          const dd = st.querySelector('dd');
          if (!dd) return;
          const r = dd.getBoundingClientRect();
          const base = stats.getBoundingClientRect();
          stats.style.setProperty('--sx', Math.round(r.left - base.left) + 'px');
          stats.style.setProperty('--sw', Math.round(r.width) + 'px');
        });
      });
      listen(stats, 'pointerleave', () => {
        stats.style.removeProperty('--sx');
        stats.style.removeProperty('--sw');
      });
    }

    /* ambient sheen and ping pause when nobody can see them */
    const syncIdle = () => lc.classList.toggle('is-idle', idle());
    heroFns.push(syncIdle);
    listen(document, 'visibilitychange', syncIdle);
    syncIdle();

    /* subtle depth on the name only (fine pointers): "Hanif" drifts a little more than "Faisal" */
    if (fine && !reduce && first && last) {
      let tx = 0;
      let ty = 0;
      let x = 0;
      let y = 0;
      let praf = 0;
      add(() => cancelAnimationFrame(praf));
      const loop = () => {
        praf = 0;
        x += (tx - x) * 0.08;
        y += (ty - y) * 0.08;
        first.style.translate = (x * 4).toFixed(2) + 'px ' + (y * 3).toFixed(2) + 'px';
        last.style.translate = (x * 10).toFixed(2) + 'px ' + (y * 5).toFixed(2) + 'px';
        if (Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002) praf = requestAnimationFrame(loop);
      };
      listen(
        hero,
        'pointermove',
        ((e: PointerEvent) => {
          if (e.pointerType && e.pointerType !== 'mouse') return;
          tx = clamp((e.clientX / innerWidth - 0.5) * 2, -1, 1);
          ty = clamp((e.clientY / innerHeight - 0.5) * 2, -1, 1);
          if (!praf) praf = requestAnimationFrame(loop);
        }) as EventListener,
        { passive: true },
      );
      listen(hero, 'pointerleave', () => {
        tx = 0;
        ty = 0;
        if (!praf) praf = requestAnimationFrame(loop);
      });
    }
  })();

  /* ================= ORBITAL PORTRAIT (L5326-5467) ================= */
  (function orbit() {
    const orb = $('#ab-orb', root);
    if (!orb || !hero) return;
    const exitEl = $('#ab-orb-exit', root);
    const copy = $('#ab-hero-copy', root);
    const portrait = $('#ab-portrait', orb);
    const textSvg = $<HTMLElement>('.ab-orb__text', orb);
    const DEG = Math.PI / 180;
    const TAU = Math.PI * 2;
    const SAT_W = TAU / 120; /* badges: one lap per 120s, clockwise, all rings together */
    const PAR = 7; /* max whole-system parallax, px */

    interface Sat {
      el: HTMLElement;
      a: number;
      ord: number;
      hidden?: boolean;
    }
    interface Dot {
      el: HTMLElement;
      a: number;
      w: number;
    }
    interface Ring {
      n: number;
      el: HTMLElement;
      frac: number;
      drift: number;
      line: SVGElement | null;
      sats: Sat[];
      dots: Dot[];
    }
    const rings: Ring[] = $$('.ab-orb__ring', orb).map((r) => ({
      n: parseInt(r.dataset.ring ?? '', 10),
      el: r,
      frac: 0.4,
      drift: parseFloat(r.dataset.drift ?? '') || 0,
      line: r.querySelector<SVGElement>('.ab-orb__line'),
      sats: $$('.ab-sat', r).map((s) => ({ el: s, a: parseFloat(s.dataset.a ?? '') * DEG, ord: 0 })),
      dots: $$('.ab-orb__dot', r).map((d) => ({
        el: d,
        a: parseFloat(d.dataset.a ?? '') * DEG,
        w: parseFloat(d.dataset.w ?? '') || 1,
      })),
    }));
    /* fly-in order: around the circle */
    const allSats: Sat[] = rings.flatMap((R) => R.sats);
    allSats
      .slice()
      .sort((a, b) => a.a - b.a)
      .forEach((s, i) => {
        s.ord = i;
      });

    let S = 600;
    let t = 0;
    let speed = 1;
    let speedT = 1;
    let lastNow = 0;
    let raf = 0;
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let introAt = 0;
    let introDone = reduce;
    let orbInView = true;
    let pending = false;
    add(() => cancelAnimationFrame(raf));

    const measure = () => {
      const cs = getComputedStyle(orb);
      S = parseFloat(cs.width) || orb.clientWidth || S; /* layout width, unaffected by the exit scale */
      rings.forEach((R) => {
        R.frac = parseFloat(cs.getPropertyValue('--r' + R.n)) || R.frac;
      });
    };
    const visible = (el: HTMLElement) =>
      el.offsetParent !== null || getComputedStyle(el).display !== 'none';
    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

    function render(now: number) {
      const intro = introDone ? 1e9 : now - introAt;
      if (!introDone && intro > 2400) introDone = true;
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      for (const R of rings) {
        const rp = R.frac * S;
        if (R.drift && R.line) R.line.style.strokeDashoffset = (t * R.drift).toFixed(3); /* pathLength 360: units are degrees */
        for (const s of R.sats) {
          if (s.hidden) continue;
          const p = reduce ? 1 : clamp((intro - 300 - s.ord * 45) / 850, 0, 1);
          const ep = easeOut(p);
          const a = s.a + t * SAT_W - (1 - ep) * 0.5;
          const rr = rp * (1 + (1 - ep) * 0.1);
          s.el.style.transform =
            'translate3d(' + (Math.cos(a) * rr).toFixed(2) + 'px,' + (Math.sin(a) * rr).toFixed(2) + 'px,0)';
          s.el.style.opacity = ep.toFixed(3);
        }
        for (const D of R.dots) {
          const da = D.a + ((t * TAU) / 100) * D.w;
          D.el.style.transform =
            'translate3d(' + (Math.cos(da) * rp).toFixed(2) + 'px,' + (Math.sin(da) * rp).toFixed(2) + 'px,0)';
        }
      }
      orb!.style.translate =
        Math.abs(mx) + Math.abs(my) > 0.001 ? (mx * PAR).toFixed(2) + 'px ' + (my * PAR).toFixed(2) + 'px' : '';
      if (textSvg) textSvg.style.transform = 'rotate(' + (-t * 4).toFixed(3) + 'deg)';
    }

    const running = () => !reduce && heroVisible && !document.hidden;
    function frame(now: number) {
      raf = 0;
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      speed += (speedT - speed) * Math.min(1, dt * 2.4);
      t += dt * speed;
      render(now);
      if (running()) raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (!raf && running()) {
        lastNow = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    const renderOnce = () => {
      requestAnimationFrame((now) => render(now));
    };
    const markHidden = () => {
      allSats.forEach((s) => {
        s.hidden = !visible(s.el);
      });
    };
    measure();
    markHidden();

    /* entrance: reset to .is-pre, then play (photo clips in, rings sweep round, badges glide in) */
    function play() {
      pending = false;
      void orb!.offsetWidth;
      orb!.classList.remove('is-pre');
      orb!.classList.add('is-in');
      introAt = performance.now();
      kick();
      if (!running()) renderOnce();
    }
    function intro(delay: number | null) {
      orb!.classList.remove('is-in');
      orb!.classList.add('is-pre');
      if (reduce) {
        orb!.classList.remove('is-pre');
        orb!.classList.add('is-in');
        renderOnce();
        return;
      }
      introDone = false;
      introAt = performance.now() + 1e7; /* hold badges hidden until play */
      renderOnce();
      pending = false;
      if (delay === null) return;
      const timer = setTimeout(() => {
        if (orbInView) play();
        else pending = true;
      }, delay || 0);
      add(() => clearTimeout(timer));
    }
    /* on narrow screens the composition starts below the fold: play the entrance when it scrolls in */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (es) => {
          orbInView = es[0].isIntersecting;
          if (orbInView && pending) play();
        },
        { threshold: 0.3 },
      );
      io.observe(orb);
      add(() => io.disconnect());
    }
    if (isLoaded()) {
      /* a page show under the curtain (L5426) */
      intro(reduce ? 0 : 480);
    } else {
      /* first load: wait for the preloader to lift */
      intro(null); /* holds .is-pre until the preloader lifts */
      add(onceLoaded(() => intro(120)));
    }
    heroFns.push(kick);
    listen(document, 'visibilitychange', kick);
    listen(window, 'resize', () => {
      measure();
      markHidden();
      if (!raf) renderOnce();
    });

    /* hover: ease down so labels are readable */
    const slow = () => {
      speedT = 0.12;
    };
    const norm = () => {
      speedT = 1;
    };
    if (portrait) {
      listen(portrait, 'pointerenter', slow);
      listen(portrait, 'pointerleave', norm);
    }
    allSats.forEach((s) => {
      listen(s.el, 'pointerenter', slow);
      listen(s.el, 'pointerleave', norm);
    });

    /* mouse parallax of the whole system (fine pointers) */
    if (fine && !reduce) {
      listen(
        hero,
        'pointermove',
        ((e: PointerEvent) => {
          if (e.pointerType && e.pointerType !== 'mouse') return;
          const r = orb.getBoundingClientRect();
          tmx = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1);
          tmy = clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2), -1, 1);
        }) as EventListener,
        { passive: true },
      );
      listen(hero, 'pointerleave', () => {
        tmx = 0;
        tmy = 0;
      });
    }

    /* scroll-linked exit (two-column layouts): composition sinks and shrinks, copy drifts faster */
    if (!reduce && exitEl) {
      let sraf = 0;
      const wide = matchMedia('(min-width:901px)');
      add(() => cancelAnimationFrame(sraf));
      const exitUpd = () => {
        sraf = 0;
        if (!wide.matches) {
          exitEl.style.translate = exitEl.style.scale = exitEl.style.opacity = '';
          if (copy) {
            copy.style.translate = '';
            copy.style.opacity = '';
          }
          return;
        }
        const h = hero.offsetHeight;
        const top = hero.getBoundingClientRect().top;
        const p = clamp(-top / (h * 0.85), 0, 1);
        const e = p * p * (3 - 2 * p) * 0.5 + p * 0.5;
        exitEl.style.translate = '0 ' + (e * h * 0.2).toFixed(1) + 'px';
        exitEl.style.scale = (1 - e * 0.14).toFixed(4);
        exitEl.style.opacity = (1 - e * 0.6).toFixed(3);
        if (copy) {
          copy.style.translate = '0 ' + (-e * h * 0.07).toFixed(1) + 'px';
          copy.style.opacity = (1 - e * 0.5).toFixed(3);
        }
      };
      const schedule = () => {
        if (!sraf) sraf = requestAnimationFrame(exitUpd);
      };
      listen(window, 'scroll', schedule, { passive: true });
      listen(window, 'resize', schedule);
      exitUpd(); /* the page show (L5465) */
    }
  })();

  /* ================= Lahore local time (L5470-5483) ================= */
  (function clock() {
    const t = $('#ab-time', root);
    const st = $('#ab-state', root);
    const dot = $('#ab-daynow', root);
    if (!t && !st && !dot) return;
    const tick = () => {
      const d = new Date(Date.now() + 5 * 3600 * 1000);
      const h = d.getUTCHours();
      const m = d.getUTCMinutes();
      const wd = d.getUTCDay();
      const h12 = h % 12 || 12;
      const ap = h < 12 ? 'AM' : 'PM';
      const hm = h12 + ':' + (m < 10 ? '0' : '') + m;
      if (t) {
        t.innerHTML = hm + '<small>' + ap + '</small>';
        t.setAttribute('aria-label', 'Local time in Lahore ' + hm + ' ' + ap);
      }
      const working = wd >= 1 && wd <= 5 && h >= 9 && h < 18;
      if (st) st.textContent = working ? 'In working hours' : 'Outside working hours';
      if (dot) dot.style.left = (((h * 60 + m) / 1440) * 100).toFixed(2) + '%';
    };
    tick();
    const id = setInterval(tick, 15000);
    add(() => clearInterval(id));
  })();

  /* ================= Copy email (L5486-5496) ================= */
  $$('[data-copy]', root).forEach((b) => {
    listen(b, 'click', () => {
      const v = b.getAttribute('data-copy') ?? '';
      const ok = () => env.toast('Email copied to clipboard');
      const fallback = () => {
        try {
          const ta = document.createElement('textarea');
          ta.value = v;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          const r = document.execCommand('copy');
          document.body.removeChild(ta);
          if (r) ok();
          else env.toast(v);
        } catch {
          env.toast(v);
        }
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(ok, fallback);
      else fallback();
    });
  });

  /* ================= Marquee (L5499-5532) ================= */
  (function marquee() {
    const mq = $('.ab-marquee', root);
    const track = $('.ab-marquee__track', root);
    const set = $('.ab-marquee__set', root);
    if (!mq || !track || !set || reduce) return;
    let w = 0;
    let x = 0;
    let v = 1;
    let vt = 1;
    const base = 38;
    let lastNow = 0;
    let raf = 0;
    let inView = false;
    let hover = false;
    let lastY = scrollY;
    let lastT = 0;
    let vel = 0;
    let dir = 1;
    add(() => cancelAnimationFrame(raf));
    const measure = () => {
      w = set.offsetWidth;
    };
    const run = () => inView && !document.hidden;
    function frame(now: number) {
      raf = 0;
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      vel *= Math.pow(0.02, dt); /* scroll impulse decays */
      vt = dir * (hover ? 0.25 : 1) * (1 + Math.min(vel / 260, 5));
      v += (vt - v) * Math.min(1, dt * 4);
      x -= base * v * dt;
      if (w) {
        if (x <= -w) x += w;
        else if (x > 0) x -= w;
      }
      track!.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      if (run()) raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (!raf && run()) {
        lastNow = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    measure();
    mq.classList.add('is-js');
    listen(
      window,
      'scroll',
      () => {
        const now = performance.now();
        const dy = scrollY - lastY;
        const dtt = Math.max(16, now - lastT);
        lastY = scrollY;
        lastT = now;
        if (Math.abs(dy) > 0.5) {
          vel = Math.max(vel * 0.6, (Math.abs(dy) / dtt) * 1000 * 0.6);
          dir = dy >= 0 ? 1 : -1;
        }
      },
      { passive: true },
    );
    listen(mq, 'pointerenter', () => {
      hover = true;
    });
    listen(mq, 'pointerleave', () => {
      hover = false;
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        inView = es[0].isIntersecting;
        kick();
      });
      io.observe(mq);
      add(() => io.disconnect());
    } else {
      inView = true;
      kick();
    }
    listen(window, 'resize', measure);
    if (document.fonts && document.fonts.ready) void document.fonts.ready.then(measure);
    listen(document, 'visibilitychange', kick);
  })();

  /* ================= Services: accordion + scroll progress (L5535-5575) ================= */
  (function services() {
    const items = $$('.ab-svc', root);
    const index = $$('.ab-svc-index li', root);
    const sync = () => {
      items.forEach((it, i) => {
        if (index[i]) index[i].classList.toggle('is-on', it.classList.contains('is-open'));
      });
    };
    items.forEach((it) => {
      const btn = $('.ab-svc__btn', it);
      if (!btn) return;
      listen(btn, 'click', () => {
        const open = !it.classList.contains('is-open');
        items.forEach((o) => {
          if (o !== it && o.classList.contains('is-open')) {
            o.classList.remove('is-open');
            $('.ab-svc__btn', o)?.setAttribute('aria-expanded', 'false');
          }
        });
        it.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        sync();
      });
    });
    sync();

    /* scroll-linked progress: each row's outlined number fills as it rises through the viewport,
       the row nearest the reading line is highlighted, and the side index shows overall progress */
    const list = $('.ab-svc-list', root);
    const idx = $('.ab-svc-index', root);
    if (!list || reduce) {
      items.forEach((it) => it.style.setProperty('--p', '1'));
      return;
    }
    let sraf = 0;
    add(() => cancelAnimationFrame(sraf));
    const upd = () => {
      sraf = 0;
      const vh = innerHeight;
      const lr = list.getBoundingClientRect();
      if (lr.bottom < -vh * 0.2 || lr.top > vh * 1.2) return;
      let best = -1;
      let bestD = 1e9;
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const p = clamp((vh * 0.86 - r.top) / (vh * 0.5), 0, 1);
        it.style.setProperty('--p', p.toFixed(3));
        const c = Math.abs(r.top + Math.min(r.height, 140) / 2 - vh * 0.45);
        if (c < bestD) {
          bestD = c;
          best = i;
        }
      });
      items.forEach((it, i) => it.classList.toggle('is-focus', i === best && bestD < vh * 0.3));
      if (idx) idx.style.setProperty('--lp', clamp((vh * 0.55 - lr.top) / Math.max(1, lr.height), 0, 1).toFixed(3));
    };
    const schedule = () => {
      if (!sraf) sraf = requestAnimationFrame(upd);
    };
    listen(window, 'scroll', schedule, { passive: true });
    listen(window, 'resize', schedule);
    upd();
  })();

  /* ================= Testimonials carousel (L5578-5634) ================= */
  (function carousel() {
    const car = $('#ab-carousel', root);
    if (!car) return;
    const slidesWrap = $('#ab-slides', car);
    const slides = $$('.ab-slide', car);
    const dots = $$('.ab-dot', car);
    const cur = $('#ab-tst-cur', root);
    const n = slides.length;
    let i = 0;
    const EASE = 'cubic-bezier(.22,1,.36,1)';
    if (!slidesWrap) return;
    function go(k: number, user: boolean, dirArg?: number) {
      const prev = i;
      i = (k + n) % n;
      if (i === prev) return;
      const dir = dirArg === undefined ? ((i - prev + n) % n <= n / 2 ? 1 : -1) : dirArg;
      slides.forEach((s, j) => {
        const on = j === i;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('aria-hidden');
        else s.setAttribute('aria-hidden', 'true');
      });
      dots.forEach((d, j) => {
        const on = j === i;
        d.classList.toggle('is-active', on);
        if (on) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
      if (cur) cur.textContent = (i < 9 ? '0' : '') + (i + 1);
      if (user) slidesWrap!.setAttribute('aria-live', 'polite');
      if (reduce || !slides[i].animate) return;
      const out = slides[prev];
      const inn = slides[i];
      const dx = 56 * dir;
      out.animate(
        [
          { opacity: 1, transform: 'none', filter: 'blur(0px)' },
          { opacity: 0, transform: 'translate3d(' + -dx + 'px,0,0) scale(.985)', filter: 'blur(10px)' },
        ],
        { duration: 560, easing: EASE },
      );
      inn.animate(
        [
          { opacity: 0, transform: 'translate3d(' + dx + 'px,0,0) scale(.985)', filter: 'blur(10px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0px)' },
        ],
        { duration: 900, delay: 140, easing: EASE, fill: 'backwards' },
      );
      const au = $('.ab-author', inn);
      const tg = $('.tags', inn);
      [au, tg].forEach((el, m) => {
        if (el)
          el.animate(
            [
              { opacity: 0, transform: 'translate3d(0,12px,0)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 800, delay: 360 + m * 110, easing: EASE, fill: 'backwards' },
          );
      });
      const mark = $('.ab-carousel__mark', car!);
      if (mark)
        mark.animate([{ transform: 'translate3d(' + dx * 0.35 + 'px,0,0)', opacity: 0.1 }, { transform: 'none' }], {
          duration: 1100,
          easing: EASE,
          composite: 'add',
        });
    }
    dots.forEach((d, j) => listen(d, 'click', () => go(j, true)));
    $$('[data-tst]', root).forEach((b) => {
      b.setAttribute('aria-controls', 'ab-slides');
      listen(b, 'click', () => {
        const nx = b.dataset.tst === 'next';
        go(i + (nx ? 1 : -1), true, nx ? 1 : -1);
      });
    });
    listen(car, 'keydown', ((e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(i + 1, true, 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(i - 1, true, -1);
      }
    }) as EventListener);
    listen(car, 'focusin', () => slidesWrap.setAttribute('aria-live', 'polite'));
    listen(car, 'focusout', ((e: FocusEvent) => {
      if (!car.contains(e.relatedTarget as Node | null))
        slidesWrap.setAttribute('aria-live', car.classList.contains('is-auto') ? 'off' : 'polite');
    }) as EventListener);

    /* swipe */
    let sx: number | null = null;
    let sy = 0;
    listen(
      slidesWrap,
      'pointerdown',
      ((e: PointerEvent) => {
        sx = e.clientX;
        sy = e.clientY;
      }) as EventListener,
      { passive: true },
    );
    listen(slidesWrap, 'pointerup', ((e: PointerEvent) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) go(i + (dx < 0 ? 1 : -1), true, dx < 0 ? 1 : -1);
    }) as EventListener);
    listen(slidesWrap, 'pointercancel', () => {
      sx = null;
    });

    /* autoplay: the active dot's fill animation is the timer (7s), paused by CSS on hover / focus / off-screen */
    if (reduce) {
      slidesWrap.setAttribute('aria-live', 'polite');
      return;
    }
    car.classList.add('is-auto');
    listen(car, 'animationend', ((e: AnimationEvent) => {
      if (e.animationName === 'ab-fill') go(i + 1, false, 1);
    }) as EventListener);
    let vis = false;
    const syncOff = () => car.classList.toggle('is-off', !(vis && !document.hidden));
    if ('IntersectionObserver' in window) {
      car.classList.add('is-off');
      const io = new IntersectionObserver(
        (es) => {
          vis = es[0].isIntersecting;
          syncOff();
        },
        { threshold: 0.35 },
      );
      io.observe(car);
      add(() => io.disconnect());
    } else vis = true;
    listen(document, 'visibilitychange', syncOff);
  })();

  /* ================= Pricing: the border light sweep runs only while on screen (L5637-5644) ================= */
  (function sweep() {
    const plan = $('.ab-plan', root);
    if (!plan || reduce || !('IntersectionObserver' in window)) return;
    let vis = false;
    const sync = () => plan.classList.toggle('is-live', vis && !document.hidden);
    const io = new IntersectionObserver((es) => {
      vis = es[0].isIntersecting;
      sync();
    });
    io.observe(plan);
    add(() => io.disconnect());
    listen(document, 'visibilitychange', sync);
  })();

  return () => {
    while (disposers.length) disposers.pop()?.();
  };
}
