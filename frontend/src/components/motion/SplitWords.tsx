import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';

import { SPLIT_BASE_MS, SPLIT_STEP_MS, splitDelay } from '@/lib/motion';

import { InView } from './Reveal';
import type { CSSVars, MotionElementProps } from './shared';

type AnyElement = ReactElement<{ className?: unknown; children?: ReactNode }>;

/** Elements wrapped whole, as one word, so gradients survive (L4584). */
const WHOLE_TAGS = new Set(['em', 'strong', 'b']);
const WHOLE_CLASSES = ['serif', 'grad-text'];

function classesOf(el: AnyElement): string[] {
  const c = el.props.className;
  return typeof c === 'string' ? c.split(/\s+/) : [];
}

function isWhole(el: AnyElement): boolean {
  if (typeof el.type !== 'string') return false;
  if (WHOLE_TAGS.has(el.type)) return true;
  return classesOf(el).some((c) => WHOLE_CLASSES.includes(c));
}

export interface SplitOptions {
  /** ms between words (default 55). */
  step?: number;
  /** ms before the first word (default 0; the contact title uses 170 with step 130). */
  base?: number;
}

/**
 * FH.split (L4573-4591) as a render time transform, so the server renders the split
 * markup. Text is split on whitespace: each word becomes
 * <span class="w"><span style="--d:{i*55}ms">word</span></span> and whitespace stays
 * plain text. A whole .serif / .grad-text / em / strong / b element counts as one
 * word; other elements are walked into; a .w element is left alone. One running
 * counter per heading.
 */
export function splitWords(children: ReactNode, options: SplitOptions = {}): ReactNode[] {
  const step = options.step ?? SPLIT_STEP_MS;
  const base = options.base ?? SPLIT_BASE_MS;
  let i = 0;

  const word = (content: ReactNode, key: string): ReactElement => {
    const style: CSSVars = { '--d': splitDelay(i, step, base) + 'ms' };
    i += 1;
    return (
      <span className="w" key={key}>
        <span style={style}>{content}</span>
      </span>
    );
  };

  const walk = (nodes: ReactNode, path: string): ReactNode[] => {
    const out: ReactNode[] = [];
    Children.toArray(nodes).forEach((n, idx) => {
      const key = path + '.' + idx;
      if (typeof n === 'string' || typeof n === 'number') {
        String(n)
          .split(/(\s+)/)
          .forEach((p, j) => {
            if (!p) return;
            if (/^\s+$/.test(p)) out.push(p);
            else out.push(word(p, key + '-' + j));
          });
        return;
      }
      if (!isValidElement(n)) {
        out.push(n);
        return;
      }
      const el = n as AnyElement;
      if (el.type !== Fragment && classesOf(el).includes('w')) {
        out.push(el);
      } else if (isWhole(el)) {
        out.push(word(el, key));
      } else if (el.props.children === undefined || el.props.children === null) {
        out.push(el);
      } else if (el.type === Fragment) {
        out.push(<Fragment key={key}>{walk(el.props.children, key)}</Fragment>);
      } else {
        out.push(cloneElement(el, undefined, ...walk(el.props.children, key)));
      }
    });
    return out;
  };

  return walk(children, 's');
}

export interface SplitWordsProps extends Omit<MotionElementProps, 'step'>, SplitOptions {
  /**
   * true (default): renders data-split="" and gets `is-in` when it enters view, like
   * the reference's [data-split] headings. false: split only, with no data-split and
   * no observer (the contact title, which contact.js splits itself, L5565-5566).
   */
  observe?: boolean;
  /** Explicit reveal key (see useReveal). */
  revealKey?: string;
}

/**
 * <SplitWords as="h2" className="sec-title">Get to <span className="serif grad-text">Know
 * Me</span></SplitWords>. Server renderable; `is-in` lands on this element (the one
 * carrying data-split), like the reference.
 */
export function SplitWords({
  as = 'h2',
  step,
  base,
  observe = true,
  revealKey,
  children,
  ...rest
}: SplitWordsProps) {
  const words = splitWords(children, { step, base });
  if (!observe) {
    const Tag = as as ElementType;
    return <Tag {...rest}>{words}</Tag>;
  }
  return (
    <InView as={as} data-split="" revealKey={revealKey} {...rest}>
      {words}
    </InView>
  );
}
