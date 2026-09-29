import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BOOKING_MODAL_ID,
  ModalProvider,
  useModalOpen,
} from '@/components/providers/ModalProvider';

const api = vi.hoisted(() => ({ enabled: false, postChat: vi.fn() }));

vi.mock('next/navigation', () => ({ usePathname: () => '/contact' }));
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    get API_ENABLED() {
      return api.enabled;
    },
    postChat: api.postChat,
  };
});

import { Modal } from '@/components/ui/Modal';

import { ChatWidget } from './ChatWidget';

const q = <E extends HTMLElement>(s: string) => document.querySelector<E>(s)!;
const settle = (ms = 0) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

function BookingProbe() {
  return useModalOpen(BOOKING_MODAL_ID) ? <b id="probe-open" /> : null;
}

function setup() {
  render(
    <ModalProvider>
      <Modal id={BOOKING_MODAL_ID} closeLabel="Close booking" />
      <BookingProbe />
      <ChatWidget />
    </ModalProvider>,
  );
}

async function ask(text: string) {
  fireEvent.change(q('#ct-chat-input'), { target: { value: text } });
  fireEvent.submit(q('#ct-chat-form'));
  await settle(2000);
}

describe('chat widget', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    sessionStorage.clear();
    api.enabled = false;
    api.postChat.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts closed, opens with a greeting and chips, closes again', async () => {
    setup();
    expect(q('#ct-chat-panel').hasAttribute('inert')).toBe(true);
    expect(q('#ct-chat-fab').getAttribute('aria-label')).toBe("Open chat with Faisal's Assistant");
    fireEvent.click(q('#ct-chat-fab'));
    await settle(1200);
    expect(q('#ct-chat').classList.contains('is-open')).toBe(true);
    expect(q('#ct-chat-fab').getAttribute('aria-label')).toBe('Close chat');
    expect(q('#ct-chat-log').textContent).toContain("Hi! I'm Faisal's assistant.");
    expect(document.querySelectorAll('.ct-chip')).toHaveLength(6);
    fireEvent.click(q('#ct-chat-x'));
    expect(q('#ct-chat').classList.contains('is-open')).toBe(false);
    expect(q('#ct-chat-panel').hasAttribute('inert')).toBe(true);
  });

  it('answers locally when the API is off, and a chip sends its label', async () => {
    setup();
    fireEvent.click(q('#ct-chat-fab'));
    await settle(1200);
    await ask('what are your rates?');
    expect(q('#ct-chat-log').textContent).toContain('Professional plan');
    expect(api.postChat).not.toHaveBeenCalled();
    fireEvent.click(document.querySelector<HTMLElement>('.ct-chip:not(.ct-chips--used .ct-chip)')!);
    await settle(2000);
    expect(document.querySelectorAll('.ct-msg--me').length).toBe(2);
  });

  it('uses the API answer, and falls back to the local one when it fails', async () => {
    api.enabled = true;
    setup();
    fireEvent.click(q('#ct-chat-fab'));
    await settle(1200);
    api.postChat.mockResolvedValueOnce('Sure thing.\n\n- one\n- two');
    await ask('what are your rates?');
    expect(q('#ct-chat-log').textContent).toContain('Sure thing.');
    expect(api.postChat.mock.calls[0][0]).toMatchObject({ message: 'what are your rates?' });
    expect(api.postChat.mock.calls[0][0].history.at(-1)).toEqual({
      role: 'user',
      content: 'what are your rates?',
    });
    // The action buttons still come from the local answer.
    expect(document.querySelector('.ct-msg--bot:last-of-type .ct-act')).not.toBeNull();
    api.postChat.mockRejectedValueOnce(new Error('down'));
    await ask('how do I book a meeting');
    expect(q('#ct-chat-log').textContent).toContain('You can book a video call right here');
  });

  it('opens the booking modal from an action and closes the chat', async () => {
    setup();
    fireEvent.click(q('#ct-chat-fab'));
    await settle(1200);
    await ask('how do I book a meeting');
    fireEvent.click(document.querySelector<HTMLElement>('[data-act]')!);
    expect(q('#ct-chat').classList.contains('is-open')).toBe(false);
    expect(document.getElementById('probe-open')).not.toBeNull();
  });

  it('shows the nudge once per session', async () => {
    setup();
    await settle(6100);
    expect(q('#ct-chat').classList.contains('is-nudge')).toBe(true);
    await settle(5300);
    expect(q('#ct-chat').classList.contains('is-nudge')).toBe(false);
    expect(sessionStorage.getItem('ct-nudged')).toBe('1');
  });
});
