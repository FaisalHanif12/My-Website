'use client';

import type { ReactElement } from 'react';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/providers/ThemeProvider';
import { shellCopy } from '@/content/site';

export interface ThemeToggleProps {
  /**
   * Where the button sits: the rail (reference L3329) or the top bar (L3336). The reference
   * markup is the same in both places, so both variants render the same button; the prop only
   * names the call site.
   */
  variant: 'rail' | 'topbar';
}

/**
 * button.theme-btn[data-theme-toggle] (L3329, L3336): the moon and sun icons, swapped by CSS on
 * data-theme (L239-241). No type attribute, like the reference (it is never inside a form).
 * aria-pressed reflects dark (orchestrator decision; nothing visible changes): "false" in the
 * server HTML, then the real theme right after hydration. The click runs the circular reveal
 * from this button (L5010-5016).
 *
 * Typed through ThemeToggleProps (variant is required at the call site) while the body ignores
 * it, since both variants are the same markup.
 */
export const ThemeToggle: (props: ThemeToggleProps) => ReactElement = function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="theme-btn"
      data-theme-toggle=""
      aria-label={shellCopy.themeToggleAriaLabel}
      aria-pressed={theme === 'dark'}
      onClick={(e) => toggle(e.currentTarget)}
    >
      <Icon name="i-moon" className="i-moon" />
      <Icon name="i-sun" className="i-sun" />
    </button>
  );
};
