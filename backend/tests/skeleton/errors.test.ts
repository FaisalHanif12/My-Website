import { describe, expect, it } from 'vitest';
import {
  AppError,
  DEFAULT_MESSAGES,
  ERROR_CODES,
  Errors,
  errorBody,
  isAppError,
} from '../../src/lib/errors.js';

describe('Errors helpers', () => {
  it('builds each code with its status and default message', () => {
    const cases: [AppError, string, number][] = [
      [Errors.validation(), 'VALIDATION_ERROR', 400],
      [Errors.payloadTooLarge(), 'VALIDATION_ERROR', 413],
      [Errors.rateLimited(30), 'RATE_LIMITED', 429],
      [Errors.slotTaken(), 'SLOT_TAKEN', 409],
      [Errors.upstream(), 'UPSTREAM_ERROR', 502],
      [Errors.notConfigured('chat'), 'UPSTREAM_ERROR', 503],
      [Errors.notFound(), 'NOT_FOUND', 404],
      [Errors.internal(), 'INTERNAL', 500],
    ];
    for (const [error, code, status] of cases) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(code);
      expect(error.status).toBe(status);
    }
    expect(Errors.validation().message).toBe('Some fields need a quick fix.');
    expect(Errors.payloadTooLarge().message).toBe('Request body is too large.');
    expect(Errors.slotTaken().message).toBe('That time was just taken. Please pick another slot.');
    expect(Errors.upstream().message).toBe('The service is busy right now. Please try again.');
    expect(Errors.notConfigured('chat').message).toBe(DEFAULT_MESSAGES.UPSTREAM_ERROR);
    expect(Errors.notFound().message).toBe('Not found.');
    expect(Errors.internal().message).toBe('Something went wrong. Please try again.');
    expect(Errors.rateLimited(1).message).toBe('Too many requests. Please try again later.');
  });

  it('has plain English defaults without em dashes', () => {
    for (const code of ERROR_CODES) {
      expect(DEFAULT_MESSAGES[code]).not.toMatch(/—/);
      expect(DEFAULT_MESSAGES[code].endsWith('.')).toBe(true);
    }
  });

  it('keeps fields and a custom message on validation errors', () => {
    const error = Errors.validation({ email: 'That email looks off.' }, 'Check the form.');
    expect(error.fields).toEqual({ email: 'That email looks off.' });
    expect(error.message).toBe('Check the form.');
  });

  it('rounds Retry-After up to whole seconds, at least 1', () => {
    expect(Errors.rateLimited(42.2).retryAfterSeconds).toBe(43);
    expect(Errors.rateLimited(0).retryAfterSeconds).toBe(1);
    expect(Errors.rateLimited(-5).retryAfterSeconds).toBe(1);
    expect(Errors.rateLimited(Number.NaN).retryAfterSeconds).toBe(60);
  });

  it('keeps the cause for the log and the feature in logContext', () => {
    const cause = new Error('upstream said no');
    expect(Errors.upstream(undefined, cause).cause).toBe(cause);
    expect(Errors.internal(cause).cause).toBe(cause);
    expect(Errors.upstream().cause).toBeUndefined();
    expect(Errors.notConfigured('google').logContext).toEqual({
      feature: 'google',
      reason: 'not configured',
    });
  });
});

describe('errorBody', () => {
  it('builds the envelope without fields when there are none', () => {
    expect(errorBody(Errors.notFound())).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Not found.' },
    });
    expect(errorBody(Errors.validation({}))).toEqual({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Some fields need a quick fix.' },
    });
  });

  it('adds fields when present and never the cause', () => {
    const body = errorBody(
      new AppError('VALIDATION_ERROR', undefined, {
        fields: { name: 'Too short.' },
        cause: new Error('secret detail'),
      }),
    );
    expect(body).toEqual({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Some fields need a quick fix.',
        fields: { name: 'Too short.' },
      },
    });
    expect(JSON.stringify(body)).not.toContain('secret detail');
  });
});

describe('isAppError', () => {
  it('recognises AppError only', () => {
    expect(isAppError(Errors.internal())).toBe(true);
    expect(isAppError(new Error('x'))).toBe(false);
    expect(isAppError({ code: 'INTERNAL', status: 500 })).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});
