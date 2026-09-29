import { Router } from 'express';
import type { Request, Response } from 'express';
import { Errors } from '../lib/errors.js';
import { isValidIdempotencyKey } from '../lib/idempotency.js';
import { rateLimiters } from '../middleware/rateLimit.js';
import { parseInput } from '../middleware/validate.js';
import { createAvailability } from '../services/booking/availability.js';
import { createBookingService } from '../services/booking/bookingService.js';
import type { Platform } from '../services/booking/types.js';
import { getCalendarProvider } from '../services/calendar/index.js';
import type { CalendarProvider } from '../services/calendar/types.js';
import { getMailer } from '../services/mail/index.js';
import type { Mailer } from '../services/mail/index.js';
import { getMeetingProvider } from '../services/meeting/index.js';
import type { MeetingProvider } from '../services/meeting/types.js';
import { createJoinLinks, joinSecret } from '../services/booking/joinLink.js';
import type { JoinLinks } from '../services/booking/joinLink.js';
import { getSharedStore } from '../store/index.js';
import type { Store } from '../store/index.js';
import { bookingBodySchema } from '../validators/booking.js';
import { honeypotProbeSchema } from '../validators/contact.js';
import type { ApiModule } from './types.js';

export interface BookingModuleOverrides {
  calendar?: CalendarProvider | null;
  mailer?: Mailer | null;
  meetingFor?: (platform: Platform) => MeetingProvider;
  /** Join link maker (default: from JOIN_LINK_SECRET or a server secret; null sends raw links). */
  joinLinks?: JoinLinks | null;
  store?: Store;
  now?: () => Date;
  newId?: () => string;
}

export const IDEMPOTENCY_KEY_MESSAGE =
  'Send an Idempotency-Key header of 8 to 128 letters, digits, dashes or underscores.';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * POST /api/booking (API_CONTRACT.md): checks the slot, creates one Google Calendar event with
 * the meeting link and emails both sides the same link with an .ics invite. 3 per hour per IP.
 * A filled honeypot gets a normal-looking 200 and creates nothing.
 */
export function createBookingModule(overrides: BookingModuleOverrides = {}): ApiModule {
  return {
    name: 'booking',
    createRouter(ctx) {
      const { env, logger } = ctx;
      const store = overrides.store ?? getSharedStore(ctx);
      const limiters = rateLimiters(store, { logger });
      const now = overrides.now ?? (() => new Date());
      const calendar =
        overrides.calendar === undefined ? getCalendarProvider(ctx) : overrides.calendar;
      const mailer = overrides.mailer === undefined ? getMailer(ctx) : overrides.mailer;
      const secret = joinSecret(env);
      const joinLinks =
        overrides.joinLinks === undefined
          ? secret
            ? createJoinLinks(secret, env.API_PUBLIC_URL)
            : null
          : overrides.joinLinks;
      const service =
        calendar && mailer
          ? createBookingService({
              calendar,
              mailer,
              store,
              env,
              logger,
              now,
              joinLinks,
              availability: createAvailability({ calendar, store, env, logger, now }),
              meetingFor: overrides.meetingFor ?? ((platform) => getMeetingProvider(platform, ctx)),
              ...(overrides.newId ? { newId: overrides.newId } : {}),
            })
          : null;

      const router = Router();
      router.post('/booking', limiters.booking, async (req: Request, res: Response) => {
        if (!isObject(req.body)) {
          throw Errors.validation({ _root: 'Send the booking as JSON.' });
        }
        if (parseInput(honeypotProbeSchema, req.body).website) {
          req.log.info({ event: 'booking.honeypot' }, 'Honeypot filled, nothing booked');
          const start = new Date(now().getTime() + 24 * 60 * 60_000).toISOString();
          res
            .status(200)
            .json({ ok: true, bookingId: 'FH-00000000', meetLink: null, start, end: start });
          return;
        }
        const key = req.header('Idempotency-Key');
        if (!isValidIdempotencyKey(key)) {
          throw Errors.validation({ idempotencyKey: IDEMPOTENCY_KEY_MESSAGE });
        }
        const body = parseInput(bookingBodySchema, req.body);
        if (!service) throw Errors.notConfigured(calendar ? 'mail' : 'google');
        const result = await service.book(body, key);
        res.status(200).json({ ok: true, ...result });
      });
      return router;
    },
  };
}

export default createBookingModule();
