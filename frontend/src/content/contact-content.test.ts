/**
 * Contact, booking and chat content (contact.ts, booking.ts, chat-knowledge.ts) against the
 * reference design.
 *
 * 1. Every copy string (length >= 3) appears verbatim in the reference text, apart from a short
 *    allowlist; templated copy is checked piece by piece around its dynamic values.
 * 2. The reference's own data literals (PLACES, ZONES, NAMES, TYPES, START, PROJECTS, A, KB,
 *    INTENTS) and its template functions (summary, mailBody, gmtLabel) are evaluated straight
 *    from the reference script and compared with the typed data, so order and numbers are proven.
 * 3. Count checks from REFERENCE_MAP.md, the documented deviations, and purity (no React, no DOM).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  collectStrings,
  normalizeSpace,
  referenceSource,
  referenceText,
  type StringLeaf,
} from '../../tests/unit/referenceText';
import {
  BOOKING_COPY,
  BOOKING_CURRENCY,
  BOOKING_CURRENCY_SYMBOL,
  BOOKING_DEFAULT_SESSION,
  BOOKING_EXPECT,
  BOOKING_HOME_TZ,
  BOOKING_MAX_DAYS_AHEAD,
  BOOKING_PKT_OFFSET_HOURS,
  BOOKING_PLATFORMS,
  BOOKING_SESSIONS,
  BOOKING_SESSIONS_MAX,
  BOOKING_SESSIONS_MIN,
  BOOKING_SLOT_HOURS_PKT,
  BOOKING_ZONE_NAMES,
  BOOKING_ZONES,
  bookingGmtLabel,
  bookingMailBody,
  bookingMailSubject,
  bookingSession,
  bookingZoneName,
  bookingZoneOption,
  type BookingMailInput,
} from './booking';
import {
  CHAT_ACTIONS,
  CHAT_CV_URL,
  CHAT_EMAIL,
  CHAT_GREETING,
  CHAT_INTENTS,
  CHAT_KB,
  CHAT_PROJECTS,
  CHAT_REVIEWS,
  CHAT_START_CHIPS,
  CHAT_UI,
  chatReviewLine,
  lahoreTime,
  projectReply,
  type ChatIntentId,
  type ChatReply,
} from './chat-knowledge';
import {
  budgets,
  clockCard,
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  CONTACT_PHONE,
  contactFormCopy,
  contactFormMessages,
  contactFormRules,
  contactHero,
  contactKicker,
  contactMailBody,
  contactMailSubject,
  contactMethodCtaIcon,
  contactMethods,
  defaultRegionLatitude,
  LAHORE_MAP_URL,
  lahoreGlobe,
  lahoreMap,
  lahoreOffsetMinutes,
  orbCopy,
  projectTypes,
  regionLatitudes,
  unknownZoneLonLimit,
  utcPlace,
  utcZonePattern,
  visitorPlaces,
  type ContactMailData,
} from './contact';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_FILES = ['contact.ts', 'booking.ts', 'chat-knowledge.ts'] as const;

const TEXT = referenceText();
const TEXT_COLLAPSED = referenceText({ collapseWhitespace: true });
const SOURCE = referenceSource();

/** A fixed instant (the visual harness clock): 2026-03-10 14:00 in Lahore. */
const NOW = new Date('2026-03-10T09:00:00Z');

/* ---------------------------------------------------------------- helpers */

function inReference(value: string): boolean {
  return TEXT.includes(value) || TEXT_COLLAPSED.includes(normalizeSpace(value));
}

/**
 * Splits a resolved template around its dynamic values and returns the static pieces that are long
 * enough to prove anything (length >= 3 after the split).
 */
function staticPieces(value: string, dynamic: readonly string[]): string[] {
  let parts = [value];
  // Longest first, so a value that contains another (tags "React.js, ..." vs cat "React.js") wins.
  const tokens = [...dynamic].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const token of tokens) parts = parts.flatMap((p) => p.split(token));
  return parts.filter((p) => p.trim().length >= 3);
}

/** Asserts a copy leaf is in the reference, verbatim or (with dynamic values) piece by piece. */
function expectCopy(path: string, value: string, dynamic: readonly string[] = []): void {
  if (inReference(value)) return;
  const pieces = staticPieces(value, dynamic);
  expect(pieces.length, `${path}: "${value}" is not in the reference`).toBeGreaterThan(0);
  for (const piece of pieces) {
    expect(inReference(piece), `${path}: piece "${piece}" of "${value}" not in the reference`).toBe(
      true,
    );
  }
}

