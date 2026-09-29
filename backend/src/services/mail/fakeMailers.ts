import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Logger } from '../../lib/logger.js';
import { MailSendError, toMailSendError } from './types.js';
import type { Mailer, MailMessage, MailSendResult } from './types.js';

/** backend/tmp/mail, found from this file in both src/services/mail and dist/services/mail. */
export const DEFAULT_FAKE_MAIL_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  'tmp',
  'mail',
);

/** Keeps a file name part to letters, digits, dots, dashes and underscores. */
function safeNamePart(value: string, fallback: string): string {
  const cleaned = path
    .basename(value)
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[-.]+/, '')
    .slice(0, 80);
  return cleaned || fallback;
}

/** 2026-09-29T11-20-33-123Z: sortable and safe in file names on every system. */
function fileStamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-');
}

function isFileExists(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'EEXIST'
  );
}

/** The header lines at the top of the .txt copy, so the dev can see who it was for. */
function headerBlock(message: MailMessage): string {
  const lines = [`To: ${message.to}`];
  if (message.replyTo) lines.push(`Reply-To: ${message.replyTo}`);
  lines.push(`Subject: ${message.subject}`);
  const names = (message.attachments ?? []).map((attachment) => attachment.filename);
  if (names.length > 0) lines.push(`Attachments: ${names.join(', ')}`);
  return `${lines.join('\n')}\n${'-'.repeat(60)}\n\n`;
}

export interface FileMailerOptions {
  logger: Logger;
  /** Output folder. Defaults to backend/tmp/mail (from the module location, not the cwd). */
  dir?: string;
  now?: () => Date;
}

/**
 * Dev fake (DEV_FAKE_EXTERNALS): writes each email to <dir>/<timestamp>-<tag>.html and .txt,
 * plus one file per attachment. Logs only the tag and the file path, never the subject.
 */
export function createFileMailer(options: FileMailerOptions): Mailer {
  const dir = options.dir ?? DEFAULT_FAKE_MAIL_DIR;
  const now = options.now ?? (() => new Date());
  const log = options.logger.child({ component: 'mail', mailer: 'file' });

  async function writeFresh(file: string, content: string | Buffer): Promise<boolean> {
    try {
      await writeFile(file, content, { flag: 'wx' });
      return true;
    } catch (error) {
      if (isFileExists(error)) return false;
      throw error;
    }
  }

  return {
    kind: 'file',

    async send(message: MailMessage): Promise<MailSendResult> {
      const tag = safeNamePart(message.tag, 'mail');
      try {
        await mkdir(dir, { recursive: true });
        const stamp = fileStamp(now());
        // Two emails with the same tag in the same millisecond get -2, -3 and so on.
        let base = `${stamp}-${tag}`;
        let copy = 1;
        while (!(await writeFresh(path.join(dir, `${base}.html`), message.html))) {
          copy += 1;
          if (copy > 1000) throw new MailSendError(message.tag, 'EEXIST');
          base = `${stamp}-${tag}-${copy}`;
        }
        const htmlPath = path.join(dir, `${base}.html`);
        await writeFile(path.join(dir, `${base}.txt`), headerBlock(message) + message.text);
        for (const attachment of message.attachments ?? []) {
          const name = safeNamePart(attachment.filename, 'attachment');
          await writeFile(path.join(dir, `${base}-${name}`), attachment.content);
        }
        log.info({ event: 'mail.sent', tag: message.tag, file: htmlPath }, 'Email written to file');
        return { messageId: `<${base}@dev-fake.local>` };
      } catch (error) {
        throw toMailSendError(message.tag, error);
      }
    },

    async verify(): Promise<void> {
      try {
        await mkdir(dir, { recursive: true });
      } catch (error) {
        throw toMailSendError('verify', error);
      }
    },

    close(): Promise<void> {
      return Promise.resolve();
    },
  };
}

/** A message the memory mailer accepted, with the id it returned. */
export interface SentMail extends MailMessage {
  messageId: string;
}

/** Tag names, or a test that picks the messages that should fail. */
export type FailOn = string | readonly string[] | ((message: MailMessage) => boolean);

export interface MemoryMailerOptions {
  /** Messages to reject with a MailSendError (by tag or by a test). */
  failOn?: FailOn;
  /** Code on the MailSendError for a rejected message. Defaults to ECONNECTION. */
  failCode?: string;
  /** Makes verify() reject, for the startup check. */
  failVerify?: boolean;
}

export interface MemoryMailer extends Mailer {
  readonly kind: 'memory';
  /** Every accepted message, in order. */
  readonly outbox: SentMail[];
  /** Every rejected message, in order. */
  readonly failed: MailMessage[];
  /** Accepted messages with this tag. */
  byTag(tag: string): SentMail[];
  /** Changes which messages fail from now on (undefined: none). */
  setFailOn(failOn: FailOn | undefined): void;
  /** Empties outbox and failed and resets the counters. */
  clear(): void;
  readonly verifyCalls: number;
  readonly closeCalls: number;
}

function matchesFailOn(failOn: FailOn | undefined, message: MailMessage): boolean {
  if (failOn === undefined) return false;
  if (typeof failOn === 'function') return failOn(message);
  if (typeof failOn === 'string') return failOn === message.tag;
  return failOn.includes(message.tag);
}

function copyMessage(message: MailMessage): MailMessage {
  const copy: MailMessage = { ...message };
  if (message.attachments) copy.attachments = message.attachments.map((item) => ({ ...item }));
  return copy;
}

/** In-memory mailer for tests: keeps every message, can fail on demand, never touches the network. */
export function createMemoryMailer(options: MemoryMailerOptions = {}): MemoryMailer {
  let failOn = options.failOn;
  const failCode = options.failCode ?? 'ECONNECTION';
  const outbox: SentMail[] = [];
  const failed: MailMessage[] = [];
  let sequence = 0;
  let verifyCalls = 0;
  let closeCalls = 0;

  return {
    kind: 'memory',
    outbox,
    failed,

    get verifyCalls() {
      return verifyCalls;
    },

    get closeCalls() {
      return closeCalls;
    },

    send(message: MailMessage): Promise<MailSendResult> {
      if (matchesFailOn(failOn, message)) {
        failed.push(copyMessage(message));
        return Promise.reject(new MailSendError(message.tag, failCode));
      }
      sequence += 1;
      const messageId = `<memory-${sequence}@test.local>`;
      outbox.push({ ...copyMessage(message), messageId });
      return Promise.resolve({ messageId });
    },

    verify(): Promise<void> {
      verifyCalls += 1;
      return options.failVerify
        ? Promise.reject(new MailSendError('verify', 'EAUTH', 535))
        : Promise.resolve();
    },

    close(): Promise<void> {
      closeCalls += 1;
      return Promise.resolve();
    },

    byTag(tag: string): SentMail[] {
      return outbox.filter((message) => message.tag === tag);
    },

    setFailOn(next: FailOn | undefined): void {
      failOn = next;
    },

    clear(): void {
      outbox.length = 0;
      failed.length = 0;
      sequence = 0;
      verifyCalls = 0;
      closeCalls = 0;
    },
  };
}
