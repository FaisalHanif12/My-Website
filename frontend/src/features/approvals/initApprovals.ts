/**
 * The Approvals page script (reference works.js: the rail L7647-7792 and the certificate fan hero
 * L8115-8287). The markup is server rendered; this wires the horizontal rail (arrows, keyboard,
 * mouse drag with inertia, shift + wheel, the velocity skew, the progress bar), the filter, and the
 * deck hero (deal in, fan, hover lift, slow float), and returns a disposer.
 */
import { CERTIFICATES, type Certificate } from '@/content/certificates';
import {
  cueBind,
  disposer,
  flash,
  makeFilter,
  makeFlip,
  pad,
  pageHero,
  type FlipCell,
} from '../works/wkShared';

export interface ApprovalsEnv {
  reduce: boolean;
  fine: boolean;
  scrollToEl: (el: Element | null | undefined) => void;
}

type CertCell = FlipCell<Certificate>;

export function initApprovals(root: HTMLElement, env: ApprovalsEnv): () => void {
  const { reduce, fine } = env;
  const d = disposer();

  const track = root.querySelector<HTMLElement>('#wk-ap-track');
  const rail = root.querySelector<HTMLElement>('#wk-rail');
  let ccells: CertCell[] = [];
  let cFilter: ReturnType<typeof makeFilter> | null = null;

  /* ================= APPROVALS RAIL (L7647-7792) ================= */
  if (track && rail) {
    const items = Array.from(track.querySelectorAll<CertCell>('.wk-cc'));
    items.forEach((el, i) => {
      el.__data = CERTIFICATES[i];
    });
    ccells = items;

    const cur = root.querySelector<HTMLElement>('#wk-ap-cur')!;
    const tot = root.querySelector<HTMLElement>('#wk-ap-tot')!;
    const bar = root.querySelector<HTMLElement>('#wk-ap-bar')!;
    const prevB = root.querySelector<HTMLButtonElement>('#wk-ap-prev')!;
    const nextB = root.querySelector<HTMLButtonElement>('#wk-ap-next')!;
    const apEmpty = root.querySelector<HTMLElement>('#wk-ap-empty')!;

    const visible = () => ccells.filter((c) => !c.hidden);
    let raf = 0;
    d.add(() => cancelAnimationFrame(raf));
    function update() {
      raf = 0;
      const vis = visible();
      const max = rail!.scrollWidth - rail!.clientWidth;
      const x = rail!.scrollLeft;
      const p = max > 1 ? x / max : 1;
      bar.style.transform = 'scaleX(' + Math.max(0.04, p).toFixed(4) + ')';
      const pl = parseFloat(getComputedStyle(rail!).scrollPaddingLeft) || 0;
      let idx = 0;
      let best = 1e9;
      const rl = rail!.getBoundingClientRect().left + pl;
      vis.forEach((c, i) => {
        const dd = Math.abs(c.getBoundingClientRect().left - rl);
        if (dd < best) {
          best = dd;
          idx = i;
        }
      });
      if (max > 1 && x >= max - 2) idx = vis.length - 1;
      cur.textContent = pad(vis.length ? idx + 1 : 0);
      tot.textContent = pad(vis.length);
      prevB.disabled = x <= 2;
      nextB.disabled = max <= 1 || x >= max - 2;
      rail!.classList.toggle('is-static', max <= 1);
      rail!.style.setProperty('--fl', x > 4 ? Math.min(64, x / 2).toFixed(0) + 'px' : '0px');
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    d.listen(rail, 'scroll', queue, { passive: true });
    d.listen(window, 'resize', queue);
    const step = (dir: number) => {
      const vis = visible();
      if (!vis.length) return;
      const w =
        vis[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || '0');
      rail.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    };
    d.listen(prevB, 'click', () => step(-1));
    d.listen(nextB, 'click', () => step(1));
    d.listen(rail, 'keydown', ((e: KeyboardEvent) => {
      if (e.target !== rail) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      }
    }) as EventListener);

    /* drag to scroll with a mouse, with inertia on release (touch scrolls natively) */
    let drag: { x: number; l: number; moved: boolean; v: number; t: number; px: number } | null =
      null;
    let glide = 0;
    let suppress = false;
    d.add(() => cancelAnimationFrame(glide));
    const nearestLeft = () => {
      const pl = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
      const rl = rail.getBoundingClientRect().left + pl;
      let best: number | null = null;
      visible().forEach((c) => {
        const dd = c.getBoundingClientRect().left - rl;
        if (best === null || Math.abs(dd) < Math.abs(best)) best = dd;
      });
      return Math.max(
        0,
        Math.min(rail.scrollWidth - rail.clientWidth, rail.scrollLeft + (best ?? 0)),
      );
    };
    const settle = () => {
      rail.scrollTo({ left: nearestLeft(), behavior: reduce ? 'auto' : 'smooth' });
      d.timeout(() => {
        if (!drag && !glide) rail.classList.remove('is-drag');
      }, 520);
    };
    const stopGlide = () => {
      if (glide) {
        cancelAnimationFrame(glide);
        glide = 0;
      }
    };
    d.listen(rail, 'pointerdown', ((e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || (e.target as Element).closest('a,button'))
        return;
      stopGlide();
      drag = {
        x: e.clientX,
        l: rail.scrollLeft,
        moved: false,
        v: 0,
        t: performance.now(),
        px: e.clientX,
      };
    }) as EventListener);
    d.listen(window, 'pointermove', ((e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 5) {
        drag.moved = true;
        rail.classList.add('is-drag');
      }
      if (drag.moved) {
        rail.scrollLeft = drag.l - dx;
        e.preventDefault();
        const now = performance.now();
        const dt = Math.max(1, now - drag.t);
        drag.v = drag.v * 0.6 + ((drag.px - e.clientX) / dt) * 0.4;
        drag.t = now;
        drag.px = e.clientX;
      }
    }) as EventListener);
    d.listen(
      rail,
      'click',
      (ev) => {
        if (suppress) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      },
      true,
    );
    d.listen(rail, 'dragstart', (ev) => ev.preventDefault());
    d.listen(window, 'pointerup', () => {
      if (!drag) return;
      const dr = drag;
      drag = null;
      if (!dr.moved) return;
      suppress = true;
      d.timeout(() => {
        suppress = false;
      }, 0);
      let v = performance.now() - dr.t > 90 ? 0 : dr.v;
      if (reduce || Math.abs(v) < 0.15) {
        settle();
        return;
      }
      let lastT = performance.now();
      const fly = (now: number) => {
        const dt = Math.min(40, now - lastT);
        lastT = now;
        rail.scrollLeft += v * dt;
        v *= Math.pow(0.94, dt / 16.67);
        const max = rail.scrollWidth - rail.clientWidth;
        if (Math.abs(v) < 0.08 || rail.scrollLeft <= 0 || rail.scrollLeft >= max - 1) {
          glide = 0;
          settle();
          return;
        }
        glide = requestAnimationFrame(fly);
      };
      fly(lastT);
    });

    /* shift + wheel scrolls the rail sideways (plain horizontal trackpad swipes stay native) */
    d.listen(
      rail,
      'wheel',
      ((e: WheelEvent) => {
        if (!e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        e.stopPropagation();
        rail.scrollLeft += e.deltaY;
      }) as EventListener,
      { passive: false },
    );

    /* scroll-velocity skew: the cards lean a touch into fast movement, then settle */
    let skew = 0;
    let skewT = 0;
    let lastX = rail.scrollLeft;
    let lastTime = performance.now();
    let skewRaf = 0;
    d.add(() => cancelAnimationFrame(skewRaf));
    const skewLoop = () => {
      skewT *= 0.86;
      skew += (skewT - skew) * 0.18;
      if (Math.abs(skew) < 0.02 && Math.abs(skewT) < 0.02) {
        skew = 0;
        track.style.transform = '';
        skewRaf = 0;
        return;
      }
      track.style.transform = 'skewX(' + skew.toFixed(3) + 'deg)';
      skewRaf = requestAnimationFrame(skewLoop);
    };
    if (!reduce) {
      d.listen(
        rail,
        'scroll',
        () => {
          const now = performance.now();
          const dt = Math.max(8, now - lastTime);
          const v = (rail.scrollLeft - lastX) / dt;
          lastX = rail.scrollLeft;
          lastTime = now;
          skewT = Math.max(-3, Math.min(3, -v * 1.6));
          if (!skewRaf) skewRaf = requestAnimationFrame(skewLoop);
        },
        { passive: true },
      );
    }

    const afterC = (vis: CertCell[]) => {
      apEmpty.hidden = vis.length > 0;
      rail.scrollLeft = 0;
      update();
    };
    const cflip = makeFlip<Certificate>(track, ccells, () => {}, afterC, reduce, d);
    const filterRoot = root.querySelector<HTMLElement>('#wk-ap-filter');
    if (filterRoot) {
      cFilter = makeFilter(
        filterRoot,
        reduce,
        (k) => cflip((c) => k === 'all' || c.__data?.filterKey === k),
        d,
      );
    }
    update();
    d.timeout(update, 600);
    if (document.fonts && document.fonts.ready) void document.fonts.ready.then(update);
    /* the page show re-measures what was measured while the page was hidden (L8292) */
    if (document.documentElement.classList.contains('is-loaded')) {
      d.timeout(() => {
        cFilter?.sync();
        rail.dispatchEvent(new Event('scroll'));
      }, 30);
    }
  }

  /* ================= APPROVALS HERO: the certificate fan (L8115-8287) ================= */
  const apHero = root.querySelector<HTMLElement>('#wk-ap-hero');
  const tiltEl = root.querySelector<HTMLElement>('#wk-deck-stage');
  if (apHero && tiltEl && track && rail) {
    const deckEl = root.querySelector<HTMLElement>('#wk-deck')!;
    const stageEl = tiltEl.parentElement!;
    const N = CERTIFICATES.length;
    const dks = Array.from(tiltEl.querySelectorAll<HTMLElement>('.wk-dk')).sort(
      (a, b) => Number(a.dataset.j) - Number(b.dataset.j),
    );

    /* geometry (em). d = desktop and tablet, m = phone */
    interface Mode {
      CW: number;
      CH: number;
      PX: number;
      D: number;
      A: number;
      spw: number;
      thf: number;
      top: number;
      bot: number;
      right: number;
    }
    const MODES: Record<'d' | 'm', Mode> = {
      d: {
        CW: 40,
        CH: 27,
        PX: 38,
        D: 45,
        A: 3.6,
        spw: 4.4,
        thf: 1.2,
        top: 5.6,
        bot: 1.4,
        right: 2.4,
      },
      m: { CW: 40, CH: 27, PX: 38, D: 45, A: 2.4, spw: 3, thf: 1, top: 4.2, bot: 1, right: 4.3 },
    };
    let G = { CW: 0, CH: 0, D: 0, A: 0, thf: 0, x: 0, y: 0 };
    let mode = '';
    const fanBox = (g: Mode) => {
      const P = [g.PX, g.CH + g.D];
      const xs: number[] = [];
      const ys: number[] = [];
      for (let j = 0; j < N; j++) {
        const th = ((g.thf - (N - 1 - j) * g.A) * Math.PI) / 180;
        const c = Math.cos(th);
        const s = Math.sin(th);
        (
          [
            [0, 0],
            [g.CW, 0],
            [0, g.CH],
            [g.CW, g.CH],
          ] as const
        ).forEach((p) => {
          const dx = p[0] - P[0];
          const dy = p[1] - P[1];
          xs.push(P[0] + dx * c - dy * s);
          ys.push(P[1] + dx * s + dy * c);
        });
      }
      return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    };
    const setMode = () => {
      const m = innerWidth < 640 ? 'm' : 'd';
      if (m === mode) return;
      mode = m;
      const g = MODES[m];
      const b = fanBox(g);
      G = { CW: g.CW, CH: g.CH, D: g.D, A: g.A, thf: g.thf, x: 0.4 - b.x0, y: g.top - b.y0 };
      const sw = b.x1 - b.x0 + 0.4 + g.right;
      const sh = b.y1 - b.y0 + g.top + g.bot;
      stageEl.style.setProperty('--wk-sw', sw.toFixed(2));
      stageEl.style.setProperty('--wk-sh', sh.toFixed(2) + 'em');
      stageEl.style.setProperty('--spw', g.spw + 'em');
      stageEl.style.setProperty('--cw', g.CW + 'em');
      stageEl.style.setProperty('--ch', g.CH + 'em');
      dks.forEach((dk) => {
        dk.style.transformOrigin = g.PX + 'em ' + (g.CH + g.D) + 'em';
      });
    };

    /* state per card: angle, radial lift, depth. targets are recomputed every frame */
    const S = dks.map(() => ({ r: 0, l: -5, z: 0, tr: 0, tl: 0, tz: 0, dealt: false }));
    let hov = -1;
    let spread = 0;
    let sp = 0;
    let running = false;
    let settled = false;
    let dRaf = 0;
    let dLast = 0;
    let dealAt = Infinity;
    let busyUntil = 0;
    const t0 = performance.now();
    d.add(() => cancelAnimationFrame(dRaf));

    function targets(now: number) {
      const T = (N - 1) * G.A;
      const s = Math.max(spread, sp * 0.6);
      const gaps: number[] = [];
      const Tt = T * (1 + 0.08 * s + (hov > -1 && hov < N - 1 ? 0.1 : 0));
      if (hov > -1 && hov < N - 1) {
        const big = Math.min(Tt * 0.52, 13);
        for (let j = 0; j < N - 1; j++) gaps.push(j === hov ? big : (Tt - big) / (N - 2));
      } else for (let j = 0; j < N - 1; j++) gaps.push(Tt / (N - 1));
      const t = (now - t0) / 1000;
      const amb = reduce ? 0 : 1;
      const face = G.thf + (Tt - T) * 0.3 + amb * Math.sin((t / 19) * Math.PI * 2) * 0.45;
      let ang = face;
      for (let j = N - 1; j >= 0; j--) {
        const st = S[j];
        const a = ang;
        if (j > 0) ang -= gaps[j - 1];
        st.tz = j * 4 + (j === hov ? 3 : 0);
        /* entrance: the deck rises as one stack, then the cards fan out one by one, back card first */
        if (!reduce && now < dealAt) {
          st.tr = G.thf + 5;
          st.tl = -8;
          continue;
        }
        if (!reduce && j < N - 1 && now < dealAt + 280 + j * 65) {
          st.tr = G.thf;
          st.tl = 0;
          continue;
        }
        if (!st.dealt) {
          st.dealt = true;
          dks[j].classList.add('is-dealt');
        }
        st.tr = a + amb * Math.sin((t / 15) * Math.PI * 2 + j * 0.9) * 0.3;
        st.tl = amb * Math.sin((t / 12) * Math.PI * 2 + j * 1.3) * 0.28 + (j === hov ? 1.7 : 0);
      }
    }
    function paint(k: number) {
      S.forEach((st, j) => {
        st.r += (st.tr - st.r) * k;
        st.l += (st.tl - st.l) * k;
        st.z += (st.tz - st.z) * k;
        dks[j].style.transform =
          'translate3d(' +
          G.x.toFixed(3) +
          'em,' +
          G.y.toFixed(3) +
          'em,' +
          st.z.toFixed(1) +
          'px) rotate(' +
          st.r.toFixed(3) +
          'deg) translate3d(0,' +
          -st.l.toFixed(3) +
          'em,0)';
      });
    }
    function frame(now: number) {
      const dt = Math.min(50, now - (dLast || now));
      dLast = now;
      targets(now);
      paint(1 - Math.pow(1 - (now < busyUntil ? 0.12 : 0.085), dt / 16.67));
      dRaf = running ? requestAnimationFrame(frame) : 0;
    }
    function snap() {
      targets(performance.now());
      paint(1);
    }
    function setRun(on: boolean) {
      running = on && !reduce;
      if (reduce) {
        snap();
        return;
      }
      if (running && !dRaf) {
        dLast = 0;
        dRaf = requestAnimationFrame(frame);
      }
    }
    function nudge() {
      if (!running && !dRaf) {
        dLast = 0;
        const f = (now: number) => {
          const dt = Math.min(50, now - (dLast || now));
          dLast = now;
          targets(now);
          paint(1 - Math.pow(1 - 0.12, dt / 16.67));
          const moving =
            now < busyUntil ||
            S.some((s) => Math.abs(s.tr - s.r) > 0.01 || Math.abs(s.tl - s.l) > 0.005);
          dRaf = moving && !running ? requestAnimationFrame(f) : 0;
          if (running && !dRaf) setRun(true);
        };
        dRaf = requestAnimationFrame(f);
      }
    }
    function setHot(j: number) {
      hov = j;
      dks.forEach((dk, i) => dk.classList.toggle('is-hot', i === j));
      if (reduce) snap();
      else nudge();
    }

    /* pointer: hover lifts a card and opens the fan after it; the deck leans toward the cursor */
    dks.forEach((b, j) => {
      d.listen(b, 'pointerenter', ((e: PointerEvent) => {
        if (e.pointerType === 'mouse' && settled) setHot(j);
      }) as EventListener);
      d.listen(b, 'pointerleave', ((e: PointerEvent) => {
        if (e.pointerType === 'mouse' && hov === j) setHot(-1);
      }) as EventListener);
      d.listen(b, 'focus', () => setHot(j));
      d.listen(b, 'blur', () => {
        if (hov === j) setHot(-1);
      });
      d.listen(b, 'click', () => {
        const ci = +(b.dataset.ci ?? 0);
        const cc = ccells[ci];
        let wait = 0;
        if (cc.hidden) {
          cFilter?.set('all');
          wait = 650;
        }
        d.timeout(() => {
          env.scrollToEl(document.getElementById('wk-ap-toolbar'));
          const pl = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
          rail.scrollTo({
            left:
              rail.scrollLeft +
              cc.getBoundingClientRect().left -
              rail.getBoundingClientRect().left -
              pl,
            behavior: reduce ? 'auto' : 'smooth',
          });
          d.timeout(() => flash(cc.firstElementChild, reduce, d), 950);
        }, wait);
      });
    });
    d.listen(tiltEl, 'pointerenter', ((e: PointerEvent) => {
      if (e.pointerType === 'mouse' && settled) {
        spread = 1;
        nudge();
      }
    }) as EventListener);
    d.listen(tiltEl, 'pointerleave', () => {
      spread = 0;
      nudge();
    });
    if (fine && !reduce) {
      let tx = 0;
      let ty = 0;
      let gx = 0;
      let gy = 0;
      let tRaf = 0;
      d.add(() => cancelAnimationFrame(tRaf));
      const tloop = () => {
        tx += (gx - tx) * 0.07;
        ty += (gy - ty) * 0.07;
        tiltEl.style.setProperty('--tx', tx.toFixed(3) + 'deg');
        tiltEl.style.setProperty('--ty', ty.toFixed(3) + 'deg');
        tRaf =
          Math.abs(gx - tx) > 0.01 || Math.abs(gy - ty) > 0.01 ? requestAnimationFrame(tloop) : 0;
      };
      d.listen(
        apHero,
        'pointermove',
        ((e: PointerEvent) => {
          if (!settled || innerWidth < 1024) return;
          const r = deckEl.getBoundingClientRect();
          const px = (e.clientX - (r.left + r.width / 2)) / Math.max(1, innerWidth / 2);
          const py = (e.clientY - (r.top + r.height / 2)) / Math.max(1, innerHeight / 2);
          /* Owner change (2026-09-29): the reference tilts the deck away from the cursor, against the
             side the fan opens on. The signs are flipped so the deck leans toward the cursor. */
          gy = Math.max(-1, Math.min(1, px)) * -6;
          gx = Math.max(-1, Math.min(1, py)) * 4.5;
          if (!tRaf) tRaf = requestAnimationFrame(tloop);
        }) as EventListener,
        { passive: true },
      );
      d.listen(apHero, 'pointerleave', () => {
        gx = gy = 0;
        if (!tRaf) tRaf = requestAnimationFrame(tloop);
      });
    }

    /* scroll-linked exit: --sp (0 to 1) starts once the hero's bottom edge rises into view */
    let spRaf = 0;
    let lastSp = -1;
    d.add(() => cancelAnimationFrame(spRaf));
    function heroScroll() {
      spRaf = 0;
      if (reduce) return;
      const r = apHero!.getBoundingClientRect();
      let p = Math.min(1, Math.max(0, (innerHeight - r.bottom) / Math.max(1, innerHeight * 0.8)));
      p = p * p * (3 - 2 * p);
      if (Math.abs(p - lastSp) < 0.001) return;
      lastSp = p;
      apHero!.style.setProperty('--sp', p.toFixed(4));
      sp = innerWidth >= 1024 ? p : 0;
      nudge();
    }
    d.listen(
      window,
      'scroll',
      () => {
        if (!spRaf) spRaf = requestAnimationFrame(heroScroll);
      },
      { passive: true },
    );

    let settleT: ReturnType<typeof setTimeout> | undefined;
    d.add(() => clearTimeout(settleT));
    d.listen(window, 'resize', () => {
      setMode();
      if (!running) snap();
    });
    cueBind(apHero, env.scrollToEl, d);
    pageHero(
      apHero,
      reduce,
      {
        sync: true,
        reset() {
          clearTimeout(settleT);
          settled = false;
          apHero.classList.remove('is-settled');
          hov = -1;
          spread = 0;
          lastSp = -1;
          apHero.style.setProperty('--sp', '0');
          setMode();
          S.forEach((s, j) => {
            s.dealt = false;
            dks[j].classList.remove('is-dealt', 'is-hot');
          });
          dealAt = Infinity;
          snap();
        },
        enter() {
          setMode();
          dealAt = performance.now() + 60;
          busyUntil = dealAt + 1300;
          heroScroll();
          nudge();
          settleT = setTimeout(
            () => {
              settled = true;
              apHero.classList.add('is-settled');
            },
            reduce ? 0 : 1300,
          );
        },
        run: setRun,
      },
      d,
    );
    setMode();
    if (reduce) dealAt = 0;
    snap();
  }

  return () => d.run();
}
