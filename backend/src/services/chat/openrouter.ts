import OpenAI from 'openai';
import type { Env } from '../../config/env.js';
import type { LlmProvider, LlmRequest } from './types.js';
import { LlmError } from './types.js';

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_TITLE = 'Faisal Hanif Portfolio';
/** Low temperature: the assistant answers from facts and should not improvise. */
export const CHAT_TEMPERATURE = 0.4;

/** The request fields both call shapes share; `models` is OpenRouter's own routing list. */
interface BaseParams {
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  max_tokens: number;
  temperature: number;
  models?: string[];
}

/** Turns anything the SDK throws into an LlmError with no upstream text in it. */
export function toLlmError(error: unknown, signal: AbortSignal): LlmError {
  if (error instanceof LlmError) return error;
  if (error instanceof OpenAI.APIUserAbortError || signal.aborted) {
    const timedOut = signal.reason instanceof Error && signal.reason.name === 'TimeoutError';
    return new LlmError('The model call was cancelled.', {
      retryable: false,
      reason: timedOut ? 'timeout' : 'aborted',
      aborted: !timedOut,
    });
  }
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new LlmError('The model call timed out.', { retryable: true, reason: 'timeout' });
  }
  if (error instanceof OpenAI.APIConnectionError) {
    return new LlmError('The model could not be reached.', { retryable: true, reason: 'network' });
  }
  if (error instanceof OpenAI.APIError) {
    const status: number | undefined = typeof error.status === 'number' ? error.status : undefined;
    const retryable =
      status === undefined || status === 408 || status === 409 || status === 429 || status >= 500;
    return new LlmError('The model returned an error.', {
      retryable,
      ...(status === undefined ? {} : { status }),
      reason: status === undefined ? 'api_error' : `http_${status}`,
    });
  }
  return new LlmError('The model call failed.', { retryable: false, reason: 'unknown' });
}

/**
 * OpenRouter through the official openai SDK (BACKEND_SPEC.md section 1). The SDK's own retries
 * are off: the chat service retries inside its 11 second budget. The key stays in this object.
 */
export function createOpenRouterProvider(env: Env, client?: OpenAI): LlmProvider {
  const sdk =
    client ??
    new OpenAI({
      baseURL: OPENROUTER_BASE_URL,
      apiKey: env.OPENROUTER_API_KEY ?? '',
      maxRetries: 0,
      defaultHeaders: { 'HTTP-Referer': env.SITE_URL, 'X-Title': OPENROUTER_TITLE },
    });

  const body = (request: LlmRequest): BaseParams => {
    const params: BaseParams = {
      model: request.model,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: request.maxTokens,
      temperature: CHAT_TEMPERATURE,
    };
    if (request.models && request.models.length > 1) params.models = [...request.models];
    return params;
  };

  return {
    kind: 'openrouter',

    async complete(request) {
      try {
        const res = await sdk.chat.completions.create(
          { ...body(request), stream: false as const },
          { signal: request.signal },
        );
        return res.choices[0]?.message?.content ?? '';
      } catch (error) {
        throw toLlmError(error, request.signal);
      }
    },

    async *stream(request) {
      try {
        const stream = await sdk.chat.completions.create(
          { ...body(request), stream: true as const },
          { signal: request.signal },
        );
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) yield delta;
        }
      } catch (error) {
        throw toLlmError(error, request.signal);
      }
    },
  };
}