/** Index of the bracket that closes the one at `open`, skipping strings and comments. */
function matchBracket(src: string, open: number): number {
  const pairs: Record<string, string> = { '{': '}', '[': ']', '(': ')' };
  const stack: string[] = [];
  for (let i = open; i < src.length; i++) {
    const c = src[i]!;
    if (c === "'" || c === '"' || c === '`') {
      for (i++; i < src.length && src[i] !== c; i++) if (src[i] === '\\') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      i = src.indexOf('\n', i);
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i) + 1;
      continue;
    }
    if (pairs[c]) stack.push(pairs[c]!);
    else if (c === '}' || c === ']' || c === ')') {
      expect(stack.pop(), `bracket balance at ${i}`).toBe(c);
      if (stack.length === 0) return i;
    }
  }
  throw new Error('no matching bracket');
}

/** The source of the literal after `marker` (for example "var ZONES = "), brackets included. */
function literalAfter(marker: string, from = 0): string {
  const at = SOURCE.indexOf(marker, from);
  expect(at, `reference marker "${marker}"`).toBeGreaterThan(-1);
  const open = at + marker.length;
  expect('{[('.includes(SOURCE[open]!), `literal after "${marker}"`).toBe(true);
  return SOURCE.slice(open, matchBracket(SOURCE, open) + 1);
}

/** The source of `function name(args){ ... }` in the reference, from `from` on. */
function functionSource(signature: string, from = 0): string {
  const at = SOURCE.indexOf(signature, from);
  expect(at, `reference function "${signature}"`).toBeGreaterThan(-1);
  const open = SOURCE.indexOf('{', at + signature.length - 1);
  return SOURCE.slice(at, matchBracket(SOURCE, open) + 1);
}

/**
 * Evaluates a reference data literal or function with the given free variables. Test only: the
 * source is always a slice of the read only reference file in this repo (never user input), so
 * the typed data can be compared with the reference's own values instead of a hand copy.
 */
function evalReference<T>(source: string, scope: Record<string, unknown> = {}): T {
  const names = Object.keys(scope);
  const run = new Function(...names, `'use strict'; return (${source});`) as (
    ...args: unknown[]
  ) => T;
  return run(...names.map((n) => scope[n]));
}

/** Start of the contact, booking and chat scripts, so markers resolve inside the right part. */
const HERO_JS = SOURCE.indexOf('function hero(){');
const BOOKING_JS = SOURCE.indexOf('(function booking(){');
const CHAT_JS = SOURCE.indexOf('(function chat(){');

function pad(n: number): string {
  return (n < 10 ? '0' : '') + n;
}

/* ---------------------------------------------------------------- copy strings */

/** Every exported data object whose string leaves are copy (functions are checked below). */
const CONTACT_EXPORTS = {
  contactHero,
  clockCard,
  orbCopy,
  contactKicker,
  contactMethods,
  contactMethodCtaIcon,
  lahoreMap,
  projectTypes,
  budgets,
  contactFormCopy,
  contactFormMessages,
};

const BOOKING_EXPORTS = {
  BOOKING_SESSIONS,
  BOOKING_CURRENCY,
  BOOKING_EXPECT,
  BOOKING_PLATFORMS,
  BOOKING_HOME_TZ,
  BOOKING_ZONES,
  BOOKING_ZONE_NAMES,
  BOOKING_COPY,
};

/** Replies resolved at a fixed instant; location's time is dynamic. */
const KB_RESOLVED = Object.fromEntries(
  (Object.keys(CHAT_KB) as ChatIntentId[]).map((id) => [id, CHAT_KB[id](NOW)]),
) as Record<ChatIntentId, ChatReply>;

const CHAT_EXPORTS = {
  CHAT_EMAIL,
  CHAT_GREETING,
  CHAT_START_CHIPS,
  CHAT_UI,
  CHAT_PROJECTS,
  CHAT_ACTIONS,
  CHAT_REVIEWS,
  CHAT_KB: KB_RESOLVED,
  CHAT_INTENTS,
};

/**
 * Leaves that are not copied text: the two slot errors API_CONTRACT.md adds (not in the
 * reference), and intent ids that are only object keys in the reference.
 */
const ALLOWLIST: readonly RegExp[] = [
  /^BOOKING_COPY\.errors\.(slotTaken|dayFull)$/,
  /^CHAT_INTENTS\[\d+\]\.id$/,
];

/** The optional clock sentence of the location reply (checked against the raw source below). */
const LOCATION_TAIL = ' It is ' + lahoreTime(NOW) + ' there right now.';

/** Dynamic values inside resolved copy (checked piece by piece around them). */
const DYNAMIC = [CONTACT_EMAIL, LOCATION_TAIL];

