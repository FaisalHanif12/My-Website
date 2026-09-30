/**
 * npm run check:booking [-- --to you@example.com] [--session deep] [--sessions 2] [--delete]
 * Books the next free weekday slot for real: one Google Calendar event with a Google Meet link,
 * and the two emails (owner and visitor, the same link, with an .ics). The visitor address is
 * --to (default MAIL_TO_OWNER). The event stays on your calendar so you can open the link and
 * check the emails; pass --delete to remove it again right away.
 */
import { features } from '../src/config/env.js';
import { sessionInfo } from '../src/services/booking/catalog.js';
import { createAvailability } from '../src/services/booking/availability.js';
import { createBookingService } from '../src/services/booking/bookingService.js';
import { addDays, bookingDateWindow, isWeekday, slotStarts } from '../src/services/booking/time.js';
import { getCalendarProvider } from '../src/services/calendar/index.js';
import { googleEventIdFor } from '../src/services/calendar/google.js';
import { createMailer, ownerAddress } from '../src/services/mail/index.js';
import { createJoinLinks, joinSecret } from '../src/services/booking/joinLink.js';
import { getMeetingProvider } from '../src/services/meeting/index.js';
import { MemoryStore } from '../src/store/index.js';
import { fail, flagValue, hasFlag, info, ok, reportFailure, scriptContext } from './lib.js';

async function main(): Promise<void> {
  const { env, logger, ctx } = scriptContext();
  const on = features(env);
  const calendar = getCalendarProvider(ctx);
  const mailer = createMailer(env, logger);
  const owner = ownerAddress(env);
  if (!calendar || !mailer || !owner || !on.mail) {
    fail('Set the GOOGLE_ values and SMTP_USER, SMTP_PASS, MAIL_TO_OWNER in backend/.env first.');
    process.exitCode = 1;
    return;
  }
  const to = flagValue('to') ?? owner;
  const platform = 'Google Meet' as const;
  const secret = joinSecret(env);
  const store = new MemoryStore();
  const now = new Date();
  const availability = createAvailability({ calendar, store, env, logger });
  const service = createBookingService({
    calendar,
    availability,
    mailer,
    store,
    env,
    logger,
    meetingFor: (p) => getMeetingProvider(p, ctx),
    joinLinks: secret ? createJoinLinks(secret, env.API_PUBLIC_URL) : null,
  });

  // The first free slots from tomorrow on, one per session (the rules need 2 hours of notice).
  const sessionType = flagValue('session')?.toLowerCase() === 'deep' ? 'deep' : 'quick';
  const count = Math.max(1, Math.min(10, Number(flagValue('sessions') ?? '1') || 1));
  const minutes = sessionInfo(sessionType).minutes;
  const window = bookingDateWindow(now, env.BOOKING_TIMEZONE);
  const slots: Date[] = [];
  let date = window.first;
  for (let i = 0; i < 21 && slots.length < count; i += 1, date = addDays(date, 1)) {
    if (!isWeekday(date)) continue;
    const free = await availability.freeSlots(date, sessionType);
    for (const s of slotStarts(date, env.BOOKING_TIMEZONE, minutes)) {
      const label = s.toLocaleTimeString('en-GB', {
        timeZone: env.BOOKING_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
      });
      if (free.includes(label) && slots.length < count) slots.push(s);
    }
  }
  if (slots.length < count) {
    fail(`Found only ${slots.length} free slot(s) in the next three weeks, ${count} needed.`);
    process.exitCode = 1;
    return;
  }
  try {
    const result = await service.book(
      {
        sessionType,
        sessions: count,
        email: to,
        name: 'Check Script',
        phone: '',
        company: '',
        timezone: env.BOOKING_TIMEZONE,
        slots: slots.map((s) => s.toISOString()),
        platform,
        notes: 'Test booking from npm run check:booking.',
        website: false,
      },
      `check-${Date.now()}`,
    );
    ok(`booked ${result.bookingId}: ${result.sessions.map((x) => x.start).join(', ')}`);
    info(`meeting link: ${result.meetLink ?? '(none)'}`);
    info(`emails sent to ${owner} (owner) and ${to} (visitor). Both must show the same link.`);
    if (hasFlag('delete') && calendar.kind === 'google') {
      await calendar.deleteEvent(googleEventIdFor(result.bookingId));
      for (let i = 2; i <= count; i += 1) {
        await calendar.deleteEvent(googleEventIdFor(`${result.bookingId}-${i}`));
      }
      info('The test event was deleted from your calendar (--delete).');
    } else {
      info('The test event is on your calendar. Delete it there when you are done.');
    }
  } catch (error) {
    reportFailure(error);
  } finally {
    await mailer.close();
  }
}

main().catch(reportFailure);
