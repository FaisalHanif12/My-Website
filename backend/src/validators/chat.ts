import { z } from 'zod';

/** Limits of POST /api/chat (BACKEND_SPEC.md section 1, API_CONTRACT.md). */
export const CHAT_LIMITS = {
  /** The reference input has maxlength 500. */
  messageMax: 500,
  historyMax: 12,
  userItemMax: 500,
  /** Assistant items are trimmed to this length instead of being rejected. */
  assistantItemMax: 2000,
} as const;

/** C0 and C1 control characters except tab, line feed and carriage return. */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

/** Removes control characters and normalises line breaks. Leaves the text otherwise as typed. */
export function cleanChatText(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(CONTROL_CHARS_RE, '');
}

const historyItemSchema = z
  .object({
    role: z.enum(['user', 'assistant'], { error: 'Role must be user or assistant.' }),
    content: z.string({ error: 'Content must be text.' }),
  })
  .transform((item, ctx) => {
    const content = cleanChatText(item.content).trim();
    if (item.role === 'user' && content.length > CHAT_LIMITS.userItemMax) {
      ctx.addIssue({
        code: 'custom',
        path: ['content'],
        message: `Use at most ${CHAT_LIMITS.userItemMax} characters.`,
      });
      return z.NEVER;
    }
    return {
      role: item.role,
      content: item.role === 'assistant' ? content.slice(0, CHAT_LIMITS.assistantItemMax) : content,
    };
  });

export const chatBodySchema = z.object({
  message: z
    .string({ error: 'Please type a message.' })
    .transform(cleanChatText)
    .pipe(
      z
        .string()
        .trim()
        .min(1, { error: 'Please type a message.' })
        .max(CHAT_LIMITS.messageMax, {
          error: `Use at most ${CHAT_LIMITS.messageMax} characters.`,
        }),
    ),
  history: z
    .array(historyItemSchema, { error: 'History must be a list.' })
    .max(CHAT_LIMITS.historyMax, { error: `Send at most ${CHAT_LIMITS.historyMax} history items.` })
    .optional()
    .transform((history) => history ?? []),
});

export type ChatBody = z.output<typeof chatBodySchema>;

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * The conversation sent upstream. The client's history already ends with the current user
 * message (API_CONTRACT.md), so the message is added only when that is not the case. Empty
 * items are dropped.
 */
export function conversationOf(body: ChatBody): ChatTurn[] {
  const turns = body.history.filter((turn) => turn.content.length > 0);
  const last = turns[turns.length - 1];
  if (!last || last.role !== 'user' || last.content !== body.message) {
    turns.push({ role: 'user', content: body.message });
  }
  return turns;
}