function copyLeaves(): StringLeaf[] {
  return [
    ...collectStrings(CONTACT_EXPORTS),
    ...collectStrings(BOOKING_EXPORTS),
    ...collectStrings(CHAT_EXPORTS),
  ].filter((leaf) => leaf.value.trim().length >= 3 && !ALLOWLIST.some((re) => re.test(leaf.path)));
}

describe('copy strings', () => {
  it('finds every copy string (length >= 3) in the reference', () => {
    const leaves = copyLeaves();
    expect(leaves.length).toBeGreaterThan(400);
    for (const leaf of leaves) expectCopy(leaf.path, leaf.value, DYNAMIC);
  });

  it('keeps the allowlist short and every allowlisted leaf real', () => {
    const all = [...collectStrings(BOOKING_EXPORTS), ...collectStrings(CHAT_EXPORTS)].filter((l) =>
      ALLOWLIST.some((re) => re.test(l.path)),
    );
    expect(all.length).toBe(2 + CHAT_INTENTS.length);
    expect(BOOKING_COPY.errors.slotTaken).toBe(
      'That time was just taken. Please pick another slot.',
    );
    expect(BOOKING_COPY.errors.dayFull).toBe(
      'That day is fully booked. Please pick another weekday.',
    );
  });

  it('checks templated copy piece by piece', () => {
    const S = '\u0001';
    const N1 = 987654;
    const N2 = 123457;
    const dyn = [S, String(N1), String(N2)];
    const templates: Array<[string, string]> = [
      ['clockCard.behind', clockCard.behind(S)],
      ['clockCard.ahead', clockCard.ahead(S)],
      ['clockCard.backIn', clockCard.backIn(N1, N2)],
      ['clockCard.backDay', clockCard.backDay(S)],
      ['clockCard.srLine', clockCard.srLine(S, S, S)],
      ['orbCopy.youWithCity', orbCopy.youWithCity(S)],
      ['contactFormCopy.done.title', contactFormCopy.done.title(S)],
      ['contactFormCopy.done.message', contactFormCopy.done.message(S)],
      ['BOOKING_COPY.done.msgHook', BOOKING_COPY.done.msgHook(S)],
      ['BOOKING_COPY.done.msgMail', BOOKING_COPY.done.msgMail(S)],
      ['BOOKING_COPY.announce.typeSelected', BOOKING_COPY.announce.typeSelected(S, N1)],
      ['BOOKING_COPY.announce.step', BOOKING_COPY.announce.step(N1)],
      ['BOOKING_COPY.announce.dateSelected', BOOKING_COPY.announce.dateSelected(S, N1)],
      ['BOOKING_COPY.announce.zoneChanged', BOOKING_COPY.announce.zoneChanged(S)],
      ['BOOKING_COPY.slotLabel', BOOKING_COPY.slotLabel(S, S, S)],
      ['bookingZoneOption', bookingZoneOption(S, S, true)],
      ['contactMailSubject', contactMailSubject({ name: S, projectType: S })],
      ['bookingMailSubject', bookingMailSubject({ sessionName: S, dateLong: S })],
    ];
    for (const [path, value] of templates) expectCopy(path, value, dyn.concat(DYNAMIC));
    for (const p of CHAT_PROJECTS) {
      const r = projectReply(p);
      const values = [p.name, p.cat, p.d, p.live, p.tags, ...(p.src ? [p.src] : [])];
      // The links line is conditional; the reference projectReply itself is compared below.
      for (const [i, line] of r.p!.slice(0, 2).entries()) {
        expectCopy(`projectReply(${p.name}).p[${i}]`, line, values);
      }
    }
  });

  it('keeps the conditional pieces exactly as the reference script writes them', () => {
    const fragments = [
      "(n === 1 ? ' session' : ' sessions') + '. Total $' + TYPES[S.type].price * n",
      "(t ? ' It is ' + t + ' there right now.' : '')",
      "'Offline, back in ' + (uh ? uh + 'h ' : '') + um + 'm'",
      "(tag ? ', ' + fmtShortTz(ms, tz) : '') + ' your time, ' + fmtTime(ms, 'Asia/Karachi') + ' in Lahore'",
      "var mine = r.z === LOCAL_TZ ? ' (your zone)' : '';",
    ];
    for (const f of fragments) expect(SOURCE, f).toContain(f);
    expect(KB_RESOLVED.location.p![0]).toBe(
      'Faisal is based in **Lahore, Pakistan** (GMT+5, PKT) and works with clients worldwide.' +
        LOCATION_TAIL,
    );
  });

  it('writes the singular session announcement like the reference', () => {
    expect(BOOKING_COPY.announce.count(1, 15)).toBe('1 session. Total $15');
    expect(BOOKING_COPY.announce.count(3, 75)).toBe('3 sessions. Total $75');
    expect(BOOKING_COPY.announce.step(2)).toBe('Step 2 of 3');
    expect(clockCard.backIn(0, 5)).toBe('Offline, back in 5m');
    expect(clockCard.backIn(2, 0)).toBe('Offline, back in 2h 0m');
  });

  it('has no em dash anywhere (the reference has none in these parts)', () => {
    const leaves = [
      ...collectStrings(CONTACT_EXPORTS),
      ...collectStrings(BOOKING_EXPORTS),
      ...collectStrings(CHAT_EXPORTS),
    ];
    for (const leaf of leaves) expect(leaf.value, leaf.path).not.toContain('\u2014');
    for (const file of SOURCE_FILES) {
      const src = readFileSync(resolve(HERE, file), 'utf8');
      expect(src, file).not.toContain('\u2014');
      expect(src, file).not.toContain('\\u2014');
    }
  });
});

