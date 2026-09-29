import { describe, expect, it } from 'vitest';

import { CHAT_KB } from '@/content/chat-knowledge';

import { fromText, has, inline, localReply, norm, plain } from './chatEngine';

describe('chat engine (reference L6845-6861, L6864-6873, L6902-6917)', () => {
  it('normalises like the reference', () => {
    expect(norm("What's Faisal's RATE?!")).toBe(' what faisal rate ');
    expect(norm('a   b')).toBe(' a b ');
  });

  it('matches short keywords as whole words and long ones anywhere', () => {
    expect(has(' what is the cost ', 'cost')).toBe(true);
    expect(has(' costume ', 'cost')).toBe(false);
    expect(has(' pricing details ', 'pricing')).toBe(true);
    expect(has(' price is $25 ', '$')).toBe(true);
  });

  it('answers rates, booking, contact and mobile questions', () => {
    expect(localReply('what are your rates?').p?.[0]).toBe(CHAT_KB.rates().p?.[0]);
    expect(localReply('I want to book a meeting').p?.[0]).toBe(CHAT_KB.book().p?.[0]);
    expect(localReply('how do I contact him').p?.[0]).toBe(CHAT_KB.contact().p?.[0]);
    expect(localReply('do you build ios apps').p?.[0]).toBe(CHAT_KB.mobile().p?.[0]);
  });

  it('returns the project card before any intent', () => {
    const r = localReply('tell me about PureBody');
    expect(r.p?.[0]).toMatch(/^\*\*PureBody\*\* \(SaaS App\): /);
    expect(r.p?.[2]).toBe('[Live preview](https://faisalhanif.work/sass-app.html) · Closed source');
  });

  it('falls back when nothing matches', () => {
    expect(localReply('zzz qqq').p?.[0]).toBe(CHAT_KB.fallback().p?.[0]);
  });

  it('renders links and bold, and escapes markup', () => {
    expect(inline('**Hi** [site](https://a.com/x) <b>')).toBe(
      '<strong>Hi</strong> <a href="https://a.com/x" target="_blank" rel="noopener">site</a> &lt;b&gt;',
    );
    expect(inline('mail [me](mailto:a@b.co)')).toBe('mail <a href="mailto:a@b.co">me</a>');
    expect(inline('see https://x.com/y/')).toBe(
      'see <a href="https://x.com/y/" target="_blank" rel="noopener">x.com/y</a>',
    );
    expect(inline('[x](javascript:alert(1))')).not.toContain('<a');
  });

  it('turns API text into paragraphs and a list', () => {
    const r = fromText('Intro line\nsecond\n\n- one\n- two\n\nOutro');
    expect(r.p).toEqual(['Intro line second']);
    expect(r.list).toEqual(['one', 'two']);
    expect(r.p2).toEqual(['Outro']);
  });

  it('flattens a reply for the history', () => {
    expect(plain({ p: ['**Bold** [link](https://a.com)'], list: ['x'], p2: ['y'] })).toBe(
      'Bold link\nx\ny',
    );
  });
});
