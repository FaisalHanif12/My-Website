'use client';

import { useEffect } from 'react';

import { scrollToEl } from '@/components/providers/TransitionProvider';
import { getFinePointer } from '@/hooks/useFinePointer';
import { getReducedMotion } from '@/hooks/useReducedMotion';

import { initApprovals } from './initApprovals';

/** Runs the Approvals page script (initApprovals.ts) while the page is mounted. Renders nothing. */
export function ApprovalsBehavior() {
  useEffect(() => {
    const root = document.getElementById('approvals');
    if (!root) return;
    return initApprovals(root, {
      reduce: getReducedMotion(),
      fine: getFinePointer(),
      scrollToEl,
    });
  }, []);
  return null;
}
