import pino from 'pino';
import type { DestinationStream, Logger, LoggerOptions } from 'pino';
import type { Env } from '../config/env.js';

export type { Logger } from 'pino';

export const SERVICE_NAME = 'faisal-portfolio-api';

/** Placed where a redacted value was. */
export const REDACTED = '[redacted]';

/** Keys that hold personal data or secrets, redacted at the top level and one level down. */
const SENSITIVE_KEYS = [
  'email',
  'phone',
  'company',
  'notes',
  'details',
  'password',
  'pass',
  'secret',
  'token',
  'apiKey',
  'accessToken',
  'refreshToken',
  'clientSecret',
  'authorization',
  'cookie',
  'ip',
  'remoteAddress',
] as const;

/**
 * A second line of defence behind "never log personal data or secrets". The keys `name`
 * and `message` are never redacted: log lines use them for module and error names.
 */
export const REDACT_PATHS: readonly string[] = [
  ...SENSITIVE_KEYS,
  ...SENSITIVE_KEYS.map((key) => `*.${key}`),
  'body',
  'req.body',
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'res.headers["set-cookie"]',
  'headers.authorization',
  'headers.Authorization',
  'headers.cookie',
  '*.headers.authorization',
  '*.headers.Authorization',
  '*.headers.cookie',
  'err.config.headers',
  'err.config.data',
  'err.response.config',
  'err.response.data',
  'err.request',
];

/** The parts of Env the logger needs, so tests can build one without a full config. */
export type LoggerEnv = Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'>;

function wantsPrettyOutput(env: LoggerEnv, destination: DestinationStream | undefined): boolean {
  return destination === undefined && env.NODE_ENV === 'development' && process.stdout.isTTY;
}

/**
 * Root pino logger. JSON lines by default; pino-pretty only in development on a TTY.
 * Pass `destination` to capture the output (tests).
 */
export function createLogger(env: LoggerEnv, destination?: DestinationStream): Logger {
  const options: LoggerOptions = {
    level: env.LOG_LEVEL,
    base: { service: SERVICE_NAME, pid: process.pid },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: [...REDACT_PATHS], censor: REDACTED },
    serializers: { err: pino.stdSerializers.err },
  };

  if (wantsPrettyOutput(env, destination)) {
    return pino({
      ...options,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname,service' },
      },
    });
  }
  return destination ? pino(options, destination) : pino(options);
}
