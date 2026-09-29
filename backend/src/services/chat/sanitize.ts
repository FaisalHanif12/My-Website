import { cleanChatText } from '../../validators/chat.js';

/** Longest reply the API sends (the model is asked for far less). */
export const REPLY_MAX_CHARS = 4000;

/**
 * Makes a model answer safe for the reference chat renderer, which understands paragraphs,
 * "- " lists, **bold** and [label](url) links and escapes everything else. This removes what it
 * cannot show: reasoning blocks, code fences, HTML tags, headings, tables and image markup.
 * Returns "" when nothing readable is left.
 */
export function sanitizeReply(raw: string): string {
  let text = cleanChatText(raw);
  // Reasoning blocks some models add.
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*$/i, '');
  // Code fences keep their content as plain lines.
  text = text.replace(/```[a-z0-9_-]*\n?([\s\S]*?)```/gi, '$1').replace(/```/g, '');
  text = text.replace(/`([^`\n]+)`/g, '$1');
  // Images become their alt text, HTML tags disappear.
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  text = text.replace(/<\/?[a-z][^>]*>/gi, '');
  const lines = text.split('\n').map((line) => {
    // Table separator rows.
    if (/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line)) return '';
    // Headings become bold lines.
    const heading = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) return heading[1] ? `**${heading[1].replace(/\*\*/g, '')}**` : '';
    // "* item" and "• item" bullets become "- item"; numbered lists stay.
    return line.replace(/^(\s*)[*•]\s+/, '$1- ').replace(/^\s+(-\s)/, '$1');
  });
  text = lines
    .join('\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (text.length > REPLY_MAX_CHARS) {
    const cut = text.slice(0, REPLY_MAX_CHARS);
    const stop = Math.max(cut.lastIndexOf('\n\n'), cut.lastIndexOf('. '));
    text = (stop > REPLY_MAX_CHARS / 2 ? cut.slice(0, stop + 1) : cut).trim();
  }
  return text;
}
