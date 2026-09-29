/**
 * Booking modal content: the two session types, the stepper range, the fixed time zone list, the
 * slot hours, every screen's copy (pick, steps 1 to 3, recap, done), errors, toasts, live region
 * texts and the mailto templates.
 *
 * Pure data (no React, no DOM, no browser APIs), so the backend can import it too (it recomputes
 * names, prices and totals from BOOKING_SESSIONS). Imports stay relative (no @/ alias).
 * Source of truth: reference-design/faisalhanif-redesign.html, markup L4240-4467 and the script
 * L5791-6173. REFERENCE_MAP.md 11.7.10 and section 10; the two slot errors come from API_CONTRACT.md.
 */
import { CONTACT_MAILTO } from './contact';

/* ---------- sessions (TYPES L5798-5801, cards L4260-4283) ---------- */

export type SessionTypeId = 'quick' | 'deep';

export interface BookingSessionType {
  id: SessionTypeId;
  /** Card name, summary row, recap head, payload sessionName. */
  name: string;
  /** Text in the card pill and the recap head. */
  dur: string;
  /** durationMinutes. */
  mins: number;
  /** USD per session. */
  price: number;
  icon: 'i-zap' | 'i-layers';
  /** Card description. */
  desc: string;
  /** Card check list. */
  features: string[];
}

export const BOOKING_SESSIONS: BookingSessionType[] = [
  {
    id: 'quick',
    name: 'Quick Chat',
    dur: '30 minutes',
    mins: 30,
    price: 15,
    icon: 'i-zap',
    desc: 'Perfect for initial discussions and project exploration',
    features: ['Project overview', 'Requirements discussion', 'Technology suggestions'],
  },
  {
    id: 'deep',
    name: 'Technical Deep Dive',
    dur: '60 minutes',
    mins: 60,
    price: 25,
    icon: 'i-layers',
    desc: 'Comprehensive discussion for complex projects',
    features: ['Detailed planning', 'Architecture review', 'Timeline & budget'],
  },
];

/** Any type other than 'deep' opens as 'quick' (reset(), L5857). */
export const BOOKING_DEFAULT_SESSION: SessionTypeId = 'quick';

/** Looks a session up by id; unknown ids fall back to the default like reset() does. */
export function bookingSession(id: string): BookingSessionType {
  const found = BOOKING_SESSIONS.find((s) => s.id === id);
  if (found) return found;
  const fallback = BOOKING_SESSIONS.find((s) => s.id === BOOKING_DEFAULT_SESSION);
  if (!fallback) throw new Error('BOOKING_SESSIONS has no default session');
  return fallback;
}

/** Stepper range (L5909-5911, hint "From 1 to 10"). */
export const BOOKING_SESSIONS_MIN = 1;
export const BOOKING_SESSIONS_MAX = 10;
export const BOOKING_CURRENCY = 'USD';
/** Prices print as '$' + number (L5890, L5901). */
export const BOOKING_CURRENCY_SYMBOL = '$';

/* ---------- "What to Expect" list (L4305-4312) ---------- */

export interface BookingExpectItem {
  icon: 'i-user' | 'i-sparkles' | 'i-clock' | 'i-shield';
  title: string;
  text: string;
}

export const BOOKING_EXPECT: BookingExpectItem[] = [
  {
    icon: 'i-user',
    title: 'Personal Consultation',
    text: 'One-on-one discussion tailored to your specific needs and goals',
  },
  {
    icon: 'i-sparkles',
    title: 'Expert Insights',
    text: 'Professional recommendations and innovative solutions for your project',
  },
  {
    icon: 'i-clock',
    title: 'Flexible Timing',
    text: 'Choose a time that works best for your schedule across different time zones',
  },
  {
    icon: 'i-shield',
    title: 'Confidential & Secure',
    text: 'Your information and project details are kept private and secure at all times',
  },
];

/* ---------- platforms (step 3, L4412-4413) ---------- */

