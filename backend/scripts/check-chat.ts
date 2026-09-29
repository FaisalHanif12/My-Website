/**
 * npm run check:chat -- "What are your rates?"
 * Sends one real question to OpenRouter with the site's system prompt and prints the answer, the
 * model, and how long it took. Uses a few hundred tokens of your OpenRouter credit.
 */
import { createChatService } from '../src/services/chat/chatService.js';
import { createFakeLlm } from '../src/services/chat/fake.js';
import { createOpenRouterProvider } from '../src/services/chat/openrouter.js';
import { features } from '../src/config/env.js';
import { fail, info, ok, reportFailure, scriptContext } from './lib.js';

async function main(): Promise<void> {
  const { env, logger } = scriptContext();
  if (!env.DEV_FAKE_EXTERNALS && !features(env).chat) {
    fail('Set OPENROUTER_API_KEY and OPENROUTER_MODEL in backend/.env first.');
    process.exitCode = 1;
    return;
  }
  const question =
    process.argv
      .slice(2)
      .filter((a) => !a.startsWith('--'))
      .join(' ') || 'What are your rates?';
  const provider = env.DEV_FAKE_EXTERNALS ? createFakeLlm() : createOpenRouterProvider(env);
  const service = createChatService({ provider, env, logger });
  console.log(`Question: ${question}`);
  const started = Date.now();
  try {
    const reply = await service.reply({ conversation: [{ role: 'user', content: question }] });
    ok(
      `answered in ${((Date.now() - started) / 1000).toFixed(1)}s with ${env.OPENROUTER_MODEL ?? provider.kind}`,
    );
    console.log(`\n${reply}\n`);
    info(
      'The site shows this text with its own formatter: paragraphs, "- " lists, **bold** and links.',
    );
  } catch (error) {
    reportFailure(error);
    info(
      'Check OPENROUTER_API_KEY and that OPENROUTER_MODEL is a real id from https://openrouter.ai/models',
    );
  }
}

main().catch(reportFailure);
