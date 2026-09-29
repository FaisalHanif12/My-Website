/** A file sent with an email, for example the booking .ics invite. */
export interface MailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

/** One email. The sender is always the configured MAIL_FROM, so it is not part of the message. */
export interface MailMessage {
  /** Short label for logs, such as "contact-owner". Never personal data. */
  tag: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: readonly MailAttachment[];
}

export interface MailSendResult {
  messageId: string;
}

/** smtp: real delivery; file: dev fake that writes to backend/tmp/mail; memory: tests. */
export type MailerKind = 'smtp' | 'file' | 'memory';

export interface Mailer {
  readonly kind: MailerKind;
  /** Sends one email. Rejects with MailSendError only. */
  send(message: MailMessage): Promise<MailSendResult>;
  /** Checks the connection and login (SMTP) or the output folder (file). Rejects with MailSendError. */
  verify(): Promise<void>;
  /** Releases the connection. Safe to call more than once. */
  close(): Promise<void>;
}

/** Codes look like "EAUTH" or "ETIMEDOUT"; anything else becomes EUNKNOWN. */
const SAFE_CODE_RE = /^[A-Z][A-Z0-9_]{1,31}$/;

/**
 * A failed send or verify. It carries only safe facts (the tag, an error code and the SMTP
 * status number), never the SMTP server text, which can hold addresses. The message is the
 * same plain sentence for every failure, so nothing from the SMTP server reaches a client.
 */
export class MailSendError extends Error {
  readonly tag: string;
  readonly code: string;
  readonly responseCode: number | undefined;

  constructor(tag: string, code: string, responseCode?: number) {
    super('The email could not be sent.');
    this.name = 'MailSendError';
    this.tag = tag;
    this.code = SAFE_CODE_RE.test(code) ? code : 'EUNKNOWN';
    this.responseCode =
      responseCode !== undefined &&
      Number.isInteger(responseCode) &&
      responseCode >= 100 &&
      responseCode <= 599
        ? responseCode
        : undefined;
  }
}

export function isMailSendError(value: unknown): value is MailSendError {
  return value instanceof MailSendError;
}

/**
 * Turns any error from a transport into a MailSendError, keeping only the code and the SMTP
 * status number. The original error (and its server text) is dropped on purpose.
 */
export function toMailSendError(tag: string, error: unknown): MailSendError {
  if (error instanceof MailSendError) return error;
  let code = 'EUNKNOWN';
  let responseCode: number | undefined;
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { code?: unknown; responseCode?: unknown };
    if (typeof candidate.code === 'string') code = candidate.code;
    if (typeof candidate.responseCode === 'number') responseCode = candidate.responseCode;
  }
  return new MailSendError(tag, code, responseCode);
}