/* ---------------------------------------------------------------- reference literals */

describe('contact data equals the reference', () => {
  it('copies PLACES (62 zones, same order and numbers)', () => {
    const ref = evalReference<Record<string, [number, number]>>(
      literalAfter('var PLACES = ', HERO_JS),
    );
    expect(Object.keys(visitorPlaces)).toEqual(Object.keys(ref));
    expect(visitorPlaces).toEqual(ref);
    expect(Object.keys(visitorPlaces)).toHaveLength(62);
  });

  it('copies the globe fallbacks and the Lahore point', () => {
    const hero = SOURCE.slice(HERO_JS, HERO_JS + 6000);
    expect(hero).toContain('var LHR = { lat:31.52, lon:74.36 }, PKT = 300;');
    expect(lahoreGlobe).toEqual({ lat: 31.52, lon: 74.36 });
    expect(lahoreOffsetMinutes).toBe(300);
    expect(hero).toContain(`/${utcZonePattern.source}/.test(tz)`);
    expect(hero).toContain("if (city === 'UTC') return { lat:51.5, lon:-.1 };");
    expect(utcPlace).toEqual({ lat: 51.5, lon: -0.1 });
    const regions = evalReference<Record<string, number>>(
      literalAfter('lat = ', hero.indexOf("var reg = tz.split('/')[0]") + HERO_JS),
    );
    expect(regionLatitudes).toEqual(regions);
    expect(Object.keys(regionLatitudes)).toEqual(Object.keys(regions));
    expect(hero).toContain(`lat: lat == null ? ${defaultRegionLatitude} : lat`);
    expect(hero).toContain(
      `Math.max(-${unknownZoneLonLimit}, Math.min(${unknownZoneLonLimit}, myOff / 4))`,
    );
    for (const tz of ['UTC', 'Etc/UTC', 'GMT', 'Etc/GMT', 'Zulu', 'Universal', 'UCT']) {
      expect(utcZonePattern.test(tz), tz).toBe(true);
    }
    expect(utcZonePattern.test('Europe/London')).toBe(false);
  });

  it('builds the contact mail exactly like summary() and the enquiry subject', () => {
    const summary = evalReference<(d: ContactMailData) => string>(
      functionSource('function summary(d){'),
    );
    const full: ContactMailData = {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+44 20 7946 0000',
      company: 'Analytical Engines',
      projectType: 'Maintenance & Support',
      budget: '$1,000 - $5,000',
      details: 'A short brief about the project, long enough.',
    };
    const bare: ContactMailData = { ...full, phone: '', company: '', budget: '' };
    expect(contactMailBody(full)).toBe(summary(full));
    expect(contactMailBody(bare)).toBe(summary(bare));
    expect(SOURCE).toContain(
      "openMail('New project enquiry: ' + data.projectType + ' from ' + data.name, summary(data));",
    );
    expect(contactMailSubject(full)).toBe(
      'New project enquiry: Maintenance & Support from Ada Lovelace',
    );
  });

  it('keeps the validation rules of the reference', () => {
    const rules = SOURCE.slice(SOURCE.indexOf('var rules = {'), SOURCE.indexOf('function setErr('));
    expect(rules).toContain(`if (v && !${contactFormRules.phonePattern.toString()}.test(v))`);
    expect(rules).toContain(`if (v.length < ${contactFormRules.nameMin}) return`);
    expect(rules).toContain(`if (v.length < ${contactFormRules.detailsMin}) return`);
    expect(SOURCE).toContain(
      `count.classList.toggle('is-near', n > ${contactFormCopy.detailsNearAt});`,
    );
    expect(SOURCE).toContain(`maxlength="${contactFormCopy.detailsMax}"`);
    for (const [key, f] of Object.entries(contactFormCopy.fields)) {
      expect(SOURCE, key).toContain(`id="ct-${key}" name="${key}"`);
      expect(SOURCE, key).toContain(`maxlength="${f.maxLength}"`);
    }
  });

  it('matches the hero stats, methods and options markup', () => {
    for (const s of contactHero.stats) {
      expect(TEXT).toContain(
        `<dt>${s.label}</dt><dd class="stat-num"><span data-ct-count="${s.to}" data-suffix="${s.suffix}">${s.to}${s.suffix}</span>`,
      );
    }
    for (const m of contactMethods) {
      expect(TEXT).toContain(
        `<use href="#${m.icon}"/></svg></span><span class="ct-method__no mono" aria-hidden="true">${m.no}</span>`,
      );
      expect(TEXT).toContain(`<use href="#${m.note.icon}"/></svg>${m.note.text}</p>`);
    }
    for (const t of projectTypes) {
      expect(TEXT).toContain(
        `value="${t.value}" aria-describedby="ct-type-err"><span class="ct-opt__box"><span class="ct-opt__ic"><svg class="i"><use href="#${t.icon}"/></svg></span><span class="ct-opt__t">${t.title}</span><span class="ct-opt__s">${t.subtitle}</span>`,
      );
    }
    for (const b of budgets) {
      expect(TEXT).toContain(
        `value="${b.value}"><span class="ct-opt__box"><span class="ct-opt__amt">${b.amount}</span><span class="ct-opt__s">${b.subtitle}</span>`,
      );
    }
  });
});

