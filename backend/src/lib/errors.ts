export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'SLOT_TAKEN',
  'UPSTREAM_ERROR',
  'NOT_FOUND',
  'INTERNAL',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** Field name (nested paths joined with dots) to the first message for it. */
export type FieldErrors = Record<string, string>;

/** Plain English defaults sent to the client for each code. */
export const DEFAULT_MESSAGES: Readonly<Record<ErrorCode, string>> = {
  VALIDATION_ERROR: 'Some fields need a quick fix.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  SLOT_TAKEN: 'That time was just taken. Please pick another slot.',
  UPSTREAM_ERROR: 'The service is busy right now. Please try again.',
  NOT_FOUND: 'Not found.',
  INTERNAL: 'Something went wrong. Please try again.',
};

/** Default HTTP status for each code (some helpers use another, for example 413 or 503). */
export const DEFAULT_STATUS: Readonly<Record<ErrorCode, number>> = {
  VALIDATION_ERROR: 400,
  RATE_LIMITED: 429,
  SLOT_TAKEN: 409,
  UPSTREAM_ERROR: 502,
  NOT_FOUND: 404,
  INTERNAL: 500,
};

export interface AppErrorOptions {
  status?: number;
  fields?: FieldErrors;
  retryAfterSeconds?: number;
  cause?: unknown;
  /** Extra context for the log only; never sent to the client. */
  logContext?: Readonly<Record<string, unknown>>;
}

/**
 * An error the API answers with its envelope. `message` is safe to show to visitors;
 * `cause` and `logContext` are for the log only.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields: FieldErrors | undefined;
  readonly retryAfterSeconds: number | undefined;
  readonly logContext: Readonly<Record<string, unknown>> | undefined;

  constructor(code: ErrorCode, message?: string, options: AppErrorOptions = {}) {
    super(
      message ?? DEFAULT_MESSAGES[code],
      options.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = 'AppError';
    this.code = code;
    this.status = options.status ?? DEFAULT_STATUS[code];
    this.fields = options.fields;
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.logContext = options.logContext;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/** Shorthands for every error the API sends. */
export const Errors = {
  /** 400 VALIDATION_ERROR, with `fields` keyed by field name. */
  validation(fields?: FieldErrors, message?: string): AppError {
    return new AppError('VALIDATION_ERROR', message, fields ? { fields } : {});
  },

  /** 413 VALIDATION_ERROR for a body over the size limit. */
  payloadTooLarge(message = 'Request body is too large.'): AppError {
    return new AppError('VALIDATION_ERROR', message, { status: 413 });
  },

  /** 429 RATE_LIMITED; the error handler sends Retry-After in whole seconds (at least 1). */
  rateLimited(seconds: number): AppError {
    const retryAfterSeconds = Number.isFinite(seconds) ? Math.max(1, Math.ceil(seconds)) : 60;
    return new AppError('RATE_LIMITED', undefined, { retryAfterSeconds });
  },

  /** 409 SLOT_TAKEN: the frontend reloads the slots. */
  slotTaken(message?: string): AppError {
    return new AppError('SLOT_TAKEN', message);
  },

  /** 502 UPSTREAM_ERROR. `cause` is logged, never sent. */
  upstream(message?: string, cause?: unknown): AppError {
    return new AppError('UPSTREAM_ERROR', message, cause === undefined ? {} : { cause });
  },

  /** 503 UPSTREAM_ERROR for a feature whose env vars are not set. */
  notConfigured(feature: string): AppError {
    return new AppError('UPSTREAM_ERROR', undefined, {
      status: 503,
      logContext: { feature, reason: 'not configured' },
    });
  },

  /** 404 NOT_FOUND. */
  notFound(message?: string): AppError {
    return new AppError('NOT_FOUND', message);
  },

  /** 500 INTERNAL. `cause` is logged, never sent. */
  internal(cause?: unknown): AppError {
    return new AppError('INTERNAL', undefined, cause === undefined ? {} : { cause });
  },
} as const;

export interface ErrorBody {
  ok: false;
  error: { code: ErrorCode; message: string; fields?: FieldErrors };
}

/** The JSON envelope for an AppError. `fields` appears only when there is at least one. */
export function errorBody(error: AppError): ErrorBody {
  const body: ErrorBody = { ok: false, error: { code: error.code, message: error.message } };
  if (error.fields && Object.keys(error.fields).length > 0) {
    body.error.fields = { ...error.fields };
  }
  return body;
}
