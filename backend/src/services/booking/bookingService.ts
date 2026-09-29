import { randomBytes } from 'node:crypto';
import type { Env } from '../../config/env.js';
import { Errors } from '../../lib/errors.js';
import { createIdempotency, fingerprintOf } from '../../lib/idempotency.js';
import type { Idempotency } from '../../lib/idempotency.js';
import { createKeyedMutex } from '../../lib/keyedMutex.js';
import type { KeyedMutex } from '../../lib/keyedMutex.js';
import type { Logger } from '../../lib/logger.js';
import type { KeyValueStore } from '../../store/types.js';
import { renderBookingOwner } from '../../templates/bookingOwner.js';
import { renderBookingVisitor } from '../../templates/bookingVisitor.js';
import type { BookingEmailData } from '../../templates/types.js';
import type { BookingBody } from '../../validators/booking.js';
import { isCalendarError } from '../calendar/types.js';
import type { CalendarProvider } from '../calendar/types.js';
import { ownerAddress } from '../mail/index.js';
import { toMailSendError } from '../mail/types.js';
import type { Mailer } from '../mail/types.js';
import { isMeetingError } from '../meeting/types.js';
import type { MeetingProvider } from '../meeting/types.js';
import type { Platform } from './types.js';
import type { Availability } from './availability.js';
import { CURRENCY, quote, sessionInfo } from './catalog.js';
import { buildIcs, icsAttachment } from './ics.js';
import {
  bookingDateWindow,
  formatWhen,
  hasNotice,
  inWindow,
  isSlotStart,
  isWeekday,
  sessionEnd,
  zoneLabel,
} from './time.js';
import type { BookingResult } from './types.js';

/** A stored success is replayed for the same Idempotency-Key this long. */
export const BOOKING_IDEMPOTENCY_TTL_MS = 24 * 60 * 60_000;

/** Field messages of the rules the payload must meet. */
export const BOOKING_FIELD_MESSAGES = {
  date: 'Pick a weekday from tomorrow up to 60 days ahead.',
  startUtc: 'Pick one of the time slots (09:00 to 17:00 Pakistan time).',
  notice: 'Pick a time at least 2 hours from now.',
} as const;

export interface BookingServiceOptions {
  calendar: CalendarProvider;
  availability: Availability;
  mailer: Mailer;
  meetingFor: (platform: Platform) => MeetingProvider;
  store: KeyValueStore;
  env: Env;
  logger: Logger;
  now?: () => Date;
  /** Booking id generator (tests fix it). */
  newId?: () => string;
}

export interface BookingService {
  /**
   * Books one slot. The same Idempotency-Key with the same request replays the first result;
   * the key with another request is a VALIDATION_ERROR. Throws SLOT_TAKEN (409), UPSTREAM_ERROR
   * (502, nothing was created or emailed) or VALIDATION_ERROR.
   */
  book(body: BookingBody, idempotencyKey: string): Promise<BookingResult>;
}

const BOOKING_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

/** "FH-7K2M9XQ4": short, easy to read out and not guessable in bulk. */
export function newBookingId(): string {
  const bytes = randomBytes(8);
  let out = '';
  for (const byte of bytes) out += BOOKING_ID_ALPHABET[byte % BOOKING_ID_ALPHABET.length];
  return `FH-${out}`;
}

