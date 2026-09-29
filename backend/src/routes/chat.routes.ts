import { Router } from 'express';
import type { Request, Response } from 'express';
import { features } from '../config/env.js';
import { createDailyCap } from '../lib/dailyCap.js';
import { AppError, Errors } from '../lib/errors.js';
import { rateLimiters } from '../middleware/rateLimit.js';
import { parseInput } from '../middleware/validate.js';
import { createChatService } from '../services/chat/chatService.js';
import type { ChatService } from '../services/chat/chatService.js';
import { createFakeLlm } from '../services/chat/fake.js';
import { createOpenRouterProvider } from '../services/chat/openrouter.js';
import type { LlmProvider } from '../services/chat/types.js';
import { loadKnowledge } from '../services/knowledge/knowledge.js';
import { getSharedStore } from '../store/index.js';
import type { Store } from '../store/index.js';
import { chatBodySchema, conversationOf } from '../validators/chat.js';
import type { ApiModule, AppContext } from './types.js';

export interface ChatModuleOverrides {
  /** Model provider (tests pass a stub; the default is OpenRouter, or the dev fake). */
  provider?: LlmProvider;
  store?: Store;
  now?: () => Date;
  clock?: () => number;
}

/** What the visitor reads when today's global cap is used up (a normal 200 answer). */
export function capReachedReply(contactUrl: string): string {
  return (
    'I have answered a lot of questions today and need a short break. ' +
    `Please send Faisal your question through the [contact form](${contactUrl}) ` +
    'and he will reply personally.'
  );
}

function providerFor(ctx: AppContext, override?: LlmProvider): LlmProvider | null {
  if (override) return override;
  if (ctx.env.DEV_FAKE_EXTERNALS) return createFakeLlm();
  return features(ctx.env).chat ? createOpenRouterProvider(ctx.env) : null;
}

/** An AbortSignal that fires when the visitor's connection closes before the answer is sent. */
function abortOnClose(res: Response): AbortSignal {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });
  return controller.signal;
}

function sseWrite(res: Response, event: string | null, data: string): void {
  res.write(`${event ? `event: ${event}\n` : ''}data: ${data}\n\n`);
}

async function streamReply(
  res: Response,
  service: ChatService,
  conversation: ReturnType<typeof conversationOf>,
  signal: AbortSignal,
): Promise<void> {
  const pieces = service.stream({ conversation, signal });
  // Nothing is sent before the first piece, so an early failure is still a normal JSON error.
  const first = await pieces.next();
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  try {
    if (!first.done) sseWrite(res, null, JSON.stringify({ delta: first.value }));
    for await (const delta of pieces) sseWrite(res, null, JSON.stringify({ delta }));
    sseWrite(res, null, '[DONE]');
  } catch (error) {
    const appError = error instanceof AppError ? error : Errors.upstream();
    sseWrite(res, 'error', JSON.stringify({ code: appError.code, message: appError.message }));
  }
  res.end();
}

/**
 * POST /api/chat (API_CONTRACT.md): `{ message, history }` in, `{ ok: true, reply }` out, or an
 * SSE stream with ?stream=true. Per IP limits run first, then the global daily cap (which answers
 * with a normal 200 pointing to the contact form).
 */
export function createChatModule(overrides: ChatModuleOverrides = {}): ApiModule {
  return {
    name: 'chat',
    createRouter(ctx) {
      const { env, logger } = ctx;
      const store = overrides.store ?? getSharedStore(ctx);
      const limiters = rateLimiters(store, { logger });
      const cap = createDailyCap({
        store,
        name: 'chat',
        limit: env.CHAT_DAILY_GLOBAL_LIMIT,
        timeZone: env.BOOKING_TIMEZONE,
        ...(overrides.now ? { now: overrides.now } : {}),
      });
      const provider = providerFor(ctx, overrides.provider);
      const service = provider
        ? createChatService({
            provider,
            env,
            logger,
            ...(overrides.now ? { now: overrides.now } : {}),
            ...(overrides.clock ? { clock: overrides.clock } : {}),
          })
        : null;
      const contactUrl = loadKnowledge().siteLinks.contactForm;

      const router = Router();
      router.post(
        '/chat',
        limiters.chatPerMinute,
        limiters.chatPerDay,
        async (req: Request, res: Response) => {
          const body = parseInput(chatBodySchema, req.body);
          if (!service) throw Errors.notConfigured('chat');
          const { allowed } = await cap.consume();
          if (!allowed) {
            req.log.warn({ event: 'chat.cap_reached' }, 'Global daily chat cap reached');
            res.status(200).json({ ok: true, reply: capReachedReply(contactUrl) });
            return;
          }
          const conversation = conversationOf(body);
          const signal = abortOnClose(res);
          if (req.query.stream === 'true') {
            await streamReply(res, service, conversation, signal);
            return;
          }
          const reply = await service.reply({ conversation, signal });
          res.status(200).json({ ok: true, reply });
        },
      );
      return router;
    },
  };
}

export default createChatModule();
