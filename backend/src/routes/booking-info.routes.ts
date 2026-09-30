import { Router } from 'express';
import type { Request, Response } from 'express';
import { Errors } from '../lib/errors.js';
import { rateLimiters } from '../middleware/rateLimit.js';
import { parseInput } from '../middleware/validate.js';
import { createAvailability } from '../services/booking/availability.js';
import { bookingConfig } from '../services/booking/catalog.js';
import { getCalendarProvider } from '../services/calendar/index.js';
import type { CalendarProvider } from '../services/calendar/types.js';
import { getSharedStore } from '../store/index.js';
import type { Store } from '../store/index.js';
import { slotsQuerySchema } from '../validators/booking.js';
import type { ApiModule } from './types.js';

export interface BookingInfoModuleOverrides {
  /** Calendar (tests pass the fake; the default is Google, or the dev fake). */
  calendar?: CalendarProvider | null;
  store?: Store;
  now?: () => Date;
}

/**
 * GET /api/booking/slots?date=YYYY-MM-DD&session=quick|deep: the free hourly starts of a day in
 * Pakistan time. GET /api/booking/config: sessions, hours and the platform (Google Meet). The
 * modal never changes because of the config; the slots only remove taken times from its list.
 */
export function createBookingInfoModule(overrides: BookingInfoModuleOverrides = {}): ApiModule {
  return {
    name: 'booking-info',
    createRouter(ctx) {
      const { env, logger } = ctx;
      const store = overrides.store ?? getSharedStore(ctx);
      const limiters = rateLimiters(store, { logger });
      const calendar =
        overrides.calendar === undefined ? getCalendarProvider(ctx) : overrides.calendar;
      const availability = calendar
        ? createAvailability({
            calendar,
            store,
            env,
            logger,
            ...(overrides.now ? { now: overrides.now } : {}),
          })
        : null;

      const router = Router();

      router.get('/booking/slots', limiters.bookingInfo, async (req: Request, res: Response) => {
        const query = parseInput(slotsQuerySchema, req.query);
        if (!availability) throw Errors.notConfigured('google');
        const slots = await availability.freeSlots(query.date, query.session);
        res.status(200).json({ ok: true, timezone: env.BOOKING_TIMEZONE, slots });
      });

      router.get('/booking/config', limiters.bookingInfo, (_req: Request, res: Response) => {
        res.status(200).json({
          ok: true,
          ...bookingConfig({ timeZone: env.BOOKING_TIMEZONE }),
        });
      });

      return router;
    },
  };
}

export default createBookingInfoModule();