export type BookingPlatformValue = 'Google Meet' | 'Zoom';

export interface BookingPlatform {
  /** Radio value (name="ct-bk-plat"), also the payload platform. */
  value: BookingPlatformValue;
  icon: 'i-video' | 'i-globe';
  title: string;
  sub: string;
}

export const BOOKING_PLATFORMS: BookingPlatform[] = [
  { value: 'Google Meet', icon: 'i-video', title: 'Google Meet', sub: 'No downloads needed' },
  { value: 'Zoom', icon: 'i-globe', title: 'Zoom', sub: 'Professional conferencing' },
];

/* ---------- calendar, slots and time zones (L5811-5830, L6013-6016, L6060) ---------- */

/** Lahore working slots: hourly start hours in PKT (UTC+5), Monday to Friday (slotsFor, L6060). */
export const BOOKING_SLOT_HOURS_PKT: readonly number[] = [9, 10, 11, 12, 13, 14, 15, 16, 17];

/** First start (09:00) and end of the working day (18:00) in PKT, in minutes after midnight. */
export const BOOKING_DAY_START_MIN = 9 * 60;
export const BOOKING_DAY_END_MIN = 18 * 60;

/**
 * The start times of one day in minutes after midnight PKT, one every `sessionMinutes` while the
 * session still ends by 18:00. Owner change (2026-09-29): a 30 minute Quick Chat starts every 30
 * minutes (09:00, 09:30 .. 17:30, 18 slots) and a 60 minute Deep Dive every 60 (9 slots).
 */
export function bookingSlotStarts(sessionMinutes: number): number[] {
  const out: number[] = [];
  for (
    let m = BOOKING_DAY_START_MIN;
    m + sessionMinutes <= BOOKING_DAY_END_MIN;
    m += sessionMinutes
  ) {
    out.push(m);
  }
  return out;
}
/** slotsFor builds each slot as Date.UTC(y, m, d, h - 5, 0). */
export const BOOKING_PKT_OFFSET_HOURS = 5;
/** A day is available when it is a weekday, after today and at most 60 days ahead (L6015). */
export const BOOKING_MAX_DAYS_AHEAD = 60;
/** Default and fallback zone (LOCAL_TZ, L5812), also the "in Lahore" times. */
export const BOOKING_HOME_TZ = 'Asia/Karachi';

/**
 * The 23 fixed zones in source order (ZONES, L5814-5816). The select adds the visitor's own zone
 * when it is missing and sorts by offset at runtime; never sort this array.
 */
export const BOOKING_ZONES: readonly string[] = [
  'Asia/Karachi',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Istanbul',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
  'America/Sao_Paulo',
  'America/New_York',
  'America/Toronto',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
];

/**
 * Display names (NAMES, L5817-5818). Zones not listed use the last path part with "_" as spaces
 * (bookingZoneName below).
 */
export const BOOKING_ZONE_NAMES: Readonly<Record<string, string>> = {
  'Asia/Karachi': 'Pakistan (PKT)',
  UTC: 'UTC',
  'Asia/Kolkata': 'India',
  'Asia/Dubai': 'Dubai',
  'Asia/Riyadh': 'Riyadh',
  'America/New_York': 'New York (Eastern)',
  'America/Chicago': 'Chicago (Central)',
  'America/Denver': 'Denver (Mountain)',
  'America/Los_Angeles': 'Los Angeles (Pacific)',
};

/** NAMES[z] || z.split('/').pop().replace(/_/g, ' ') (L5834). */
export function bookingZoneName(zone: string): string {
  return BOOKING_ZONE_NAMES[zone] ?? (zone.split('/').pop() ?? zone).replace(/_/g, ' ');
}

/** gmtLabel(min) (L5830): 'GMT+5', 'GMT-4', 'GMT+5:30'; '' when the offset is unknown. */
export function bookingGmtLabel(offsetMinutes: number | null): string {
  if (offsetMinutes == null) return '';
  const sign = offsetMinutes < 0 ? '-' : '+';
  const a = Math.abs(offsetMinutes);
  const rest = a % 60;
  return 'GMT' + sign + Math.floor(a / 60) + (rest ? ':' + String(rest).padStart(2, '0') : '');
}

