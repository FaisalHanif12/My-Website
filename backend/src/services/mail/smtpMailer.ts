import nodemailer from 'nodemailer';
import type { SendMailOptions, SMTPTransportOptions } from 'nodemailer';
import { mailFrom } from '../../config/env.js';
import type { Env } from '../../config/env.js';
import type { Logger } from '../../lib/logger.js';
import { MailSendError, toMailSendError } from './types.js';
import type { Mailer, MailMessage, MailSendResult } from './types.js';

/** Every outgoing SMTP step has a limit, so a stuck server never holds a request. */
export const SMTP_TIMEOUTS = {
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
  dnsTimeout: 10_000,
} as const;

/** The part of a Nodemailer transporter the mailer uses (tests inject a fake). */
export interface SmtpTransport {
  sendMail(data: SendMailOptions): Promise<{ messageId?: string | undefined }>;
  verify(): Promise<unknown>;
  close(): void;
}

export type CreateSmtpTransport = (options: SMTPTransportOptions) => SmtpTransport;

export interface SmtpMailerDeps {
  createTransport?: CreateSmtpTransport;
  /** Milliseconds clock for the duration in the logs. */
  now?: () => number;
}

const defaultCreateTransport: CreateSmtpTransport = (options) =>
  nodemailer.createTransport(options);

/**
 * Removes line breaks (and other control characters) from a header value, so user input
 * can never add a header. Runs of spaces become one space.
 */
export function stripHeaderBreaks(value: string): string {
  return (
    value
      // eslint-disable-next-line no-control-regex -- control characters are exactly what we remove
      .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Transport options from env only, so any SMTP host works without code changes. */
export function smtpTransportOptions(env: Env): SMTPTransportOptions {
  const options: SMTPTransportOptions = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...SMTP_TIMEOUTS,
    // Our attachments are always in-memory content; never read files or fetch URLs.
    disableFileAccess: true,
    disableUrlAccess: true,
  };
  if (env.SMTP_USER && env.SMTP_PASS) {
    options.auth = { user: env.SMTP_USER, pass: env.SMTP_PASS };
  }
  return options;
}

/** The Nodemailer message for one MailMessage, with every header value cleaned. */
export function toSendMailOptions(from: string, message: MailMessage): SendMailOptions {
  const data: SendMailOptions = {
    from: stripHeaderBreaks(from),
    to: stripHeaderBreaks(message.to),
    subject: stripHeaderBreaks(message.subject),
    html: message.html,
    text: message.text,
  };
  const replyTo = message.replyTo === undefined ? '' : stripHeaderBreaks(message.replyTo);
  if (replyTo) data.replyTo = replyTo;
  if (message.attachments && message.attachments.length > 0) {
    data.attachments = message.attachments.map((attachment) => ({
      filename: stripHeaderBreaks(attachment.filename),
      content: attachment.content,
      contentType: stripHeaderBreaks(attachment.contentType),
    }));
  }
  return data;
}

/**
 * Real delivery through SMTP with Nodemailer (Gmail by default, any host by env).
 * Logs only the tag, the message id and the duration: never addresses or subjects.
 */
export function createSmtpMailer(env: Env, logger: Logger, deps: SmtpMailerDeps = {}): Mailer {
  const createTransport = deps.createTransport ?? defaultCreateTransport;
  const now = deps.now ?? Date.now;
  const from = mailFrom(env);
  const log = logger.child({ component: 'mail', mailer: 'smtp' });
  let transport: SmtpTransport | undefined;
  let closed = false;

  function getTransport(): SmtpTransport {
    transport ??= createTransport(smtpTransportOptions(env));
    return transport;
  }

  return {
    kind: 'smtp',

    async send(message: MailMessage): Promise<MailSendResult> {
      const { tag } = message;
      const started = now();
      const data = toSendMailOptions(from, message);
      if (!data.to) throw new MailSendError(tag, 'EENVELOPE');
      try {
        const info = await getTransport().sendMail(data);
        const messageId = typeof info.messageId === 'string' ? info.messageId : '';
        log.info({ event: 'mail.sent', tag, messageId, durationMs: now() - started }, 'Email sent');
        return { messageId };
      } catch (error) {
        const failure = toMailSendError(tag, error);
        log.warn(
          {
            event: 'mail.failed',
            tag,
            code: failure.code,
            responseCode: failure.responseCode,
            durationMs: now() - started,
          },
          'Email could not be sent',
        );
        throw failure;
      }
    },

    async verify(): Promise<void> {
      try {
        await getTransport().verify();
      } catch (error) {
        throw toMailSendError('verify', error);
      }
    },

    close(): Promise<void> {
      if (!closed && transport) transport.close();
      closed = true;
      return Promise.resolve();
    },
  };
}
