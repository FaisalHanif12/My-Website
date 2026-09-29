import type { NextFunction, Request, Response } from 'express';
import { Errors } from '../lib/errors.js';

/** Any route nobody handled: 404 NOT_FOUND through the error handler. */
export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(Errors.notFound());
}
