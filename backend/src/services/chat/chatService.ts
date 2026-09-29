import type { Env } from '../../config/env.js';
import { Errors } from '../../lib/errors.js';
import type { Logger } from '../../lib/logger.js';
import type { ChatTurn } from '../../validators/chat.js';
import { loadKnowledge } from '../knowledge/knowledge.js';
import type { PortfolioKnowledge } from '../knowledge/types.js';
import { buildSystemPrompt, PROMPT_VERSION } from './prompt.js';
import { sanitizeReply } from './sanitize.js';
import type { LlmMessage, LlmProvider, LlmRequest } from './types.js';
import { isLlmError, LlmError } from './types.js';

/**
 * The whole request has this long. The reference client gives up after 12 seconds and uses its
 * local answers, so the server stops one second earlier (BACKEND_SPEC.md section 1).
 */
export const CHAT_BUDGET_MS = 11_000;
/** No new upstream try starts with less than this left. */
export const MIN_ATTEMPT_MS = 1_200;

export interface ChatServiceOptions {
  provider: LlmProvider;
  env: Pick<
    Env,
    | 'OPENROUTER_MODEL'
    | 'OPENROUTER_FALLBACK_MODELS'
    | 'CHAT_MAX_TOKENS'
    | 'BOOKING_TIMEZONE'
    | 'SITE_URL'
  >;
  logger: Logger;
  /** Clock (default real time). */
  now?: () => Date;
  /** Monotonic ms clock for the budget (default Date.now). */
  clock?: () => number;
  budgetMs?: number;
  knowledge?: PortfolioKnowledge;
}

export interface ChatCall {
  conversation: readonly ChatTurn[];
  /** Aborts the upstream call when the visitor's connection closes. */
  signal?: AbortSignal;
}

export interface ChatService {
  /** The whole answer, sanitised. Rejects with an AppError (UPSTREAM_ERROR). */
  reply(call: ChatCall): Promise<string>;
  /**
   * The answer in pieces. Tries are retried only until the first piece arrives; after that a
   * failure is thrown from the iterator (the route sends it as an SSE error event).
   */
  stream(call: ChatCall): AsyncGenerator<string, void, void>;
}

interface Attempt {
  model: string;
  /** Sent only on the first try of the primary model. */
  models?: readonly string[];
}

/**
 * The tries in order: the primary model (with OpenRouter's own fallback list), the primary again
 * (a transient error), then each fallback model alone. A model listed twice runs once.
 */
export function planAttempts(primary: string, fallbacks: readonly string[]): Attempt[] {
  const models = [primary, ...fallbacks.filter((m) => m !== primary)];
  const attempts: Attempt[] = [{ model: primary, models }, { model: primary }];
  for (const model of models.slice(1)) attempts.push({ model });
  return attempts;
}

export function createChatService(options: ChatServiceOptions): ChatService {
  const { provider, env } = options;
  const log = options.logger.child({ component: 'chat', provider: provider.kind });
  const now = options.now ?? (() => new Date());
  const clock = options.clock ?? Date.now;
  const budgetMs = options.budgetMs ?? CHAT_BUDGET_MS;
  const knowledge = options.knowledge ?? loadKnowledge();
  const primary = env.OPENROUTER_MODEL ?? 'fake/model';
  const attempts = planAttempts(primary, env.OPENROUTER_FALLBACK_MODELS);

  const messagesFor = (conversation: readonly ChatTurn[]): LlmMessage[] => [
    {
      role: 'system',
      content: buildSystemPrompt({
        knowledge,
        now: now(),
        timeZone: env.BOOKING_TIMEZONE,
        siteUrl: env.SITE_URL,
      }),
    },
    ...conversation.map((turn) => ({ role: turn.role, content: turn.content })),
  ];

  /** The budget signal joined with the visitor's own. */
  function signalFor(deadline: number, outer: AbortSignal | undefined): AbortSignal {
    const timeout = AbortSignal.timeout(Math.max(1, deadline - clock()));
    return outer ? AbortSignal.any([timeout, outer]) : timeout;
  }

  function request(attempt: Attempt, messages: LlmMessage[], signal: AbortSignal): LlmRequest {
    return {
      messages,
      model: attempt.model,
      ...(attempt.models ? { models: attempt.models } : {}),
      maxTokens: env.CHAT_MAX_TOKENS,
      signal,
    };
  }

  function logAttempt(index: number, attempt: Attempt, error: unknown): void {
    const context = isLlmError(error)
      ? { reason: error.reason, status: error.status, retryable: error.retryable }
      : { reason: 'unexpected' };
    log.warn({ attempt: index + 1, model: attempt.model, ...context }, 'chat_attempt_failed');
  }

  /** True when trying again cannot help (the visitor left, or the budget is spent). */
  function shouldStop(error: unknown, deadline: number): boolean {
    if (isLlmError(error) && error.aborted) return true;
    return deadline - clock() < MIN_ATTEMPT_MS;
  }

  /** A retry of the primary makes no sense after a permanent error such as a wrong key. */
  function skipRetry(index: number, error: unknown): boolean {
    return index === 0 && isLlmError(error) && !error.retryable;
  }

  return {
    async reply({ conversation, signal }) {
      const deadline = clock() + budgetMs;
      const messages = messagesFor(conversation);
      let skip = false;
      for (const [index, attempt] of attempts.entries()) {
        if (index === 1 && skip) continue;
        if (deadline - clock() < MIN_ATTEMPT_MS) break;
        try {
          const raw = await provider.complete(
            request(attempt, messages, signalFor(deadline, signal)),
          );
          const text = sanitizeReply(raw);
          if (text) {
            log.info(
              { promptVersion: PROMPT_VERSION, model: attempt.model, chars: text.length },
              'chat_reply',
            );
            return text;
          }
          throw new LlmError('The model sent an empty answer.', {
            retryable: true,
            reason: 'empty',
          });
        } catch (error) {
          logAttempt(index, attempt, error);
          if (shouldStop(error, deadline)) break;
          skip = skipRetry(index, error);
        }
      }
      throw Errors.upstream(undefined, new Error('chat upstream failed'));
    },

    async *stream({ conversation, signal }) {
      const deadline = clock() + budgetMs;
      const messages = messagesFor(conversation);
      let skip = false;
      for (const [index, attempt] of attempts.entries()) {
        if (index === 1 && skip) continue;
        if (deadline - clock() < MIN_ATTEMPT_MS) break;
        const iterator = provider
          .stream(request(attempt, messages, signalFor(deadline, signal)))
          [Symbol.asyncIterator]();
        let first: IteratorResult<string>;
        try {
          first = await iterator.next();
          if (first.done) {
            throw new LlmError('The model sent an empty answer.', {
              retryable: true,
              reason: 'empty',
            });
          }
        } catch (error) {
          logAttempt(index, attempt, error);
          if (shouldStop(error, deadline)) break;
          skip = skipRetry(index, error);
          continue;
        }
        // The first piece is out: from here on a failure is not retried.
        yield first.value;
        for (let next = await iterator.next(); !next.done; next = await iterator.next()) {
          yield next.value;
        }
        return;
      }
      throw Errors.upstream(undefined, new Error('chat upstream failed'));
    },
  };
}
