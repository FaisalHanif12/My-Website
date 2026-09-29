/**
 * The booking modal script (reference contact.js booking(), L6322-6704): the three screens (pick,
 * steps, done), the session radios and stepper with the animated total, the three step panes, the
 * email check, the calendar with its keyboard support, the hourly slots in the visitor's zone, the
 * recap and the submit.
 *
 * Submit: with NEXT_PUBLIC_API_URL set the booking goes to POST /api/booking with an
 * Idempotency-Key (the reference's `FH_HOOKS.onBooking`), and the free slots come from
 * GET /api/booking/slots. Without it the reference mailto flow runs (`viaMail`) and the slots are
 * the fixed nine of the reference. A 409 goes back to step 2 with the slot error.
 */
import {
  BOOKING_COPY,
  BOOKING_HOME_TZ,
  BOOKING_MAX_DAYS_AHEAD,
  BOOKING_SESSIONS_MAX,
  BOOKING_SESSIONS_MIN,
  BOOKING_SLOT_HOURS_PKT,
  BOOKING_ZONES,
  BOOKING_PKT_OFFSET_HOURS,
  bookingGmtLabel,
  bookingMailBody,
  bookingMailSubject,
  bookingSession,
  bookingZoneName,
  bookingZoneOption,
  type BookingPlatformValue,
  type SessionTypeId,
} from '@/content/booking';
import {
  API_ENABLED,
  getBookingSlots,
  isApiError,
  newIdempotencyKey,
  postBooking,
  type BookingRequest,
} from '@/lib/api';
import { openMail } from '@/lib/mailto';
import { EASE_OUT } from '@/lib/motion';
import { EMAIL_RE, esc, parseYmd, ymd } from '@/lib/strings';
import { swapViews, wait } from '@/lib/viewMotion';

export interface BookingEnv {
  reduce: boolean;
  toast: (message: string) => void;
}

export interface BookingController {
  /** FH.openBooking without the modal part: resets, shows the pick screen and focuses the radio. */
  open(type: SessionTypeId): void;
  dispose(): void;
}

type ScreenName = 'pick' | 'steps' | 'done';

interface State {
  type: SessionTypeId;
  n: number;
  email: string;
  verified: boolean;
  name: string;
  phone: string;
  company: string;
  date: string | null;
  slot: number | null;
  plat: BookingPlatformValue | '';
  notes: string;
}

const C = BOOKING_COPY;

