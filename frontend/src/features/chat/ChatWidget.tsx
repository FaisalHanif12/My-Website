'use client';

import { useEffect, useRef } from 'react';

import { BOOKING_MODAL_ID, bookingPayload, useModal } from '@/components/providers/ModalProvider';
import { Icon } from '@/components/ui/Icon';
import { CHAT_UI } from '@/content/chat-knowledge';
import { getReducedMotion } from '@/hooks/useReducedMotion';
import { useNavigate, usePageId } from '@/hooks/usePageTransition';
import type { PageId } from '@/lib/routes';

import { initChat } from './initChat';

/**
 * The chat widget (reference markup L4837-4860, script L6709-7016): a floating button with a
 * one-time "Ask me anything" nudge that opens the assistant panel. Server rendered closed; the
 * script opens it, writes the messages and handles the actions. Lives in the root layout so it
 * stays through page changes.
 */
export function ChatWidget() {
  const rootRef = useRef<HTMLDivElement>(null);
  const modal = useModal();
  const { go } = useNavigate();
  const page = usePageId();
  // The script reads these from events and timers, so they live in refs.
  const modalRef = useRef(modal);
  const goRef = useRef(go);
  const pageRef = useRef<PageId | null>(page);
  useEffect(() => {
    modalRef.current = modal;
    goRef.current = go;
    pageRef.current = page;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return initChat(root, {
      reduce: getReducedMotion(),
      openBooking: (type, returnFocus) =>
        modalRef.current.open(BOOKING_MODAL_ID, {
          payload: bookingPayload(type),
          returnFocus,
        }),
      go: (target) => goRef.current(target),
      currentPage: () => pageRef.current,
    });
  }, []);

  return (
    <div className="ct-chat" id="ct-chat" ref={rootRef}>
      <div className="ct-chat__nudge" id="ct-chat-nudge" aria-hidden="true">
        <span>{CHAT_UI.nudge}</span>
      </div>
      <button
        type="button"
        className="ct-chat__fab"
        id="ct-chat-fab"
        aria-expanded="false"
        aria-controls="ct-chat-panel"
        aria-label={CHAT_UI.fabOpenLabel}
      >
        <Icon name="i-bolt-chat" className="ct-chat__fi ct-chat__fi--open" aria-hidden="true" />
        <Icon name="i-close" className="ct-chat__fi ct-chat__fi--close" aria-hidden="true" />
        <span className="ct-chat__unread" aria-hidden="true"></span>
      </button>
      <section
        className="ct-chat__panel"
        id="ct-chat-panel"
        role="dialog"
        aria-labelledby="ct-chat-title"
        aria-hidden="true"
        inert
      >
        <header className="ct-chat__head">
          <span className="ct-chat__av" aria-hidden="true">
            {CHAT_UI.avatar}
            <span className="ct-chat__live"></span>
          </span>
          <div className="ct-chat__who">
            <strong id="ct-chat-title">{CHAT_UI.title}</strong>
            <span>{CHAT_UI.status}</span>
          </div>
          <button
            type="button"
            className="ct-chat__x"
            id="ct-chat-x"
            aria-label={CHAT_UI.closeLabel}
          >
            <Icon name="i-close" />
          </button>
        </header>
        <div
          className="ct-chat__log"
          id="ct-chat-log"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={0}
          aria-label={CHAT_UI.logLabel}
        ></div>
        <form className="ct-chat__form" id="ct-chat-form" autoComplete="off">
          <label className="sr-only" htmlFor="ct-chat-input">
            {CHAT_UI.inputLabel}
          </label>
          <input
            className="ct-chat__in"
            id="ct-chat-input"
            type="text"
            placeholder={CHAT_UI.placeholder}
            maxLength={CHAT_UI.maxLength}
            enterKeyHint="send"
          />
          <button type="submit" className="ct-chat__send" aria-label={CHAT_UI.sendLabel}>
            <Icon name="i-send" />
          </button>
        </form>
      </section>
    </div>
  );
}
