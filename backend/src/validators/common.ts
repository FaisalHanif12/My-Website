import { z } from 'zod';

/**
 * Email pattern copied from the reference design (faisalhanif-redesign.html L5185), so the
 * server accepts exactly what the reference form accepts.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

/** Phone pattern copied from the reference contact form (L5668). */
export const PHONE_RE = /^[+()\d\s.-]{7,24}$/;

/** YYYY-MM-DD shape; ymdDateSchema also checks that the day exists on the calendar. */
export const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** An IANA zone name such as "Asia/Karachi", "America/Argentina/Buenos_Aires" or "UTC". */
const IANA_NAME_RE = /^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)*$/;

/**
 * Email field: trimmed, required, at most `max` characters and matching the reference rule.
 */
export function emailSchema(max: number) {
  return z
    .string({ error: 'Please enter an email address.' })
    .trim()
    .min(1, { error: 'Please enter an email address.' })
    .max(max, { error: `Use at most ${max} characters.` })
    .regex(EMAIL_RE, { error: 'That email looks off.' });
}

/** Required text field: trimmed, then between `min` and `max` characters. */
export function trimmedString(min: number, max: number) {
  return z
    .string({ error: 'This field must be text.' })
    .trim()
    .min(min, {
      error: min <= 1 ? 'This field is required.' : `Use at least ${min} characters.`,
    })
    .max(max, { error: `Use at most ${max} characters.` });
}

/**
 * Optional text field: trimmed and at most `max` characters. A missing or null value
 * becomes "" so controllers always get a string, as the reference payloads do.
 */
export function optionalTrimmed(max: number) {
  return z
    .string({ error: 'This field must be text.' })
    .trim()
    .max(max, { error: `Use at most ${max} characters.` })
    .nullish()
    .transform((value) => value ?? '');
}

/**
 * True when a honeypot value was filled in. Only bots fill the hidden field, so any
 * non-blank string or any non-string value counts as filled.
 */
export function isHoneypotFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Honeypot field (`website`). It never fails validation, so a bot always gets the same
 * normal-looking answer; the output is true when the field was filled.
 */
export const honeypotSchema = z
  .unknown()
  .optional()
  .transform((value) => isHoneypotFilled(value));

/** True when `zone` is an IANA time zone name that this runtime knows. */
export function isValidTimeZone(zone: string): boolean {
  if (zone.length === 0 || zone.length > 64 || !IANA_NAME_RE.test(zone)) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** IANA time zone name, for example "Asia/Karachi". */
export const ianaTimeZoneSchema = z
  .string({ error: 'Please pick a time zone.' })
  .trim()
  .min(1, { error: 'Please pick a time zone.' })
  .refine(isValidTimeZone, { error: 'That time zone is not recognised.' });

/** True when `value` is YYYY-MM-DD and names a real calendar day. */
export function isYmdDate(value: string): boolean {
  const match = YMD_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Calendar day in YYYY-MM-DD form that exists on the calendar (no 2025-02-30). */
export const ymdDateSchema = z
  .string({ error: 'Please pick a date.' })
  .trim()
  .refine(isYmdDate, { error: 'Use a real date in the form YYYY-MM-DD.' });
