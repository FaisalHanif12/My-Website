import { act, fireEvent, render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BOOKING_MODAL_ID,
  ModalProvider,
  bookingPayload,
  useModal,
  type ModalApi,
} from '@/components/providers/ModalProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

import { BookingModal } from './BookingModal';

let modal: ModalApi;
function Grab() {
  const api = useModal();
  useEffect(() => {
    modal = api;
  }, [api]);
  return null;
}

function setup() {
  return render(
    <ToastProvider>
      <ModalProvider>
        <Grab />
        <BookingModal />
      </ModalProvider>
    </ToastProvider>,
  );
}

const q = <E extends HTMLElement>(s: string) => document.querySelector<E>(s)!;
const click = (s: string) => act(() => fireEvent.click(q(s)));
/** Clicks, then lets the step swap promise settle (the flow ignores clicks while it runs). */
const clickAndSettle = async (s: string) => {
  click(s);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
};

describe('booking modal (mailto mode)', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'Date',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
      ],
    });
    vi.setSystemTime(new Date('2026-03-10T09:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens on Quick Chat, or Deep Dive from the payload, with the summary updated', () => {
    setup();
    act(() => modal.open(BOOKING_MODAL_ID, { payload: bookingPayload('deep') }));
    expect(q('#booking').classList.contains('is-open')).toBe(true);
    expect(q<HTMLInputElement>('input[name="ct-bk-type"][value="deep"]').checked).toBe(true);
    expect(q('#ct-bk-s-type').textContent).toBe('Technical Deep Dive');
    expect(q('#ct-bk-s-price').textContent).toBe('$25');
    expect(q('#ct-bk-s-total').textContent).toBe('$25');
  });

  it('steps the session count between 1 and 10 and prices it', async () => {
    setup();
    act(() => modal.open(BOOKING_MODAL_ID, { payload: bookingPayload('quick') }));
    click('[data-bk-step="1"]');
    click('[data-bk-step="1"]');
    expect(q('#ct-bk-n').textContent).toBe('3');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(q('#ct-bk-s-total').textContent).toBe('$45');
    expect(q<HTMLButtonElement>('[data-bk-step="-1"]').disabled).toBe(false);
    for (let i = 0; i < 12; i++) click('[data-bk-step="1"]');
    expect(q('#ct-bk-n').textContent).toBe('10');
    expect(q<HTMLButtonElement>('[data-bk-step="1"]').disabled).toBe(true);
  });

  it('validates each step, then reaches the done screen through the mail flow', async () => {
    setup();
    act(() => modal.open(BOOKING_MODAL_ID, { payload: bookingPayload('quick') }));
    await clickAndSettle('#ct-bk-go');
    expect(q('[data-screen="steps"]').hidden).toBe(false);

    click('.ct-pane[data-pane="1"] [data-bk-next]');
    expect(q('#ct-bk-email-err').textContent).toBe(
      'Please enter your email so I can send the meeting link.',
    );
    fireEvent.change(q('#ct-bk-email'), { target: { value: 'nope' } });
    click('#ct-bk-verify');
    expect(q('#ct-bk-email-err').textContent).toBe(
      'That email looks off. Try something like name@company.com.',
    );
    fireEvent.change(q('#ct-bk-email'), { target: { value: 'a@b.co' } });
    click('#ct-bk-verify');
    expect(q('#ct-bk-verify').textContent).toBe('Verified');
    fireEvent.change(q('#ct-bk-name'), { target: { value: 'A' } });
    click('.ct-pane[data-pane="1"] [data-bk-next]');
    expect(q('#ct-bk-name-err').textContent).toBe('That name looks a little short.');
    fireEvent.change(q('#ct-bk-name'), { target: { value: 'Ada Lovelace' } });
    await clickAndSettle('.ct-pane[data-pane="1"] [data-bk-next]');
    expect(q('.ct-pane[data-pane="2"]').hidden).toBe(false);

    click('.ct-pane[data-pane="2"] [data-bk-next]');
    expect(q('#ct-bk-date-err').textContent).toBe('Pick a weekday for the meeting.');
    const day = document.querySelector<HTMLElement>('.ct-cal__d:not([disabled])')!;
    click('.ct-cal__d:not([disabled])');
    expect(day.getAttribute('aria-pressed')).toBe('true');
    // A Quick Chat starts every 30 minutes: 09:00 to 17:30.
    expect(document.querySelectorAll('.ct-slot')).toHaveLength(18);
    click('.ct-pane[data-pane="2"] [data-bk-next]');
    expect(q('#ct-bk-slot-err').textContent).toBe('Choose one of the time slots.');
    click('.ct-slot');
    await clickAndSettle('.ct-pane[data-pane="2"] [data-bk-next]');
    expect(q('.ct-pane[data-pane="3"]').hidden).toBe(false);

    click('#ct-bk-complete');
    expect(q('#ct-bk-plat-err').textContent).toBe('Choose Google Meet or Zoom.');
    fireEvent.click(q('input[name="ct-bk-plat"][value="Zoom"]'));
    const opened: string[] = [];
    document.addEventListener(
      'click',
      (e) => {
        const a = (e.target as Element).closest?.('a[href^="mailto:"]');
        if (a) {
          opened.push((a as HTMLAnchorElement).href);
          e.preventDefault();
        }
      },
      true,
    );
    click('#ct-bk-complete');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(opened).toHaveLength(1);
    expect(decodeURIComponent(opened[0])).toContain('Meeting request: Quick Chat on ');
    expect(decodeURIComponent(opened[0])).toContain('Platform: Zoom');
    expect(q('[data-screen="done"]').hidden).toBe(false);
    expect(q('#ct-bk-t3').textContent).toBe('Request ready!');
    expect(q('#ct-bk-done-msg').textContent).toContain('a@b.co');
    expect(q('#ct-bk-ticket').textContent).toContain('Quick Chat × 1');
  });

  async function toStep2(type: 'quick' | 'deep', sessions: number) {
    act(() => modal.open(BOOKING_MODAL_ID, { payload: bookingPayload(type) }));
    for (let i = 1; i < sessions; i += 1) click('[data-bk-step="1"]');
    await clickAndSettle('#ct-bk-go');
    fireEvent.change(q('#ct-bk-email'), { target: { value: 'a@b.co' } });
    fireEvent.change(q('#ct-bk-name'), { target: { value: 'Ada Lovelace' } });
    await clickAndSettle('.ct-pane[data-pane="1"] [data-bk-next]');
    click('.ct-cal__d:not([disabled])');
  }

  it('a Deep Dive offers a slot every 60 minutes, a Quick Chat every 30', async () => {
    setup();
    await toStep2('deep', 1);
    const labels = [...document.querySelectorAll('.ct-slot')].map((b) => b.textContent);
    expect(labels).toHaveLength(9);
    expect(labels[1]).not.toMatch(/:30/);
  });

  it('two sessions need two different slots, and a third pick is refused', async () => {
    setup();
    await toStep2('quick', 2);
    const slotBtns = () => [...document.querySelectorAll<HTMLElement>('.ct-slot')];
    expect(slotBtns()[0]!.getAttribute('role')).toBe('checkbox');
    expect(q('#ct-slots-hint').textContent).toContain('Pick 2 times');
    fireEvent.click(slotBtns()[0]!);
    await clickAndSettle('.ct-pane[data-pane="2"] [data-bk-next]');
    expect(q('#ct-bk-slot-err').textContent).toBe(
      'Choose 2 time slots, one for each session (1 picked so far).',
    );
    fireEvent.click(slotBtns()[1]!);
    fireEvent.click(slotBtns()[2]!);
    expect(q('#ct-bk-slot-err').textContent).toContain('Tap a picked time to remove it first');
    expect(slotBtns().filter((b) => b.getAttribute('aria-checked') === 'true')).toHaveLength(2);
    // Tapping a picked time removes it.
    fireEvent.click(slotBtns()[0]!);
    expect(slotBtns().filter((b) => b.getAttribute('aria-checked') === 'true')).toHaveLength(1);
    fireEvent.click(slotBtns()[2]!);
    await clickAndSettle('.ct-pane[data-pane="2"] [data-bk-next]');
    expect(q('.ct-pane[data-pane="3"]').hidden).toBe(false);
    expect(q('.ct-order [data-recap]').textContent).toContain('Times');
  });

  it('the mail lists every session', async () => {
    setup();
    await toStep2('quick', 2);
    const btns = () => [...document.querySelectorAll<HTMLElement>('.ct-slot')];
    fireEvent.click(btns()[0]!);
    fireEvent.click(btns()[3]!);
    await clickAndSettle('.ct-pane[data-pane="2"] [data-bk-next]');
    fireEvent.click(q('input[name="ct-bk-plat"][value="Zoom"]'));
    const opened: string[] = [];
    document.addEventListener(
      'click',
      (e) => {
        const a = (e.target as Element).closest?.('a[href^="mailto:"]');
        if (a) {
          opened.push((a as HTMLAnchorElement).href);
          e.preventDefault();
        }
      },
      true,
    );
    click('#ct-bk-complete');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    const body = decodeURIComponent(opened[0]!);
    expect(body).toContain('Session 1: ');
    expect(body).toContain('Session 2: ');
    expect(body).toContain('Number of sessions: 2');
    expect(q('#ct-bk-ticket').querySelectorAll('small')).toHaveLength(2);
  });
});
