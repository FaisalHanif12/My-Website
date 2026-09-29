'use client';

/**
 * The shared modal shell (CSS L266-279, markup L4240-4244 and L4493-4498, REFERENCE_MAP.md 11.2.11):
 *
 *   div.fh-modal(+className)#id[aria-hidden]
 *     div.fh-modal__scrim[data-close]
 *     div.fh-modal__panel[role=dialog][aria-modal=true][aria-labelledby](+panelProps)
 *       button.fh-modal__close[type=button][data-close][aria-label] > svg.i > use#i-close
 *       children
 *
 * The two reference shells differ only in: the root's extra class (ct-bk, wk-pb), the panel's
 * extra class (ct-bk__panel on booking only, pass it as panelProps.className), aria-labelledby
 * (ct-bk-t1, wk-pb-title), the close button's aria-label, and data-native-scroll, which the
 * booking script adds to its panel (L5794, pass it in panelProps).
 *
 * `is-open` is toggled like the reference and closing is instant (visibility has no transition);
 * children stay mounted while closed. onOpen and onClose replace the fh:open and fh:close events
 * and run synchronously inside open() and close().
 */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { useModalOpen, useModalRegistry } from '@/components/providers/ModalProvider';

type DataAttributes = { [key: `data-${string}`]: string | undefined };

/** Extra attributes for the panel, written after the reference ones. */
export type ModalPanelProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'aria-modal' | 'aria-labelledby' | 'dangerouslySetInnerHTML'
> &
  DataAttributes;

export interface ModalProps {
  /** Element id and the key for open(id) / close(id), e.g. "booking", "purebody". */
  id: string;
  /** Extra root class after "fh-modal" (ct-bk, wk-pb). */
  className?: string;
  /** Panel aria-labelledby (ct-bk-t1 / ct-bk-t2 / ct-bk-t3, wk-pb-title). */
  labelledBy?: string;
  /** Close button aria-label, from content ("Close booking", "Close PureBody showcase"). */
  closeLabel: string;
  /** fh:open: runs synchronously when the modal opens, with the open() payload. */
  onOpen?: (payload: unknown) => void;
  /** fh:close: runs synchronously when the modal closes. */
  onClose?: () => void;
  /** Panel extras: className (ct-bk__panel), data-native-scroll, etc. */
  panelProps?: ModalPanelProps;
  /** Ref to the panel element (the scroll container). */
  panelRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export function Modal({
  id,
  className,
  labelledBy,
  closeLabel,
  onOpen,
  onClose,
  panelProps,
  panelRef,
  children,
}: ModalProps) {
  const open = useModalOpen(id);
  const register = useModalRegistry();
  const rootRef = useRef<HTMLDivElement>(null);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
  });

  useEffect(
    () =>
      register(id, {
        root: () => rootRef.current,
        panel: () =>
          rootRef.current?.querySelector<HTMLElement>(':scope > .fh-modal__panel') ?? null,
        onOpen: (payload) => onOpenRef.current?.(payload),
        onClose: () => onCloseRef.current?.(),
      }),
    [id, register],
  );

  const { className: panelClassName, ...panelRest } = panelProps ?? {};
  const rootClass = ['fh-modal', className, open && 'is-open'].filter(Boolean).join(' ');
  const panelClass = panelClassName ? `fh-modal__panel ${panelClassName}` : 'fh-modal__panel';

  return (
    <div ref={rootRef} className={rootClass} id={id} aria-hidden={open ? 'false' : 'true'}>
      <div className="fh-modal__scrim" data-close="" />
      <div
        ref={panelRef}
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        {...panelRest}
      >
        <button type="button" className="fh-modal__close" data-close="" aria-label={closeLabel}>
          <svg className="i">
            <use href="#i-close" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