export function initBooking(modal: HTMLElement, env: BookingEnv): BookingController {
  const { reduce } = env;
  const disposers: Array<() => void> = [];
  const add = (d: () => void) => disposers.push(d);
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
  };
  const $ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = modal) =>
    r.querySelector<E>(s);
  const $$ = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = modal) =>
    Array.from(r.querySelectorAll<E>(s));
  /** A markup id the script cannot run without. */
  const need = <E extends HTMLElement = HTMLElement>(s: string, r: ParentNode = modal): E => {
    const found = r.querySelector<E>(s);
    if (!found) throw new Error('Booking modal markup is missing ' + s);
    return found;
  };

  const panel = need('.ct-bk__panel');
  const stage = need('#ct-bk-stage');
  const live = need('#ct-bk-live');
  panel.setAttribute('data-native-scroll', '');
  const screens: Record<ScreenName, HTMLElement> = {
    pick: need('[data-screen="pick"]'),
    steps: need('[data-screen="steps"]'),
    done: need('[data-screen="done"]'),
  };
  const titles: Record<ScreenName, string> = {
    pick: 'ct-bk-t1',
    steps: 'ct-bk-t2',
    done: 'ct-bk-t3',
  };
  const panes = need('#ct-bk-panes');
  const el = {
    email: need<HTMLInputElement>('#ct-bk-email'),
    name: need<HTMLInputElement>('#ct-bk-name'),
    phone: need<HTMLInputElement>('#ct-bk-phone'),
    company: need<HTMLInputElement>('#ct-bk-company'),
    tz: need<HTMLSelectElement>('#ct-bk-tz'),
    notes: need<HTMLTextAreaElement>('#ct-bk-notes'),
    n: need('#ct-bk-n'),
    total: need('#ct-bk-s-total'),
    grid: need('#ct-cal-grid'),
    month: need('#ct-cal-month'),
    slots: need('#ct-slots'),
    complete: need<HTMLButtonElement>('#ct-bk-complete'),
  };

  let S: State = blankState('quick');
  let cur: ScreenName = 'pick';
  let step = 1;
  let busy = false;
  let totalShown = 15;
  let raf = 0;
  let view = { y: 0, m: 0 };
  /** Free slot hours in PKT per "date|session" (API mode). A missing key means not loaded. */
  const freeSlots = new Map<string, number[]>();
  /** Days the API reported as fully booked; the calendar shows them disabled. */
  const fullDays = new Set<string>();
  let attempt: { sig: string; key: string } | null = null;
  let slotsSeq = 0;

  const announce = (m: string) => {
    live.textContent = '';
    timeout(() => {
      live.textContent = m;
    }, 30);
  };

  function blankState(type: SessionTypeId): State {
    return {
      type: type === 'deep' ? 'deep' : 'quick',
      n: 1,
      email: '',
      verified: false,
      name: '',
      phone: '',
      company: '',
      date: null,
      slot: null,
      plat: '',
      notes: '',
    };
  }

  /* ---- time zones (L6343-6376) ---- */
  let LOCAL_TZ: string = BOOKING_HOME_TZ;
  try {
    LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || LOCAL_TZ;
  } catch {
    /* keep the default */
  }
  function tzOffset(tz: string, at?: Date): number | null {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).formatToParts(at || new Date());
      const o: Record<string, number> = {};
      parts.forEach((p) => {
        o[p.type] = +p.value;
      });
      const asUtc = Date.UTC(o.year, o.month - 1, o.day, o.hour % 24, o.minute);
      const t = at || new Date();
      const base = t.getTime() - t.getSeconds() * 1000 - t.getMilliseconds();
      return Math.round((asUtc - base) / 60000);
    } catch {
      return null;
    }
  }
  function buildZones() {
    const list = BOOKING_ZONES.slice();
    if (list.indexOf(LOCAL_TZ) < 0) list.unshift(LOCAL_TZ);
    const rows = list
      .map((z) => {
        const off = tzOffset(z);
        return { z, off: off == null ? 0 : off, ok: off != null };
      })
      .filter((r) => r.ok);
    rows.sort((a, b) => a.off - b.off || a.z.localeCompare(b.z));
    el.tz.innerHTML = rows
      .map(
        (r) =>
          '<option value="' +
          esc(r.z) +
          '">' +
          esc(bookingZoneOption(bookingGmtLabel(r.off), bookingZoneName(r.z), r.z === LOCAL_TZ)) +
          '</option>',
      )
      .join('');
    el.tz.value = rows.some((r) => r.z === LOCAL_TZ) ? LOCAL_TZ : BOOKING_HOME_TZ;
  }
  function fmtTime(ms: number, tz: string): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
      }).format(ms);
    } catch {
      return new Date(ms).toLocaleTimeString();
    }
  }
  function fmtDayTz(ms: number, tz: string): string {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(ms);
    } catch {
      return ymd(new Date(ms));
    }
  }
  function fmtLongDate(s: string): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parseYmd(s));
  }
  function fmtShortTz(ms: number, tz: string): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(ms);
    } catch {
      return '';
    }
  }
  function tzName(tz: string): string {
    const o = el.tz.querySelector('option[value="' + tz + '"]');
    return o && o.textContent ? o.textContent.replace(C.steps.p2.yourZone, '') : tz;
  }

  /* ---- state (L6379-6400) ---- */
  function reset(type: SessionTypeId, keepContact: boolean) {
    const keep = keepContact
      ? {
          email: S.email,
          verified: S.verified,
          name: S.name,
          phone: S.phone,
          company: S.company,
        }
      : {};
    S = { ...blankState(type), ...keep };
    attempt = null;
    fullDays.clear();
    $$<HTMLInputElement>('input[name="ct-bk-type"]').forEach((r) => {
      r.checked = r.value === S.type;
    });
    $$<HTMLInputElement>('input[name="ct-bk-plat"]').forEach((r) => {
      r.checked = false;
    });
    el.email.value = S.email || '';
    el.name.value = S.name || '';
    el.phone.value = S.phone || '';
    el.company.value = S.company || '';
    el.notes.value = '';
    el.email.closest('.ct-bf')?.classList.toggle('is-verified', !!S.verified);
    setVerifyLabel();
    $$('.ct-err').forEach((e) => {
      e.textContent = '';
    });
    $$('[aria-invalid]').forEach((i) => i.removeAttribute('aria-invalid'));
    $$('.is-invalid').forEach((i) => i.classList.remove('is-invalid'));
    el.tz.value = el.tz.querySelector('option[value="' + LOCAL_TZ + '"]')
      ? LOCAL_TZ
      : BOOKING_HOME_TZ;
    const t = new Date();
    view = { y: t.getFullYear(), m: t.getMonth() };
    if (!firstAvailIn(view.y, view.m)) {
      const nx = new Date(view.y, view.m + 1, 1);
      view = { y: nx.getFullYear(), m: nx.getMonth() };
    }
    renderCal();
    renderSlots(false);
    totalShown = bookingSession(S.type).price * S.n;
    cancelAnimationFrame(raf);
    updateSummary(false);
    step = 1;
    setStepUI();
    $$('.ct-pane').forEach((p) => {
      p.hidden = p.dataset.pane !== '1';
    });
    el.complete.classList.remove('is-loading');
    busy = false;
  }
  function showScreen(name: ScreenName, animate: boolean, dir?: number): Promise<void> {
    const from = screens[cur];
    const to = screens[name];
    panel.setAttribute('aria-labelledby', titles[name]);
    const prev = cur;
    cur = name;
    if (!animate || from === to) {
      (Object.keys(screens) as ScreenName[]).forEach((k) => {
        screens[k].hidden = k !== name;
      });
      return Promise.resolve();
    }
    if (panel.scrollTop > 0) panel.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    return swapViews(stage, screens[prev], to, dir == null ? 1 : dir, 'y');
  }

  /* ---- screen A (L6410-6453) ---- */
  function tweenTotal(to: number) {
    cancelAnimationFrame(raf);
    if (reduce) {
      totalShown = to;
      el.total.textContent = '$' + to;
      return;
    }
    const from = totalShown;
    const t0 = performance.now();
    const d = 650;
    const f = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / d));
      const e = 1 - Math.pow(1 - p, 3);
      totalShown = from + (to - from) * e;
      el.total.textContent = '$' + Math.round(totalShown);
      if (p < 1) raf = requestAnimationFrame(f);
      else totalShown = to;
    };
    raf = requestAnimationFrame(f);
  }
  function updateSummary(animate: boolean) {
    const T = bookingSession(S.type);
    const total = T.price * S.n;
    need('#ct-bk-s-type').textContent = T.name;
    need('#ct-bk-s-price').textContent = '$' + T.price;
    need('#ct-bk-s-n').textContent = String(S.n);
    el.n.textContent = String(S.n);
    need<HTMLButtonElement>('[data-bk-step="-1"]').disabled = S.n <= BOOKING_SESSIONS_MIN;
    need<HTMLButtonElement>('[data-bk-step="1"]').disabled = S.n >= BOOKING_SESSIONS_MAX;
    if (animate) tweenTotal(total);
    else {
      totalShown = total;
      el.total.textContent = '$' + total;
    }
    need('#ct-recap-name').textContent = T.name;
    need('#ct-recap-dur').textContent = T.dur;
    need('#ct-recap-ic use', modal).setAttribute('href', '#' + T.icon);
    renderRecap();
  }
  $$<HTMLInputElement>('input[name="ct-bk-type"]').forEach((r) => {
    listen(r, 'change', () => {
      S.type = r.value === 'deep' ? 'deep' : 'quick';
      updateSummary(true);
      announce(
        C.announce.typeSelected(bookingSession(S.type).name, bookingSession(S.type).price * S.n),
      );
      if (API_ENABLED && S.date) void loadSlots(S.date);
    });
  });
  $$<HTMLButtonElement>('[data-bk-step]').forEach((b) => {
    listen(b, 'click', () => {
      const delta = +(b.dataset.bkStep ?? 0);
      const n = Math.max(BOOKING_SESSIONS_MIN, Math.min(BOOKING_SESSIONS_MAX, S.n + delta));
      if (n === S.n) return;
      S.n = n;
      updateSummary(true);
      if (!reduce && el.n.animate)
        el.n.animate(
          [
            { transform: 'translateY(' + (delta > 0 ? 6 : -6) + 'px)', opacity: 0.3 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 380, easing: EASE_OUT },
        );
      announce(C.announce.count(n, bookingSession(S.type).price * n));
      if (b.disabled)
        need<HTMLButtonElement>(delta > 0 ? '[data-bk-step="-1"]' : '[data-bk-step="1"]').focus();
    });
  });
  listen(need('#ct-bk-go'), 'click', () => {
    void showScreen('steps', true, 1).then(() => el.email.focus({ preventScroll: true }));
  });
  listen(need('#ct-bk-change'), 'click', () => {
    void showScreen('pick', true, -1).then(() => {
      $<HTMLInputElement>('input[name="ct-bk-type"]:checked')?.focus({ preventScroll: true });
    });
  });

  /* ---- screen B: steps (L6455-6535) ---- */
  function setStepUI() {
    $$('.ct-steps__i').forEach((li) => {
      const i = +(li.dataset.si ?? 0);
      li.classList.toggle('is-current', i === step);
      li.classList.toggle('is-done', i < step);
      if (i === step) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    need('#ct-steps-fill').style.transform = 'scaleX(' + (step - 1) / 2 + ')';
  }
  const pane = (n: number) => need('.ct-pane[data-pane="' + n + '"]');
  function goStep(n: number) {
    if (busy || n === step) return;
    const from = pane(step);
    const to = pane(n);
    const dir = n > step ? 1 : -1;
    step = n;
    setStepUI();
    renderRecap();
    if (n === 2) renderSlots(false);
    busy = true;
    void swapViews(panes, from, to, dir, 'x').then(() => {
      busy = false;
      const f =
        n === 1
          ? el.email
          : n === 2
            ? $('.ct-cal__d[tabindex="0"]') || el.tz
            : $('input[name="ct-bk-plat"]:checked') || $('input[name="ct-bk-plat"]');
      f?.focus({ preventScroll: true });
    });
    announce(C.announce.step(n));
  }
  function fieldErr(input: HTMLElement | null, errId: string, msg: string): boolean {
    const e = document.getElementById(errId);
    if (e) e.textContent = msg;
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function setVerifyLabel() {
    need('#ct-bk-verify').textContent = S.verified ? C.steps.p1.verified : C.steps.p1.verify;
  }
  function verifyEmail(silent: boolean): boolean {
    const v = el.email.value.trim();
    const wrap = el.email.closest('.ct-bf');
    if (!v) {
      S.verified = false;
      wrap?.classList.remove('is-verified');
      setVerifyLabel();
      return fieldErr(el.email, 'ct-bk-email-err', C.errors.emailEmpty);
    }
    if (!EMAIL_RE.test(v)) {
      S.verified = false;
      wrap?.classList.remove('is-verified');
      setVerifyLabel();
      return fieldErr(el.email, 'ct-bk-email-err', C.errors.emailBad);
    }
    S.email = v;
    S.verified = true;
    wrap?.classList.add('is-verified');
    setVerifyLabel();
    fieldErr(el.email, 'ct-bk-email-err', '');
    if (!silent) announce(C.announce.emailVerified);
    return true;
  }
  listen(need('#ct-bk-verify'), 'click', () => {
    verifyEmail(false);
  });
  listen(el.email, 'input', () => {
    if (S.verified) {
      S.verified = false;
      el.email.closest('.ct-bf')?.classList.remove('is-verified');
      setVerifyLabel();
    }
    if (el.email.getAttribute('aria-invalid') === 'true' && EMAIL_RE.test(el.email.value.trim()))
      fieldErr(el.email, 'ct-bk-email-err', '');
  });
  listen(el.email, 'keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      e.preventDefault();
      verifyEmail(false);
    }
  });
  listen(el.name, 'input', () => {
    if (el.name.getAttribute('aria-invalid') === 'true' && el.name.value.trim().length >= 2)
      fieldErr(el.name, 'ct-bk-name-err', '');
  });

  function validStep(n: number): boolean {
    if (n === 1) {
      const a = verifyEmail(true);
      const nm = el.name.value.trim();
      const b = fieldErr(
        el.name,
        'ct-bk-name-err',
        !nm ? C.errors.nameEmpty : nm.length < 2 ? C.errors.nameShort : '',
      );
      if (!a) el.email.focus();
      else if (!b) el.name.focus();
      if (a && b) {
        S.name = nm;
        S.phone = el.phone.value.trim();
        S.company = el.company.value.trim();
      }
      return a && b;
    }
    if (n === 2) {
      const cal = need('#ct-cal');
      if (!S.date) {
        cal.classList.add('is-invalid');
        need('#ct-bk-date-err').textContent = C.errors.date;
        $('.ct-cal__d[tabindex="0"]')?.focus();
        return false;
      }
      if (S.slot == null) {
        el.slots.classList.add('is-invalid');
        need('#ct-bk-slot-err').textContent = C.errors.slot;
        $('.ct-slot')?.focus();
        return false;
      }
      return true;
    }
    if (n === 3) {
      const set = need('.ct-bf--set');
      if (!S.plat) {
        set.classList.add('is-invalid');
        need('#ct-bk-plat-err').textContent = C.errors.platform;
        need('input[name="ct-bk-plat"]').focus();
        return false;
      }
      return true;
    }
    return true;
  }
  $$('[data-bk-next]').forEach((b) =>
    listen(b, 'click', () => {
      if (validStep(step)) goStep(step + 1);
    }),
  );
  $$('[data-bk-prev]').forEach((b) => listen(b, 'click', () => goStep(step - 1)));
  $$<HTMLInputElement>('input[name="ct-bk-plat"]').forEach((r) => {
    listen(r, 'change', () => {
      S.plat = r.value as BookingPlatformValue;
      need('.ct-bf--set').classList.remove('is-invalid');
      need('#ct-bk-plat-err').textContent = '';
      renderRecap();
    });
  });
  listen(el.notes, 'input', () => {
    S.notes = el.notes.value;
  });

  /* ---- calendar (L6537-6588) ---- */
  const today0 = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  };
  const maxDate = () => {
    const t = today0();
    t.setDate(t.getDate() + BOOKING_MAX_DAYS_AHEAD);
    return t;
  };
  const avail = (d: Date) => {
    const w = d.getDay();
    return d > today0() && d <= maxDate() && w !== 0 && w !== 6 && !fullDays.has(ymd(d));
  };
  function firstAvailIn(y: number, m: number): Date | null {
    const d = new Date(y, m, 1);
    while (d.getMonth() === m) {
      if (avail(d)) return d;
      d.setDate(d.getDate() + 1);
    }
    return null;
  }
  function renderCal(focusYmd?: string) {
    const { y, m } = view;
    const first = new Date(y, m, 1);
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const t0 = today0();
    el.month.textContent = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(first);
    let tabYmd: string | null =
      focusYmd ||
      (S.date && parseYmd(S.date).getMonth() === m && parseYmd(S.date).getFullYear() === y
        ? S.date
        : null);
    if (!tabYmd) {
      const fa = firstAvailIn(y, m);
      tabYmd = fa ? ymd(fa) : null;
    }
    let h = '';
    for (let i = 0; i < lead; i++) h += '<span class="ct-cal__pad" aria-hidden="true"></span>';
    for (let dd = 1; dd <= days; dd++) {
      const d = new Date(y, m, dd);
      const k = ymd(d);
      const ok = avail(d);
      const label =
        new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d) + (ok ? '' : C.steps.p2.unavailable);
      h +=
        '<button type="button" class="ct-cal__d' +
        (d.getTime() === t0.getTime() ? ' is-today' : '') +
        '" data-date="' +
        k +
        '" aria-label="' +
        esc(label) +
        '" aria-pressed="' +
        (S.date === k) +
        '" tabindex="' +
        (k === tabYmd ? 0 : -1) +
        '"' +
        (ok ? '' : ' disabled') +
        '>' +
        dd +
        '</button>';
    }
    el.grid.innerHTML = h;
    const now = new Date();
    const mx = maxDate();
    need<HTMLButtonElement>('[data-cal="-1"]').disabled =
      y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth());
    need<HTMLButtonElement>('[data-cal="1"]').disabled =
      y > mx.getFullYear() || (y === mx.getFullYear() && m >= mx.getMonth());
  }
  function moveMonth(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    view = { y: d.getFullYear(), m: d.getMonth() };
    renderCal();
  }
  $$('[data-cal]').forEach((b) => listen(b, 'click', () => moveMonth(+(b.dataset.cal ?? 0))));
  function pickDate(k: string) {
    S.date = k;
    if (S.slot != null && fmtDayTz(S.slot, BOOKING_HOME_TZ) !== k) S.slot = null;
    $$('.ct-cal__d', el.grid).forEach((b) => {
      const on = b.dataset.date === k;
      b.setAttribute('aria-pressed', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    need('#ct-cal').classList.remove('is-invalid');
    need('#ct-bk-date-err').textContent = '';
    renderSlots(true);
    renderRecap();
    announce(C.announce.dateSelected(fmtLongDate(k), el.slots.querySelectorAll('.ct-slot').length));
    if (API_ENABLED) void loadSlots(k);
  }
  listen(el.grid, 'click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('.ct-cal__d');
    if (b && !b.disabled && b.dataset.date) pickDate(b.dataset.date);
  });
  listen(el.grid, 'keydown', (ev) => {
    const e = ev as KeyboardEvent;
    const b = (e.target as Element).closest<HTMLElement>('.ct-cal__d');
    if (!b || !b.dataset.date) return;
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const d = parseYmd(b.dataset.date);
    let target: Date | null = null;
    if (map[e.key]) {
      const step7 = map[e.key];
      const t = new Date(d);
      for (let i = 0; i < 70; i++) {
        t.setDate(t.getDate() + step7);
        if (t > maxDate() || t < today0()) break;
        if (avail(t)) {
          target = new Date(t);
          break;
        }
      }
    } else if (e.key === 'PageDown' || e.key === 'PageUp') {
      const nm = new Date(view.y, view.m + (e.key === 'PageDown' ? 1 : -1), 1);
      target = firstAvailIn(nm.getFullYear(), nm.getMonth());
    } else if (e.key === 'Home' || e.key === 'End') {
      if (e.key === 'Home') target = firstAvailIn(view.y, view.m);
      else {
        const x = new Date(view.y, view.m + 1, 0);
        while (x.getMonth() === view.m) {
          if (avail(x)) {
            target = new Date(x);
            break;
          }
          x.setDate(x.getDate() - 1);
        }
      }
    } else return;
    e.preventDefault();
    if (!target) return;
    if (target.getMonth() !== view.m || target.getFullYear() !== view.y) {
      view = { y: target.getFullYear(), m: target.getMonth() };
      renderCal(ymd(target));
    } else {
      const want = ymd(target);
      $$('.ct-cal__d', el.grid).forEach((x) => {
        x.tabIndex = x.dataset.date === want ? 0 : -1;
      });
    }
    $('.ct-cal__d[data-date="' + ymd(target) + '"]', el.grid)?.focus();
  });

  /* ---- time slots (9AM to 6PM PKT, Mon to Fri) (L6590-6625) ---- */
  function slotsFor(k: string): number[] {
    const p = k.split('-').map(Number);
    const free = API_ENABLED ? freeSlots.get(k + '|' + S.type) : undefined;
    return BOOKING_SLOT_HOURS_PKT.filter((h) => !free || free.includes(h)).map((h) =>
      Date.UTC(p[0], p[1] - 1, p[2], h - BOOKING_PKT_OFFSET_HOURS, 0),
    );
  }
  function renderSlots(animate: boolean) {
    const tz = el.tz.value || LOCAL_TZ;
    if (!S.date) {
      el.slots.innerHTML =
        '<div class="ct-slots__empty"><svg class="i" aria-hidden="true"><use href="#i-calendar"/></svg><span>' +
        esc(C.steps.p2.slotsEmpty) +
        '</span></div>';
      return;
    }
    const day0 = parseYmd(S.date).getTime();
    const list = slotsFor(S.date);
    const sel = S.slot;
    let i = 0;
    el.slots.innerHTML = list
      .map((ms) => {
        const day = fmtDayTz(ms, tz);
        const shift = Math.round((parseYmd(day).getTime() - day0) / 864e5);
        const tag = shift > 0 ? C.steps.p2.nextDay : shift < 0 ? C.steps.p2.prevDay : '';
        const on = sel === ms;
        const label = C.slotLabel(
          fmtTime(ms, tz),
          tag ? fmtShortTz(ms, tz) : '',
          fmtTime(ms, BOOKING_HOME_TZ),
        );
        return (
          '<button type="button" role="radio" class="ct-slot' +
          (animate && !reduce ? ' ct-slot--in' : '') +
          '" style="animation-delay:' +
          i++ * 35 +
          'ms" data-ms="' +
          ms +
          '" aria-checked="' +
          on +
          '" aria-label="' +
          esc(label) +
          '" tabindex="-1">' +
          esc(fmtTime(ms, tz)) +
          (tag ? '<small>' + tag + '</small>' : '') +
          '</button>'
        );
      })
      .join('');
    const focusable = $('.ct-slot[aria-checked="true"]', el.slots) || $('.ct-slot', el.slots);
    if (focusable) focusable.tabIndex = 0;
  }
  function pickSlot(b: HTMLElement) {
    S.slot = +(b.dataset.ms ?? 0);
    $$('.ct-slot', el.slots).forEach((x) => {
      const on = x === b;
      x.setAttribute('aria-checked', String(on));
      x.tabIndex = on ? 0 : -1;
    });
    el.slots.classList.remove('is-invalid');
    need('#ct-bk-slot-err').textContent = '';
    renderRecap();
  }
  listen(el.slots, 'click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('.ct-slot');
    if (b) pickSlot(b);
  });
  listen(el.slots, 'keydown', (ev) => {
    const e = ev as KeyboardEvent;
    const b = (e.target as Element).closest<HTMLElement>('.ct-slot');
    if (!b) return;
    const all = $$('.ct-slot', el.slots);
    const i = all.indexOf(b);
    let n: HTMLElement | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = all[(i + 1) % all.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      n = all[(i - 1 + all.length) % all.length];
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      pickSlot(b);
      return;
    }
    if (n) {
      e.preventDefault();
      pickSlot(n);
      n.focus();
    }
  });
  listen(el.tz, 'change', () => {
    renderSlots(true);
    renderRecap();
    announce(C.announce.zoneChanged(tzName(el.tz.value)));
  });

  /**
   * API mode: asks the server which hours are free on a day and re-renders the slot buttons and
   * the calendar. A failed request keeps the reference's nine slots (the server still rejects a
   * taken one with a 409 on submit).
   */
  async function loadSlots(k: string): Promise<void> {
    const seq = ++slotsSeq;
    const session = S.type;
    let hours: number[];
    try {
      const list = await getBookingSlots(k, session);
      hours = list.map((s) => parseInt(s, 10)).filter((h) => Number.isFinite(h));
    } catch {
      return;
    }
    if (seq !== slotsSeq) return;
    freeSlots.set(k + '|' + session, hours);
    if (S.date !== k || S.type !== session) return;
    if (hours.length === 0) {
      fullDays.add(k);
      S.date = null;
      S.slot = null;
      renderCal();
      renderSlots(false);
      renderRecap();
      need('#ct-bk-date-err').textContent = C.errors.dayFull;
      return;
    }
    if (S.slot != null && !slotsFor(k).includes(S.slot)) S.slot = null;
    renderSlots(false);
    renderRecap();
  }

  /* ---- recap / order summary (L6627-6640) ---- */
  function renderRecap() {
    const T = bookingSession(S.type);
    const tz = el.tz.value || LOCAL_TZ;
    const R = C.recap;
    type Row = [label: string, value: string, filled: boolean, html?: boolean];
    const rows: Row[] = [
      [R.session, T.name + ' (' + T.mins + R.minSuffix + ')', true],
      [R.sessions, S.n + R.times + T.price, true],
      [R.date, S.date ? fmtLongDate(S.date) : R.notPicked, !!S.date],
      [
        R.time,
        S.slot != null
          ? fmtTime(S.slot, tz) +
            '<small>' +
            esc(fmtTime(S.slot, BOOKING_HOME_TZ)) +
            R.inLahore +
            '</small>'
          : R.notPicked,
        S.slot != null,
        true,
      ],
      [R.platform, S.plat || R.notPicked, !!S.plat],
    ];
    const body = (list: Row[]) =>
      list
        .map(
          (r) =>
            '<div' +
            (r[2] ? '' : ' class="is-empty"') +
            '><dt>' +
            r[0] +
            '</dt><dd>' +
            (r[3] && r[2] ? r[1] : esc(r[1])) +
            '</dd></div>',
        )
        .join('') +
      '<div class="ct-recap-total"><dt>' +
      R.total +
      '</dt><dd>$' +
      T.price * S.n +
      '</dd></div>';
    $$('[data-recap]').forEach((dl) => {
      dl.innerHTML = body(dl.dataset.recap === 'short' ? rows.slice(1) : rows);
    });
  }

  /* ---- complete (L6642-6691) ---- */
  function bookingData(): BookingRequest {
    const T = bookingSession(S.type);
    const tz = el.tz.value;
    const slot = S.slot ?? 0;
    return {
      sessionType: S.type,
      sessionName: T.name,
      durationMinutes: T.mins,
      pricePerSession: T.price,
      sessions: S.n,
      total: T.price * S.n,
      currency: 'USD',
      email: S.email,
      name: S.name,
      phone: S.phone,
      company: S.company,
      date: S.date ?? '',
      timezone: tz,
      startUtc: new Date(slot).toISOString(),
      timeLocal: fmtTime(slot, tz),
      timeLahore: fmtTime(slot, BOOKING_HOME_TZ),
      platform: (S.plat || 'Google Meet') as BookingPlatformValue,
      notes: (el.notes.value || '').trim(),
    };
  }
  function mailInput(d: BookingRequest) {
    return {
      sessionName: d.sessionName,
      durationMinutes: d.durationMinutes,
      sessions: d.sessions,
      total: d.total,
      dateLong: fmtLongDate(d.date),
      timeLocal: d.timeLocal,
      timezoneName: tzName(d.timezone),
      timeLahore: d.timeLahore,
      platform: d.platform,
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company,
      notes: d.notes,
    };
  }
  function finish(viaMail: boolean, d: BookingRequest) {
    const D = C.done;
    const t3 = need('#ct-bk-t3');
    t3.textContent = viaMail ? D.titleMail : D.titleHook;
    need('#ct-bk-done-msg').textContent = viaMail ? D.msgMail(d.email) : D.msgHook(d.email);
    need('#ct-bk-ticket').innerHTML =
      '<dl class="ct-recap-dl">' +
      '<div><dt>' +
      D.ticket.session +
      '</dt><dd>' +
      esc(d.sessionName) +
      D.ticket.times +
      d.sessions +
      '</dd></div>' +
      '<div><dt>' +
      D.ticket.when +
      '</dt><dd>' +
      esc(fmtLongDate(d.date)) +
      '<small>' +
      esc(d.timeLocal + D.ticket.yourTime + d.timeLahore + D.ticket.inLahore) +
      '</small></dd></div>' +
      '<div><dt>' +
      D.ticket.platform +
      '</dt><dd>' +
      esc(d.platform) +
      '</dd></div>' +
      '<div><dt>' +
      D.ticket.total +
      '</dt><dd>$' +
      d.total +
      '</dd></div></dl>';
    screens.done.classList.remove('is-drawn');
    void showScreen('done', true, 1).then(() => t3.focus({ preventScroll: true }));
    const id = requestAnimationFrame(() => screens.done.classList.add('is-drawn'));
    add(() => cancelAnimationFrame(id));
    env.toast(viaMail ? C.toasts.mail : C.toasts.sent);
  }
  const unbusy = () => {
    busy = false;
    el.complete.classList.remove('is-loading');
    el.complete.removeAttribute('aria-busy');
  };
  listen(el.complete, 'click', () => {
    if (busy || !validStep(3)) return;
    const d = bookingData();
    const viaMail = !API_ENABLED;
    busy = true;
    el.complete.classList.add('is-loading');
    el.complete.setAttribute('aria-busy', 'true');
    let job: Promise<unknown>;
    if (viaMail) {
      const input = mailInput(d);
      openMail(bookingMailSubject(input), bookingMailBody(input));
      job = wait(700);
    } else {
      // One key per attempt: a retry of the same booking reuses it, so the server never books twice.
      const sig = JSON.stringify(d);
      if (!attempt || attempt.sig !== sig) attempt = { sig, key: newIdempotencyKey() };
      job = Promise.all([postBooking(d, attempt.key), wait(400)]);
    }
    job.then(
      () => {
        attempt = null;
        unbusy();
        finish(viaMail, d);
      },
      (err: unknown) => {
        unbusy();
        if (isApiError(err, 'SLOT_TAKEN')) {
          attempt = null;
          S.slot = null;
          freeSlots.delete(d.date + '|' + S.type);
          goStep(2);
          need('#ct-bk-slot-err').textContent = C.errors.slotTaken;
          el.slots.classList.add('is-invalid');
          void loadSlots(d.date).then(() => {
            need('#ct-bk-slot-err').textContent = C.errors.slotTaken;
          });
          return;
        }
        env.toast(C.toasts.failed);
        announce(C.announce.failed);
      },
    );
  });
  listen(need('#ct-bk-again'), 'click', () => {
    reset(S.type, true);
    void showScreen('pick', true, -1).then(() => {
      $<HTMLInputElement>('input[name="ct-bk-type"]:checked')?.focus({ preventScroll: true });
    });
  });

  /* ---- public API (L6693-6703) ---- */
  buildZones();
  reset('quick', false);
  void showScreen('pick', false);

  return {
    open(type) {
      reset(type === 'deep' ? 'deep' : 'quick', false);
      cur = 'pick';
      void showScreen('pick', false);
      panel.scrollTop = 0;
      timeout(
        () => {
          $<HTMLInputElement>('input[name="ct-bk-type"]:checked')?.focus({ preventScroll: true });
        },
        reduce ? 70 : 90,
      );
    },
    dispose() {
      cancelAnimationFrame(raf);
      while (disposers.length) disposers.pop()?.();
    },
  };
}
