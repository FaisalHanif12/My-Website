import type { AllHTMLAttributes, CSSProperties, JSX, Ref, RefCallback } from 'react';

/** data-reveal values (CSS L175-187). '' is the default ("up") variant. */
export type RevealVariant = '' | 'up' | 'fade' | 'scale' | 'left' | 'right' | 'blur' | 'mask';

/** A host tag name. Strings only, so server pages can pass `as` to client components. */
export type MotionTag = keyof JSX.IntrinsicElements;

/** Inline style that may carry CSS custom properties such as --d. */
export type CSSVars = CSSProperties & { [name: `--${string}`]: string | number | undefined };

/** HTML attributes for a polymorphic motion element (`as` is ours, not the link attribute). */
export interface MotionElementProps extends Omit<AllHTMLAttributes<HTMLElement>, 'as' | 'style'> {
  as?: MotionTag;
  style?: CSSVars;
  ref?: Ref<HTMLElement>;
}

/** Merges `is-in` at the end of the class list, where classList.add would put it. */
export function withIsIn(className: string | undefined, isIn: boolean): string | undefined {
  if (!isIn) return className;
  return className ? className + ' is-in' : 'is-in';
}

/** Writes el into a caller's ref (callback or object). */
export function assignRef<T>(ref: Ref<T> | undefined, el: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    (ref as RefCallback<T>)(el);
    return;
  }
  ref.current = el;
}
