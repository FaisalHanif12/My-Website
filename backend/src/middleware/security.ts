import cors from 'cors';
import type { RequestHandler } from 'express';
import helmet from 'helmet';
import type { Env } from '../config/env.js';

export const CORS_METHODS = ['GET', 'POST', 'OPTIONS'] as const;
export const CORS_ALLOWED_HEADERS = ['Content-Type', 'Idempotency-Key', 'X-Request-Id'] as const;
export const CORS_EXPOSED_HEADERS = ['Retry-After', 'X-Request-Id'] as const;
export const CORS_MAX_AGE_SECONDS = 600;

/** Helmet with its secure defaults. */
export function helmetMiddleware(): RequestHandler {
  return helmet();
}

/**
 * CORS for the site origins in CORS_ORIGINS only. A foreign origin gets no
 * Access-Control-Allow-Origin header, so the browser blocks the response. No credentials.
 */
export function corsMiddleware(env: Pick<Env, 'CORS_ORIGINS'>): RequestHandler {
  return cors({
    origin: [...env.CORS_ORIGINS],
    methods: [...CORS_METHODS],
    allowedHeaders: [...CORS_ALLOWED_HEADERS],
    exposedHeaders: [...CORS_EXPOSED_HEADERS],
    credentials: false,
    maxAge: CORS_MAX_AGE_SECONDS,
    optionsSuccessStatus: 204,
  });
}
