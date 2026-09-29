/**
 * The Contact page hero (reference contact.js L5703-6171): the live world clock with a 24 hour dial,
 * the globe with day and night, the arc from the visitor to Lahore, the clock card that docks beside
 * it, the entrance, the scroll exit, the ambient sway and the copy email button.
 *
 * The SVG is drawn into #ct-orb-svg by this script, exactly like the reference builds it. Only the
 * current page is mounted, so `FH.current === 'contact'` is always true. A mount after boot is a page
 * show (L6154), a mount before boot is the first load on this route (L6159).
 */
import { clockCard, lahoreGlobe, visitorPlaces } from '@/content/contact';
import { pad } from '@/lib/strings';

export interface ContactHeroEnv {
  reduce: boolean;
  toast: (message: string) => void;
}

type Dispose = () => void;

const NS = 'http://www.w3.org/2000/svg';
const C = 250;
const RG = 146;
const RD = 194;
const D2R = Math.PI / 180;
const PKT = 300;
type Vec = [number, number, number];

const f1 = (n: number) => Math.round(n * 10) / 10;

export function initContactHero(page: HTMLElement, env: ContactHeroEnv): Dispose {
  const { reduce } = env;
  const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = page) =>
    r.querySelector<E>(s);
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

  const hero = $('#ct-hero');
  const svg = $<HTMLElement & SVGElement>('#ct-orb-svg') as unknown as SVGSVGElement | null;
  if (!hero || !svg) return () => {};
  const colL = $('#ct-hero-l')!;
  const colR = $('#ct-hero-r')!;
  const cue = $('.ct-cue', hero);
  const orb = $('#ct-orb')!;
  const card = $('#ct-clock-card')!;

  const LHR = lahoreGlobe;

  /* ---- where is the visitor (best guess from the time zone, never exact) ---- */
  let tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    /* no Intl */
  }
  const myOff = -new Date().getTimezoneOffset();
  let same = myOff === PKT;
  const city =
    /^(Etc\/)?(UTC|GMT|UCT|Universal|Zulu)$/.test(tz) || !tz
      ? 'UTC'
      : (tz.split('/').pop() ?? '').replace(/_/g, ' ');
  const you = (() => {
    const p = visitorPlaces[tz];
    if (p) return { lat: p[0], lon: p[1] };
    if (city === 'UTC') return { lat: 51.5, lon: -0.1 };
    const reg = tz.split('/')[0];
    const lat = (
      { America: 35, Europe: 48, Africa: 5, Australia: -30, Pacific: -15, Asia: 28 } as Record<
        string,
        number
      >
    )[reg];
    return { lat: lat == null ? 30 : lat, lon: Math.max(-170, Math.min(170, myOff / 4)) };
  })();

  /* ---- sphere helpers ---- */
  const vec = (lat: number, lon: number): Vec => {
    const a = lat * D2R;
    const b = lon * D2R;
    return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)];
  };
  const ll = (v: Vec) => {
    const n = Math.hypot(v[0], v[1], v[2]) || 1;
    return { lat: Math.asin(v[2] / n) / D2R, lon: Math.atan2(v[1], v[0]) / D2R };
  };
  const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const slerp = (a: Vec, b: Vec, t: number): Vec => {
    const d = Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
    if (d < 1e-6) return [a[0], a[1], a[2]];
    const s = Math.sin(d);
    const k1 = Math.sin((1 - t) * d) / s;
    const k2 = Math.sin(t * d) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  };
  const vY = vec(you.lat, you.lon);
  const vL = vec(LHR.lat, LHR.lon);
  const angDist = Math.acos(Math.max(-1, Math.min(1, dot(vY, vL))));
  if (angDist < 4 * D2R) same = true;
  const mid = same ? LHR : ll(slerp(vY, vL, 0.5));

  /* Pick the view that frames the connection best (L5747-5772). */
  const base = (() => {
    const prj = (la: number, lo: number, L0: number, O0: number): Vec => {
      const p = la * D2R;
      const l = (lo - O0) * D2R;
      const s0 = Math.sin(L0 * D2R);
      const c0 = Math.cos(L0 * D2R);
      const cp = Math.cos(p);
      const sp = Math.sin(p);
      const cl = Math.cos(l);
      return [cp * Math.sin(l), c0 * sp - s0 * cp * cl, s0 * sp + c0 * cp * cl];
    };
    let best: { lat: number; lon: number; side: number } | null = null;
    let bs = 1e9;
    const mm = ll(slerp(vY, vL, 0.5));
    for (let side = 0; side < 1; side++) {
      const sx = -1; /* the card side: lower-left */
      for (let la = -40; la <= 60; la += 4) {
        for (let dl = -100; dl <= 100; dl += 4) {
          const lo = mid.lon + dl;
          const pl = prj(LHR.lat, LHR.lon, la, lo);
          let sc = Math.abs(la - 22) * 0.012 + side * 0.15;
          if (pl[2] < 0.25) continue;
          if (same) {
            sc += Math.pow(pl[0] - 0.22, 2) + Math.pow(pl[1] - 0.12, 2);
          } else {
            const py = prj(you.lat, you.lon, la, lo);
            const pm = prj(mm.lat, mm.lon, la, lo);
            if (py[2] < 0.25) continue;
            [py, pl, pm].forEach((q) => {
              if (q[0] * sx > 0.05 && q[1] < 0.05) sc += 3;
              if (q[1] < -0.55) sc += 2;
              if (q[1] > 0.8) sc += 1;
            });
            const n = [
              py[1] * pl[2] - py[2] * pl[1],
              py[2] * pl[0] - py[0] * pl[2],
              py[0] * pl[1] - py[1] * pl[0],
            ];
            const nn = Math.hypot(n[0], n[1], n[2]) || 1;
            sc +=
              Math.pow(Math.abs(n[2] / nn) - 0.45, 2) * 3; /* a real curve, not a straight chord */
            if (pm[1] < (py[1] + pl[1]) / 2) sc += 0.8; /* bow upward like a rainbow */
            sc +=
              (1 - py[2]) * 0.5 +
              (1 - pl[2]) * 0.5 +
              Math.pow(pm[0], 2) * 0.5 +
              Math.pow(pm[1] - 0.2, 2);
          }
          if (sc < bs) {
            bs = sc;
            best = { lat: la, lon: lo, side };
          }
        }
      }
    }
    return best ?? { lat: 20, lon: mid.lon, side: 0 };
  })();

  /* view state */
  let lat0 = 0;
  let lon0 = 0;
  let sL0 = 0;
  let cL0 = 0;
  const sway = { lat: 0, lon: 0 };
  let scrollRot = 0;
  const setView = () => {
    lat0 = base.lat + sway.lat;
    lon0 = base.lon + sway.lon + scrollRot;
    sL0 = Math.sin(lat0 * D2R);
    cL0 = Math.cos(lat0 * D2R);
  };
  const pv = (lat: number, lon: number): Vec => {
    const p = lat * D2R;
    const l = (lon - lon0) * D2R;
    const cp = Math.cos(p);
    const sp = Math.sin(p);
    const cl = Math.cos(l);
    return [cp * Math.sin(l), cL0 * sp - sL0 * cp * cl, sL0 * sp + cL0 * cp * cl];
  };
  const X = (v: Vec, r = 1) => C + v[0] * RG * r;
  const Y = (v: Vec, r = 1) => C - v[1] * RG * r;

  /* ---- build the static SVG once ---- */
  type Attrs = Record<string, string | number>;
  const el = (tag: string, attrs: Attrs, parent?: Element) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, String(attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  };
  const pol = (h: number, r: number): [number, number] => {
    const a = (h - 12) * 15 * D2R;
    return [C + r * Math.sin(a), C - r * Math.cos(a)];
  };
  const defs = el('defs', {}, svg);
  const g1 = el('radialGradient', { id: 'ct-orb-fill', cx: '36%', cy: '30%', r: '80%' }, defs);
  el('stop', { offset: '0', class: 'ct-s-a' }, g1);
  el('stop', { offset: '1', class: 'ct-s-b' }, g1);
  const p9 = pol(9, RD);
  const p18 = pol(18, RD);
  const g2 = el(
    'linearGradient',
    {
      id: 'ct-orb-wg',
      gradientUnits: 'userSpaceOnUse',
      x1: p9[0],
      y1: p9[1],
      x2: p18[0],
      y2: p18[1],
    },
    defs,
  );
  el('stop', { offset: '0', class: 'ct-s-d' }, g2);
  el('stop', { offset: '1', class: 'ct-s-c' }, g2);
  const g3 = el(
    'linearGradient',
    { id: 'ct-orb-ag', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 500, y2: 0 },
    defs,
  );
  el('stop', { offset: '0', class: 'ct-s-d' }, g3);
  el('stop', { offset: '1', class: 'ct-s-c' }, g3);
  const g4 = el('linearGradient', { id: 'ct-orb-bg', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
  el('stop', { offset: '0', class: 'ct-s-e' }, g4);
  el('stop', { offset: '1', class: 'ct-s-f' }, g4);
  const g5 = el('radialGradient', { id: 'ct-orb-shade', cx: '40%', cy: '36%', r: '68%' }, defs);
  el('stop', { offset: '.55', class: 'ct-s-g' }, g5);
  el('stop', { offset: '1', class: 'ct-s-h' }, g5);
  const cp = el('clipPath', { id: 'ct-orb-clip' }, defs);
  el('circle', { cx: C, cy: C, r: RG }, cp);
  const fl = el(
    'filter',
    { id: 'ct-orb-soft', x: '-20%', y: '-20%', width: '140%', height: '140%' },
    defs,
  );
  el('feGaussianBlur', { stdDeviation: '5' }, fl);

  el('circle', { class: 'ct-orb__glow', cx: C, cy: C, r: RG + 26 }, svg);
  /* dial */
  const dial = el('g', { class: 'ct-orb__dial' }, svg);
  el(
    'circle',
    {
      class: 'ct-orb__ring',
      cx: C,
      cy: C,
      r: RD,
      pathLength: 1,
      transform: 'rotate(-90 ' + C + ' ' + C + ')',
    },
    dial,
  );
  el('circle', { class: 'ct-orb__ring2', cx: C, cy: C, r: RG + 16 }, dial);
  const ticks = el('g', { class: 'ct-orb__ticks' }, dial);
  for (let h = 0; h < 24; h++) {
    const q = h % 6 === 0;
    const a1 = pol(h, RD);
    const a2 = pol(h, RD - (q ? 11 : 6));
    el(
      'line',
      {
        class: 'ct-orb__tick' + (q ? ' ct-orb__tick--q' : ''),
        x1: f1(a1[0]),
        y1: f1(a1[1]),
        x2: f1(a2[0]),
        y2: f1(a2[1]),
      },
      ticks,
    );
    if (q) {
      const lp = pol(h, RD - 24);
      const t = el('text', { class: 'ct-orb__hl', x: f1(lp[0]), y: f1(lp[1]) }, ticks);
      t.textContent = pad(h);
    }
  }
  const arcD =
    'M' +
    f1(p9[0]) +
    ',' +
    f1(p9[1]) +
    'A' +
    RD +
    ',' +
    RD +
    ' 0 0 1 ' +
    f1(p18[0]) +
    ',' +
    f1(p18[1]);
  el('path', { class: 'ct-orb__work-halo', d: arcD }, dial);
  el('path', { class: 'ct-orb__work', d: arcD, pathLength: 1 }, dial);
  const t9 = pol(9, RD + 13);
  const t18 = pol(18, RD + 13);
  el(
    'path',
    {
      id: 'ct-orb-tp',
      d:
        'M' +
        f1(t9[0]) +
        ',' +
        f1(t9[1]) +
        'A' +
        (RD + 13) +
        ',' +
        (RD + 13) +
        ' 0 0 1 ' +
        f1(t18[0]) +
        ',' +
        f1(t18[1]),
      fill: 'none',
    },
    dial,
  );
  const wl = el('text', { class: 'ct-orb__wlabel' }, dial);
  const tp = el(
    'textPath',
    { href: '#ct-orb-tp', startOffset: '50%', 'text-anchor': 'middle' },
    wl,
  );
  tp.textContent = 'Mon–Fri · 9AM–6PM PKT';
  const now = el('g', { class: 'ct-orb__now' }, dial);
  el('line', { class: 'ct-orb__hand', x1: C, y1: C - RG - 6, x2: C, y2: C - RD + 6 }, now);
  el('circle', { class: 'ct-orb__nowping', cx: C, cy: C - RD, r: 6 }, now);
  el('circle', { class: 'ct-orb__nowdot', cx: C, cy: C - RD, r: 5.5 }, now);
  /* globe */
  const globe = el('g', { class: 'ct-orb__g' }, svg);
  el('circle', { class: 'ct-orb__disc', cx: C, cy: C, r: RG }, globe);
  const pBack = el('path', { class: 'ct-orb__back' }, globe);
  const pNight = el(
    'path',
    { class: 'ct-orb__night', 'clip-path': 'url(#ct-orb-clip)', filter: 'url(#ct-orb-soft)' },
    globe,
  );
  const pFront = el('path', { class: 'ct-orb__front' }, globe);
  const pPar = el('path', { class: 'ct-orb__par' }, globe);
  el('circle', { class: 'ct-orb__shade', cx: C, cy: C, r: RG }, globe);
  const s1 = pol(20.2, RG - 7);
  const s2 = pol(22.6, RG - 7);
  el(
    'path',
    {
      class: 'ct-orb__shine',
      d:
        'M' +
        f1(s1[0]) +
        ',' +
        f1(s1[1]) +
        'A' +
        (RG - 7) +
        ',' +
        (RG - 7) +
        ' 0 0 1 ' +
        f1(s2[0]) +
        ',' +
        f1(s2[1]),
    },
    globe,
  );
  /* the connection */
  const lead = el('g', { class: 'ct-orb__lead' }, svg) as SVGGElement;
  const pLead = el('path', { class: 'ct-orb__lead-l' }, lead);
  const cLead = el('circle', { class: 'ct-orb__lead-d', r: 3.2 }, lead);
  const link = el('g', { class: 'ct-orb__link' }, svg);
  const pBed = el('path', { class: 'ct-orb__arc-bed' }, link);
  const pArc = el('path', { class: 'ct-orb__arc', pathLength: 1 }, link);
  const pPulse = el('path', { class: 'ct-orb__pulse', pathLength: 1 }, link);
  const gYou = el('g', { class: 'ct-orb__you' }, link) as SVGGElement;
  el('circle', { r: 6 }, gYou);
  el('circle', { class: 'ct-orb__ydot', r: 2.2 }, gYou);
  const tYou = el('text', { class: 'ct-orb__lbl', x: 10, y: 4 }, gYou);
  tYou.textContent = 'You';
  const gL = el('g', { class: 'ct-orb__pin' }, link) as SVGGElement;
  el('rect', { class: 'ct-orb__beam', x: -1, y: -66, width: 2, height: 62 }, gL);
  el('rect', { class: 'ct-orb__beamdot', x: -1.6, y: -18, width: 3.2, height: 14, rx: 1.6 }, gL);
  el('circle', { class: 'ct-orb__ping', r: 9 }, gL);
  el('circle', { class: 'ct-orb__ping ct-orb__ping--b', r: 9 }, gL);
  el('circle', { class: 'ct-orb__halo', r: 17 }, gL);
  el('circle', { class: 'ct-orb__core', r: 6 }, gL);
  const tL = el(
    'text',
    { class: 'ct-orb__lbl ct-orb__lbl--l', x: 12, y: -8 },
    gL,
  ) as SVGTextElement;
  tL.textContent = 'Lahore';
  if (same) gYou.style.display = 'none';
  else tYou.textContent = 'You · ' + city;

  /* ---- per-frame render ---- */
  let sun = { lat: 0, lon: 0 };
  const sunVec = () => {
    const d = new Date();
    const start = Date.UTC(d.getUTCFullYear(), 0, 0);
    const doy = (d.getTime() - start) / 864e5;
    const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (doy + 10));
    const lon = -15 * (d.getUTCHours() + d.getUTCMinutes() / 60 - 12);
    sun = { lat: decl, lon: ((lon + 540) % 360) - 180 };
  };
  const graticule = () => {
    let fr = '';
    let bk = '';
    const line = (pts: Vec[]) => {
      let fOpen = false;
      let bOpen = false;
      pts.forEach((v) => {
        const x = f1(X(v));
        const y = f1(Y(v));
        if (v[2] >= 0) {
          fr += (fOpen ? 'L' : 'M') + x + ',' + y;
          fOpen = true;
          bOpen = false;
        } else {
          bk += (bOpen ? 'L' : 'M') + x + ',' + y;
          bOpen = true;
          fOpen = false;
        }
      });
    };
    let lo: number;
    let la: number;
    let pts: Vec[];
    for (lo = -180; lo < 180; lo += 20) {
      pts = [];
      for (la = -84; la <= 84; la += 6) pts.push(pv(la, lo));
      line(pts);
    }
    for (la = -60; la <= 60; la += 20) {
      pts = [];
      for (lo = -180; lo <= 180; lo += 6) pts.push(pv(la, lo));
      line(pts);
    }
    pFront.setAttribute('d', fr);
    pBack.setAttribute('d', bk);
    let par = '';
    let open = false;
    for (lo = -180; lo <= 180; lo += 4) {
      const v = pv(LHR.lat, lo);
      if (v[2] >= 0) {
        par += (open ? 'L' : 'M') + f1(X(v)) + ',' + f1(Y(v));
        open = true;
      } else open = false;
    }
    pPar.setAttribute('d', par);
  };
  const night = () => {
    const S = pv(sun.lat, sun.lon);
    const m = Math.hypot(S[0], S[1]);
    if (m < 1e-3) {
      pNight.setAttribute(
        'd',
        S[2] > 0
          ? ''
          : 'M' +
              (C - RG) +
              ',' +
              C +
              'a' +
              RG +
              ',' +
              RG +
              ' 0 1 0 ' +
              2 * RG +
              ',0a' +
              RG +
              ',' +
              RG +
              ' 0 1 0 ' +
              -2 * RG +
              ',0',
      );
      return;
    }
    const u = [S[0] / m, S[1] / m];
    const v = [-u[1], u[0]];
    let W = [S[1] * 0 - S[2] * v[1], S[2] * v[0] - S[0] * 0, S[0] * v[1] - S[1] * v[0]];
    const wn = Math.hypot(W[0], W[1], W[2]) || 1;
    W = [W[0] / wn, W[1] / wn, W[2] / wn];
    if (W[2] < 0) W = [-W[0], -W[1], -W[2]];
    let d = '';
    let i: number;
    let t: number;
    for (i = 0; i <= 40; i++) {
      t = (Math.PI * i) / 40;
      const px = Math.cos(t) * v[0] + Math.sin(t) * W[0];
      const py = Math.cos(t) * v[1] + Math.sin(t) * W[1];
      d += (i ? 'L' : 'M') + f1(C + px * RG) + ',' + f1(C - py * RG);
    }
    /* back along the limb, through the side facing away from the sun */
    const a0 = Math.atan2(-v[1], -v[0]);
    const a1 = Math.atan2(v[1], v[0]);
    const am = Math.atan2(-u[1], -u[0]);
    let span = a1 - a0;
    while (span < 0) span += 2 * Math.PI;
    let mid2 = am - a0;
    while (mid2 < 0) mid2 += 2 * Math.PI;
    if (mid2 > span) span = span - 2 * Math.PI;
    for (i = 1; i <= 40; i++) {
      t = a0 + (span * i) / 40;
      d += 'L' + f1(C + Math.cos(t) * RG * 1.04) + ',' + f1(C - Math.sin(t) * RG * 1.04);
    }
    pNight.setAttribute('d', d + 'Z');
  };

  /* keep a pin label on the side facing away from its arc */
  const lastPl: Record<string, string> = {};
  const place = (txt: SVGTextElement | Element, a: number[], b: number[], isL?: boolean) => {
    let dx = a[0] - b[0];
    let dy = a[1] - b[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    const away = dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle';
    const inward = a[0] > C + RG * 0.45 ? 'end' : a[0] < C - RG * 0.45 ? 'start' : null;
    const anchorSide = inward ? (away === inward || away === 'middle' ? inward : 'middle') : away;
    const x = anchorSide === 'middle' ? 0 : (anchorSide === 'start' ? 1 : -1) * (isL ? 14 : 11);
    const y =
      anchorSide === 'middle'
        ? isL || dy > 0
          ? isL
            ? 30
            : 21
          : -13
        : isL
          ? dy > 0.2
            ? 20
            : -8
          : 4;
    const key = anchorSide + x + '|' + Math.round(y);
    const id = String(txt === tL);
    if (lastPl[id] === key) return;
    lastPl[id] = key;
    txt.setAttribute('text-anchor', anchorSide);
    txt.setAttribute('x', String(x));
    txt.setAttribute('y', String(Math.round(y)));
  };
  /* the Lahore label sits right, left or below its pin: whichever box stays clear of the arc and of
     the card's leader line, and inside the globe near the limb */
  let curL = '';
  let arcPts: Array<[number, number]> | null = null;
  let anchor: [number, number] | null = null;
  const placeL = (a: number[], b: number[] | null) => {
    let w = 0;
    try {
      w = tL.getComputedTextLength();
    } catch {
      /* not laid out */
    }
    if (!w) w = 50;
    const R: Record<string, [string, number, number, number, number, number, number]> = {
      r: ['start', 18, -6, 18, 18 + w, -18, -1],
      l: ['end', -18, -6, -18 - w, -18, -18, -1],
      b: ['middle', 0, 32, -w / 2, w / 2, 20, 36],
    };
    const hits = (k: string) => {
      const P = R[k];
      let n = 0;
      const x0 = a[0] + P[3] - 3;
      const x1 = a[0] + P[4] + 3;
      const y0 = a[1] + P[5] - 3;
      const y1 = a[1] + P[6] + 3;
      const inR = (x: number, y: number) => x > x0 && x < x1 && y > y0 && y < y1;
      if (b && arcPts) {
        for (let i = 0; i < arcPts.length; i++)
          if (inR(arcPts[i][0], arcPts[i][1])) {
            n += 2;
            break;
          }
      }
      if (anchor) {
        const dx = anchor[0] - a[0];
        const dy = anchor[1] - a[1];
        const m = Math.hypot(dx, dy) || 1;
        for (let t = 13; t < Math.min(m, 140); t += 3)
          if (inR(a[0] + (dx / m) * t, a[1] + (dy / m) * t)) {
            n += 2;
            break;
          }
      }
      if (x1 > C + RG * 1.08 || x0 < C - RG * 1.08 || y1 > C + RG * 1.02) n += 1;
      if (k !== 'r') n += 0.1; /* slight preference for the classic right-hand label */
      return n;
    };
    let best = '';
    let bs = 1e9;
    const sc: Record<string, number> = {};
    ['r', 'l', 'b'].forEach((k) => {
      sc[k] = hits(k);
      if (sc[k] < bs) {
        bs = sc[k];
        best = k;
      }
    });
    if (curL && sc[curL] <= bs + 0.2)
      best = curL; /* hysteresis: no flicker while the globe sways */
    if (best === curL) return;
    curL = best;
    const Q = R[best];
    tL.setAttribute('text-anchor', Q[0]);
    tL.setAttribute('x', String(Q[1]));
    tL.setAttribute('y', String(Q[2]));
  };
  const leadRender = (px: number, py: number, vis: boolean) => {
    if (!anchor || !vis) {
      lead.style.display = 'none';
      return;
    }
    lead.style.display = '';
    const dx = px - anchor[0];
    const dy = py - anchor[1];
    const m = Math.hypot(dx, dy) || 1;
    const k = (m - 13) / m;
    pLead.setAttribute(
      'd',
      'M' +
        f1(anchor[0]) +
        ',' +
        f1(anchor[1]) +
        'L' +
        f1(anchor[0] + dx * k) +
        ',' +
        f1(anchor[1] + dy * k),
    );
    cLead.setAttribute('cx', String(f1(anchor[0])));
    cLead.setAttribute('cy', String(f1(anchor[1])));
  };
  const linkRender = () => {
    const L = pv(LHR.lat, LHR.lon);
    gL.setAttribute('transform', 'translate(' + f1(X(L)) + ',' + f1(Y(L)) + ')');
    gL.style.visibility = L[2] < -0.05 ? 'hidden' : '';
    leadRender(X(L), Y(L), L[2] >= -0.05);
    if (same) placeL([X(L), Y(L)], null);
    if (same) {
      pArc.removeAttribute('d');
      pBed.removeAttribute('d');
      pPulse.removeAttribute('d');
      return;
    }
    const Yv = pv(you.lat, you.lon);
    gYou.setAttribute('transform', 'translate(' + f1(X(Yv)) + ',' + f1(Y(Yv)) + ')');
    let d = '';
    const n = 56;
    const lift = 0.08 + 0.2 * Math.min(1, angDist / 1.6);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const w = ll(slerp(vY, vL, t));
      const p = pv(w.lat, w.lon);
      const r = 1 + lift * Math.sin(Math.PI * t);
      pts.push([X(p, r), Y(p, r)]);
      d += (i ? 'L' : 'M') + f1(pts[i][0]) + ',' + f1(pts[i][1]);
    }
    place(tYou, pts[0], pts[3]);
    arcPts = pts;
    placeL(pts[n], pts[n - 3]);
    pArc.setAttribute('d', d);
    pBed.setAttribute('d', d);
    pPulse.setAttribute('d', d);
  };
  let running = false;
  const render = () => {
    setView();
    graticule();
    night();
    linkRender();
  };

  /* ---- composition: dial and clock card never overlap (L5943-6037) ---- */
  const KR = 203 / 500;
  const KV = 216 / 500;
  const PADE = 0.05;
  const px = (n: number) => Math.round(n * 10) / 10 + 'px';
  const setGeo = (g: { S: number; sx: number; sy: number; kx: number; ky: number; H: number }) => {
    orb.style.setProperty('--ct-s', px(g.S));
    orb.style.setProperty('--ct-sx', px(g.sx));
    orb.style.setProperty('--ct-sy', px(g.sy));
    orb.style.setProperty('--ct-kx', px(g.kx));
    orb.style.setProperty('--ct-ky', px(g.ky));
    orb.style.setProperty('--ct-h', px(g.H));
    orb.classList.add('is-fit');
    if (!running) render();
  };
  const fit = () => {
    const W = orb.clientWidth;
    if (!W) return;
    if (innerWidth < 1024) {
      fitSmall(W);
      return;
    }
    const two = innerWidth >= 1024;
    const diag = W >= 440;
    const cw = diag
      ? Math.round(Math.min(two ? 252 : 262, W * 0.54))
      : Math.round(Math.min(W - 12, two ? 300 : 460));
    orb.style.setProperty('--ct-kw', cw + 'px');
    const ch = card.offsetHeight || 190;
    const gap = diag ? 26 : 22;
    let g: { S: number; sx: number; sy: number; kx: number; ky: number; H: number };
    const geo = (S: number) => {
      const e = S * PADE;
      const cx = W + e - S / 2;
      const cy = S / 2 - e;
      const Rc = KR * S + gap;
      const dx = cx - cw;
      const bot = cy + KV * S;
      let ky = dx >= Rc ? bot - ch : cy + Math.sqrt(Rc * Rc - dx * dx);
      ky = Math.max(
        ky,
        cy + Rc * 0.66,
      ); /* keep the card below the dial's equator so the leader climbs clear of the 06 label */
      const H = Math.max(bot, ky + ch);
      ky = Math.max(ky, H - ch);
      return { S, sx: W + e - S, sy: -e, kx: 0, ky, H };
    };
    if (diag) {
      let Hmax = 1e9;
      if (two) {
        /* as tall as the text column, a little more if the viewport has room */
        const lH = colL.offsetHeight || 0;
        const grid = colL.parentElement!;
        const room =
          innerHeight -
          (grid.getBoundingClientRect().top - hero.getBoundingClientRect().top) -
          (parseFloat(getComputedStyle(hero).paddingBottom) || 0);
        Hmax = Math.max(440, lH + 8, Math.min(lH + 48, room));
      }
      let lo = 240;
      let hi = Math.min(W / (1 - 2 * PADE), two ? 600 : 540);
      if (geo(hi).H <= Hmax) g = geo(hi);
      else {
        for (let i = 0; i < 18; i++) {
          const m = (lo + hi) / 2;
          if (geo(m).H <= Hmax) lo = m;
          else hi = m;
        }
        g = geo(lo);
      }
      const ax = g.kx + cw - 34;
      anchor = [((ax - g.sx) * 500) / g.S, ((g.ky - g.sy) * 500) / g.S];
    } else {
      const S = Math.min(W, 480);
      g = { S, sx: (W - S) / 2, sy: 0, kx: (W - cw) / 2, ky: S / 2 + KR * S + gap, H: 0 };
      g.H = g.ky + ch;
      anchor = null;
    }
    setGeo(g);
  };
  /* Single column (under 1024px): the visual sits on top of the text (L5988-6037). */
  const fitSmall = (W0: number) => {
    const W = orb.getBoundingClientRect().width || W0;
    const vh = innerHeight;
    const Hmax = Math.max(300, Math.min(vh * (innerWidth > vh ? 0.5 : 0.54), 600));
    const gap = 22;
    const R = 0.5 - KV;
    /* side: card fully clear of the dial reach circle, its top a little below the equator */
    const cwS = Math.round(Math.min(284, W * 0.44));
    orb.style.setProperty('--ct-kw', cwS + 'px');
    const chS = card.offsetHeight || 170;
    const side = (S: number, beside: boolean) => {
      const cy = KV * S + 2;
      const Rc = KR * S + gap;
      const ky = beside
        ? Math.max(0, cy - chS * 0.5 + 0.1 * Rc)
        : Math.max(cy + 0.3 * Rc, cy + KV * S - chS);
      const cx = cwS + (beside ? Rc : Math.sqrt(Rc * Rc - Math.pow(Math.min(Rc, ky - cy), 2))) + 4;
      return { S, cx, cy, ky, H: Math.max(cy + KV * S, ky + chS), Wc: cx + KV * S, beside };
    };
    const best = (beside: boolean) => {
      let lo = 160;
      let hi = 540;
      let t = side(lo, beside);
      if (t.Wc > W || t.H > Hmax) return null;
      for (let i = 0; i < 20; i++) {
        const m = (lo + hi) / 2;
        t = side(m, beside);
        if (t.Wc <= W && t.H <= Hmax) lo = m;
        else hi = m;
      }
      return side(lo, beside);
    };
    let sd = best(false);
    const sb = best(true);
    if (sb && (!sd || sb.S > sd.S * 1.08)) sd = sb;
    /* stack */
    const cwK = Math.round(Math.min(W - 12, 316));
    const gapK = 16;
    const HK = Math.max(300, Math.min(vh * 0.56, 600));
    orb.style.setProperty('--ct-kw', cwK + 'px');
    const chK = card.offsetHeight || 170;
    const SK = Math.max(
      Math.min(W / 0.88, 250),
      Math.min(W / 0.88, 480, (HK - gapK - chK) / (KV + KR)),
    );
    let g: { S: number; sx: number; sy: number; kx: number; ky: number; H: number };
    if (sd && sd.S >= SK * 0.92) {
      orb.style.setProperty('--ct-kw', cwS + 'px');
      const ox = Math.max(0, (W - sd.Wc) / 2);
      g = { S: sd.S, sx: ox + sd.cx - sd.S / 2, sy: sd.cy - sd.S / 2, kx: ox, ky: sd.ky, H: sd.H };
      anchor = sd.beside
        ? [((ox + cwS + 7 - g.sx) * 500) / g.S, ((g.ky + 22 - g.sy) * 500) / g.S]
        : [((ox + cwS - 34 - g.sx) * 500) / g.S, ((g.ky - g.sy) * 500) / g.S];
    } else {
      const S = SK;
      g = { S, sx: (W - S) / 2, sy: -R * S, kx: (W - cwK) / 2, ky: (KV + KR) * S + gapK, H: 0 };
      g.H = g.ky + chK;
      anchor = [((g.kx + cwK * 0.34 - g.sx) * 500) / S, ((g.ky - g.sy) * 500) / S];
    }
    setGeo(g);
  };

  /* ---- clocks and working hours ---- */
  const eLhr = $('#ct-h-lhr')!;
  const eYou = $('#ct-h-you')!;
  const eCity = $('#ct-h-city')!;
  const eDiff = $('#ct-h-diff')!;
  const eHrs = $('#ct-h-hrs')!;
  const eStat = $('#ct-h-status')!;
  const eSr = $('#ct-orb-sr')!;
  eCity.textContent = same ? clockCard.sameCity : city;
  {
    const diff = PKT - myOff;
    const a = Math.abs(diff);
    const hh = Math.floor(a / 60);
    const mm = a % 60;
    const txt = hh + 'h' + (mm ? ' ' + mm + 'm' : '');
    eDiff.textContent = same
      ? clockCard.same
      : diff > 0
        ? clockCard.behind(txt)
        : clockCard.ahead(txt);
    const hm = (minOfDay: number) => {
      minOfDay = ((minOfDay % 1440) + 1440) % 1440;
      return pad(Math.floor(minOfDay / 60)) + ':' + pad(minOfDay % 60);
    };
    eHrs.textContent = hm(9 * 60 - diff) + clockCard.hoursJoin + hm(18 * 60 - diff);
  }
  let fmtL: Intl.DateTimeFormat | null = null;
  let fmtY: Intl.DateTimeFormat | null = null;
  try {
    fmtL = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    fmtY = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
  } catch {
    /* no Intl */
  }
  const pktParts = (d: Date) => {
    const u = new Date(d.getTime() + PKT * 6e4);
    return { h: u.getUTCHours(), m: u.getUTCMinutes(), s: u.getUTCSeconds(), wd: u.getUTCDay() };
  };
  let lastMin = -1;
  const tick = () => {
    const d = new Date();
    const p = pktParts(d);
    eLhr.textContent = fmtL ? fmtL.format(d) : pad(p.h) + ':' + pad(p.m) + ':' + pad(p.s);
    eYou.textContent = fmtY ? fmtY.format(d) : pad(d.getHours()) + ':' + pad(d.getMinutes());
    const ang = p.h + p.m / 60 + p.s / 3600 - 12;
    now.setAttribute('transform', 'rotate(' + (ang * 15).toFixed(2) + ' ' + C + ' ' + C + ')');
    if (p.m === lastMin) return;
    lastMin = p.m;
    const wk = p.wd >= 1 && p.wd <= 5;
    const mins = p.h * 60 + p.m;
    const open = wk && mins >= 540 && mins < 1080;
    hero.classList.toggle('is-hours', open);
    let msg: string;
    if (open) msg = clockCard.open;
    else {
      let addDays = 0;
      let wd = p.wd;
      if (wk && mins < 540) addDays = 0;
      else {
        addDays = 1;
        wd = (wd + 1) % 7;
        while (wd === 0 || wd === 6) {
          addDays++;
          wd = (wd + 1) % 7;
        }
      }
      const until = addDays * 1440 + 540 - mins;
      const uh = Math.floor(until / 60);
      const um = until % 60;
      msg = until < 1440 ? clockCard.backIn(uh, um) : clockCard.backDay(clockCard.weekdays[wd]);
    }
    eStat.textContent = msg;
    eSr.textContent = clockCard.srLine(pad(p.h) + ':' + pad(p.m), msg, eDiff.textContent ?? '');
    if (p.m % 5 === 0) {
      sunVec();
      if (!running) render();
    }
  };
  sunVec();
  fit();
  render();
  tick();
  const tickId = setInterval(tick, 1000);
  add(() => clearInterval(tickId));
  let fitT = 0;
  add(() => cancelAnimationFrame(fitT));
  const fitSoon = () => {
    cancelAnimationFrame(fitT);
    fitT = requestAnimationFrame(fit);
  };
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(fitSoon);
    ro.observe(orb);
    ro.observe(colL);
    ro.observe(card);
    add(() => ro.disconnect());
  }
  if (document.fonts && document.fonts.ready) void document.fonts.ready.then(fitSoon);

  /* ---- entrance (plays every time the page is shown) ---- */
  let playT: ReturnType<typeof setTimeout> | undefined;
  let liveT: ReturnType<typeof setTimeout> | undefined;
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  const rafs: number[] = [];
  add(() => {
    clearTimeout(playT);
    clearTimeout(liveT);
    timers.forEach(clearTimeout);
    rafs.forEach(cancelAnimationFrame);
  });
  const countUp = () => {
    hero.querySelectorAll<HTMLElement>('[data-ct-count]').forEach((n, i) => {
      const to = +(n.dataset.ctCount ?? 0);
      const suf = n.dataset.suffix || '';
      if (reduce) {
        n.textContent = to + suf;
        return;
      }
      n.textContent = '0' + suf;
      timers.push(
        setTimeout(
          () => {
            let t0: number | null = null;
            const f = (t: number) => {
              if (t0 === null) t0 = t;
              const k = Math.min(1, (t - t0) / 1500);
              const e = 1 - Math.pow(1 - k, 4);
              n.textContent = Math.round(to * e) + suf;
              if (k < 1) rafs.push(requestAnimationFrame(f));
            };
            f(performance.now());
          },
          700 + i * 110,
        ),
      );
    });
  };
  const play = (delay: number) => {
    clearTimeout(playT);
    clearTimeout(liveT);
    hero.classList.remove('is-play', 'is-live');
    void hero.offsetWidth;
    playT = setTimeout(
      () => {
        hero.classList.add('is-play');
        countUp();
        liveT = setTimeout(() => hero.classList.add('is-live'), reduce ? 0 : 2400);
      },
      reduce ? 0 : delay,
    );
  };

  /* ---- scroll-linked exit ---- */
  let lastP = -1;
  const exit = () => {
    const hh = hero.offsetHeight || 1;
    const y = window.scrollY || 0;
    const p = Math.max(0, Math.min(1, y / (hh * 0.85)));
    const desk = innerWidth >= 1024;
    const rot = Math.max(0, Math.min(1, y / (hh * 1.2))) * (desk ? 26 : 18);
    if (Math.abs(rot - scrollRot) > 0.05) {
      scrollRot = rot;
      if (!running) render();
    }
    if (p === lastP) return;
    lastP = p;
    if (!desk && !reduce) {
      /* single column: the visual is on top, it shrinks toward its top edge and fades as you scroll past */
      colL.style.transform = colL.style.opacity = '';
      if (cue) cue.style.opacity = '';
      const oh = colR.offsetHeight + colR.offsetTop || 1;
      const q = Math.max(0, Math.min(1, y / oh));
      const e2 = q * q * (3 - 2 * q);
      colR.style.transform = e2 ? 'scale(' + (1 - e2 * 0.08).toFixed(4) + ')' : '';
      colR.style.opacity = e2 ? (1 - e2 * 0.75).toFixed(3) : '';
      return;
    }
    if (!desk || reduce) {
      colL.style.transform = colL.style.opacity = colR.style.transform = colR.style.opacity = '';
      if (cue) cue.style.opacity = '';
      return;
    }
    const e = p * p * (3 - 2 * p);
    colL.style.transform = 'translate3d(0,' + (-e * 90).toFixed(1) + 'px,0)';
    colL.style.opacity = (1 - e * 0.9).toFixed(3);
    colR.style.transform =
      'translate3d(0,' + (e * 40).toFixed(1) + 'px,0) scale(' + (1 - e * 0.1).toFixed(4) + ')';
    colR.style.opacity = (1 - e * 0.75).toFixed(3);
    if (cue) cue.style.opacity = Math.max(0, 1 - p * 3).toFixed(3);
  };
  let sraf = 0;
  add(() => cancelAnimationFrame(sraf));
  listen(
    window,
    'scroll',
    () => {
      if (!sraf)
        sraf = requestAnimationFrame(() => {
          sraf = 0;
          exit();
        });
    },
    { passive: true },
  );
  listen(window, 'resize', () => {
    lastP = -1;
    fitSoon();
    exit();
  });

  /* ---- ambient loop: the globe sways very slowly (32s), only while visible ---- */
  let inView = true;
  let rafA = 0;
  let lastR = 0;
  const T0 = performance.now();
  add(() => cancelAnimationFrame(rafA));
  const loop = (t: number) => {
    if (!running) return;
    rafA = requestAnimationFrame(loop);
    if (t - lastR < 45) return;
    lastR = t;
    const s = (t - T0) / 1000;
    sway.lon = 8 * Math.sin((s * 2 * Math.PI) / 32);
    sway.lat = 3 * Math.sin((s * 2 * Math.PI) / 46);
    render();
  };
  const sync = () => {
    const want = !reduce && inView && !document.hidden;
    if (want && !running) {
      running = true;
      rafA = requestAnimationFrame(loop);
    } else if (!want && running) {
      running = false;
      cancelAnimationFrame(rafA);
    }
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      inView = es[0].isIntersecting;
      sync();
    });
    io.observe(orb);
    add(() => io.disconnect());
  }
  listen(document, 'visibilitychange', sync);

  /* ---- router hooks: a mount after boot is a page show, before boot the first load ---- */
  if (document.documentElement.classList.contains('is-loaded')) {
    lastP = -1;
    fit();
    exit();
    play(600);
  } else play(1320);
  sync();
  exit();

  /* ---- copy email ---- */
  const copyBtn = $('#ct-copy');
  if (copyBtn) {
    const tip = $('.ct-mail__tip', copyBtn)!;
    listen(copyBtn, 'click', () => {
      const v = copyBtn.dataset.copy ?? '';
      const done = () => {
        copyBtn.classList.add('is-done');
        tip.textContent = 'Copied';
        env.toast('Email copied: ' + v);
        timers.push(
          setTimeout(() => {
            copyBtn.classList.remove('is-done');
            tip.textContent = 'Copy email';
          }, 2200),
        );
      };
      const legacy = () => {
        const ta = document.createElement('textarea');
        ta.value = v;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch {
          /* copy is not available */
        }
        ta.remove();
        done();
      };
      if (navigator.clipboard && navigator.clipboard.writeText)
        void navigator.clipboard.writeText(v).then(done, legacy);
      else legacy();
    });
  }

  return () => {
    while (disposers.length) disposers.pop()?.();
  };
}
