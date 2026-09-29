import { chatReplyText, loadKnowledge, projectReplyText } from '../knowledge/knowledge.js';
import type { ChatIntentId } from '../knowledge/types.js';
import type { LlmProvider } from './types.js';

/** [pattern, intent]: the first match wins. */
const INTENT_PATTERNS: ReadonlyArray<readonly [RegExp, ChatIntentId]> = [
  [/\b(book|meeting|call|schedule|appointment)\b/i, 'book'],
  [/\b(rates?|prices?|pricing|cost|hourly|how much)\b/i, 'rates'],
  [/\b(cv|resume)\b/i, 'cv'],
  [/\b(contact|email|phone|reach)\b/i, 'contact'],
  [/\b(projects?|portfolio|built)\b/i, 'projects'],
  [/\b(experience|job|company|career)\b/i, 'experience'],
  [/\b(skills?|stack|tech)\b/i, 'skills'],
  [/\b(certs?|certificates?|certification)\b/i, 'certs'],
  [/\b(where|location|lahore|time zone|timezone)\b/i, 'location'],
  [/\b(services?|offer|do you do)\b/i, 'services'],
  [/\b(hi|hello|hey)\b/i, 'greet'],
];

/** The last user message of a request. */
function lastUser(messages: ReadonlyArray<{ role: string; content: string }>): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m && m.role === 'user') return m.content;
  }
  return '';
}

/**
 * Dev fake (DEV_FAKE_EXTERNALS): answers from the knowledge base with the reference replies, so
 * the chat can be tried end to end without an OpenRouter key.
 */
export function createFakeLlm(now: () => Date = () => new Date()): LlmProvider {
  const answer = (messages: ReadonlyArray<{ role: string; content: string }>): string => {
    const k = loadKnowledge();
    const text = lastUser(messages);
    for (const project of k.projects) {
      if (text.toLowerCase().includes(project.name.toLowerCase())) {
        const card = projectReplyText(k, project.id);
        if (card) return card;
      }
    }
    const intent = INTENT_PATTERNS.find(([re]) => re.test(text))?.[1] ?? 'about';
    return chatReplyText(k, intent, now());
  };

  return {
    kind: 'fake',
    complete(request) {
      return Promise.resolve(answer(request.messages));
    },
    async *stream(request) {
      const words = answer(request.messages).split(/(\s+)/);
      for (const word of words) {
        if (request.signal.aborted) return;
        yield word;
        await Promise.resolve();
      }
    },
  };
}
