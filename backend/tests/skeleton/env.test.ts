import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_DEV_CORS_ORIGINS,
  DEFAULT_ENV_FILE,
  EnvError,
  features,
  loadEnv,
  mailFrom,
  parseEnv,
  unconfiguredFeatures,
} from '../../src/config/env.js';
import { makeTestEnv } from '../helpers/testEnv.js';

function envErrorOf(source: Record<string, string | undefined>): EnvError {
  try {
    parseEnv(source);
  } catch (error) {
    if (error instanceof EnvError) return error;
    throw error;
  }
  throw new Error('parseEnv did not throw');
}

describe('parseEnv defaults', () => {
  it('fills every default from an empty source', () => {
    const env = parseEnv({});
    expect(env).toMatchObject({
      NODE_ENV: 'development',
      HOST: '127.0.0.1',
      PORT: 8787,
      LOG_LEVEL: 'info',
      TRUST_PROXY: 1,
      CORS_ORIGINS: [...DEFAULT_DEV_CORS_ORIGINS],
      SITE_URL: 'https://faisalhanif.work',
      DEV_FAKE_EXTERNALS: false,
      OPENROUTER_FALLBACK_MODELS: [],
      CHAT_MAX_TOKENS: 600,
      CHAT_DAILY_GLOBAL_LIMIT: 1000,
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: 465,
      SMTP_SECURE: true,
      GOOGLE_CALENDAR_ID: 'primary',
      BOOKING_TIMEZONE: 'Asia/Karachi',
    });
    expect(env.OPENROUTER_API_KEY).toBeUndefined();
    expect(env.OPENROUTER_MODEL).toBeUndefined();
    expect(env.MAIL_FROM).toBeUndefined();
    expect(env.ZOOM_CLIENT_SECRET).toBeUndefined();
  });

  it('defaults LOG_LEVEL to silent in tests', () => {
    expect(parseEnv({ NODE_ENV: 'test' }).LOG_LEVEL).toBe('silent');
    expect(parseEnv({ NODE_ENV: 'test', LOG_LEVEL: 'debug' }).LOG_LEVEL).toBe('debug');
  });

  it('treats empty and blank strings as unset', () => {
    const env = parseEnv({
      PORT: '',
      OPENROUTER_API_KEY: '   ',
      SMTP_HOST: '',
      CORS_ORIGINS: '',
      DEV_FAKE_EXTERNALS: '',
    });
    expect(env.PORT).toBe(8787);
    expect(env.OPENROUTER_API_KEY).toBeUndefined();
    expect(env.SMTP_HOST).toBe('smtp.gmail.com');
    expect(env.CORS_ORIGINS).toEqual([...DEFAULT_DEV_CORS_ORIGINS]);
    expect(env.DEV_FAKE_EXTERNALS).toBe(false);
  });

  it('ignores unknown variables', () => {
    const env = parseEnv({ PATH: '/usr/bin', HOME: '/home/someone' });
    expect(env).not.toHaveProperty('PATH');
  });
});

