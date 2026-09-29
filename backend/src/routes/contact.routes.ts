import { Router } from 'express';
import type { Request, Response } from 'express';
import { Errors } from '../lib/errors.js';
import { rateLimiters } from '../middleware/rateLimit.js';
import { parseInput } from '../middleware/validate.js';
import { getMailer } from '../services/mail/index.js';
import type { Mailer } from '../services/mail/index.js';
import { createContactService } from '../services/contact/contactService.js';
import { getSharedStore } from '../store/index.js';
import type { Store } from '../store/index.js';
import {
  contactBodySchema,
  honeypotProbeSchema,
  isSubmittedTooFast,
} from '../validators/contact.js';
import type { ApiModule } from './types.js';

export interface ContactModuleOverrides {
  /** Mailer (tests pass the memory mailer; the default is SMTP, or the dev fake file mailer). */
  mailer?: Mailer;
  store?: Store;
  now?: () => Date;
}

/** fields.startedAt when the form was sent within three seconds of being shown. */
export const TOO_FAST_MESSAGE = 'Please take a moment to fill in the form.';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * POST /api/contact (API_CONTRACT.md). A filled honeypot gets a normal 200 and sends nothing. The
 * form must have been on screen for at least 3 seconds. 5 per hour per IP.
 */
export function createContactModule(overrides: ContactModuleOverrides = {}): ApiModule {
  return {
    name: 'contact',
    createRouter(ctx) {
      const { env, logger } = ctx;
      const store = overrides.store ?? getSharedStore(ctx);
      const limiters = rateLimiters(store, { logger });
      const now = overrides.now ?? (() => new Date());
      const mailer = overrides.mailer ?? getMailer(ctx);
      const service = mailer ? createContactService({ mailer, env, logger, store, now }) : null;

      const router = Router();
      router.post('/contact', limiters.contact, async (req: Request, res: Response) => {
        if (!isObject(req.body)) {
          throw Errors.validation({ _root: 'Send the form fields as JSON.' });
        }
        if (parseInput(honeypotProbeSchema, req.body).website) {
          req.log.info({ event: 'contact.honeypot' }, 'Honeypot filled, nothing sent');
          res.status(200).json({ ok: true });
          return;
        }
        const body = parseInput(contactBodySchema, req.body);
        if (isSubmittedTooFast(body.startedAt, now().getTime())) {
          throw Errors.validation({ startedAt: TOO_FAST_MESSAGE });
        }
        if (!service) throw Errors.notConfigured('mail');
        await service.send(body);
        res.status(200).json({ ok: true });
      });
      return router;
    },
  };
}

export default createContactModule();