/* ---------- screen copy ---------- */

/** Every visible and assistive text of the modal, in screen order. */
export const BOOKING_COPY = {
  /** Modal close button aria-label (L4243). */
  closeLabel: 'Close booking',
  /** The ct-req mark after required labels. */
  requiredMark: '*',

  /** Screen A (L4248-4314). */
  pick: {
    eyebrow: 'Book Meeting',
    titleA: 'Schedule a ',
    /** .serif.grad-text */
    titleB: 'Meeting',
    lead: 'Pick a session, choose how many you need, then grab a time that suits you.',
    /** sr-only legend. */
    typesLegend: 'Session type',
    /** After <b>$15</b> in the card price. */
    perSession: ' per session',
    countLabel: 'Select Number of Session',
    countHint: 'From 1 to 10',
    stepperUnit: 'Session (s)',
    removeLabel: 'Remove a session',
    addLabel: 'Add a session',
    summaryAria: 'Booking summary',
    summary: 'Summary',
    rowType: 'Session Type',
    rowPrice: 'Price per Session',
    rowCount: 'Number of Sessions',
    total: 'Total Amount',
    go: 'Book Session',
    fine: 'Next, pick a date and time',
    expectTitle: 'What to Expect',
  },

  /** Screen B (L4317-4449). */
  steps: {
    change: 'Change session',
    titleA: 'Book Your ',
    /** .serif.grad-text */
    titleB: 'Session',
    lead: 'Complete the steps below to schedule your meeting',
    progressAria: 'Booking progress',
    labels: ['Details', 'Schedule', 'Confirm'],
    next: 'Continue',
    back: 'Back',
    optional: '(Optional)',
    /** Step 1 (L4338-4373). */
    p1: {
      title: 'Contact Information',
      email: 'Email Address',
      emailPh: 'you@company.com',
      verify: 'Verify',
      verified: 'Verified',
      emailHint: 'Meeting link will be sent here',
      name: 'Full Name',
      namePh: 'Your name',
      phone: 'Phone Number',
      phonePh: '+1 555 000 0000',
      phoneHint: 'For urgent communication',
      company: 'Company',
      companyPh: 'Company name',
      companyHint: 'Business context helps',
    },
    /** Step 2 (L4377-4405, calendar and slots script L6017-6080). */
    p2: {
      title: 'Select Date & Time',
      date: 'Preferred Date',
      dateTag: '(Monday to Friday)',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      /** Weeks start on Monday. */
      dow: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      /** Hint under the slots when more than one session was booked (owner change, 2026-09-29). */
      slotsHintMany: (n: number, picked: number) =>
        'Pick ' +
        n +
        ' times, one for each session (' +
        picked +
        ' picked). Times shown in your timezone',
      /** Appended to a disabled day's aria-label. */
      unavailable: ', unavailable',
      tz: 'Your Timezone',
      /** Between the GMT label and the zone name in each option. */
      zoneSep: ' · ',
      /** Appended to the visitor's own zone option (and stripped again by tzName). */
      yourZone: ' (your zone)',
      slots: 'Available Time Slots',
      slotsHint: 'Times shown in your timezone',
      slotsEmpty: 'Pick a date to see open times.',
      nextDay: 'next day',
      prevDay: 'prev day',
    },
    /** Step 3 (L4409-4437). */
    p3: {
      title: 'Meeting Preferences',
      platform: 'Choose Platform',
      notes: 'Notes',
      notesPh: 'A line or two about your project',
      notesHint: 'Helps me prepare for our session',
      notesMax: 800,
      orderAria: 'Order summary',
      order: 'Order summary',
      complete: 'Complete Booking',
    },
    /** Recap aside aria-label (L4441). */
    recapAria: 'Your session',
  },

  /** Recap and order summary rows (renderRecap, L6096-6108). The short recap drops the first row. */
  recap: {
    session: 'Session',
    /** Session value: name + ' (' + mins + minSuffix + ')'. */
    minSuffix: ' min',
    sessions: 'Sessions',
    /** Sessions value: n + times + '$' + price. */
    times: ' × $',
    date: 'Date',
    time: 'Time',
    /** After the Lahore time in the Time row's <small>. */
    inLahore: ' in Lahore',
    platform: 'Platform',
    total: 'Total',
    notPicked: 'Not picked yet',
    /** Row of the picked times when several sessions were booked. */
    timesRow: 'Times',
    /** Under the picked times while some are still missing. */
    morePick: (left: number) => left + (left === 1 ? ' more time to pick' : ' more times to pick'),
  },

  /** Screen C (L4452-4461, finish() L6131-6145). */
  done: {
    titleHook: 'Booking sent!',
    titleMail: 'Request ready!',
    /** Markup default of #ct-bk-t3. */
    titleDefault: 'Request ready!',
    msgHook: (email: string) =>
      'Your booking went through. The confirmation and meeting link are on their way to ' +
      email +
      '.',
    msgMail: (email: string) =>
      'A prefilled email just opened in your mail app with every detail. Send it and I will confirm the slot and share the meeting link at ' +
      email +
      '.',
    again: 'Book Another Meeting',
    support: 'Contact Support',
    supportHref: CONTACT_MAILTO + '?subject=Booking%20support',
    /** Ticket rows (L6136-6140). */
    ticket: {
      session: 'Session',
      /** sessionName + times + sessions. */
      times: ' × ',
      when: 'When',
      /** <small>: timeLocal + yourTime + timeLahore + inLahore. */
      yourTime: ' your time · ',
      inLahore: ' in Lahore',
      platform: 'Platform',
      total: 'Total',
    },
  },

  /** Field errors (validStep L5970-5995). slotTaken and dayFull come from API_CONTRACT.md. */
  errors: {
    emailEmpty: 'Please enter your email so I can send the meeting link.',
    emailBad: 'That email looks off. Try something like name@company.com.',
    nameEmpty: 'Please add your full name.',
    nameShort: 'That name looks a little short.',
    date: 'Pick a weekday for the meeting.',
    slot: 'Choose one of the time slots.',
    /** Step 2 with several sessions: one slot per session. */
    slotMany: (n: number, picked: number) =>
      'Choose ' + n + ' time slots, one for each session (' + picked + ' picked so far).',
    /** Tapping one more slot than there are sessions. */
    slotLimit: (n: number) =>
      'You booked ' +
      n +
      (n === 1 ? ' session' : ' sessions') +
      '. Tap a picked time to remove it first.',
    platform: 'Choose Google Meet or Zoom.',
    /** 409 SLOT_TAKEN, shown in #ct-bk-slot-err after going back to step 2 (API_CONTRACT.md). */
    slotTaken: 'That time was just taken. Please pick another slot.',
    /** A picked day with no free slot, shown in #ct-bk-date-err (API_CONTRACT.md). */
    dayFull: 'That day is fully booked. Please pick another weekday.',
  },

  toasts: {
    sent: 'Booking sent. Check your inbox soon.',
    mail: 'Opening your email app with the booking details',
    failed: 'Booking did not go through. Please try again.',
  },

  /** #ct-bk-live texts (announce(), cleared then set after 30ms). */
  announce: {
    /** Session radio change (L5905). */
    typeSelected: (name: string, total: number) => name + ' selected. Total $' + total,
    /** Stepper click (L5913). */
    count: (n: number, total: number) =>
      n + (n === 1 ? ' session' : ' sessions') + '. Total $' + total,
    /** goStep (L5943). */
    step: (n: number) => 'Step ' + n + ' of 3',
    emailVerified: 'Email verified',
    /** A slot was added or removed with several sessions. */
    slotCount: (n: number, picked: number) => picked + ' of ' + n + ' times picked',
    /** pickDate (L6031); longDate is fmtLongDate(k), for example "Tue, Mar 10, 2026". */
    dateSelected: (longDate: string, slotCount: number) =>
      longDate + ' selected. ' + slotCount + ' time slots available.',
    /** Time zone change (L6090); zoneName is the option text without ' (your zone)'. */
    zoneChanged: (zoneName: string) => 'Times now shown in ' + zoneName,
    failed: 'Booking failed. Please try again.',
  },

  /**
   * Slot button aria-label (L6069): time + (tag ? ', ' + shortDate : '') + ' your time, ' +
   * lahoreTime + ' in Lahore'. shortDate is '' when the slot is on the same day.
   */
  slotLabel: (time: string, shortDate: string, lahoreTime: string) =>
    time + (shortDate ? ', ' + shortDate : '') + ' your time, ' + lahoreTime + ' in Lahore',
} as const;

