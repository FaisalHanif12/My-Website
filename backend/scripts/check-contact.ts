/**
 * npm run check:contact [-- --to you@example.com]
 * Sends the real contact emails: the owner notification to MAIL_TO_OWNER and the visitor
 * confirmation to --to (default MAIL_TO_OWNER), with a sample message. Look for both in the inbox.
 */
import { createContactService } from '../src/services/contact/contactService.js';
import { createMailer, ownerAddress } from '../src/services/mail/index.js';
import { MemoryStore } from '../src/store/index.js';
import { fail, flagValue, info, ok, reportFailure, scriptContext } from './lib.js';

async function main(): Promise<void> {
  const { env, logger } = scriptContext();
  const mailer = createMailer(env, logger);
  const owner = ownerAddress(env);
  if (!mailer || !owner) {
    fail('Set SMTP_USER, SMTP_PASS and MAIL_TO_OWNER in backend/.env first.');
    process.exitCode = 1;
    return;
  }
  const to = flagValue('to') ?? owner;
  const service = createContactService({ mailer, env, logger, store: new MemoryStore() });
  try {
    await service.send({
      name: 'Check Script',
      email: to,
      phone: '+92 300 0000000',
      company: 'Portfolio check',
      projectType: 'Web Application',
      budget: '$1,000 - $5,000',
      details: 'This is a test message from npm run check:contact. You can ignore it.',
      website: false,
      startedAt: Date.now() - 60_000,
    });
    ok(`owner email sent to ${owner}, confirmation sent to ${to}`);
    info('Open the owner email and press Reply: the reply should go to the visitor address.');
  } catch (error) {
    reportFailure(error);
  } finally {
    await mailer.close();
  }
}

main().catch(reportFailure);
