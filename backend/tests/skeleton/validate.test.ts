import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from '../../src/lib/errors.js';
import { ROOT_FIELD, parseInput, zodFieldErrors } from '../../src/middleware/validate.js';
import {
  EMAIL_RE,
  PHONE_RE,
  emailSchema,
  honeypotSchema,
  ianaTimeZoneSchema,
  isHoneypotFilled,
  isValidTimeZone,
  isYmdDate,
  optionalTrimmed,
  trimmedString,
  ymdDateSchema,
} from '../../src/validators/common.js';

function validationError(fn: () => unknown): AppError {
  try {
    fn();
  } catch (error) {
    if (error instanceof AppError) return error;
    throw error;
  }
  throw new Error('expected a validation error');
}

describe('parseInput', () => {
  const schema = z.object({
    name: trimmedString(2, 120),
    history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })),
  });

  it('returns the parsed data and strips unknown keys', () => {
    const data = parseInput(schema, {
      name: '  Ada  ',
      history: [{ role: 'user', content: 'hi', extra: true }],
      admin: true,
    });
    expect(data).toEqual({ name: 'Ada', history: [{ role: 'user', content: 'hi' }] });
    expect(data).not.toHaveProperty('admin');
  });

  it('throws VALIDATION_ERROR with fields keyed by path, first message per key', () => {
    const error = validationError(() =>
      parseInput(schema, {
        name: 'A',
        history: [
          { role: 'user', content: 'ok' },
          { role: 'user', content: 'ok' },
          { role: 'user', content: 'ok' },
          { role: 'robot', content: 5 },
        ],
      }),
    );
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.fields).toMatchObject({
      name: 'Use at least 2 characters.',
    });
    expect(Object.keys(error.fields ?? {}).sort()).toEqual(
      ['history.3.content', 'history.3.role', 'name'].sort(),
    );
  });

  it('keys a whole-input problem as _root', () => {
    const error = validationError(() => parseInput(schema, 'not an object'));
    expect(Object.keys(error.fields ?? {})).toEqual([ROOT_FIELD]);
  });

  it('keeps only the first message for a key', () => {
    const result = z
      .string()
      .min(5, { error: 'first' })
      .regex(/^x+$/, { error: 'second' })
      .safeParse('ab');
    expect(result.success).toBe(false);
    if (!result.success) expect(zodFieldErrors(result.error)).toEqual({ [ROOT_FIELD]: 'first' });
  });
});

describe('EMAIL_RE (reference L5185)', () => {
  it.each(['name@company.com', 'a.b+c@sub.domain.co', 'x@y.io'])('accepts %s', (email) => {
    expect(EMAIL_RE.test(email)).toBe(true);
  });

  it.each(['plain', 'a@b', 'a@b.c', 'a b@c.com', 'a@.com', 'a@b..com', '@b.com', 'a@b.c0m'])(
    'rejects %s',
    (email) => {
      expect(EMAIL_RE.test(email)).toBe(false);
    },
  );
});

describe('PHONE_RE (reference L5668)', () => {
  it.each(['+1 555 123 4567', '(042) 111-2222', '0300.1234567'])('accepts %s', (phone) => {
    expect(PHONE_RE.test(phone)).toBe(true);
  });

  it.each(['12345', 'call me', '+1 555 123 4567 ext 9', '1'.repeat(25)])('rejects %s', (phone) => {
    expect(PHONE_RE.test(phone)).toBe(false);
  });
});

describe('field helpers', () => {
  it('emailSchema trims, requires, caps and checks the pattern', () => {
    const schema = emailSchema(20);
    expect(schema.parse('  me@example.com ')).toBe('me@example.com');
    expect(schema.safeParse('').success).toBe(false);
    expect(schema.safeParse('bad@').success).toBe(false);
    expect(schema.safeParse(`${'a'.repeat(15)}@example.com`).success).toBe(false);
    expect(schema.safeParse(42).success).toBe(false);
  });

  it('trimmedString enforces min and max after trimming', () => {
    const schema = trimmedString(2, 5);
    expect(schema.parse('  ab  ')).toBe('ab');
    expect(schema.safeParse(' a ').success).toBe(false);
    expect(schema.safeParse('abcdef').success).toBe(false);
  });

  it('optionalTrimmed turns missing or null into an empty string', () => {
    const schema = z.object({ company: optionalTrimmed(5) });
    expect(schema.parse({})).toEqual({ company: '' });
    expect(schema.parse({ company: null })).toEqual({ company: '' });
    expect(schema.parse({ company: '  Acme ' })).toEqual({ company: 'Acme' });
    expect(schema.safeParse({ company: 'Too long' }).success).toBe(false);
  });

  it('honeypot never fails and reports whether it was filled', () => {
    const schema = z.object({ website: honeypotSchema });
    expect(schema.parse({})).toEqual({ website: false });
    expect(schema.parse({ website: '' })).toEqual({ website: false });
    expect(schema.parse({ website: '   ' })).toEqual({ website: false });
    expect(schema.parse({ website: 'http://spam.example' })).toEqual({ website: true });
    expect(schema.parse({ website: 12 })).toEqual({ website: true });
    expect(isHoneypotFilled(null)).toBe(false);
    expect(isHoneypotFilled({})).toBe(true);
  });

  it('ianaTimeZoneSchema accepts real zones only', () => {
    expect(ianaTimeZoneSchema.parse('Asia/Karachi')).toBe('Asia/Karachi');
    expect(ianaTimeZoneSchema.parse('America/Argentina/Buenos_Aires')).toBe(
      'America/Argentina/Buenos_Aires',
    );
    expect(ianaTimeZoneSchema.parse('UTC')).toBe('UTC');
    for (const zone of ['', 'Mars/Olympus', '+05:00', 'Asia/Karachi; drop', 'x'.repeat(80)]) {
      expect(ianaTimeZoneSchema.safeParse(zone).success).toBe(false);
    }
    expect(isValidTimeZone('Europe/London')).toBe(true);
  });

  it('ymdDateSchema accepts real calendar days only', () => {
    expect(ymdDateSchema.parse('2026-02-28')).toBe('2026-02-28');
    expect(isYmdDate('2028-02-29')).toBe(true);
    for (const date of ['2026-02-29', '2026-13-01', '2026-00-10', '2026-04-31', '26-1-1', '']) {
      expect(ymdDateSchema.safeParse(date).success).toBe(false);
    }
    expect(ymdDateSchema.safeParse(20260101).success).toBe(false);
  });
});