/** The option text of one zone: gmtLabel + ' · ' + name + (own zone ? ' (your zone)' : ''). */
export function bookingZoneOption(gmt: string, name: string, isOwnZone: boolean): string {
  return (
    gmt + BOOKING_COPY.steps.p2.zoneSep + name + (isOwnZone ? BOOKING_COPY.steps.p2.yourZone : '')
  );
}

/* ---------- mailto templates (L6119-6129, L6151) ---------- */

/**
 * What the mail templates need: the bookingData() fields plus the two strings the modal formats
 * at runtime, dateLong = fmtLongDate(date) ("Tue, Mar 10, 2026") and timezoneName = tzName(timezone)
 * (the option text without ' (your zone)').
 */
export interface BookingMailInput {
  sessionName: string;
  durationMinutes: number;
  sessions: number;
  total: number;
  dateLong: string;
  timeLocal: string;
  timezoneName: string;
  timeLahore: string;
  /** Every booked session in order. More than one entry lists them all in the mail. */
  slots?: ReadonlyArray<{ dateLong: string; timeLocal: string; timeLahore: string }>;
  platform: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  /** Trimmed; '' when empty. */
  notes: string;
}

/** Mailto subject: 'Meeting request: <sessionName> on <long date>' (L6151). */
export function bookingMailSubject(d: Pick<BookingMailInput, 'sessionName' | 'dateLong'>): string {
  return 'Meeting request: ' + d.sessionName + ' on ' + d.dateLong;
}

