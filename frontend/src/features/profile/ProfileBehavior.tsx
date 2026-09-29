'use client';

import { useEffect } from 'react';

import { scrollToEl } from '@/components/providers/TransitionProvider';
import { getFinePointer } from '@/hooks/useFinePointer';
import { getReducedMotion } from '@/hooks/useReducedMotion';

import { initProfile } from './initProfile';

/** Runs the Profile page script (initProfile.ts) while the page is mounted. Renders nothing. */
export function ProfileBehavior() {
  useEffect(() => {
    const sec = document.getElementById('profile');
    if (!sec) return;
    return initProfile(sec, { reduce: getReducedMotion(), fine: getFinePointer(), scrollToEl });
  }, []);
  return null;
}
