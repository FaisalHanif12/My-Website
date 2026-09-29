import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import type {} from 'pino-http';

export const REQUEST_ID_HEADER = 'X-Request-Id';

/** A client id is kept only when it looks like one of ours (a uuid or similar). */
export const REQUEST_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

/** Returns the incoming id when it is safe to reuse, else a fresh uuid. */
export function resolveRequestId(incoming: unknown): string {
  return typeof incoming === 'string' && REQUEST_ID_RE.test(incoming) ? incoming : randomUUID();
}

/** Sets req.id (pino-http reuses it) and echoes it in the X-Request-Id response header. */
export function requestId(): RequestHandler {
  return (req, res, next) => {
    const id = resolveRequestId(req.get(REQUEST_ID_HEADER));
    req.id = id;
    res.setHeader(REQUEST_ID_HEADER, id);
    next();
  };
}