/** Mailto body, exactly mailBody() at L6119-6129. */
export function bookingMailBody(d: BookingMailInput): string {
  return (
    'Hi Faisal,\n\nI would like to book a meeting.\n\n' +
    'Session: ' +
    d.sessionName +
    ' (' +
    d.durationMinutes +
    ' minutes)\n' +
    'Number of sessions: ' +
    d.sessions +
    '\nTotal: $' +
    d.total +
    '\n\n' +
    (d.slots && d.slots.length > 1
      ? d.slots
          .map(
            (s, i) =>
              'Session ' +
              (i + 1) +
              ': ' +
              s.dateLong +
              ', ' +
              s.timeLocal +
              ' (' +
              d.timezoneName +
              '), ' +
              s.timeLahore +
              ' PKT\n',
          )
          .join('')
      : 'Date: ' +
        d.dateLong +
        '\n' +
        'Time: ' +
        d.timeLocal +
        ' (' +
        d.timezoneName +
        ')\n' +
        'Time in Lahore: ' +
        d.timeLahore +
        ' PKT\n') +
    'Platform: ' +
    d.platform +
    '\n\n' +
    'Name: ' +
    d.name +
    '\nEmail: ' +
    d.email +
    (d.phone ? '\nPhone: ' + d.phone : '') +
    (d.company ? '\nCompany: ' + d.company : '') +
    (d.notes ? '\n\nNotes:\n' + d.notes : '') +
    '\n\nSent from faisalhanif.work'
  );
}
