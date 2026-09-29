'use client';

import { useEffect } from 'react';

import { useModal } from '@/components/providers/ModalProvider';
import { scrollToEl } from '@/components/providers/TransitionProvider';
import { getReducedMotion } from '@/hooks/useReducedMotion';

import { initWorks } from './initWorks';

/** Runs the Works page script (initWorks.ts) while the page is mounted. Renders nothing. */
export function WorksBehavior() {
  const modal = useModal();
  useEffect(() => {
    const root = document.getElementById('works');
    if (!root) return;
    return initWorks(root, {
      reduce: getReducedMotion(),
      scrollToEl,
      openPureBody: () => modal.open('purebody'),
    });
  }, [modal]);
  return null;
}
