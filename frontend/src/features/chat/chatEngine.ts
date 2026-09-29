/**
 * The chat answer engine (reference contact.js chat(), L6741-6790 and L6844-6851): keyword scoring
 * over the intent table, the project cards, the tiny markdown renderer and the text-to-reply
 * parser for API answers. Pure functions, no DOM access.
 */
import {
  CHAT_INTENTS,
  CHAT_KB,
  CHAT_PROJECTS,
  projectReply,
  type ChatReply,
} from '@/content/chat-knowledge';
import { esc } from '@/lib/strings';

/** norm (L6845): lower case, drop possessive s, keep letters, digits and $ . / + - only. */
export function norm(s: string): string {
  return (
    ' ' +
    String(s)
      .toLowerCase()
      .replace(/[’']s\b/g, '')
      .replace(/[^a-z0-9$./+\- ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() +
    ' '
  );
}

/** has (L6846-6850): "$" matches anywhere, long or spaced keywords match as a substring, short ones as a word. */
export function has(t: string, k: string): boolean {
  if (k === '$') return t.indexOf('$') > -1;
  if (k.indexOf(' ') > -1 || k.length > 5) return t.indexOf(k) > -1;
  return (
    t.indexOf(' ' + k + ' ') > -1 ||
    t.indexOf(' ' + k + 's ') > -1 ||
    t.indexOf(' ' + k + '? ') > -1 ||
    t.indexOf(' ' + k + '. ') > -1
  );
}

/** localReply (L6851-6861): a project card on a project keyword, else the best scoring intent. */
export function localReply(text: string, now?: Date): ChatReply {
  const t = norm(text);
  for (const p of CHAT_PROJECTS) {
    if (p.k.some((k) => has(t, k))) return projectReply(p);
  }
  let best: (typeof CHAT_INTENTS)[number]['id'] | null = null;
  let bestScore = 0;
  for (const it of CHAT_INTENTS) {
    let s = 0;
    for (const k of it.kw) {
      if (has(t, k)) s += (k.indexOf(' ') > -1 ? 1.6 : 1) * (it.w || 1);
    }
    if (s > bestScore + 1e-6) {
      bestScore = s;
      best = it.id;
    }
  }
  return (best ? CHAT_KB[best] : CHAT_KB.fallback)(now);
}

/** inline (L6864-6873): escapes, then [label](url), **bold** and bare links. */
export function inline(s: string): string {
  let h = esc(s);
  h = h.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:|#)[^\s)]+)\)/g,
    (_m, l: string, u: string) => {
      const ext = /^https?:/.test(u);
      return (
        '<a href="' + u + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + l + '</a>'
      );
    },
  );
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(
    /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
    (_m, a: string, u: string) =>
      a +
      '<a href="' +
      u +
      '" target="_blank" rel="noopener">' +
      u.replace(/^https?:\/\//, '').replace(/\/$/, '') +
      '</a>',
  );
  return h;
}

/** plain (L6902): the reply as text for the history (no bold or link markup). */
export function plain(r: ChatReply): string {
  return ([] as string[])
    .concat(r.p || [], r.list || [], r.p2 || [])
    .join('\n')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

const BULLET = /^\s*([-*•]|\d+\.)\s+/;

/** fromText (L6908-6917): turns an API answer into paragraphs, a bullet list and trailing paragraphs. */
export function fromText(text: string): ChatReply {
  const blocks = String(text)
    .trim()
    .split(/\n{2,}/);
  const r: { p: string[]; list: string[] | null; p2?: string[] } = { p: [], list: null };
  for (const b of blocks) {
    const lines = b.split('\n');
    if (lines.every((l) => BULLET.test(l))) {
      r.list = (r.list || []).concat(lines.map((l) => l.replace(BULLET, '')));
    } else if (r.list) {
      r.p2 = (r.p2 || []).concat(lines.join(' '));
    } else {
      r.p.push(lines.join(' '));
    }
  }
  return r;
}
