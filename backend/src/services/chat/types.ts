/** One message sent to the model. */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmRequest {
  messages: readonly LlmMessage[];
  /** The model to call. */
  model: string;
  /**
   * OpenRouter's own fallback list (the `models` request field). Only the first try of the
   * primary model sends it, so OpenRouter can fall back inside that one call.
   */
  models?: readonly string[];
  maxTokens: number;
  /** Fires on the request deadline or when the visitor's connection closes. */
  signal: AbortSignal;
}

export type LlmKind = 'openrouter' | 'fake';

export interface LlmProvider {
  readonly kind: LlmKind;
  /** The whole answer. Rejects with LlmError only. */
  complete(request: LlmRequest): Promise<string>;
  /** The answer in pieces. Rejects (on the first read or later) with LlmError only. */
  stream(request: LlmRequest): AsyncIterable<string>;
}

export interface LlmErrorOptions {
  /** True when trying again may work (timeout, network, 408, 409, 429, 5xx). */
  retryable: boolean;
  status?: number;
  /** Short machine reason such as "timeout" or "http_429". Never upstream text. */
  reason: string;
  /** True when the visitor's connection closed (nothing more should be tried). */
  aborted?: boolean;
}

/**
 * Error thrown by every LlmProvider. It holds a plain message, a retry hint, an HTTP status
 * and a short reason, never the upstream body, keys or headers, so logging it is safe.
 */
export class LlmError extends Error {
  override readonly name = 'LlmError';
  readonly retryable: boolean;
  readonly status: number | undefined;
  readonly reason: string;
  readonly aborted: boolean;

  constructor(message: string, options: LlmErrorOptions) {
    super(message);
    this.retryable = options.retryable;
    this.status = options.status;
    this.reason = options.reason;
    this.aborted = options.aborted ?? false;
  }
}

export function isLlmError(value: unknown): value is LlmError {
  return value instanceof LlmError;
}
