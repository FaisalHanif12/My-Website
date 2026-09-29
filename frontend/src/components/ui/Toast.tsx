'use client';

/**
 * The #toast live region (markup L4557, CSS L281-284). Always mounted so the live region exists
 * before the first message; empty until the first toast(msg).
 *
 * The text is keyed on seq so every toast(msg) call swaps in a new Text node, like the reference's
 * `t.textContent=msg` (L4663). A repeated identical message is then announced again; hiding keeps
 * the same node.
 */
import { Fragment } from 'react';
import { useToastState } from '@/components/providers/ToastProvider';

export function Toast() {
  const { text, on, seq } = useToastState();
  return (
    <div className={on ? 'toast is-on' : 'toast'} id="toast" role="status" aria-live="polite">
      <Fragment key={seq}>{text}</Fragment>
    </div>
  );
}
