'use client';

import { useEffect, useRef } from 'react';

import { useToast } from '@/components/providers/ToastProvider';
import { getFinePointer } from '@/hooks/useFinePointer';
import { getReducedMotion } from '@/hooks/useReducedMotion';

import { initAbout } from './initAbout';

/**
 * Runs the About page script (initAbout.ts) once the page is mounted, and undoes it when the
 * page unmounts. Renders nothing. Reduced motion and the fine pointer test are read once, like the
 * reference (FH.reduce, FH.fine).
 */
export function AboutBehavior() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  });
  useEffect(() => {
    const root = document.getElementById('about');
    if (!root) return;
    return initAbout(root, {
      reduce: getReducedMotion(),
      fine: getFinePointer(),
      toast: (message) => toastRef.current(message),
    });
  }, []);
  return null;
}
