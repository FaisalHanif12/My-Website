import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { SendMailOptions, SMTPTransportOptions } from 'nodemailer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLifecycle } from '../../src/lib/lifecycle.js';
import type { Lifecycle } from '../../src/lib/lifecycle.js';
import {
  createFileMailer,
  createMailer,
  createMemoryMailer,
  createSmtpMailer,
  DEFAULT_FAKE_MAIL_DIR,
  DEV_FAKE_OWNER_ADDRESS,
  getMailer,
  isMailSendError,
  MailSendError,
  ownerAddress,
  resetMailerForTests,
  SMTP_TIMEOUTS,
} from '../../src/services/mail/index.js';
import type { MailMessage } from '../../src/services/mail/index.js';
import type { SmtpTransport } from '../../src/services/mail/smtpMailer.js';
import type { AppContext } from '../../src/routes/types.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { makeTestEnv } from '../helpers/testEnv.js';

/**
 * No test here can open a real SMTP connection: nodemailer itself is replaced by a fake whose
 * transports only record what they are given.
 */
const smtpFake = vi.hoisted(() => {
  interface Recorded {
    options: unknown;
    sent: unknown[];
    verifyCalls: number;
    closeCalls: number;
  }
  const state = {
    transports: [] as Recorded[],
    verifyError: undefined as unknown,
  };
  function createTransport(options: unknown) {
    const record: Recorded = { options, sent: [], verifyCalls: 0, closeCalls: 0 };
    state.transports.push(record);
    return {
      sendMail(data: unknown) {
        record.sent.push(data);
        return Promise.resolve({ messageId: `<fake-${record.sent.length}@smtp.test>` });
      },
      verify() {
        record.verifyCalls += 1;
        return state.verifyError === undefined
          ? Promise.resolve(true)
          : // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- fakes reject with any value on purpose
            Promise.reject(state.verifyError);
      },
      close() {
        record.closeCalls += 1;
      },
    };
  }
  return { state, createTransport };
});

vi.mock('nodemailer', () => ({
  default: { createTransport: smtpFake.createTransport },
  createTransport: smtpFake.createTransport,
}));

const VISITOR = 'amelia.hart@example.com';
const SUBJECT = 'New message from Amelia Hart via faisalhanif.work';

function message(overrides: Partial<MailMessage> = {}): MailMessage {
  return {
    tag: 'contact-owner',
    to: 'owner@example.com',
    subject: SUBJECT,
    html: '<p>Hello</p>',
    text: 'Hello',
    replyTo: VISITOR,
    ...overrides,
  };
}

/** A fake transport injected through deps, recording every call. */
function fakeTransport(options: { sendError?: unknown; verifyError?: unknown } = {}) {
  const calls = {
    created: [] as SMTPTransportOptions[],
    sent: [] as SendMailOptions[],
    verify: 0,
    close: 0,
  };
  const transport: SmtpTransport = {
    sendMail(data) {
      calls.sent.push(data);
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- fakes reject with any value on purpose
      if (options.sendError !== undefined) return Promise.reject(options.sendError);
      return Promise.resolve({ messageId: '<abc123@example.com>' });
    },
    verify() {
      calls.verify += 1;
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- fakes reject with any value on purpose
      if (options.verifyError !== undefined) return Promise.reject(options.verifyError);
      return Promise.resolve(true);
    },
    close() {
      calls.close += 1;
    },
  };
  const createTransport = (opts: SMTPTransportOptions) => {
    calls.created.push(opts);
    return transport;
  };
  return { calls, createTransport };
}

/** An SMTP error as Nodemailer builds it, with server text that holds an address. */
function smtpError(code: string, responseCode?: number): Error {
  const error = new Error(`Invalid login: 535 5.7.8 Username and Password not accepted ${VISITOR}`);
  return Object.assign(error, {
    code,
    responseCode,
    response: `535 5.7.8 Username and Password not accepted for ${VISITOR}`,
    command: 'AUTH PLAIN',
  });
}

