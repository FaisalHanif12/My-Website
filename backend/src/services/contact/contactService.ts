import { createHash } from 'node:crypto';
import type { Env } from '../../config/env.js';
import { Errors } from '../../lib/errors.js';
import type { Logger } from '../../lib/logger.js';
import { renderContactOwner } from '../../templates/contactOwner.js';
import { renderContactVisitor } from '../../templates/contactVisitor.js';
import type { ContactEmailData } from '../../templates/types.js';
import type { ContactBody } from '../../validators/contact.js';
import { formatPktStamp } from '../booking/time.js';
import { ownerAddress } from '../mail/index.js';
import { toMailSendError } from '../mail/types.js';
import type { Mailer } from '../mail/types.js';
import type { KeyValueStore } from '../../store/types.js';

/** The same message (same email and text) sent again within this window sends nothing new. */
export const CONTACT_DEDUPE_TTL_MS = 10 * 60_000;

export interface ContactServiceOptions {
  mailer: Mailer;
  env: Env;
  logger: Logger;
  store: KeyValueStore;
  now?: () => Date;
}

export interface ContactService {
  /**
   * Emails the owner (Reply-To is the visitor) and sends the visitor a confirmation.
   * Throws UPSTREAM_ERROR when the owner email fails. A failed confirmation is logged and does
   * not fail the request: the owner already has the message.
   */
  send(body: ContactBody): Promise<{ duplicate: boolean }>;
}

/** What the store remembers about a sent message: a hash, never the text. */
function dedupeKey(body: ContactBody): string {
  const hash = createHash('sha256')
    .update(`${body.email.toLowerCase()}\n${body.projectType}\n${body.details}`)
    .digest('hex')
    .slice(0, 32);
  return `contact:sent:${hash}`;
}

export function createContactService(options: ContactServiceOptions): ContactService {
  const { mailer, env, store } = options;
  const log = options.logger.child({ component: 'contact' });
  const now = options.now ?? (() => new Date());

  return {
    async send(body) {
      const owner = ownerAddress(env);
      if (!owner) throw Errors.notConfigured('mail');

      const key = dedupeKey(body);
      const first = await store.setIfAbsent(key, 1, CONTACT_DEDUPE_TTL_MS);
      if (!first) {
        log.info({ event: 'contact.duplicate' }, 'Repeated contact message ignored');
        return { duplicate: true };
      }

      const data: ContactEmailData = {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        projectType: body.projectType,
        budget: body.budget,
        details: body.details,
        receivedAt: formatPktStamp(now(), env.BOOKING_TIMEZONE),
        source: `${env.SITE_URL}/contact`,
      };

      const ownerMail = renderContactOwner(data);
      try {
        await mailer.send({
          tag: 'contact-owner',
          to: owner,
          subject: ownerMail.subject,
          html: ownerMail.html,
          text: ownerMail.text,
          replyTo: body.email,
        });
      } catch (error) {
        // Let the visitor try again: the same message must not count as already sent.
        await store.delete(key).catch(() => undefined);
        const failure = toMailSendError('contact-owner', error);
        log.error(
          {
            event: 'contact.owner_mail_failed',
            code: failure.code,
            responseCode: failure.responseCode,
          },
          'The contact email to the owner failed',
        );
        throw Errors.upstream(undefined, failure);
      }

      const visitorMail = renderContactVisitor(data);
      try {
        await mailer.send({
          tag: 'contact-visitor',
          to: body.email,
          subject: visitorMail.subject,
          html: visitorMail.html,
          text: visitorMail.text,
        });
      } catch (error) {
        const failure = toMailSendError('contact-visitor', error);
        log.warn(
          {
            event: 'contact.visitor_mail_failed',
            code: failure.code,
            responseCode: failure.responseCode,
          },
          'The confirmation email to the visitor failed',
        );
      }
      log.info({ event: 'contact.sent' }, 'Contact message sent');
      return { duplicate: false };
    },
  };
}