describe('parseEnv values', () => {
  it('parses numbers, flags and lists', () => {
    const env = parseEnv({
      PORT: '0',
      CHAT_MAX_TOKENS: '50',
      CHAT_DAILY_GLOBAL_LIMIT: '25',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      DEV_FAKE_EXTERNALS: 'TRUE',
      OPENROUTER_FALLBACK_MODELS: ' a/one , b/two ,, ',
      CORS_ORIGINS:
        'https://faisalhanif.work/, https://www.faisalhanif.work,https://faisalhanif.work',
    });
    expect(env.PORT).toBe(0);
    expect(env.CHAT_MAX_TOKENS).toBe(50);
    expect(env.CHAT_DAILY_GLOBAL_LIMIT).toBe(25);
    expect(env.SMTP_PORT).toBe(587);
    expect(env.SMTP_SECURE).toBe(false);
    expect(env.DEV_FAKE_EXTERNALS).toBe(true);
    expect(env.OPENROUTER_FALLBACK_MODELS).toEqual(['a/one', 'b/two']);
    expect(env.CORS_ORIGINS).toEqual(['https://faisalhanif.work', 'https://www.faisalhanif.work']);
  });

  it('parses TRUST_PROXY as a hop count, a flag or an address list', () => {
    expect(parseEnv({ TRUST_PROXY: '2' }).TRUST_PROXY).toBe(2);
    expect(parseEnv({ TRUST_PROXY: 'false' }).TRUST_PROXY).toBe(false);
    expect(parseEnv({ TRUST_PROXY: 'true' }).TRUST_PROXY).toBe(true);
    expect(parseEnv({ TRUST_PROXY: 'loopback' }).TRUST_PROXY).toBe('loopback');
  });

  it('API_PUBLIC_URL defaults to SITE_URL and can be set on its own', () => {
    expect(parseEnv({ SITE_URL: 'https://example.com' }).API_PUBLIC_URL).toBe(
      'https://example.com',
    );
    expect(
      parseEnv({ SITE_URL: 'https://example.com', API_PUBLIC_URL: 'http://localhost:8787/' })
        .API_PUBLIC_URL,
    ).toBe('http://localhost:8787');
    expect(() => parseEnv({ API_PUBLIC_URL: 'ftp://x' })).toThrow(/API_PUBLIC_URL/);
  });

  it('keeps SITE_URL without a trailing slash', () => {
    expect(parseEnv({ SITE_URL: 'https://example.com/' }).SITE_URL).toBe('https://example.com');
  });

  it('rejects values out of range or malformed', () => {
    const error = envErrorOf({
      PORT: '70000',
      CHAT_MAX_TOKENS: '10',
      SMTP_SECURE: 'maybe',
      NODE_ENV: 'staging',
      LOG_LEVEL: 'loud',
      CORS_ORIGINS: 'https://ok.example,https://bad.example/path',
      SITE_URL: 'ftp://example.com',
      MAIL_TO_OWNER: 'not-an-email',
      BOOKING_TIMEZONE: 'Mars/Olympus',
    });
    expect(error.issues.map((issue) => issue.name).sort()).toEqual(
      [
        'PORT',
        'CHAT_MAX_TOKENS',
        'SMTP_SECURE',
        'NODE_ENV',
        'LOG_LEVEL',
        'CORS_ORIGINS',
        'SITE_URL',
        'MAIL_TO_OWNER',
        'BOOKING_TIMEZONE',
      ].sort(),
    );
    expect(error.message).toContain('CHAT_MAX_TOKENS: must be between 50 and 4000');
  });

  it('lists names and reasons only, never values', () => {
    const secretish = 'sk-or-super-secret-value-123';
    const error = envErrorOf({
      PORT: secretish,
      SMTP_PORT: `${secretish}-2`,
      MAIL_TO_OWNER: `${secretish}@nowhere`,
      CORS_ORIGINS: `https://example.com/${secretish}`,
      OPENROUTER_API_KEY: secretish,
    });
    expect(error.message).toContain('PORT');
    expect(error.message).toContain('MAIL_TO_OWNER');
    expect(error.message).not.toContain(secretish);
    expect(JSON.stringify(error.issues)).not.toContain(secretish);
  });
});