/** Google Calendar "add event" template link (the visitor's one-click add). */
export function addToCalendarUrl(input: {
  title: string;
  start: Date;
  end: Date;
  details: string;
  location: string | null;
}): string {
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${stamp(input.start)}/${stamp(input.end)}`,
    details: input.details,
  });
  if (input.location) params.set('location', input.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** The trusted fields an idempotency key is bound to. */
function requestFingerprint(body: BookingBody): string {
  return fingerprintOf({
    sessionType: body.sessionType,
    sessions: body.sessions,
    email: body.email.toLowerCase(),
    name: body.name,
    phone: body.phone,
    company: body.company,
    date: body.date,
    timezone: body.timezone,
    startUtc: body.startUtc,
    platform: body.platform,
    notes: body.notes,
  });
}

function zoneText(tz: string, at: Date, home: string): string {
  return tz === home ? 'PKT' : `(${zoneLabel(tz, at)})`;
}

export function createBookingService(options: BookingServiceOptions): BookingService {
  const { calendar, availability, mailer, meetingFor, env } = options;
  const log = options.logger.child({ component: 'booking' });
  const now = options.now ?? (() => new Date());
  const newId = options.newId ?? newBookingId;
  const homeTz = env.BOOKING_TIMEZONE;
  const idempotency: Idempotency<BookingResult> = createIdempotency<BookingResult>({
    store: options.store,
    prefix: 'booking',
    ttlMs: BOOKING_IDEMPOTENCY_TTL_MS,
    now,
    onStoreError: (err) => log.warn({ err }, 'idempotency_store_failed'),
  });
  const mutex: KeyedMutex = createKeyedMutex();

  /** Checks the payload against the booking rules and returns the slot start. */
  function checkRules(body: BookingBody): Date {
    if (!isWeekday(body.date) || !inWindow(body.date, bookingDateWindow(now(), body.timezone))) {
      throw Errors.validation({ date: BOOKING_FIELD_MESSAGES.date });
    }
    if (!isSlotStart(body.date, body.startUtc, homeTz)) {
      throw Errors.validation({ startUtc: BOOKING_FIELD_MESSAGES.startUtc });
    }
    const start = new Date(body.startUtc);
    if (!hasNotice(start, now())) {
      throw Errors.validation({ startUtc: BOOKING_FIELD_MESSAGES.notice });
    }
    return start;
  }

  async function create(body: BookingBody, start: Date): Promise<BookingResult> {
    const info = sessionInfo(body.sessionType);
    const price = quote(body.sessionType, body.sessions);
    const end = sessionEnd(start, info.minutes);
    const bookingId = newId();
    const title = `${info.name} (${info.minutes} min) with ${body.name}`;
    const meeting = meetingFor(body.platform);

    // 1. The meeting, before the event: a Zoom link is made first and goes into the event.
    let plan;
    try {
      plan = await meeting.plan({
        bookingId,
        topic: title,
        start,
        durationMinutes: info.minutes,
        timeZone: homeTz,
      });
    } catch (error) {
      log.error(
        { bookingId, reason: isMeetingError(error) ? error.reason : 'unexpected' },
        'meeting_plan_failed',
      );
      throw Errors.upstream(undefined, error);
    }

    // 2. The one calendar event (with a Meet conference for Google Meet).
    const description = [
      `Booking ${bookingId}`,
      `${info.name}, ${info.minutes} minutes, $${info.price} per session`,
      `Sessions: ${body.sessions} (total $${price.total} ${CURRENCY})`,
      body.sessions > 1 ? 'The other sessions will be planned together on the first call.' : null,
      `Platform: ${body.platform}${plan.pending ? ' (Zoom link still to be sent)' : ''}`,
      `Visitor: ${body.name} <${body.email}>`,
      body.phone ? `Phone: ${body.phone}` : null,
      body.company ? `Company: ${body.company}` : null,
      body.notes ? `Notes: ${body.notes}` : null,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    let created;
    try {
      created = await calendar.createEvent({
        requestId: bookingId,
        summary: title,
        description,
        start,
        end,
        timeZone: homeTz,
        attendee: { email: body.email, name: body.name },
        location: plan.joinUrl,
        withGoogleMeet: plan.withGoogleMeet,
      });
    } catch (error) {
      log.error(
        isCalendarError(error)
          ? { bookingId, reason: error.reason, status: error.status, retryable: error.retryable }
          : { bookingId, reason: 'unexpected' },
        'calendar_create_failed',
      );
      throw Errors.upstream(undefined, error);
    }

    // 3. The one link both sides get.
    const meetLink = plan.joinUrl ?? created.meetLink;
    await availability.markBooked(start, end).catch((error: unknown) => {
      log.warn({ bookingId, err: error }, 'mark_booked_failed');
    });

    const result: BookingResult = {
      bookingId,
      meetLink,
      start: start.toISOString(),
      end: end.toISOString(),
    };

    // 4. The emails. The event exists now, so a failure here is logged and the booking still
    // succeeds (BACKEND_SPEC.md section 3): the owner sees it in Google Calendar.
    const owner = ownerAddress(env);
    const emailData: BookingEmailData = {
      bookingId,
      sessionName: info.name,
      durationMinutes: info.minutes,
      pricePerSession: info.price,
      sessions: body.sessions,
      total: price.total,
      currency: CURRENCY,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      notes: body.notes,
      platform: body.platform,
      meetLink,
      zoomPending: plan.pending,
      whenVisitor: formatWhen(start, end, body.timezone),
      whenPkt: `${formatWhen(start, end, homeTz)} ${zoneText(homeTz, start, 'Asia/Karachi')}`,
      visitorTimeZone: body.timezone,
      addToCalendarUrl: addToCalendarUrl({
        title,
        start,
        end,
        details: description,
        location: meetLink,
      }),
      eventLink: created.htmlLink,
      multiSession: body.sessions > 1,
    };
    let ics: string | null = null;
    try {
      ics = buildIcs({
        uid: created.iCalUID,
        start,
        end,
        title,
        description,
        link: meetLink,
        organizer: { name: 'Faisal Hanif', email: owner ?? body.email },
        attendee: { name: body.name, email: body.email },
      });
    } catch (error) {
      log.warn({ bookingId, err: error }, 'ics_failed');
    }
    const attachments = ics ? [icsAttachment(ics)] : undefined;

    const visitorMail = renderBookingVisitor(emailData);
    const ownerMail = renderBookingOwner(emailData);
    const sends = [
      mailer.send({
        tag: 'booking-visitor',
        to: body.email,
        subject: visitorMail.subject,
        html: visitorMail.html,
        text: visitorMail.text,
        ...(attachments ? { attachments } : {}),
      }),
      owner
        ? mailer.send({
            tag: 'booking-owner',
            to: owner,
            subject: ownerMail.subject,
            html: ownerMail.html,
            text: ownerMail.text,
            replyTo: body.email,
            ...(attachments ? { attachments } : {}),
          })
        : Promise.reject(new Error('no owner address')),
    ];
    const outcomes = await Promise.allSettled(sends);
    const tags = ['visitor', 'owner'] as const;
    outcomes.forEach((outcome, index) => {
      if (outcome.status === 'fulfilled') return;
      const failure = toMailSendError(`booking-${tags[index] ?? 'mail'}`, outcome.reason);
      // Error level with the booking id, so the email can be sent again by hand.
      log.error(
        {
          event: 'booking.mail_failed',
          bookingId,
          to: tags[index],
          code: failure.code,
          responseCode: failure.responseCode,
        },
        'A booking email failed after the event was created',
      );
    });
    log.info({ event: 'booking.created', bookingId, platform: body.platform }, 'Booking created');
    return result;
  }

  return {
    async book(body, idempotencyKey) {
      const start = checkRules(body);
      const { value } = await idempotency.run(idempotencyKey, requestFingerprint(body), () =>
        mutex.withLock(`slot:${start.toISOString()}`, async () => {
          const minutes = sessionInfo(body.sessionType).minutes;
          // Google is asked again here (not the cache) so two visitors cannot take one slot.
          if (!(await availability.isFree(start, minutes, { fresh: true }))) {
            throw Errors.slotTaken();
          }
          return create(body, start);
        }),
      );
      return value;
    },
  };
}
