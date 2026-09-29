import { z } from 'zod';
import {
  MAX_SESSIONS,
  MIN_SESSIONS,
  PLATFORMS,
  SESSION_TYPE_IDS,
} from '../services/booking/catalog.js';
import {
  emailSchema,
  honeypotSchema,
  ianaTimeZoneSchema,
  optionalTrimmed,
  PHONE_RE,
  trimmedString,
  ymdDateSchema,
} from './common.js';

export const BOOKING_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  emailMax: 160,
  phoneMax: 40,
  companyMax: 120,
  notesMax: 800,
} as const;

/**
 * POST /api/booking (API_CONTRACT.md). The display fields the reference also sends
 * (sessionName, durationMinutes, pricePerSession, total, currency, timeLocal, timeLahore) are
 * accepted and ignored: the server recomputes them from the catalog.
 */
export const bookingBodySchema = z.object({
  sessionType: z.enum(SESSION_TYPE_IDS, { error: 'Pick Quick Chat or Technical Deep Dive.' }),
  sessions: z
    .number({ error: 'Pick how many sessions you need.' })
    .int({ error: 'Pick how many sessions you need.' })
    .min(MIN_SESSIONS, { error: `Book at least ${MIN_SESSIONS} session.` })
    .max(MAX_SESSIONS, { error: `Book at most ${MAX_SESSIONS} sessions.` }),
  email: emailSchema(BOOKING_LIMITS.emailMax),
  name: trimmedString(BOOKING_LIMITS.nameMin, BOOKING_LIMITS.nameMax),
  phone: optionalTrimmed(BOOKING_LIMITS.phoneMax).refine(
    (value) => value === '' || PHONE_RE.test(value),
    { error: 'Enter a valid phone number.' },
  ),
  company: optionalTrimmed(BOOKING_LIMITS.companyMax),
  date: ymdDateSchema,
  timezone: ianaTimeZoneSchema,
  startUtc: z
    .string({ error: 'Pick a time slot.' })
    .trim()
    .min(1, { error: 'Pick a time slot.' })
    .max(40, { error: 'Pick a time slot.' }),
  platform: z.enum(PLATFORMS, { error: 'Choose Google Meet or Zoom.' }),
  notes: optionalTrimmed(BOOKING_LIMITS.notesMax),
  website: honeypotSchema,
});

export type BookingBody = z.output<typeof bookingBodySchema>;

/** Query of GET /api/booking/slots. */
export const slotsQuerySchema = z.object({
  date: ymdDateSchema,
  session: z.enum(SESSION_TYPE_IDS, { error: 'session must be quick or deep.' }),
});

export type SlotsQuery = z.output<typeof slotsQuerySchema>;
