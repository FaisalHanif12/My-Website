/**
 * The Works page script (reference works.js: the grid L7556-7645, the orbit hero L7856-8113, and the
 * shared helpers in wkShared.ts). The markup is server rendered; this wires the filter, the FLIP
 * animation, the jump to a card and the orbit, and returns a disposer.
 *
 * Only the current page is mounted, so `FH.current === 'works'` is always true here, and a mount
 * after boot is a page show (the fh:page listeners collapse into pageHero's mount logic).
 */
import { PROJECTS, type Project } from '@/content/projects';
import { layoutGrid } from './gridLayout';
import {
  cueBind,
  disposer,
  flash,
  makeFilter,
  makeFlip,
  pageHero,
  type FlipCell,
} from './wkShared';

export interface WorksEnv {
  reduce: boolean;
  scrollToEl: (el: Element | null | undefined) => void;
  /** FH.openModal('purebody'). */
  openPureBody: () => void;
}

type ProjectCell = FlipCell<Project>;

export function initWorks(root: HTMLElement, env: WorksEnv): () => void {
  const { reduce } = env;
  const d = disposer();

  /* ================= WORKS GRID (L7556-7645) ================= */
  const grid = root.querySelector<HTMLElement>('#wk-grid');
  const wkHero = root.querySelector<HTMLElement>('#wk-hero');
  const obStage = root.querySelector<HTMLElement>('#wk-ob-stage');
  let pFilter: ReturnType<typeof makeFilter> | null = null;
  let cells: ProjectCell[] = [];

  if (grid) {
    /* the cells in DATA order: the card title id "wk-pNN" holds the project number */
    const byIndex: ProjectCell[] = [];
    grid.querySelectorAll<ProjectCell>('.wk-cell').forEach((c) => {
      const n = parseInt(c.querySelector('.wk-title')?.id.slice(4) ?? '', 10) - 1;
      c.__data = PROJECTS[n];
      byIndex[n] = c;
    });
    cells = byIndex;

    const setWide = (c: ProjectCell, on: boolean) => {
      c.classList.toggle('is-wide', on);
      c.querySelector('.wk-card')?.classList.toggle('wk-card--wide', on);
    };
    const layout = (vis: ProjectCell[]) => {
      const res = layoutGrid(
        vis.map((c) => ({ hero: c.hasAttribute('data-hero'), feat: c.hasAttribute('data-feat') })),
      );
      res.order.forEach((i) => grid.appendChild(vis[i]));
      res.order.forEach((i, k) => {
        const c = vis[i];
        const pl = res.place[k];
        c.style.setProperty('--span', String(pl.span));
        setWide(c, pl.wide);
        c.classList.toggle('is-big', pl.big);
        c.classList.toggle('is-p5', pl.p5);
        c.classList.toggle('is-odd', pl.odd);
      });
    };
    const countEl = root.querySelector<HTMLElement>('#wk-count');
    const emptyEl = root.querySelector<HTMLElement>('#wk-empty');
    const after = (vis: ProjectCell[]) => {
      if (countEl) countEl.innerHTML = 'Showing <b>' + vis.length + '</b> of ' + PROJECTS.length;
      if (emptyEl) emptyEl.hidden = vis.length > 0;
    };

    const flip = makeFlip<Project>(grid, cells, layout, after, reduce, d);
    const filterRoot = root.querySelector<HTMLElement>('#wk-filter');
    if (filterRoot) {
      pFilter = makeFilter(
        filterRoot,
        reduce,
        (k) => flip((c) => k === 'all' || c.__data?.filterKey === k),
        d,
      );
    }
  }

  /* ================= WORKS HERO: "the orbit" (L7856-8113) ================= */
  const jumpToCell = (i: number) => {
    const cell = cells[i];
    if (!cell) return;
    let wait = 0;
    if (pFilter && pFilter.get() !== 'all') {
      pFilter.set('all');
      wait = 650;
    }
    d.timeout(() => {
      env.scrollToEl(cell);
      d.timeout(() => flash(cell.firstElementChild, reduce, d), 900);
    }, wait);
  };

  if (wkHero && grid && obStage) {
    const TAU = Math.PI * 2;
    const NS = 'http://www.w3.org/2000/svg';
    const svgB = root.querySelector<SVGElement>('#wk-ob-back')!;
    const svgF = root.querySelector<SVGElement>('#wk-ob-front')!;
    const phn = root.querySelector<HTMLElement>('#wk-phn')!;
    const shots = Array.from(obStage.querySelectorAll<HTMLElement>('.wk-phn__img'));
    const pgs = Array.from(obStage.querySelectorAll<HTMLElement>('.wk-ob__pg i'));
    const byT = (t: string) => PROJECTS.findIndex((p) => p.title === t);
    const ocs = Array.from(obStage.querySelectorAll<HTMLElement>('.wk-oc'));
    const N = ocs.length;

    interface Card {
      el: HTMLElement;
      fog: HTMLElement;
      idx: number;
      slot: number;
      lift: number;
      z: string;
      a: number;
      ed: number;
      delta: number;
    }
    const C: Card[] = ocs.map((el, i) => ({
      el,
      fog: el.querySelector<HTMLElement>('.wk-oc__fog')!,
      idx: byT(el.dataset.p ?? ''),
      slot: (i * TAU) / N,
      lift: 0,
      z: '',
      a: 0,
      ed: 0,
      delta: 0,
    }));

    /* ---- svg: two layers built from the same recipe ---- */
    type Attrs = Record<string, string | number>;
    const mk = (tag: string, at: Attrs, par?: Element) => {
      const e = document.createElementNS(NS, tag);
      for (const k in at) e.setAttribute(k, String(at[k]));
      if (par) par.appendChild(e);
      return e;
    };
    const grad = (
      defs: Element,
      id: string,
      stops: Array<[number, number, string?]>,
      at?: Attrs & { r?: number },
    ) => {
      const g = mk(
        at && at.r ? 'radialGradient' : 'linearGradient',
        { id, ...(at && at.r ? {} : (at ?? {})) },
        defs,
      );
      stops.forEach((s) =>
        mk('stop', { offset: s[0], 'stop-opacity': s[1], class: s[2] || 'wk-st' }, g),
      );
      return g;
    };
    interface Layer {
      svg: SVGElement;
      disc?: Element;
      plat?: Element;
      mid: Element;
      inner: Element;
      outer: Element;
      sp: Array<{ g: Element; l: Element; n: Element }>;
      pg: Element;
      pt: Element;
      ph: Element;
    }
    const layer = (svg: SVGElement, k: string): Layer => {
      const defs = mk('defs', {}, svg);
      const back = k === 'b';
      grad(
        defs,
        'wk-ob-r' + k,
        back
          ? [
              [0, 0.08],
              [1, 0.5],
            ]
          : [
              [0, 0.5],
              [1, 1],
            ],
        { x1: 0, y1: 0, x2: 0, y2: 1 },
      );
      let disc: Element | undefined;
      let plat: Element | undefined;
      if (back) {
        const dg = mk('radialGradient', { id: 'wk-ob-disc' }, defs);
        (
          [
            [0, 0.1],
            [0.7, 0.05],
            [1, 0.012],
          ] as const
        ).forEach((s) => mk('stop', { offset: s[0], 'stop-opacity': s[1], class: 'wk-st2' }, dg));
        disc = mk('ellipse', { class: 'wk-or-disc', fill: 'url(#wk-ob-disc)' }, svg);
        const pgd = mk('radialGradient', { id: 'wk-ob-plat', cy: 0.42, r: 0.62 }, defs);
        (
          [
            [0, 0.22],
            [0.65, 0.1],
            [1, 0.03],
          ] as const
        ).forEach((s) => mk('stop', { offset: s[0], 'stop-opacity': s[1], class: 'wk-st2' }, pgd));
        plat = mk('ellipse', { class: 'wk-or-plat', fill: 'url(#wk-ob-plat)' }, svg);
      }
      const mid = mk('path', { class: 'wk-or-i' }, svg);
      const inner = mk('path', { class: 'wk-or-pr' }, svg);
      const outer = mk(
        'path',
        { class: 'wk-or-o', stroke: 'url(#wk-ob-r' + k + ')', pathLength: 1 },
        svg,
      );
      const sp = C.map((_, i) => {
        const g = grad(
          defs,
          'wk-ob-s' + k + i,
          [
            [0, 0, 'wk-st2'],
            [0.45, 0.3, 'wk-st2'],
            [1, 0.95, 'wk-st2'],
          ],
          { gradientUnits: 'userSpaceOnUse' },
        );
        return {
          g,
          l: mk('line', { class: 'wk-or-sp', stroke: 'url(#wk-ob-s' + k + i + ')' }, svg),
          n: mk('circle', { class: 'wk-or-sn', r: 1.6 }, svg),
        };
      });
      const pg = grad(
        defs,
        'wk-ob-p' + k,
        [
          [0, 0, 'wk-st2'],
          [1, 0.95, 'wk-st2'],
        ],
        { gradientUnits: 'userSpaceOnUse' },
      );
      const pt = mk('path', { class: 'wk-or-pt', stroke: 'url(#wk-ob-p' + k + ')' }, svg);
      const ph = mk('circle', { class: 'wk-or-ph', r: 2.4 }, svg);
      return { svg, disc, plat, mid, inner, outer, sp, pg, pt, ph };
    };
    const LB = layer(svgB, 'b');
    const LF = layer(svgF, 'f');

    /* ---- geometry: everything derives from the stage size ---- */
    interface Geo {
      W: number;
      H: number;
      m: boolean;
      PH: number;
      PW: number;
      CW: number;
      CH: number;
      stem: number;
      rx: number;
      ry: number;
      rxi: number;
      ryi: number;
      cx: number;
      cy: number;
      pcy: number;
      SB: number;
      SM: number;
      SF: number;
      cover: number;
    }
    let G: Geo | null = null;
    const sOf = (sn: number, g: { SB: number; SM: number; SF: number }) =>
      sn >= 0 ? g.SM + (g.SF - g.SM) * sn : g.SM + (g.SM - g.SB) * sn;

    /* The phone stands on a turntable: the orbit plane sits at the phone's base, so the front arc
       runs below the screen and the back arc passes behind its lower half. A small solver picks the
       ring height (and, if it must, a smaller front scale) so that no card ever covers more than
       ~10% of the screen, or anything above its bottom quarter. */
    function measure(): boolean {
      const W = obStage!.clientWidth;
      const H = obStage!.clientHeight;
      if (!W || !H) return false;
      const m = W < 560;
      const pad = m ? 4 : 10;
      const stem = m ? 7 : 11;
      const LIFT = 1.08;
      const RAT = m ? 2.9 : 3;
      const CW = W * (m ? 0.3 : 0.265);
      const CH = CW * (0.076 + 1 / 1.8) + 1;
      const g = { SB: 0.6, SM: 0.8, SF: 0.9 };
      /* widest radius that keeps every card (even a lifted one) inside the stage at every angle */
      let rx = W / 2;
      for (let q = 0; q <= 36; q++) {
        const th = (q / 36) * Math.PI;
        const sn = Math.sin(th);
        const cs = Math.abs(Math.cos(th));
        const hw = ((CW * sOf(sn, g) * LIFT) / 2) * (1 - 0.02);
        if (cs > 0.05) rx = Math.min(rx, (W / 2 - pad - hw) / cs);
      }
      const ry = rx / RAT;
      const pf = Math.min(13, Math.max(10.5, Math.min(H * 0.72, H - ry - 60) * 0.037));
      const pillH = pf * 2.65;
      const gap = m ? 16 : 22;
      const PH = Math.min(H * (m ? 0.74 : 0.72), H - ry - gap - pillH - (m ? 10 : 18));
      const PW = PH * 0.468;
      const em = PH / 100;
      const sx = 22.03 * em;
      const sTop = -48.63 * em;
      const sH = 97.26 * em;
      const sArea = 2 * sx * sH;
      const worst = (off: number, SF: number) => {
        const gg = { SB: g.SB, SM: g.SM, SF };
        let w = 0;
        let hi = false;
        for (let q = 0; q <= 40; q++) {
          const th = (q / 40) * Math.PI;
          const sn = Math.sin(th);
          const x = Math.cos(th) * rx;
          const s = sOf(sn, gg);
          const node = off + sn * ry;
          const top = node - (stem + CH) * s;
          const bot = node - stem * s;
          const hw = (CW * s) / 2;
          const ox = Math.max(0, Math.min(x + hw, sx) - Math.max(x - hw, -sx));
          const oy = Math.max(0, Math.min(bot, sTop + sH) - Math.max(top, sTop));
          w = Math.max(w, (ox * oy) / sArea);
          if (ox > 0 && oy > 0 && top < sTop + sH * 0.75) hi = true;
        }
        return hi ? 1 : w;
      };
      let off = PH * 0.5;
      let best: [number, number] | null = null;
      for (let SF = 0.9; SF >= 0.72 && !best; SF -= 0.02) {
        for (let k = 0; k <= 10; k++) {
          const o = PH * (0.4 + k * 0.01);
          if (worst(o, SF) <= 0.09) {
            best = [o, SF];
            break;
          }
        }
      }
      if (best) {
        off = best[0];
        g.SF = best[1];
      } else {
        off = PH * 0.5;
        g.SF = 0.72;
      }
      const rxi = PW / 2 + W * (m ? 0.03 : 0.028);
      const ryi = rxi / RAT;
      const rxm = rxi + (rx - rxi) * 0.5;
      const rym = rxm / RAT;
      /* vertical extents: phone top, back and side card tops; bottom is the pill under the front arc */
      const top = Math.min(-PH / 2, off - ry - (stem + CH) * g.SB, off - (stem + CH) * g.SM);
      const pillTop = off + ry + gap;
      const bot = pillTop + pillH;
      const pcy = (H - (bot - top)) / 2 - top;
      G = {
        W,
        H,
        m,
        PH,
        PW,
        CW,
        CH,
        stem,
        rx,
        ry,
        rxi,
        ryi,
        cx: W / 2,
        cy: pcy + off,
        pcy,
        SB: g.SB,
        SM: g.SM,
        SF: g.SF,
        cover: worst(off, g.SF),
      };
      const st = obStage!.style;
      st.setProperty('--ph', PH.toFixed(1) + 'px');
      st.setProperty('--pcy', pcy.toFixed(1) + 'px');
      st.setProperty('--cw', CW.toFixed(1) + 'px');
      st.setProperty('--stem', stem + 'px');
      st.setProperty('--pill', pillTop.toFixed(1) + 'px');
      [LB, LF].forEach((L, j) => {
        L.svg.setAttribute('viewBox', '0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1));
        const cx = G!.cx;
        const cy = G!.cy; /* back layer: upper arc, front layer: lower arc */
        const arc = (a: number, b: number) =>
          'M' +
          (cx - a * (j ? -1 : 1)).toFixed(1) +
          ' ' +
          cy.toFixed(1) +
          'A' +
          a.toFixed(1) +
          ' ' +
          b.toFixed(1) +
          ' 0 0 1 ' +
          (cx + a * (j ? -1 : 1)).toFixed(1) +
          ' ' +
          cy.toFixed(1);
        L.outer.setAttribute('d', arc(rx, ry));
        L.inner.setAttribute('d', arc(rxi, ryi));
        L.mid.setAttribute('d', arc(rxm, rym));
        if (L.disc) {
          L.disc.setAttribute('cx', String(cx));
          L.disc.setAttribute('cy', String(cy));
          L.disc.setAttribute('rx', String(rx));
          L.disc.setAttribute('ry', String(ry));
        }
        if (L.plat) {
          L.plat.setAttribute('cx', String(cx));
          L.plat.setAttribute('cy', String(cy));
          L.plat.setAttribute('rx', String(rxi));
          L.plat.setAttribute('ry', String(ryi));
        }
      });
      return true;
    }

    /* ---- state ---- */
    const BASE = TAU / 66000; /* one lap in 66s */
    let rot = 0;
    let spd = 0;
    let spdT = BASE;
    let tau = 500;
    let hot = -1;
    let dim = 0;
    let pa = -Math.PI / 2;
    let t0 = Infinity;
    let running = false;
    let raf = 0;
    let last = 0;
    let settled = false;
    let drag: {
      id: number;
      x: number;
      px: number;
      t: number;
      r: number;
      v: number;
      moved: boolean;
    } | null = null;
    let suppress = false;
    let sim = 0;
    let shot = 0;
    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const eo = (t: number) => 1 - Math.pow(1 - t, 3);
    const wrap = (a: number) => {
      a = (a + Math.PI) % TAU;
      if (a < 0) a += TAU;
      return a - Math.PI;
    };
    d.add(() => cancelAnimationFrame(raf));
    /* entrance plan: every card starts behind the phone and glides to its slot, nearest slots first */
    C.forEach((c) => {
      c.delta = wrap(c.slot + Math.PI / 2);
      c.ed = 260 + Math.round(Math.abs(c.delta) / (Math.PI / 3) - 0.5) * 85;
    });

    function render(now: number, dt?: number) {
      if (!G && !measure()) return;
      const g = G!;
      const T = now - t0;
      const intro = reduce ? 1e9 : T;
      const tE = reduce ? 1 : clamp01((intro - 1150) / 550);
      const pE = reduce ? 0 : clamp01((intro - 1500) / 900);
      const k = 1 - Math.exp(-(dt || 16) / 170);
      dim += ((hot > -1 ? 1 : 0) - dim) * (reduce ? 1 : k);
      if (Math.abs((hot > -1 ? 1 : 0) - dim) < 0.002) dim = hot > -1 ? 1 : 0;
      C.forEach((c, i) => {
        const e = reduce ? 1 : clamp01((intro - c.ed) / 1050);
        const ee = eo(e);
        const a = e >= 1 ? rot + c.slot : -Math.PI / 2 + c.delta * ee + rot * ee;
        c.a = a;
        const sn = Math.sin(a);
        const cs = Math.cos(a);
        const dd = (1 + sn) / 2;
        c.lift += ((i === hot ? 1 : 0) - c.lift) * (reduce ? 1 : k);
        if (Math.abs((i === hot ? 1 : 0) - c.lift) < 0.002) c.lift = i === hot ? 1 : 0;
        const l = c.lift;
        const s = sOf(sn, g) * (1 + 0.08 * l);
        const x = g.cx + cs * g.rx;
        const y = g.cy + sn * g.ry;
        const tx = x - g.CW / 2;
        const ty = y - g.stem - g.CH - l * 5;
        const turn = cs * 13 * (1 - l);
        c.el.style.transform =
          'translate3d(' +
          tx.toFixed(2) +
          'px,' +
          ty.toFixed(2) +
          'px,0) perspective(' +
          (g.CW * 5).toFixed(0) +
          'px) rotateY(' +
          turn.toFixed(2) +
          'deg) scale(' +
          s.toFixed(4) +
          ')';
        const fog = (1 - dd) * 0.4 * (1 - l) + dim * (1 - l) * 0.26;
        c.fog.style.opacity = fog.toFixed(3);
        const bl = sn < 0 && l < 0.5 ? -sn * 0.6 : 0;
        c.el.style.filter = bl > 0.05 ? 'blur(' + bl.toFixed(1) + 'px)' : '';
        c.el.style.opacity = (reduce ? 1 : clamp01(e * 2.4)).toFixed(3);
        const z =
          l > 0.02 ? '150' : String(sn < 0 ? 10 + Math.round(dd * 60) : 60 + Math.round(sn * 30));
        if (z !== c.z) {
          c.el.style.zIndex = z;
          c.z = z;
        }
        /* tethers: from the inner ring (hugging the phone) out to this card's node */
        const ix = g.cx + cs * g.rxi;
        const iy = g.cy + sn * g.ryi;
        const front = sn >= 0;
        [LB, LF].forEach((L, j) => {
          const S = L.sp[i];
          const on = (j === 1) === front;
          const op = on ? tE * (front ? 0.75 : 0.5) * (1 - dim * 0.5 + l * 0.5) : 0;
          S.l.setAttribute('opacity', op.toFixed(3));
          S.n.setAttribute('opacity', (on ? tE * (front ? 0.9 : 0.55) : 0).toFixed(3));
          if (on) {
            S.l.setAttribute('x1', ix.toFixed(1));
            S.l.setAttribute('y1', iy.toFixed(1));
            S.l.setAttribute('x2', x.toFixed(1));
            S.l.setAttribute('y2', y.toFixed(1));
            S.g.setAttribute('x1', ix.toFixed(1));
            S.g.setAttribute('y1', iy.toFixed(1));
            S.g.setAttribute('x2', x.toFixed(1));
            S.g.setAttribute('y2', y.toFixed(1));
            S.n.setAttribute('cx', ix.toFixed(1));
            S.n.setAttribute('cy', iy.toFixed(1));
          }
        });
      });
      /* the pulse: a small light with a short tail, travelling the ring */
      const sn = Math.sin(pa);
      const frontP = sn >= 0;
      const hx = g.cx + Math.cos(pa) * g.rx;
      const hy = g.cy + sn * g.ry;
      let d0 = 'M';
      for (let q = 14; q >= 0; q--) {
        const b = pa - q * 0.024;
        d0 +=
          (q < 14 ? 'L' : '') +
          (g.cx + Math.cos(b) * g.rx).toFixed(1) +
          ' ' +
          (g.cy + Math.sin(b) * g.ry).toFixed(1);
      }
      const tb = pa - 14 * 0.024;
      const tx0 = g.cx + Math.cos(tb) * g.rx;
      const ty0 = g.cy + Math.sin(tb) * g.ry;
      [LB, LF].forEach((L, j) => {
        const on = (j === 1) === frontP;
        const op = on ? pE * (frontP ? 0.95 : 0.55) * (1 - dim * 0.6) : 0;
        L.pt.setAttribute('opacity', op.toFixed(3));
        L.ph.setAttribute('opacity', op.toFixed(3));
        if (on) {
          L.pt.setAttribute('d', d0);
          L.ph.setAttribute('cx', hx.toFixed(1));
          L.ph.setAttribute('cy', hy.toFixed(1));
          L.pg.setAttribute('x1', tx0.toFixed(1));
          L.pg.setAttribute('y1', ty0.toFixed(1));
          L.pg.setAttribute('x2', hx.toFixed(1));
          L.pg.setAttribute('y2', hy.toFixed(1));
        }
      });
    }

    /* ---- the phone: a tiny simulator, two app screens every 4.5s ---- */
    function showShot(n: number) {
      if (n === shot) return;
      const prev = shots[shot];
      const next = shots[n];
      shot = n;
      next.classList.add('is-snap');
      next.classList.remove('is-out', 'is-on');
      void next.offsetWidth;
      next.classList.remove('is-snap');
      prev.classList.remove('is-on');
      prev.classList.add('is-out');
      next.classList.add('is-on');
      pgs.forEach((p, i) => {
        p.classList.toggle('is-on', i === n);
        p.style.setProperty('--pg', i < n ? '1' : '0');
      });
    }

    function frame(now: number) {
      const dt = Math.min(50, now - (last || now));
      last = now;
      if (!drag) {
        spd += (spdT - spd) * (1 - Math.exp(-dt / tau));
        if (spdT === 0 && Math.abs(spd) < BASE * 0.06) spd = 0;
        let ramp = clamp01((now - t0 - 1200) / 1800);
        ramp = ramp * ramp * (3 - 2 * ramp);
        rot += spd * dt * (spdT === BASE && tau === 500 ? ramp : 1);
      }
      pa += (dt * TAU) / 13000;
      if (now - t0 > 1400) {
        sim += dt;
        const n = Math.floor(sim / 4500) % shots.length;
        showShot(n);
        pgs[n].style.setProperty('--pg', ((sim % 4500) / 4500).toFixed(3));
      }
      render(now, dt);
      raf = running ? requestAnimationFrame(frame) : 0;
    }
    function setRun(on: boolean) {
      running = on && !reduce;
      if (reduce) {
        render(performance.now());
        return;
      }
      if (running && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }
    function kick() {
      if (!raf) requestAnimationFrame((t) => render(t));
    }

    /* ---- hover, focus, click ---- */
    function setHot(i: number) {
      if (hot === i) return;
      hot = i;
      C.forEach((c, j) => c.el.classList.toggle('is-hot', j === i));
      spdT = i > -1 ? 0 : BASE;
      tau = i > -1 ? 420 : 900;
      if (!running) kick();
    }
    C.forEach((c, i) => {
      d.listen(c.el, 'pointerenter', ((e: PointerEvent) => {
        if (e.pointerType === 'mouse' && settled && !drag) setHot(i);
      }) as EventListener);
      d.listen(c.el, 'pointerleave', ((e: PointerEvent) => {
        if (e.pointerType === 'mouse' && hot === i) setHot(-1);
      }) as EventListener);
      d.listen(c.el, 'focus', () => setHot(i));
      d.listen(c.el, 'blur', () => {
        if (hot === i) setHot(-1);
      });
      d.listen(c.el, 'click', () => {
        if (!suppress) jumpToCell(c.idx);
      });
    });
    d.listen(phn, 'click', () => {
      if (!suppress) env.openPureBody();
    });

    /* ---- drag (mouse or touch) to spin, with inertia ---- */
    d.listen(obStage, 'pointerdown', ((e: PointerEvent) => {
      if (reduce || !settled || (e.pointerType === 'mouse' && e.button !== 0)) return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        px: e.clientX,
        t: performance.now(),
        r: rot,
        v: 0,
        moved: false,
      };
    }) as EventListener);
    d.listen(obStage, 'pointermove', ((e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 7) return;
        drag.moved = true;
        obStage.classList.add('is-drag');
        try {
          obStage.setPointerCapture(e.pointerId);
        } catch {
          /* the pointer may already be gone */
        }
        if (hot > -1) setHot(-1);
      }
      const now = performance.now();
      const dt = Math.max(1, now - drag.t);
      const nr = drag.r - dx / G!.rx;
      drag.v = drag.v * 0.55 + ((nr - rot) / dt) * 0.45;
      rot = nr;
      drag.t = now;
      if (!running) kick();
    }) as EventListener);
    const endDrag = (e: PointerEvent | null, cancel: boolean) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const dr = drag;
      drag = null;
      obStage.classList.remove('is-drag');
      if (!dr.moved) return;
      if (!cancel) {
        suppress = true;
        d.timeout(() => {
          suppress = false;
        }, 0);
      }
      let v = performance.now() - dr.t > 90 ? 0 : dr.v;
      v = Math.max(-0.004, Math.min(0.004, v));
      spd = v;
      spdT = BASE;
      tau = 1400;
      d.timeout(() => {
        if (!drag && hot < 0) tau = 900;
      }, 1500);
    };
    d.listen(obStage, 'pointerup', ((e: PointerEvent) => endDrag(e, false)) as EventListener);
    d.listen(obStage, 'pointercancel', ((e: PointerEvent) => endDrag(e, true)) as EventListener);
    d.listen(obStage, 'lostpointercapture', ((e: PointerEvent) =>
      endDrag(e, true)) as EventListener);
    d.listen(obStage, 'pointerleave', ((e: PointerEvent) => {
      if (e.pointerType === 'mouse' && hot > -1 && !e.relatedTarget) setHot(-1);
    }) as EventListener);

    /* ---- re-measure: resize ---- */
    const remeasure = () => {
      G = null;
      if (measure()) render(performance.now());
    };
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(remeasure);
      ro.observe(obStage);
      d.add(() => ro.disconnect());
    } else d.listen(window, 'resize', remeasure);
    /* the page show measures once more a frame later (L8082) */
    const remeasureFrame = requestAnimationFrame(remeasure);
    d.add(() => cancelAnimationFrame(remeasureFrame));

    /* scroll-linked exit: --sp (0 to 1) once the hero's bottom edge rises into view */
    let wsRaf = 0;
    let wLastSp = -1;
    d.add(() => cancelAnimationFrame(wsRaf));
    function wkScroll() {
      wsRaf = 0;
      if (reduce) return;
      const r = wkHero!.getBoundingClientRect();
      let p = Math.min(1, Math.max(0, (innerHeight - r.bottom) / Math.max(1, innerHeight * 0.8)));
      p = p * p * (3 - 2 * p);
      if (Math.abs(p - wLastSp) < 0.001) return;
      wLastSp = p;
      wkHero!.style.setProperty('--sp', p.toFixed(4));
    }
    d.listen(
      window,
      'scroll',
      () => {
        if (!wsRaf) wsRaf = requestAnimationFrame(wkScroll);
      },
      { passive: true },
    );

    let wSettle: ReturnType<typeof setTimeout> | undefined;
    d.add(() => clearTimeout(wSettle));
    cueBind(wkHero, env.scrollToEl, d);
    pageHero(
      wkHero,
      reduce,
      {
        sync: true,
        reset() {
          clearTimeout(wSettle);
          settled = false;
          wkHero.classList.remove('is-settled');
          setHot(-1);
          dim = 0;
          C.forEach((c) => {
            c.lift = 0;
          });
          wLastSp = -1;
          wkHero.style.setProperty('--sp', '0');
          t0 = Infinity;
          rot = 0;
          spd = 0;
          spdT = BASE;
          tau = 500;
          sim = 0;
          pa = -Math.PI / 2;
          showShot(0);
          pgs.forEach((p) => p.style.setProperty('--pg', '0'));
          G = null;
          render(performance.now());
        },
        enter() {
          wkScroll();
          G = null;
          measure();
          t0 = performance.now();
          rot = 0;
          spd = BASE;
          if (reduce) {
            settled = true;
            wkHero.classList.add('is-settled');
            render(t0);
            return;
          }
          wSettle = setTimeout(() => {
            settled = true;
            wkHero.classList.add('is-settled');
          }, 1400);
        },
        run(on) {
          wkHero.classList.toggle('is-idle', !on);
          setRun(on);
        },
      },
      d,
    );
    render(performance.now());
  }

  return () => d.run();
}
