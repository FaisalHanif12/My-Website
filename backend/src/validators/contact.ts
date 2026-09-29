import { z } from 'zod';
import { emailSchema, honeypotSchema, optionalTrimmed, PHONE_RE, trimmedString } from './common.js';

/** The six project type radios of the reference form, in order. */
export const PROJECT_TYPES = [
  'App Development',
  'Web Application',
  'E-commerce',
  'Maintenance & Support',
  'Consultation',
  'Other',
] as const;

/** The four budget radios of the reference form. "" means none picked. */
export const BUDGETS = ['Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'] as const;

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  emailMax: 160,
  phoneMax: 40,
  companyMax: 120,
  detailsMin: 20,
  detailsMax: 2000,
} as const;

/** A submit sooner than this after the form was first shown is a bot (API_CONTRACT.md). */
export const CONTACT_MIN_FILL_MS = 3000;

const phoneSchema = optionalTrimmed(CONTACT_LIMITS.phoneMax).refine(
  (value) => value === '' || PHONE_RE.test(value),
  { error: 'Enter a valid phone number.' },
);

const budgetSchema = z
  .string({ error: 'Pick one of the budgets.' })
  .trim()
  .nullish()
  .transform((value) => value ?? '')
  .refine((value) => value === '' || (BUDGETS as readonly string[]).includes(value), {
    error: 'Pick one of the budgets.',
  });

export const contactBodySchema = z.object({
  name: trimmedString(CONTACT_LIMITS.nameMin, CONTACT_LIMITS.nameMax),
  email: emailSchema(CONTACT_LIMITS.emailMax),
  phone: phoneSchema,
  company: optionalTrimmed(CONTACT_LIMITS.companyMax),
  projectType: z.enum(PROJECT_TYPES, { error: 'Pick one of the project types.' }),
  budget: budgetSchema as z.ZodType<'' | (typeof BUDGETS)[number], unknown>,
  details: trimmedString(CONTACT_LIMITS.detailsMin, CONTACT_LIMITS.detailsMax),
  website: honeypotSchema,
  startedAt: z
    .number({ error: 'startedAt must be a number.' })
    .finite({ error: 'startedAt must be a number.' }),
});

export type ContactBody = z.output<typeof contactBodySchema>;

/**
 * Fields the honeypot path must not fail on: a bot always gets the same normal-looking 200.
 * The body parses with only this schema first, and the full schema runs when it is not filled.
 */
export const honeypotProbeSchema = z.object({ website: honeypotSchema });

/**
 * True when the form was submitted too fast. A `startedAt` far ahead of the server clock
 * means the visitor's own clock is wrong, so it does not count as too fast (the honeypot and
 * the rate limit still apply); only a small skew (three seconds) is treated like a fast submit.
 */
export function isSubmittedTooFast(startedAt: number, now: number): boolean {
  const elapsed = now - startedAt;
  return elapsed >= -CONTACT_MIN_FILL_MS && elapsed < CONTACT_MIN_FILL_MS;
}
