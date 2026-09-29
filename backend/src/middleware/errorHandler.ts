import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Errors, errorBody, isAppError } from '../lib/errors.js';
import type { AppError } from '../lib/errors.js';
import type { Logger } from '../lib/logger.js';
import { zodFieldErrors } from './validate.js';

export const BODY_TOO_LARGE_MESSAGE = 'Request body is too large.';
export const INVALID_JSON_MESSAGE = 'Invalid JSON body.';

interface HttpErrorLike {
  type?: unknown;
  status?: unknown;
  statusCode?: unknown;
}

function httpStatusOf(err: HttpErrorLike): number | undefined {
  const status = typeof err.status === 'number' ? err.status : err.statusCode;
  return typeof status === 'number' ? status : undefined;
}

/** Maps the body parser's own errors (they carry a `type`) to the envelope. */
function fromBodyParser(err: unknown): AppError | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const httpErr = err as HttpErrorLike;
  if (httpErr.type === 'entity.too.large') return Errors.payloadTooLarge(BODY_TOO_LARGE_MESSAGE);
  if (httpErr.type === 'entity.parse.failed') {
    return Errors.validation(undefined, INVALID_JSON_MESSAGE);
  }
  const status = httpStatusOf(httpErr);
  if (typeof httpErr.type === 'string' && status !== undefined && status >= 400 && status < 500) {
    // Other body reading problems (unsupported charset or encoding, aborted upload).
    return Errors.validation();
  }
  return undefined;
}

/** Turns anything thrown into an AppError. Unknown errors become INTERNAL. */
export function toAppError(err: unknown): AppError {
  if (isAppError(err)) return err;
  const fromParser = fromBodyParser(err);
  if (fromParser) return fromParser;
  if (err instanceof ZodError) return Errors.validation(zodFieldErrors(err));
  return Errors.internal(err);
}

function logFailure(log: Logger, original: unknown, appError: AppError): void {
  if (appError.status < 500) return; // pino-http already logs 4xx at warn.
  const context = { code: appError.code, status: appError.status, ...appError.logContext };
  if (appError.status === 503) {
    log.warn(context, 'Feature is not configured');
    return;
  }
  const err = isAppError(original) ? (appError.cause ?? appError) : original;
  log.error(
    { ...context, err },
    appError.code === 'INTERNAL' ? 'Unhandled error' : 'Upstream error',
  );
}

/**
 * The last middleware. Sends the error envelope (plus Retry-After for 429) and never
 * leaks stack traces, upstream text or secrets; those go to the log.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const log = req.log;

  if (res.headersSent) {
    // A stream (SSE) already started: the envelope cannot be sent any more, so just end.
    log.error({ err }, 'Error after the response started');
    if (!res.writableEnded) res.end();
    return;
  }

  const appError = toAppError(err);
  logFailure(log, err, appError);

  if (appError.retryAfterSeconds !== undefined) {
    res.setHeader('Retry-After', String(appError.retryAfterSeconds));
  }
  res.status(appError.status).json(errorBody(appError));
}