describe('createSmtpMailer', () => {
  it('builds the transport from env only, with timeouts and no file or URL access', async () => {
    const { calls, createTransport } = fakeTransport();
    const env = makeTestEnv({ SMTP_HOST: 'mail.example.net', SMTP_PORT: 587, SMTP_SECURE: false });
    const mailer = createSmtpMailer(env, createCapturingLogger().logger, { createTransport });
    expect(mailer.kind).toBe('smtp');
    expect(calls.created).toHaveLength(0); // created lazily, on first use

    await mailer.send(message());
    await mailer.send(message({ tag: 'contact-visitor' }));
    expect(calls.created).toHaveLength(1);
    expect(calls.created[0]).toMatchObject({
      host: 'mail.example.net',
      port: 587,
      secure: false,
      auth: { user: 'sender@example.com', pass: 'test-smtp-pass' },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    expect(SMTP_TIMEOUTS).toMatchObject({
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  });

  it('sends from the default "Faisal Hanif <SMTP_USER>" address', async () => {
    const { calls, createTransport } = fakeTransport();
    const mailer = createSmtpMailer(makeTestEnv(), createCapturingLogger().logger, {
      createTransport,
    });
    const result = await mailer.send(message());
    expect(result).toEqual({ messageId: '<abc123@example.com>' });
    expect(calls.sent[0]).toMatchObject({
      from: 'Faisal Hanif <sender@example.com>',
      to: 'owner@example.com',
      subject: SUBJECT,
      replyTo: VISITOR,
      html: '<p>Hello</p>',
      text: 'Hello',
    });
  });

  it('sends from MAIL_FROM when it is set and passes attachments through', async () => {
    const { calls, createTransport } = fakeTransport();
    const env = makeTestEnv({ MAIL_FROM: 'Portfolio <hello@example.com>' });
    const mailer = createSmtpMailer(env, createCapturingLogger().logger, { createTransport });
    await mailer.send(
      message({
        attachments: [
          { filename: 'invite.ics', content: 'BEGIN:VCALENDAR', contentType: 'text/calendar' },
        ],
      }),
    );
    expect(calls.sent[0]?.from).toBe('Portfolio <hello@example.com>');
    expect(calls.sent[0]?.attachments).toEqual([
      { filename: 'invite.ics', content: 'BEGIN:VCALENDAR', contentType: 'text/calendar' },
    ]);
  });

  it('strips CR and LF from the subject, to and replyTo headers', async () => {
    const { calls, createTransport } = fakeTransport();
    const mailer = createSmtpMailer(makeTestEnv(), createCapturingLogger().logger, {
      createTransport,
    });
    await mailer.send(
      message({
        to: 'owner@example.com\r\nBcc: victim@example.com',
        subject: 'Hello\r\nBcc: victim@example.com\nX-Spam: yes',
        replyTo: `${VISITOR}\r\nCc: other@example.com`,
      }),
    );
    const sent = calls.sent[0];
    for (const value of [sent?.to, sent?.subject, sent?.replyTo]) {
      expect(typeof value).toBe('string');
      expect(value as string).not.toMatch(/[\r\n]/);
    }
    expect(sent?.subject).toBe('Hello Bcc: victim@example.com X-Spam: yes');
  });

  it('leaves replyTo out when it is empty and refuses an empty recipient', async () => {
    const { calls, createTransport } = fakeTransport();
    const mailer = createSmtpMailer(makeTestEnv(), createCapturingLogger().logger, {
      createTransport,
    });
    await mailer.send(message({ replyTo: ' \r\n ' }));
    expect(calls.sent[0]).not.toHaveProperty('replyTo');
    await expect(mailer.send(message({ to: '\r\n' }))).rejects.toMatchObject({
      name: 'MailSendError',
      code: 'EENVELOPE',
    });
    expect(calls.sent).toHaveLength(1);
  });

  it('logs the tag, message id and duration only', async () => {
    const { createTransport } = fakeTransport();
    const capture = createCapturingLogger();
    let clock = 1_000;
    const mailer = createSmtpMailer(makeTestEnv(), capture.logger, {
      createTransport,
      now: () => (clock += 25),
    });
    await mailer.send(message());
    const line = capture.lines().find((entry) => entry.event === 'mail.sent');
    expect(line).toMatchObject({
      tag: 'contact-owner',
      messageId: '<abc123@example.com>',
      durationMs: 25,
    });
    const text = capture.text();
    expect(text).not.toContain(VISITOR);
    expect(text).not.toContain('owner@example.com');
    expect(text).not.toContain('Amelia');
    expect(text).not.toContain('test-smtp-pass');
  });

  it('maps a send failure to MailSendError without the SMTP server text', async () => {
    const { createTransport } = fakeTransport({ sendError: smtpError('EAUTH', 535) });
    const capture = createCapturingLogger();
    const mailer = createSmtpMailer(makeTestEnv(), capture.logger, { createTransport });
    const failure = await mailer.send(message()).catch((error: unknown) => error);
    expect(isMailSendError(failure)).toBe(true);
    const mailError = failure as MailSendError;
    expect(mailError).toMatchObject({ tag: 'contact-owner', code: 'EAUTH', responseCode: 535 });
    expect(mailError.message).toBe('The email could not be sent.');
    expect(mailError.cause).toBeUndefined();
    expect(JSON.stringify(mailError)).not.toContain(VISITOR);
    const warn = capture.lines().find((entry) => entry.event === 'mail.failed');
    expect(warn).toMatchObject({ tag: 'contact-owner', code: 'EAUTH', responseCode: 535 });
    expect(capture.text()).not.toContain(VISITOR);
    expect(capture.text()).not.toContain('Username and Password');
  });

  it('maps unknown failures to EUNKNOWN', async () => {
    for (const thrown of ['boom', new Error('no code'), { code: 'not a code!' }, null]) {
      const { createTransport } = fakeTransport({ sendError: thrown });
      const mailer = createSmtpMailer(makeTestEnv(), createCapturingLogger().logger, {
        createTransport,
      });
      await expect(mailer.send(message())).rejects.toMatchObject({ code: 'EUNKNOWN' });
    }
  });

  it('maps a transport that cannot be built to MailSendError', async () => {
    const mailer = createSmtpMailer(makeTestEnv(), createCapturingLogger().logger, {
      createTransport: () => {
        throw Object.assign(new Error('bad config'), { code: 'ECONFIG' });
      },
    });
    await expect(mailer.send(message())).rejects.toMatchObject({ code: 'ECONFIG' });
  });

  it('verify maps errors and close closes the transport once', async () => {
    const { calls, createTransport } = fakeTransport({ verifyError: smtpError('ETIMEDOUT') });
    const mailer = createSmtpMailer(makeTestEnv(), createCapturingLogger().logger, {
      createTransport,
    });
    await expect(mailer.verify()).rejects.toMatchObject({ tag: 'verify', code: 'ETIMEDOUT' });
    expect(calls.verify).toBe(1);
    await mailer.close();
    await mailer.close();
    expect(calls.close).toBe(1);
  });

  it('close before any use opens nothing', async () => {
    const { calls, createTransport } = fakeTransport();
    const mailer = createSmtpMailer(makeTestEnv(), createCapturingLogger().logger, {
      createTransport,
    });
    await mailer.close();
    expect(calls.created).toHaveLength(0);
  });

  it('leaves auth out when SMTP_USER or SMTP_PASS is missing', async () => {
    const { calls, createTransport } = fakeTransport();
    const env = makeTestEnv({ SMTP_USER: undefined, SMTP_PASS: undefined });
    await createSmtpMailer(env, createCapturingLogger().logger, { createTransport }).verify();
    expect(calls.created[0]).not.toHaveProperty('auth');
  });
});

describe('createFileMailer', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'fh-mail-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('defaults to backend/tmp/mail, found from the module, not the cwd', () => {
    expect(DEFAULT_FAKE_MAIL_DIR.endsWith(path.join('backend', 'tmp', 'mail'))).toBe(true);
    expect(path.isAbsolute(DEFAULT_FAKE_MAIL_DIR)).toBe(true);
  });

  it('writes <timestamp>-<tag>.html, .txt and each attachment', async () => {
    const capture = createCapturingLogger();
    const mailer = createFileMailer({
      dir,
      logger: capture.logger,
      now: () => new Date('2026-09-29T11:20:33.123Z'),
    });
    expect(mailer.kind).toBe('file');
    const result = await mailer.send(
      message({
        tag: 'booking-visitor',
        attachments: [
          { filename: 'invite.ics', content: 'BEGIN:VCALENDAR', contentType: 'text/calendar' },
          { filename: '../../evil name.txt', content: Buffer.from('x'), contentType: 'text/plain' },
        ],
      }),
    );
    const base = '2026-09-29T11-20-33-123Z-booking-visitor';
    expect(result.messageId).toBe(`<${base}@dev-fake.local>`);
    const files = (await readdir(dir)).sort();
    expect(files).toEqual(
      [`${base}.html`, `${base}.txt`, `${base}-invite.ics`, `${base}-evil-name.txt`].sort(),
    );
    expect(await readFile(path.join(dir, `${base}.html`), 'utf8')).toBe('<p>Hello</p>');
    const text = await readFile(path.join(dir, `${base}.txt`), 'utf8');
    expect(text).toContain('To: owner@example.com');
    expect(text).toContain(`Reply-To: ${VISITOR}`);
    expect(text).toContain(`Subject: ${SUBJECT}`);
    expect(text.endsWith('Hello')).toBe(true);
    expect(await readFile(path.join(dir, `${base}-invite.ics`), 'utf8')).toBe('BEGIN:VCALENDAR');

    const line = capture.lines().find((entry) => entry.event === 'mail.sent');
    expect(line).toMatchObject({ tag: 'booking-visitor', file: path.join(dir, `${base}.html`) });
    expect(capture.text()).not.toContain('Amelia');
    expect(capture.text()).not.toContain(VISITOR);
  });

  it('never overwrites: the same tag in the same millisecond gets -2', async () => {
    const mailer = createFileMailer({
      dir,
      logger: createCapturingLogger().logger,
      now: () => new Date('2026-09-29T11:20:33.123Z'),
    });
    await mailer.send(message());
    const second = await mailer.send(message());
    expect(second.messageId).toBe('<2026-09-29T11-20-33-123Z-contact-owner-2@dev-fake.local>');
    expect(await readdir(dir)).toHaveLength(4);
  });

  it('verify creates the folder and close does nothing', async () => {
    const nested = path.join(dir, 'a', 'b');
    const mailer = createFileMailer({ dir: nested, logger: createCapturingLogger().logger });
    await mailer.verify();
    expect(await readdir(nested)).toEqual([]);
    await expect(mailer.close()).resolves.toBeUndefined();
  });

  it('maps a write failure to MailSendError', async () => {
    const blocked = path.join(dir, 'file-not-folder');
    await createFileMailer({ dir, logger: createCapturingLogger().logger }).send(message());
    const [first] = await readdir(dir);
    const mailer = createFileMailer({
      dir: path.join(dir, first ?? blocked),
      logger: createCapturingLogger().logger,
    });
    await expect(mailer.send(message())).rejects.toBeInstanceOf(MailSendError);
  });
});

describe('createMemoryMailer', () => {
  it('keeps every sent message and returns ids', async () => {
    const mailer = createMemoryMailer();
    const first = await mailer.send(message());
    await mailer.send(message({ tag: 'contact-visitor', to: VISITOR }));
    expect(mailer.kind).toBe('memory');
    expect(first.messageId).toBe('<memory-1@test.local>');
    expect(mailer.outbox.map((mail) => mail.tag)).toEqual(['contact-owner', 'contact-visitor']);
    expect(mailer.byTag('contact-visitor')[0]?.to).toBe(VISITOR);
    mailer.clear();
    expect(mailer.outbox).toHaveLength(0);
  });

  it('fails on demand by tag, list of tags or a test', async () => {
    const byTag = createMemoryMailer({ failOn: 'contact-visitor', failCode: 'ETIMEDOUT' });
    await byTag.send(message());
    await expect(byTag.send(message({ tag: 'contact-visitor' }))).rejects.toMatchObject({
      name: 'MailSendError',
      code: 'ETIMEDOUT',
      tag: 'contact-visitor',
    });
    expect(byTag.outbox).toHaveLength(1);
    expect(byTag.failed).toHaveLength(1);

    const byList = createMemoryMailer({ failOn: ['a', 'b'] });
    await expect(byList.send(message({ tag: 'b' }))).rejects.toBeInstanceOf(MailSendError);

    const byTest = createMemoryMailer({ failOn: (mail) => mail.to.endsWith('@example.com') });
    await expect(byTest.send(message())).rejects.toMatchObject({ code: 'ECONNECTION' });

    byTest.setFailOn(undefined);
    await expect(byTest.send(message())).resolves.toHaveProperty('messageId');
  });

  it('counts verify and close calls and can fail verify', async () => {
    const mailer = createMemoryMailer({ failVerify: true });
    await expect(mailer.verify()).rejects.toMatchObject({ code: 'EAUTH' });
    await mailer.close();
    expect(mailer.verifyCalls).toBe(1);
    expect(mailer.closeCalls).toBe(1);
  });
});

function makeCtx(envOverrides: Parameters<typeof makeTestEnv>[0] = {}) {
  const capture = createCapturingLogger();
  const lifecycle: Lifecycle = createLifecycle(capture.logger);
  const hooks = { started: [] as string[], shutdown: [] as string[] };
  const ctx: AppContext = {
    env: makeTestEnv(envOverrides),
    logger: capture.logger,
    lifecycle: {
      ...lifecycle,
      onStarted: (name, fn) => {
        hooks.started.push(name);
        lifecycle.onStarted(name, fn);
      },
      onShutdown: (name, fn) => {
        hooks.shutdown.push(name);
        lifecycle.onShutdown(name, fn);
      },
    },
  };
  return { ctx, capture, hooks, lifecycle };
}

describe('getMailer', () => {
  beforeEach(() => {
    resetMailerForTests();
    smtpFake.state.transports.length = 0;
    smtpFake.state.verifyError = undefined;
  });

  afterEach(() => {
    resetMailerForTests();
  });

  it('returns null and registers nothing when mail is not configured', () => {
    const { ctx, hooks } = makeCtx({ SMTP_USER: undefined, SMTP_PASS: undefined });
    expect(getMailer(ctx)).toBeNull();
    expect(createMailer(ctx.env, ctx.logger)).toBeNull();
    expect(hooks).toEqual({ started: [], shutdown: [] });
  });

  it('returns null without MAIL_TO_OWNER', () => {
    const { ctx } = makeCtx({ MAIL_TO_OWNER: undefined });
    expect(getMailer(ctx)).toBeNull();
  });

  it('uses the file mailer with DEV_FAKE_EXTERNALS, even without SMTP settings', () => {
    const { ctx } = makeCtx({
      DEV_FAKE_EXTERNALS: true,
      SMTP_USER: undefined,
      SMTP_PASS: undefined,
      MAIL_TO_OWNER: undefined,
    });
    expect(getMailer(ctx)?.kind).toBe('file');
  });

  it('uses SMTP when configured, once per process, with the two lifecycle hooks', async () => {
    const { ctx, hooks, lifecycle } = makeCtx();
    const mailer = getMailer(ctx);
    expect(mailer?.kind).toBe('smtp');
    expect(getMailer(ctx)).toBe(mailer);
    expect(hooks).toEqual({ started: ['smtp-verify'], shutdown: ['mail'] });

    await lifecycle.runStarted();
    expect(smtpFake.state.transports).toHaveLength(1);
    expect(smtpFake.state.transports[0]?.verifyCalls).toBe(1);

    await lifecycle.runShutdown();
    expect(smtpFake.state.transports[0]?.closeCalls).toBe(1);

    resetMailerForTests();
    expect(getMailer(ctx)).not.toBe(mailer);
  });

  it('a failed SMTP check logs one clear warning with the error code and nothing else', async () => {
    smtpFake.state.verifyError = smtpError('EAUTH', 535);
    const { ctx, capture, lifecycle } = makeCtx();
    getMailer(ctx);
    await lifecycle.runStarted();
    const warnings = capture.lines().filter((line) => line.level === 40);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({ event: 'mail.verify_failed', code: 'EAUTH' });
    expect(warnings[0]?.msg).toContain('EAUTH');
    expect(capture.text()).not.toContain(VISITOR);
    expect(capture.text()).not.toContain('Username and Password');
  });

  it('sends through the SMTP transport with the configured sender', async () => {
    const { ctx } = makeCtx();
    const mailer = getMailer(ctx);
    await mailer?.send(message());
    const record = smtpFake.state.transports[0];
    expect(record?.options).toMatchObject({ host: 'smtp.example.test', port: 465, secure: true });
    expect(record?.sent[0]).toMatchObject({ from: 'Faisal Hanif <sender@example.com>' });
  });
});

describe('ownerAddress', () => {
  it('uses MAIL_TO_OWNER, a placeholder in dev fake mode, else null', () => {
    expect(ownerAddress(makeTestEnv())).toBe('owner@example.com');
    expect(ownerAddress(makeTestEnv({ MAIL_TO_OWNER: undefined }))).toBeNull();
    expect(ownerAddress(makeTestEnv({ MAIL_TO_OWNER: undefined, DEV_FAKE_EXTERNALS: true }))).toBe(
      DEV_FAKE_OWNER_ADDRESS,
    );
  });
});
