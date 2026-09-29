import type { ComponentPropsWithoutRef } from 'react';

import type { IconName } from '@/components/ui/IconSprite';

export type { IconName };

export interface IconProps extends Omit<
  ComponentPropsWithoutRef<'svg'>,
  'children' | 'className' | 'fill'
> {
  /** Shell sprite symbol id, with its i- prefix, for example "i-arrow-right". */
  name: IconName;
  /** Extra classes after "i" (and "i--fill"), for example "i-moon" on the theme toggle. */
  className?: string;
  /** Adds .i--fill (fill:currentColor, no stroke), like i-play and the Featured i-star. */
  fill?: boolean;
}

/**
 * <svg class="i"><use href="#i-..."/></svg>, the reference icon markup (map 11.1.5). The class order
 * matches the works.js icon() helper: "i", then the extra classes. Other attributes (for example
 * aria-hidden="true", which many reference icons have and the rail, dock and top bar icons do not)
 * are passed through as written. Server safe: no state, no effects.
 */
export function Icon({ name, className, fill = false, ...rest }: IconProps) {
  const cls = 'i' + (fill ? ' i--fill' : '') + (className ? ' ' + className : '');
  return (
    <svg className={cls} {...rest}>
      <use href={`#${name}`} />
    </svg>
  );
}
