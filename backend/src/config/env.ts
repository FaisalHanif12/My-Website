import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';
import { EMAIL_RE, isValidTimeZone } from '../validators/common.js';

export const NODE_ENVS = ['development', 'test', 'production'] as const;
export type NodeEnv = (typeof NODE_ENVS)[number];

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/** Express "trust proxy" value: hop count, on/off, or a list of trusted addresses. */
export type TrustProxy = number | boolean | string;

/** CORS origins allowed outside production when CORS_ORIGINS is not set. */
export const DEFAULT_DEV_CORS_ORIGINS: readonly string[] = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

/** Validated server configuration. Secrets stay optional so the server boots without them. */
export interface Env {
  readonly NODE_ENV: NodeEnv;
  readonly HOST: string;
  readonly PORT: number;
  readonly LOG_LEVEL: LogLevel;
  readonly TRUST_PROXY: TrustProxy;
  readonly CORS_ORIGINS: readonly string[];
  readonly SITE_URL: string;
  /**
   * Public address of this API, used for the meeting join links in the booking emails
   * (<API_PUBLIC_URL>/api/join/<token>). Defaults to SITE_URL, right when nginx serves /api on the
   * site's own domain. Set it in local tests, where the site and the API use different ports.
   */
  readonly API_PUBLIC_URL: string;
  readonly DEV_FAKE_EXTERNALS: boolean;

  readonly OPENROUTER_API_KEY: string | undefined;
  readonly OPENROUTER_MODEL: string | undefined;
  readonly OPENROUTER_FALLBACK_MODELS: readonly string[];
  readonly CHAT_MAX_TOKENS: number;
  readonly CHAT_DAILY_GLOBAL_LIMIT: number;

  readonly SMTP_HOST: string;
  readonly SMTP_PORT: number;
  readonly SMTP_SECURE: boolean;
  readonly SMTP_USER: string | undefined;
  readonly SMTP_PASS: string | undefined;
  readonly MAIL_FROM: string | undefined;
  readonly MAIL_TO_OWNER: string | undefined;

  readonly GOOGLE_CLIENT_ID: string | undefined;
  readonly GOOGLE_CLIENT_SECRET: string | undefined;
  readonly GOOGLE_REFRESH_TOKEN: string | undefined;
  readonly GOOGLE_CALENDAR_ID: string;
  readonly BOOKING_TIMEZONE: string;

  readonly ZOOM_ACCOUNT_ID: string | undefined;
  readonly ZOOM_CLIENT_ID: string | undefined;
  readonly ZOOM_CLIENT_SECRET: string | undefined;

  readonly JOIN_LINK_SECRET: string | undefined;
}

/** One problem with one variable. Holds the name and a reason, never the value. */
export interface EnvIssue {
  readonly name: string;
  readonly reason: string;
}

/** Thrown by parseEnv. The message lists variable names and reasons only, never values. */
export class EnvError extends Error {
  readonly issues: readonly EnvIssue[];

  constructor(issues: readonly EnvIssue[]) {
    const lines = issues.map((issue) => `  - ${issue.name}: ${issue.reason}`);
    super(`Invalid environment configuration:\n${lines.join('\n')}`);
    this.name = 'EnvError';
    this.issues = issues;
  }
}

export type EnvSource = Readonly<Record<string, string | undefined>>;

const TRUE_WORDS = new Set(['true', '1', 'yes', 'on']);
const FALSE_WORDS = new Set(['false', '0', 'no', 'off']);

/** Trims every value and turns empty strings into undefined ("empty counts as unset"). */
function cleanSource(source: EnvSource): Record<string, string | undefined> {
  const cleaned: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(source)) {
    const trimmed = typeof value === 'string' ? value.trim() : undefined;
    cleaned[key] = trimmed ? trimmed : undefined;
  }
  return cleaned;
}

/** Optional secret or setting. The transform keeps the key present (value may be undefined). */
function optionalText() {
  return z
    .string()
    .optional()
    .transform((value) => value);
}

function textWithDefault(fallback: string) {
  return z.string().default(fallback);
}

function wholeNumber(fallback: number, min: number, max: number) {
  return z
    .string()
    .optional()
    .transform((raw, ctx) => {
      if (raw === undefined) return fallback;
      if (!/^-?\d+$/.test(raw)) {
        ctx.addIssue({ code: 'custom', message: 'must be a whole number' });
        return z.NEVER;
      }
      const value = Number(raw);
      if (value < min || value > max) {
        ctx.addIssue({ code: 'custom', message: `must be between ${min} and ${max}` });
        return z.NEVER;
      }
      return value;
    });
}

function flag(fallback: boolean) {
  return z
    .string()
    .optional()
    .transform((raw, ctx) => {
      if (raw === undefined) return fallback;
      const word = raw.toLowerCase();
      if (TRUE_WORDS.has(word)) return true;
      if (FALSE_WORDS.has(word)) return false;
      ctx.addIssue({ code: 'custom', message: 'must be true or false' });
      return z.NEVER;
    });
}

