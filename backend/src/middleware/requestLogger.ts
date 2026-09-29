import type { IncomingMessage, ServerResponse } from 'node:http';
import type { RequestHandler } from 'express';
import type { LevelWithSilent } from 'pino';
import { pinoHttp } from 'pino-http';
import type { Logger } from '../lib/logger.js';

type RequestWithUrl = IncomingMessage & { originalUrl?: string };

/** The request path without its query string (queries can hold personal data). */
export function requestPath(req: RequestWithUrl): string {
  const url = req.originalUrl ?? req.url ?? '/';
  const queryStart = url.indexOf('?');
  return queryStart === -1 ? url : url.slice(0, queryStart);
}

function isHealthCheck(req: RequestWithUrl): boolean {
  return requestPath(req).replace(/\/+$/, '').toLowerCase() === '/api/health';
}

/** 5xx at error, 4xx at warn, health checks at debug, the rest at info. */
export function requestLogLevel(
  req: RequestWithUrl,
  res: ServerResponse,
  err?: Error,
): LevelWithSilent {
  if (err || res.statusCode >= 500) return 'error';
  if (res.statusCode >= 400) return 'warn';
  if (isHealthCheck(req)) return 'debug';
  return 'info';
}

/**
 * One line per request with only the method, path (no query), status, time and id.
 * No headers, bodies or IP addresses. `req.log` carries just the request id.
 */
export function requestLogger(logger: Logger): RequestHandler {
  return pinoHttp({
    logger,
    quietReqLogger: true,
    wrapSerializers: false,
    customLogLevel: requestLogLevel,
    serializers: {
      req: (req: RequestWithUrl) => ({ id: req.id, method: req.method, path: requestPath(req) }),
      res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
    },
  });
}