describe('booking data equals the reference', () => {
  it('copies TYPES into BOOKING_SESSIONS (same order, names, durations, prices, icons)', () => {
    const ref = evalReference<Record<string, Record<string, unknown>>>(
      literalAfter('var TYPES = ', BOOKING_JS),
    );
    expect(BOOKING_SESSIONS.map((s) => s.id)).toEqual(Object.keys(ref));
    for (const s of BOOKING_SESSIONS) {
      expect({ name: s.name, dur: s.dur, mins: s.mins, price: s.price, icon: s.icon }).toEqual(
        ref[s.id],
      );
      // Card markup: pill, name, price, description and the check list, in this order.
      expect(TEXT).toContain(`<input type="radio" name="ct-bk-type" value="${s.id}">`);
      expect(TEXT).toContain(
        `<use href="#${s.icon}"/></svg></span><span class="ct-sess__dur mono">${s.dur}</span>`,
      );
      expect(TEXT).toContain(`<span class="ct-sess__name">${s.name}</span>`);
      expect(TEXT).toContain(
        `<span class="ct-sess__price"><b>$${s.price}</b>${BOOKING_COPY.pick.perSession}</span>`,
      );
      expect(TEXT).toContain(`<span class="ct-sess__desc">${s.desc}</span>`);
      const list = s.features
        .map(
          (f) => `<span><svg class="i" aria-hidden="true"><use href="#i-check"/></svg>${f}</span>`,
        )
        .join('');
      expect(TEXT).toContain(`<span class="ct-sess__list">${list}</span>`);
    }
    expect(bookingSession('deep').name).toBe('Technical Deep Dive');
    expect(bookingSession('anything').id).toBe(BOOKING_DEFAULT_SESSION);
    expect(BOOKING_DEFAULT_SESSION).toBe('quick');
  });

  it('copies ZONES (23, source order) and NAMES', () => {
    const zones = evalReference<string[]>(literalAfter('var ZONES = ', BOOKING_JS));
    expect(BOOKING_ZONES).toEqual(zones);
    expect(BOOKING_ZONES).toHaveLength(23);
    const names = evalReference<Record<string, string>>(literalAfter('var NAMES = ', BOOKING_JS));
    expect(BOOKING_ZONE_NAMES).toEqual(names);
    expect(Object.keys(BOOKING_ZONE_NAMES)).toEqual(Object.keys(names));
  });

  it('labels zones like gmtLabel() and the NAMES fallback', () => {
    const gmtLabel = evalReference<(min: number | null) => string>(
      functionSource('function gmtLabel(min){', BOOKING_JS),
      { pad },
    );
    for (const min of [300, 330, 345, 0, -180, -240, -210, 60, 780, -600, null]) {
      expect(bookingGmtLabel(min), String(min)).toBe(gmtLabel(min));
    }
    const refName = (z: string): string =>
      BOOKING_ZONE_NAMES[z] || (z.split('/').pop() ?? z).replace(/_/g, ' ');
    expect(SOURCE).toContain("var name = NAMES[r.z] || r.z.split('/').pop().replace(/_/g,' ');");
    for (const z of [...BOOKING_ZONES, 'Asia/Ho_Chi_Minh', 'America/Argentina/Buenos_Aires']) {
      expect(bookingZoneName(z), z).toBe(refName(z));
    }
    expect(bookingZoneOption('GMT+5', 'Pakistan (PKT)', true)).toBe(
      'GMT+5 · Pakistan (PKT) (your zone)',
    );
    expect(bookingZoneOption('GMT+0', 'UTC', false)).toBe('GMT+0 · UTC');
  });

  it('keeps the slot hours, window, stepper range and currency of the reference', () => {
    const slotsFor = evalReference<(k: string) => number[]>(
      functionSource('function slotsFor(k){', BOOKING_JS),
    );
    const k = '2026-03-11';
    const [y, m, d] = k.split('-').map(Number) as [number, number, number];
    expect(
      BOOKING_SLOT_HOURS_PKT.map((h) => Date.UTC(y, m - 1, d, h - BOOKING_PKT_OFFSET_HOURS, 0)),
    ).toEqual(slotsFor(k));
    expect(BOOKING_SLOT_HOURS_PKT).toHaveLength(9);
    expect(SOURCE).toContain(`t.setDate(t.getDate() + ${BOOKING_MAX_DAYS_AHEAD}); return t;`);
    expect(SOURCE).toContain(
      `var n = Math.max(${BOOKING_SESSIONS_MIN}, Math.min(${BOOKING_SESSIONS_MAX}, S.n + (+b.dataset.bkStep)));`,
    );
    expect(SOURCE).toContain(`currency: '${BOOKING_CURRENCY}'`);
    expect(SOURCE).toContain(`el.total.textContent = '${BOOKING_CURRENCY_SYMBOL}' + to;`);
    expect(SOURCE).toContain(`var LOCAL_TZ = '${BOOKING_HOME_TZ}';`);
  });

  it('matches the expect list, platforms and step markup', () => {
    for (const e of BOOKING_EXPECT) {
      expect(TEXT).toContain(
        `<li><span class="icon-tile icon-tile--soft"><svg class="i"><use href="#${e.icon}"/></svg></span><div><strong>${e.title}</strong><p>${e.text}</p></div></li>`,
      );
    }
    for (const p of BOOKING_PLATFORMS) {
      expect(TEXT).toContain(
        `<input type="radio" name="ct-bk-plat" value="${p.value}"><span class="ct-plat__box"><span class="ct-plat__ic"><svg class="i"><use href="#${p.icon}"/></svg></span><span><strong>${p.title}</strong><small>${p.sub}</small></span>`,
      );
    }
    BOOKING_COPY.steps.labels.forEach((label, i) => {
      expect(TEXT).toContain(
        `<span>${i + 1}</span><svg class="i"><use href="#i-check"/></svg></span><span class="ct-steps__l">${label}</span>`,
      );
    });
    expect(TEXT).toContain(
      `<div class="ct-cal__dow" aria-hidden="true">${BOOKING_COPY.steps.p2.dow.map((d) => `<span>${d}</span>`).join('')}</div>`,
    );
    expect(SOURCE).toContain(`maxlength="${BOOKING_COPY.steps.p3.notesMax}"`);
  });

  it('builds the booking mail exactly like mailBody() and the request subject', () => {
    const dateLong = 'Wed, Mar 11, 2026';
    const zoneName = 'GMT+0 · London';
    const mailBody = evalReference<(d: Record<string, unknown>) => string>(
      functionSource('function mailBody(d){', BOOKING_JS),
      { fmtLongDate: () => dateLong, tzName: () => zoneName },
    );
    const base: BookingMailInput = {
      sessionName: 'Technical Deep Dive',
      durationMinutes: 60,
      sessions: 2,
      total: 50,
      dateLong,
      timeLocal: '9:00 AM',
      timezoneName: zoneName,
      timeLahore: '2:00 PM',
      platform: 'Google Meet',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+44 20 7946 0000',
      company: 'Analytical Engines',
      notes: 'Two lines\nof notes',
    };
    const bare: BookingMailInput = { ...base, phone: '', company: '', notes: '' };
    for (const d of [base, bare]) {
      const refInput = { ...d, date: '2026-03-11', timezone: 'Europe/London' };
      expect(bookingMailBody(d)).toBe(mailBody(refInput));
    }
    expect(SOURCE).toContain(
      "openMail('Meeting request: ' + d.sessionName + ' on ' + fmtLongDate(d.date), mailBody(d));",
    );
    expect(bookingMailSubject(base)).toBe('Meeting request: Technical Deep Dive on ' + dateLong);
  });

  it('points the support link and the done copy at the reference texts', () => {
    expect(BOOKING_COPY.done.supportHref).toBe(
      'mailto:mehrfaisal111@gmail.com?subject=Booking%20support',
    );
    expect(BOOKING_COPY.done.msgHook('a@b.co')).toBe(
      'Your booking went through. The confirmation and meeting link are on their way to a@b.co.',
    );
    expect(BOOKING_COPY.done.titleHook).toBe('Booking sent!');
    expect(BOOKING_COPY.done.titleMail).toBe('Request ready!');
    expect(TEXT).toContain(`tabindex="-1">${BOOKING_COPY.done.titleDefault}</h2>`);
  });
});

