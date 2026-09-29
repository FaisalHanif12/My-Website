/**
 * npm run check:booking [-- --to you@example.com] [--platform zoom] [--delete]
 * Books the next free weekday slot for real: one Google Calendar event with a Google Meet link,
 * and the two emails (owner and visitor, the same link, with an .ics). The visitor address is
 * --to (default MAIL_TO_OWNER). The event stays on your calendar so you can open the link and
 * check the emails; pass --delete to remove it again right away.
 */
import { features } from '../src/config/env.js';
import { createAvailability } from '../src/services/booking/availability.js';
import { createBookingService } from '../src/services/booking/bookingService.js';
import { addDays, bookingDateWindow, isWeekday, slotStarts } from '../src/services/booking/time.js';
import { getCalendarProvider } from '../src/services/calendar/index.js';
import { googleEventIdFor } from '../src/services/calendar/google.js';
import { createMailer, ownerAddress } from '../src/services/mail/index.js';
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
  const platform = flagValue('platform')?.toLowerCase() === 'zoom' ? 'Zoom' : 'Google Meet';
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
  });

  // The first free slot from tomorrow on (the booking rules need at least 2 hours of notice).
  const window = bookingDateWindow(now, env.BOOKING_TIMEZONE);
  let date = window.first;
  let start: Date | undefined;
  for (let i = 0; i < 14 && !start; i += 1, date = addDays(date, 1)) {
    if (!isWeekday(date)) continue;
    const free = await availability.freeSlots(date, 'quick');
    if (free.length === 0) continue;
    start = slotStarts(date, env.BOOKING_TIMEZONE).find((s) =>
      free.includes(
        s.toLocaleTimeString('en-GB', {
          timeZone: env.BOOKING_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit',
        }),
      ),
    );
    if (start) break;
  }
  if (!start) {
    fail('No free weekday slot found in the next two weeks.');
    process.exitCode = 1;
    return;
  }
  const bookingDate = start.toLocaleDateString('en-CA', { timeZone: env.BOOKING_TIMEZONE });
  try {
    const result = await service.book(
      {
        sessionType: 'quick',
        sessions: 1,
        email: to,
        name: 'Check Script',
        phone: '',
        company: '',
        date: bookingDate,
        timezone: env.BOOKING_TIMEZONE,
        startUtc: start.toISOString(),
        platform,
        notes: 'Test booking from npm run check:booking.',
        website: false,
      },
      `check-${Date.now()}`,
    );
    ok(`booked ${result.bookingId} for ${result.start}`);
    info(
      `meeting link: ${result.meetLink ?? '(none: Zoom is not set up, the link would follow by email)'}`,
    );
    info(`emails sent to ${owner} (owner) and ${to} (visitor). Both must show the same link.`);
    if (hasFlag('delete') && calendar.kind === 'google') {
      await calendar.deleteEvent(googleEventIdFor(result.bookingId));
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
