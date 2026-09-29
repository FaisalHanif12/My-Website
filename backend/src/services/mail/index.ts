import { features } from '../../config/env.js';
import type { Env } from '../../config/env.js';
import type { Logger } from '../../lib/logger.js';
import type { AppContext } from '../../routes/types.js';
import { createFileMailer } from './fakeMailers.js';
import { createSmtpMailer } from './smtpMailer.js';
import { toMailSendError } from './types.js';
import type { Mailer } from './types.js';

export { createFileMailer, createMemoryMailer, DEFAULT_FAKE_MAIL_DIR } from './fakeMailers.js';
export type {
  FailOn,
  FileMailerOptions,
  MemoryMailer,
  MemoryMailerOptions,
  SentMail,
} from './fakeMailers.js';
export { createSmtpMailer, SMTP_TIMEOUTS, stripHeaderBreaks } from './smtpMailer.js';
export type { CreateSmtpTransport, SmtpMailerDeps, SmtpTransport } from './smtpMailer.js';
export { isMailSendError, MailSendError, toMailSendError } from './types.js';
export type { MailAttachment, Mailer, MailerKind, MailMessage, MailSendResult } from './types.js';

/** Where owner emails go in dev fake mode when MAIL_TO_OWNER is not set. */
export const DEV_FAKE_OWNER_ADDRESS = 'owner@example.com';

/**
 * The owner's inbox: MAIL_TO_OWNER, or a placeholder in dev fake mode (the file mailer never
 * delivers it). null when mail is not configured.
 */
export function ownerAddress(env: Env): string | null {
  if (env.MAIL_TO_OWNER) return env.MAIL_TO_OWNER;
  return env.DEV_FAKE_EXTERNALS ? DEV_FAKE_OWNER_ADDRESS : null;
}

/**
 * Picks the mailer for this env without caching: the file mailer with DEV_FAKE_EXTERNALS,
 * SMTP when SMTP_USER, SMTP_PASS and MAIL_TO_OWNER are set, else null.
 */
export function createMailer(env: Env, logger: Logger): Mailer | null {
  if (env.DEV_FAKE_EXTERNALS) return createFileMailer({ logger });
  if (features(env).mail) return createSmtpMailer(env, logger);
  return null;
}

let shared: Mailer | undefined;

/**
 * The process mailer (created once). null when mail is not configured, so the caller answers
 * 503. Call it while building a router (before the server listens): the first call registers
 * the startup check "smtp-verify" and the shutdown hook "mail".
 */
export function getMailer(ctx: AppContext): Mailer | null {
  if (shared) return shared;
  const mailer = createMailer(ctx.env, ctx.logger);
  if (!mailer) return null;
  shared = mailer;

  ctx.lifecycle.onStarted('smtp-verify', async () => {
    try {
      await mailer.verify();
      ctx.logger.info({ event: 'mail.verified', mailer: mailer.kind }, 'Mail is ready');
    } catch (error) {
      const failure = toMailSendError('verify', error);
      ctx.logger.warn(
        {
          event: 'mail.verify_failed',
          mailer: mailer.kind,
          code: failure.code,
          responseCode: failure.responseCode,
        },
        `SMTP check failed (${failure.code}). Emails will fail until SMTP_HOST, SMTP_PORT, ` +
          'SMTP_SECURE, SMTP_USER and SMTP_PASS are right.',
      );
    }
  });
  ctx.lifecycle.onShutdown('mail', () => mailer.close());
  return mailer;
}

/** Forgets the process mailer, so the next getMailer() builds a new one. Tests only. */
export function resetMailerForTests(): void {
  shared = undefined;
}
