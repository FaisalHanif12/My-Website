/**
 * The calendar the booking routes use:
 * - DEV_FAKE_EXTERNALS=true: be-05's process wide fake (getDevFakeCalendar), so the slots
 *   and booking routes see the same in-memory events;
 * - Google configured (features(env).google): one Google provider per process;
 * - otherwise null, and the routes answer 503 UPSTREAM_ERROR.
 */
import { features } from '../../config/env.js';
import type { AppContext } from '../../routes/types.js';
import { getDevFakeCalendar } from './fake.js';
import { createGoogleCalendarProvider } from './google.js';
import type { CalendarProvider } from './types.js';

export type CalendarContext = Pick<AppContext, 'env' | 'logger'>;

let cachedGoogle: { env: CalendarContext['env']; provider: CalendarProvider } | undefined;

export function getCalendarProvider(ctx: CalendarContext): CalendarProvider | null {
  if (ctx.env.DEV_FAKE_EXTERNALS) return getDevFakeCalendar();
  if (!features(ctx.env).google) return null;
  // One provider per process (a new env object only appears in tests).
  if (cachedGoogle?.env !== ctx.env) {
    cachedGoogle = { env: ctx.env, provider: createGoogleCalendarProvider(ctx.env, ctx.logger) };
  }
  return cachedGoogle.provider;
}

/** Drops the Google singleton and empties the dev fake calendar. */
export function resetCalendarForTests(): void {
  cachedGoogle = undefined;
  getDevFakeCalendar().reset();
}