describe('chat knowledge equals the reference', () => {
  /** The reference's A, with the documented CV deviation injected as its CV variable. */
  const refActions = evalReference<Record<string, Record<string, unknown>>>(
    literalAfter('var A = ', CHAT_JS),
    { CV: CHAT_CV_URL, EMAIL: CONTACT_EMAIL },
  );
  const refStart = evalReference<string[]>(literalAfter('var START = ', CHAT_JS));
  const refLahoreTime = () => lahoreTime(NOW);
  const refKB = evalReference<Record<string, () => ChatReply>>(literalAfter('var KB = ', CHAT_JS), {
    A: refActions,
    START: refStart,
    EMAIL: CONTACT_EMAIL,
    lahoreTime: refLahoreTime,
  });

  it('serves the CV from the same origin (orchestrator decision)', () => {
    expect(CHAT_CV_URL).toBe('/imgs/Faisal-CVS.pdf');
    // The reference builds the absolute URL instead; this is the one documented deviation.
    expect(SOURCE).toContain(
      "var CV = FH.asset ? FH.asset('imgs/Faisal-CVS.pdf') : 'https://faisalhanif.work/imgs/Faisal-CVS.pdf';",
    );
    expect(CHAT_ACTIONS.cv.href).toBe(CHAT_CV_URL);
  });

  it('copies the greeting, START chips and the email', () => {
    expect(CHAT_START_CHIPS).toEqual(refStart);
    expect(SOURCE).toContain(`var r = { p:["${CHAT_GREETING}"], chips:START };`);
    expect(SOURCE).toContain(`var EMAIL = '${CHAT_EMAIL}';`);
    expect(CHAT_UI.avatar).toBe('FH');
    expect(TEXT).toContain(`maxlength="${CHAT_UI.maxLength}"`);
    expect(TEXT).toContain(`placeholder="${CHAT_UI.placeholder}"`);
  });

  it('copies PROJECTS (14, same order, keywords and links)', () => {
    const ref = evalReference<unknown[]>(literalAfter('var PROJECTS = ', CHAT_JS));
    expect(CHAT_PROJECTS).toEqual(ref);
  });

  it('copies the action buttons A', () => {
    expect(Object.keys(CHAT_ACTIONS)).toEqual(Object.keys(refActions));
    expect(CHAT_ACTIONS).toEqual(refActions);
    expect(CHAT_ACTIONS.mail.href).toBe(CONTACT_MAILTO);
    expect(CHAT_ACTIONS.map.href).toBe(LAHORE_MAP_URL);
  });

  it('copies every KB reply word for word, with its actions and chips', () => {
    expect(Object.keys(CHAT_KB)).toEqual(Object.keys(refKB));
    for (const id of Object.keys(CHAT_KB) as ChatIntentId[]) {
      expect(CHAT_KB[id](NOW), id).toEqual(refKB[id]!());
    }
    expect(CHAT_KB.contact().list![1]).toBe(
      'Phone: [' +
        CONTACT_PHONE.display +
        '](' +
        CONTACT_PHONE.href +
        '), Mon-Fri, 9AM-6PM (GMT+5)',
    );
  });

  it('builds every project card like projectReply()', () => {
    const ref = evalReference<(p: unknown) => ChatReply>(
      functionSource('function projectReply(p){', CHAT_JS),
      { A: refActions },
    );
    for (const p of CHAT_PROJECTS) expect(projectReply(p), p.name).toEqual(ref(p));
    expect(projectReply(CHAT_PROJECTS[3]!).p).toEqual([
      '**GitPulse** (Next.js): GitHub activity tracking platform for coding bootcamps, with role-based dashboards, cohort management, scoring and leaderboards.',
      'Built with Next.js, React, GitHub API, Role-Based Access.',
      '[Live preview](https://gitpulseee.netlify.app/) · [Source](https://github.com/FaisalHanif12/GitPulse-)',
    ]);
  });

  it('copies INTENTS (same order, keywords and weights)', () => {
    const ref = evalReference<unknown[]>(literalAfter('var INTENTS = ', CHAT_JS));
    expect(CHAT_INTENTS).toEqual(ref);
  });

  it('marks the unconfirmed reviews and keeps the review lines', () => {
    expect(CHAT_REVIEWS.filter((r) => r.needsConfirmation).map((r) => r.name)).toEqual([
      'Sarah Johnson',
      'Emily Rodriguez',
    ]);
    expect(CHAT_KB.reviews().list).toEqual(CHAT_REVIEWS.map(chatReviewLine));
  });

  it('keeps each response time where the reference has it', () => {
    expect(CHAT_KB.contact().list![0]).toContain('usually replies within 2-4 hours');
    expect(CHAT_KB.avail().p![0]).toContain('replies to messages within 24 hours');
    expect(contactMethods[0]!.note.text).toBe('Usually responds within 2-4 hours');
    expect(contactFormCopy.notes[1].text).toBe("I'll respond within 24 hours with next steps");
    expect(contactHero.stats[0]).toEqual({ label: 'Response Time', to: 24, suffix: 'h' });
  });
});

