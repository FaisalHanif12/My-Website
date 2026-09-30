import { Router } from 'express';
import type { Request, Response } from 'express';
import { rateLimiters } from '../middleware/rateLimit.js';
import { createJoinLinks, joinSecret, joinStatus } from '../services/booking/joinLink.js';
import type { JoinLinks } from '../services/booking/joinLink.js';
import { formatWhen } from '../services/booking/time.js';
import { escapeHtml } from '../templates/escape.js';
import { getSharedStore } from '../store/index.js';
import type { Store } from '../store/index.js';
import type { ApiModule } from './types.js';

export interface JoinModuleOverrides {
  joinLinks?: JoinLinks | null;
  store?: Store;
  now?: () => Date;
}

function page(title: string, message: string, detail: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f2f6f4;color:#0f231e;font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:460px;margin:24px;padding:36px;border-radius:24px;background:#fff;box-shadow:0 12px 40px rgba(8,48,42,.12);text-align:center}
h1{margin:0 0 10px;font-size:1.4rem;color:#0e6655}p{margin:8px 0;color:#34504a}strong{color:#0f231e}</style></head>
<body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p>${detail}</p></main></body></html>`;
}

/**
 * GET /api/join/:token, the address both booking emails carry. The real Google Meet address
 * is inside the (encrypted) token and only handed out from 10 minutes before the session until
 * 15 minutes after it should end. Outside that window the visitor sees a plain page with the time.
 */
export function createJoinModule(overrides: JoinModuleOverrides = {}): ApiModule {
  return {
    name: 'join',
    createRouter(ctx) {
      const { env, logger } = ctx;
      const store = overrides.store ?? getSharedStore(ctx);
      const limiters = rateLimiters(store, { logger });
      const now = overrides.now ?? (() => new Date());
      const secret = joinSecret(env);
      const links =
        overrides.joinLinks === undefined
          ? secret
            ? createJoinLinks(secret, env.API_PUBLIC_URL)
            : null
          : overrides.joinLinks;

      const router = Router();
      router.get('/join/:token', limiters.bookingInfo, (req: Request, res: Response) => {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Referrer-Policy', 'no-referrer');
        const token = typeof req.params.token === 'string' ? req.params.token : '';
        const payload = links?.read(token) ?? null;
        if (!payload) {
          res
            .status(404)
            .type('html')
            .send(
              page(
                'Link not found',
                'This meeting link is not valid.',
                'Please use the link from your booking email.',
              ),
            );
          return;
        }
        const status = joinStatus(
          payload.sessions.map((s) => ({ start: new Date(s.start), end: new Date(s.end) })),
          now(),
        );
        const state = status.state;
        const when = escapeHtml(
          formatWhen(status.session.start, status.session.end, env.BOOKING_TIMEZONE),
        );
        if (state === 'open') {
          req.log.info(
            { event: 'join.redirect', bookingId: payload.bookingId },
            'Join link opened',
          );
          res.redirect(302, payload.url);
          return;
        }
        if (state === 'early') {
          res
            .status(200)
            .type('html')
            .send(
              page(
                'Not open yet',
                'This meeting link opens 10 minutes before the session starts.',
                `Your next session: <strong>${when}</strong> (Pakistan time). Open this link again then.`,
              ),
            );
          return;
        }
        res
          .status(410)
          .type('html')
          .send(
            page(
              'This meeting has ended',
              'The link was only active around the booked time.',
              `Your last session was <strong>${when}</strong> (Pakistan time). Reply to your booking email to book another.`,
            ),
          );
      });
      return router;
    },
  };
}

export default createJoinModule();