function commaList() {
  return z
    .string()
    .optional()
    .transform((raw) =>
      raw === undefined
        ? []
        : raw
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
    );
}

/** Returns the origin without a trailing slash, or undefined when it is not a bare origin. */
function normaliseOrigin(entry: string): string | undefined {
  const candidate = entry.replace(/\/+$/, '');
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return undefined;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
  return url.origin === candidate.toLowerCase() || url.origin === candidate
    ? url.origin
    : undefined;
}

function originList() {
  return z
    .string()
    .optional()
    .transform((raw, ctx) => {
      if (raw === undefined) return undefined;
      const entries = raw
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      const origins: string[] = [];
      entries.forEach((entry, index) => {
        const origin = normaliseOrigin(entry);
        if (origin === undefined) {
          ctx.addIssue({
            code: 'custom',
            message: `entry ${index + 1} is not an origin like https://example.com (scheme, host and optional port, no path)`,
          });
        } else if (!origins.includes(origin)) {
          origins.push(origin);
        }
      });
      if (origins.length === 0 && entries.length === 0) {
        ctx.addIssue({ code: 'custom', message: 'must list at least one origin' });
      }
      return origins;
    });
}

function httpUrl(fallback: string) {
  return z
    .string()
    .default(fallback)
    .transform((raw, ctx) => {
      try {
        const url = new URL(raw);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return url.href.replace(/\/+$/, '');
        }
      } catch {
        // reported below
      }
      ctx.addIssue({ code: 'custom', message: 'must be an http or https URL' });
      return z.NEVER;
    });
}

function optionalEmail() {
  return z
    .string()
    .optional()
    .refine((value) => value === undefined || EMAIL_RE.test(value), {
      error: 'must be an email address',
    })
    .transform((value) => value);
}

function trustProxy() {
  return z
    .string()
    .optional()
    .transform((raw): TrustProxy => {
      if (raw === undefined) return 1;
      const word = raw.toLowerCase();
      if (word === 'true') return true;
      if (word === 'false') return false;
      if (/^\d+$/.test(raw)) return Number(raw);
      return raw;
    });
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(NODE_ENVS, { error: `must be one of ${NODE_ENVS.join(', ')}` })
    .default('development'),
  HOST: textWithDefault('127.0.0.1'),
  PORT: wholeNumber(8787, 0, 65535),
  LOG_LEVEL: z.enum(LOG_LEVELS, { error: `must be one of ${LOG_LEVELS.join(', ')}` }).optional(),
  TRUST_PROXY: trustProxy(),
  CORS_ORIGINS: originList(),
  SITE_URL: httpUrl('https://faisalhanif.work'),
  API_PUBLIC_URL: z
    .string()
    .optional()
    .transform((raw, ctx) => {
      if (raw === undefined) return undefined;
      try {
        const url = new URL(raw);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return url.href.replace(/\/+$/, '');
        }
      } catch {
        // reported below
      }
      ctx.addIssue({ code: 'custom', message: 'must be an http or https URL' });
      return z.NEVER;
    }),
  DEV_FAKE_EXTERNALS: flag(false),

  OPENROUTER_API_KEY: optionalText(),
  OPENROUTER_MODEL: optionalText(),
  OPENROUTER_FALLBACK_MODELS: commaList(),
  CHAT_MAX_TOKENS: wholeNumber(600, 50, 4000),
  CHAT_DAILY_GLOBAL_LIMIT: wholeNumber(1000, 1, 1_000_000),

  SMTP_HOST: textWithDefault('smtp.gmail.com'),
  SMTP_PORT: wholeNumber(465, 1, 65535),
  SMTP_SECURE: flag(true),
  SMTP_USER: optionalText(),
  SMTP_PASS: optionalText(),
  MAIL_FROM: optionalText(),
  MAIL_TO_OWNER: optionalEmail(),

  GOOGLE_CLIENT_ID: optionalText(),
  GOOGLE_CLIENT_SECRET: optionalText(),
  GOOGLE_REFRESH_TOKEN: optionalText(),
  GOOGLE_CALENDAR_ID: textWithDefault('primary'),
  BOOKING_TIMEZONE: textWithDefault('Asia/Karachi').refine(isValidTimeZone, {
    error: 'must be an IANA time zone such as Asia/Karachi',
  }),

  ZOOM_ACCOUNT_ID: optionalText(),
  ZOOM_CLIENT_ID: optionalText(),
  ZOOM_CLIENT_SECRET: optionalText(),

  JOIN_LINK_SECRET: optionalText(),
});

