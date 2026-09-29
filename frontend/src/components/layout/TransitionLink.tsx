'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';

import { useNavigate } from '@/hooks/usePageTransition';

export interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** A route ("/works"), a route with an anchor ("/profile#pf-exp") or a "#id" of the current page. */
  href: string;
  /**
   * Blur the link after a mouse click, like the reference does for .rail__link and .rail__logo
   * (L5088: `if (e.detail) a.blur()`), so the focus ring only shows for keyboard use.
   */
  blurOnMouse?: boolean;
}

/**
 * A real link (crawlers, middle click, "open in new tab" all keep working) whose plain left click
 * runs the curtain transition: FH.go(target). Modified clicks (meta, ctrl, shift, alt) and other
 * buttons are left to the browser, like the reference click listener (L5083).
 */
export function TransitionLink({ href, blurOnMouse, onClick, ...rest }: TransitionLinkProps) {
  const { go } = useNavigate();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (blurOnMouse && e.detail) e.currentTarget.blur();
    go(href);
  };
  return <a href={href} onClick={handleClick} {...rest} />;
}
