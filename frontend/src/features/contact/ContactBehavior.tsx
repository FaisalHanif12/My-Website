'use client';

import { useEffect, useRef } from 'react';

import { useToast } from '@/components/providers/ToastProvider';
import { getReducedMotion } from '@/hooks/useReducedMotion';

import { initContact } from './initContact';
import { initContactHero } from './initContactHero';

/** Runs the Contact page scripts (the hero and the form) while the page is mounted. Renders nothing. */
export function ContactBehavior() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  });
  useEffect(() => {
    const page = document.getElementById('contact');
    if (!page) return;
    const env = {
      reduce: getReducedMotion(),
      toast: (message: string) => toastRef.current(message),
    };
    const offHero = initContactHero(page, env);
    const offForm = initContact(page, env);
    return () => {
      offForm();
      offHero();
    };
  }, []);
  return null;
}
