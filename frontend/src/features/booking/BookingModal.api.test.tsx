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

const api = vi.hoisted(() => ({
  getBookingSlots: vi.fn(),
  postBooking: vi.fn(),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return { ...actual, API_ENABLED: true, ...api };
});

import { ApiError } from '@/lib/api';

import { BookingModal } from './BookingModal';

let modal: ModalApi;
function Grab() {
  const api = useModal();
  useEffect(() => {
    modal = api;
  }, [api]);
  return null;
}

const q = <E extends HTMLElement>(s: string) => document.querySelector<E>(s)!;
const click = (s: string) => act(() => fireEvent.click(q(s)));
const settle = (ms = 0) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

async function reachStep3() {
  act(() => modal.open(BOOKING_MODAL_ID, { payload: bookingPayload('quick') }));
  click('#ct-bk-go');
  await settle();
  fireEvent.change(q('#ct-bk-email'), { target: { value: 'a@b.co' } });
  fireEvent.change(q('#ct-bk-name'), { target: { value: 'Ada Lovelace' } });
  click('.ct-pane[data-pane="1"] [data-bk-next]');
  await settle();
  click('.ct-cal__d:not([disabled])');
  await settle();
  click('.ct-slot');
  click('.ct-pane[data-pane="2"] [data-bk-next]');
  await settle();
  fireEvent.click(q('input[name="ct-bk-plat"][value="Google Meet"]'));
}

describe('booking modal (API mode)', () => {
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
    api.getBookingSlots.mockReset().mockResolvedValue(['10:00', '11:00', '15:00']);
    api.postBooking.mockReset();
    render(
      <ToastProvider>
        <ModalProvider>
          <Grab />
          <BookingModal />
        </ModalProvider>
      </ToastProvider>,
    );
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows only the free hours the server returns', async () => {
    act(() => modal.open(BOOKING_MODAL_ID, { payload: bookingPayload('quick') }));
    click('#ct-bk-go');
    await settle();
    fireEvent.change(q('#ct-bk-email'), { target: { value: 'a@b.co' } });
    fireEvent.change(q('#ct-bk-name'), { target: { value: 'Ada Lovelace' } });
    click('.ct-pane[data-pane="1"] [data-bk-next]');
    await settle();
    click('.ct-cal__d:not([disabled])');
    await settle();
    expect(api.getBookingSlots).toHaveBeenCalledWith(
      expect.stringMatching(/^2026-03-1\d$/),
      'quick',
    );
    expect(document.querySelectorAll('.ct-slot')).toHaveLength(3);
  });

  it('posts with an Idempotency-Key, reuses it on retry, and shows the slot error on 409', async () => {
    await reachStep3();
    api.postBooking.mockRejectedValueOnce(new ApiError('SLOT_TAKEN', { status: 409 }));
    click('#ct-bk-complete');
    await settle(600);
    expect(api.postBooking).toHaveBeenCalledTimes(1);
    const body = api.postBooking.mock.calls[0][0];
    expect(body).toMatchObject({ sessionType: 'quick', email: 'a@b.co', platform: 'Google Meet' });
    const key = api.postBooking.mock.calls[0][1] as string;
    expect(key).toMatch(/^[A-Za-z0-9_-]{8,128}$/);
    // Back on step 2 with the reference slot error.
    expect(q('.ct-pane[data-pane="2"]').hidden).toBe(false);
    expect(q('#ct-bk-slot-err').textContent).toBe(
      'That time was just taken. Please pick another slot.',
    );
  });

  it('shows the done screen (no mail app) when the booking succeeds', async () => {
    await reachStep3();
    api.postBooking.mockResolvedValueOnce({
      ok: true,
      bookingId: 'b1',
      meetLink: 'https://meet.google.com/x',
      start: '',
      end: '',
    });
    click('#ct-bk-complete');
    await settle(600);
    expect(q('[data-screen="done"]').hidden).toBe(false);
    expect(q('#ct-bk-t3').textContent).toBe('Booking sent!');
    expect(q('#ct-bk-done-msg').textContent).toContain('a@b.co');
  });

  it('shows the failure toast on any other error and stays on step 3', async () => {
    await reachStep3();
    api.postBooking.mockRejectedValueOnce(new ApiError('INTERNAL', { status: 500 }));
    click('#ct-bk-complete');
    await settle(600);
    expect(q('.ct-pane[data-pane="3"]').hidden).toBe(false);
    expect(q('#ct-bk-live').textContent).toBe('Booking failed. Please try again.');
  });
});