/** Rules that need more than one variable. Only runs on values that parsed. */
function productionIssues(
  nodeEnv: string | undefined,
  corsRaw: string | undefined,
  devFake: boolean,
): EnvIssue[] {
  if (nodeEnv !== 'production') return [];
  const issues: EnvIssue[] = [];
  if (devFake) {
    issues.push({ name: 'DEV_FAKE_EXTERNALS', reason: 'is not allowed in production' });
  }
  if (corsRaw === undefined) {
    issues.push({ name: 'CORS_ORIGINS', reason: 'is required in production' });
  }
  return issues;
}

/**
 * Validates a raw environment (for example process.env) and returns the typed config.
 * Pure: it reads nothing but `source`. Empty strings count as unset.
 * Throws EnvError listing variable names and reasons, never values.
 */
export function parseEnv(source: EnvSource): Env {
  const raw = cleanSource(source);
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const issues: EnvIssue[] = result.error.issues.map((issue) => ({
      name: typeof issue.path[0] === 'string' ? issue.path[0] : 'environment',
      reason: issue.message,
    }));
    const devFakeRaw = raw.DEV_FAKE_EXTERNALS?.toLowerCase();
    const devFake = devFakeRaw !== undefined && TRUE_WORDS.has(devFakeRaw);
    const seen = new Set(issues.map((issue) => issue.name));
    for (const extra of productionIssues(raw.NODE_ENV, raw.CORS_ORIGINS, devFake)) {
      if (!seen.has(extra.name)) issues.push(extra);
    }
    throw new EnvError(issues);
  }

  const data = result.data;
  const crossIssues = productionIssues(data.NODE_ENV, raw.CORS_ORIGINS, data.DEV_FAKE_EXTERNALS);
  if (crossIssues.length > 0) throw new EnvError(crossIssues);

  return {
    ...data,
    API_PUBLIC_URL: data.API_PUBLIC_URL ?? data.SITE_URL,
    LOG_LEVEL: data.LOG_LEVEL ?? (data.NODE_ENV === 'test' ? 'silent' : 'info'),
    CORS_ORIGINS: data.CORS_ORIGINS ?? [...DEFAULT_DEV_CORS_ORIGINS],
  };
}

/** Which external features have what they need to run. */
export interface Features {
  readonly chat: boolean;
  readonly mail: boolean;
  readonly google: boolean;
  readonly zoom: boolean;
}

export type FeatureName = keyof Features;

/**
 * Chat needs the OpenRouter key and model; mail needs SMTP_USER, SMTP_PASS and MAIL_TO_OWNER;
 * google needs the three GOOGLE_ secrets; zoom needs the three ZOOM_ values. With
 * DEV_FAKE_EXTERNALS the local fakes make chat, mail and google available; zoom always
 * follows its real config. Booking needs google and mail.
 */
export function features(env: Env): Features {
  const fake = env.DEV_FAKE_EXTERNALS;
  return {
    chat: fake || Boolean(env.OPENROUTER_API_KEY && env.OPENROUTER_MODEL),
    mail: fake || Boolean(env.SMTP_USER && env.SMTP_PASS && env.MAIL_TO_OWNER),
    google:
      fake || Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN),
    zoom: Boolean(env.ZOOM_ACCOUNT_ID && env.ZOOM_CLIENT_ID && env.ZOOM_CLIENT_SECRET),
  };
}

/** Names of the features that are not configured, in a stable order. */
export function unconfiguredFeatures(env: Env): FeatureName[] {
  const state = features(env);
  return (Object.keys(state) as FeatureName[]).filter((name) => !state[name]);
}

/** Sender address: MAIL_FROM, else "Faisal Hanif <SMTP_USER>" (a local placeholder without SMTP). */
export function mailFrom(env: Env): string {
  if (env.MAIL_FROM) return env.MAIL_FROM;
  return `Faisal Hanif <${env.SMTP_USER ?? 'no-reply@localhost'}>`;
}

/** backend/.env, found from this file in both src/config and dist/config. */
export const DEFAULT_ENV_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '.env',
);

export interface LoadEnvOptions {
  /** The .env file to read. Defaults to backend/.env. */
  readonly path?: string;
  /** Where dotenv writes and parseEnv reads. Defaults to process.env. */
  readonly processEnv?: Record<string, string | undefined>;
}

/**
 * Reads backend/.env quietly (real environment variables always win), then parseEnv.
 * On an invalid configuration it prints the names and reasons (never values) and exits 1.
 */
export function loadEnv(options: LoadEnvOptions = {}): Env {
  const target = options.processEnv ?? process.env;
  dotenv.config({
    path: options.path ?? DEFAULT_ENV_FILE,
    processEnv: target,
    quiet: true,
    override: false,
  });
  try {
    return parseEnv(target);
  } catch (error) {
    if (!(error instanceof EnvError)) throw error;
    process.stderr.write(`${error.message}\nSee backend/.env.example for every variable.\n`);
    return process.exit(1);
  }
}
