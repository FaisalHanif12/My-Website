import express from 'express';
import type { Express, Request, RequestHandler } from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { corsMiddleware, helmetMiddleware } from './middleware/security.js';
import { createHealthRouter } from './routes/health.routes.js';
import type { AppContext, LoadedApiModule } from './routes/types.js';

/** JSON body limit for every route except POST /api/chat. */
export const JSON_LIMIT_DEFAULT = '32kb';
/** JSON body limit for POST /api/chat (12 history items plus the message). */
export const JSON_LIMIT_CHAT = '64kb';

export interface CreateAppOptions {
  ctx: AppContext;
  modules: readonly LoadedApiModule[];
}

function isChatPost(req: Request): boolean {
  return req.method === 'POST' && req.path.replace(/\/+$/, '').toLowerCase() === '/api/chat';
}

/** One JSON parser per request: 64 KB for POST /api/chat, 32 KB everywhere else. */
function jsonBodyParser(): RequestHandler {
  const chatJson = express.json({ limit: JSON_LIMIT_CHAT });
  const defaultJson = express.json({ limit: JSON_LIMIT_DEFAULT });
  return (req, res, next) => {
    if (isChatPost(req)) {
      chatJson(req, res, next);
    } else {
      defaultJson(req, res, next);
    }
  };
}

/** API responses hold visitor data or live availability: never cache them. */
const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};

/**
 * The Express app. Order: trust proxy, no x-powered-by, request id, request log, helmet,
 * CORS, no-store on /api, JSON body, health, feature modules, not found, error handler.
 * No compression middleware: it would break SSE (nginx can gzip).
 */
export function createApp({ ctx, modules }: CreateAppOptions): Express {
  const app = express();

  app.set('trust proxy', ctx.env.TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(requestId());
  app.use(requestLogger(ctx.logger));
  app.use(helmetMiddleware());
  app.use(corsMiddleware(ctx.env));
  app.use('/api', noStore);
  app.use(jsonBodyParser());

  app.use('/api', createHealthRouter());
  for (const feature of modules) {
    app.use('/api', feature.router);
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