/* ---------------------------------------------------------------- counts and purity */

describe('counts (REFERENCE_MAP.md 11.6.9, 11.7.10, 11.7.15, 11.7.16)', () => {
  it('has the list sizes of the reference', () => {
    expect(contactHero.stats).toHaveLength(3);
    expect(contactMethods).toHaveLength(4);
    expect(contactMethods.map((m) => m.no)).toEqual(['01', '02', '03', '04']);
    expect(projectTypes).toHaveLength(6);
    expect(projectTypes.map((t) => t.value)).toEqual([
      'App Development',
      'Web Application',
      'E-commerce',
      'Maintenance & Support',
      'Consultation',
      'Other',
    ]);
    expect(budgets).toHaveLength(4);
    expect(Object.keys(contactFormMessages.errors)).toHaveLength(8);
    expect(Object.keys(visitorPlaces)).toHaveLength(62);
    expect(BOOKING_SESSIONS).toHaveLength(2);
    expect(BOOKING_SESSIONS_MAX).toBe(10);
    expect(BOOKING_ZONES).toHaveLength(23);
    expect(Object.keys(BOOKING_ZONE_NAMES)).toHaveLength(9);
    expect(BOOKING_EXPECT).toHaveLength(4);
    // Google Meet only (owner change, 2026-10-01).
    expect(BOOKING_PLATFORMS).toHaveLength(1);
    // The reference/contract messages, minus the platform error (nothing to choose), plus the two
    // several-session messages (owner change, 2026-09-29).
    expect(Object.keys(BOOKING_COPY.errors)).toHaveLength(10);
    expect(BOOKING_MAX_DAYS_AHEAD).toBe(60);
    expect(BOOKING_SLOT_HOURS_PKT[0]).toBe(9);
    expect(BOOKING_SLOT_HOURS_PKT.at(-1)).toBe(17);
    expect(CHAT_PROJECTS).toHaveLength(14);
    expect(CHAT_START_CHIPS).toHaveLength(6);
    expect(Object.keys(CHAT_ACTIONS)).toHaveLength(9);
    expect(Object.keys(CHAT_KB)).toHaveLength(22);
    expect(CHAT_INTENTS).toHaveLength(21);
    expect(CHAT_REVIEWS).toHaveLength(3);
  });

  it('has no WhatsApp on the contact page (the reference has none)', () => {
    for (const leaf of collectStrings(CONTACT_EXPORTS)) {
      expect(leaf.value.toLowerCase(), leaf.path).not.toContain('whatsapp');
    }
  });
});

describe('purity (the backend imports these files)', () => {
  it('imports nothing but sibling content files and touches no browser API', () => {
    for (const file of SOURCE_FILES) {
      const src = readFileSync(resolve(HERE, file), 'utf8');
      expect(src, file).not.toMatch(/['"]use client['"]/);
      const imports = [...src.matchAll(/^import[^;]*?from\s+'([^']+)'/gm)].map((m) => m[1]);
      for (const spec of imports) expect(spec, `${file} imports ${spec}`).toMatch(/^\.\/[a-z-]+$/);
      // Code only: drop string literals (copy says "React Native"), then comments.
      const code = src
        .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, "''")
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      expect(code, file).not.toMatch(
        /\b(window|document|navigator|localStorage|sessionStorage|React|JSX)\b/,
      );
    }
  });
});
