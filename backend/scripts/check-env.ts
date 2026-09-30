/**
 * npm run check:env
 * Reads backend/.env and tells you, feature by feature, what is set and whether the live
 * connection works: SMTP login, Google Calendar free/busy. It prints names and results only,
 * never values. It sends no email and creates no event.
 */
import { features } from '../src/config/env.js';
import { createMailer } from '../src/services/mail/index.js';
import { getCalendarProvider } from '../src/services/calendar/index.js';
import { fail, info, ok, reportFailure, scriptContext } from './lib.js';

async function main(): Promise<void> {
  const { env, logger } = scriptContext();
  const on = features(env);
  console.log('Feature configuration (from backend/.env)');
  if (env.DEV_FAKE_EXTERNALS) {
    console.log(
      '  DEV_FAKE_EXTERNALS is on: chat, mail and Google use local fakes, so nothing real is tested.',
    );
  }
  console.log(`  ${on.chat ? 'set    ' : 'missing'} chat   OPENROUTER_API_KEY, OPENROUTER_MODEL`);
  console.log(`  ${on.mail ? 'set    ' : 'missing'} mail   SMTP_USER, SMTP_PASS, MAIL_TO_OWNER`);
  console.log(
    `  ${on.google ? 'set    ' : 'missing'} google GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN`,
  );
  console.log();
  console.log(
    `  model: ${env.OPENROUTER_MODEL ?? '(not set)'}  timezone: ${env.BOOKING_TIMEZONE}  site: ${env.SITE_URL}`,
  );

  if (on.mail) {
    console.log('\nSMTP');
    const mailer = createMailer(env, logger);
    try {
      await mailer?.verify();
      ok(
        mailer?.kind === 'smtp'
          ? `connected to ${env.SMTP_HOST}:${env.SMTP_PORT} and logged in`
          : 'the fake mailer is ready (emails go to backend/tmp/mail)',
      );
    } catch (error) {
      reportFailure(error);
      info(
        'For Gmail: turn on 2-Step Verification and use an App Password, not your normal password.',
      );
    } finally {
      await mailer?.close();
    }
  }

  if (on.google) {
    console.log('\nGoogle Calendar');
    const calendar = getCalendarProvider({ env, logger });
    try {
      const now = new Date();
      await calendar?.freeBusy(now, new Date(now.getTime() + 60 * 60_000));
      ok(
        calendar?.kind === 'google'
          ? `the token works and calendar "${env.GOOGLE_CALENDAR_ID}" can be read`
          : 'the fake calendar is ready (events stay in memory)',
      );
    } catch (error) {
      reportFailure(error);
      info(
        'If it says invalid_grant, run npm run google:auth again and update GOOGLE_REFRESH_TOKEN.',
      );
    }
  }

  if (!on.chat) fail('chat is off until OPENROUTER_API_KEY and OPENROUTER_MODEL are set');
}

main().catch(reportFailure);