describe('parseEnv in production', () => {
  const prod = { NODE_ENV: 'production', CORS_ORIGINS: 'https://faisalhanif.work' };

  it('accepts a production config without any secrets', () => {
    const env = parseEnv(prod);
    expect(env.NODE_ENV).toBe('production');
    expect(env.CORS_ORIGINS).toEqual(['https://faisalhanif.work']);
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('refuses DEV_FAKE_EXTERNALS=true', () => {
    const error = envErrorOf({ ...prod, DEV_FAKE_EXTERNALS: 'true' });
    expect(error.issues).toEqual([
      { name: 'DEV_FAKE_EXTERNALS', reason: 'is not allowed in production' },
    ]);
    expect(parseEnv({ ...prod, DEV_FAKE_EXTERNALS: 'false' }).DEV_FAKE_EXTERNALS).toBe(false);
  });

  it('requires CORS_ORIGINS (an empty value counts as missing)', () => {
    for (const cors of [undefined, '', '  ']) {
      const error = envErrorOf({ NODE_ENV: 'production', CORS_ORIGINS: cors });
      expect(error.issues).toEqual([{ name: 'CORS_ORIGINS', reason: 'is required in production' }]);
    }
  });

  it('reports production rules together with other problems', () => {
    const error = envErrorOf({ NODE_ENV: 'production', DEV_FAKE_EXTERNALS: '1', PORT: 'x' });
    expect(error.issues.map((issue) => issue.name).sort()).toEqual(
      ['CORS_ORIGINS', 'DEV_FAKE_EXTERNALS', 'PORT'].sort(),
    );
  });
});

describe('features', () => {
  const bare = parseEnv({ NODE_ENV: 'test' });

  it('reports everything off without keys', () => {
    expect(features(bare)).toEqual({ chat: false, mail: false, google: false, zoom: false });
    expect(unconfiguredFeatures(bare)).toEqual(['chat', 'mail', 'google', 'zoom']);
  });

  it('needs both the chat key and model', () => {
    expect(features({ ...bare, OPENROUTER_API_KEY: 'k' }).chat).toBe(false);
    expect(features({ ...bare, OPENROUTER_MODEL: 'm/x' }).chat).toBe(false);
    expect(features({ ...bare, OPENROUTER_API_KEY: 'k', OPENROUTER_MODEL: 'm/x' }).chat).toBe(true);
  });

  it('needs SMTP_USER, SMTP_PASS and MAIL_TO_OWNER for mail', () => {
    const mail = { SMTP_USER: 'u@example.com', SMTP_PASS: 'p', MAIL_TO_OWNER: 'o@example.com' };
    expect(features({ ...bare, ...mail }).mail).toBe(true);
    expect(features({ ...bare, ...mail, MAIL_TO_OWNER: undefined }).mail).toBe(false);
    expect(features({ ...bare, ...mail, SMTP_PASS: undefined }).mail).toBe(false);
  });

  it('needs the three Google secrets and the three Zoom values', () => {
    const google = { GOOGLE_CLIENT_ID: 'a', GOOGLE_CLIENT_SECRET: 'b', GOOGLE_REFRESH_TOKEN: 'c' };
    const zoom = { ZOOM_ACCOUNT_ID: 'a', ZOOM_CLIENT_ID: 'b', ZOOM_CLIENT_SECRET: 'c' };
    expect(features({ ...bare, ...google }).google).toBe(true);
    expect(features({ ...bare, ...google, GOOGLE_REFRESH_TOKEN: undefined }).google).toBe(false);
    expect(features({ ...bare, ...zoom }).zoom).toBe(true);
    expect(features({ ...bare, ...zoom, ZOOM_ACCOUNT_ID: undefined }).zoom).toBe(false);
  });

  it('counts chat, mail and google as available with DEV_FAKE_EXTERNALS, never zoom', () => {
    expect(features({ ...bare, DEV_FAKE_EXTERNALS: true })).toEqual({
      chat: true,
      mail: true,
      google: true,
      zoom: false,
    });
  });

  it('matches the test env (chat and mail on, google and zoom off)', () => {
    expect(features(makeTestEnv())).toEqual({
      chat: true,
      mail: true,
      google: false,
      zoom: false,
    });
  });
});

describe('mailFrom', () => {
  it('prefers MAIL_FROM, else uses "Faisal Hanif <SMTP_USER>"', () => {
    const env = makeTestEnv({ SMTP_USER: 'me@example.com' });
    expect(mailFrom(env)).toBe('Faisal Hanif <me@example.com>');
    expect(mailFrom({ ...env, MAIL_FROM: 'Site <site@example.com>' })).toBe(
      'Site <site@example.com>',
    );
    expect(mailFrom({ ...env, SMTP_USER: undefined })).toBe('Faisal Hanif <no-reply@localhost>');
  });
});

describe('loadEnv', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'env-test-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('points at backend/.env by default', () => {
    expect(path.basename(DEFAULT_ENV_FILE)).toBe('.env');
    expect(path.basename(path.dirname(DEFAULT_ENV_FILE))).toBe('backend');
  });

  it('reads the file without overriding real variables', () => {
    const file = path.join(dir, '.env');
    writeFileSync(file, 'PORT=9100\nOPENROUTER_MODEL=file/model\nSMTP_HOST=from-file.example\n');
    const target: Record<string, string | undefined> = {
      NODE_ENV: 'test',
      SMTP_HOST: 'real.example',
    };
    const env = loadEnv({ path: file, processEnv: target });
    expect(env.PORT).toBe(9100);
    expect(env.OPENROUTER_MODEL).toBe('file/model');
    expect(env.SMTP_HOST).toBe('real.example');
  });

  it('works when the file does not exist', () => {
    const env = loadEnv({ path: path.join(dir, 'missing.env'), processEnv: { NODE_ENV: 'test' } });
    expect(env.PORT).toBe(8787);
  });

  it('prints names only and exits 1 on an invalid config', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const secret = 'do-not-print-this-value';
    loadEnv({
      path: path.join(dir, 'missing.env'),
      processEnv: { NODE_ENV: 'test', PORT: secret },
    });
    expect(exit).toHaveBeenCalledWith(1);
    const printed = stderr.mock.calls.map((call) => String(call[0])).join('');
    expect(printed).toContain('PORT');
    expect(printed).not.toContain(secret);
  });
});
