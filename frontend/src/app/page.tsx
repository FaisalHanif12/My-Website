import type { Metadata } from 'next';

import { AboutPage } from '@/features/about/AboutPage';

// The About page keeps the site default title (reference L4683).
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Page() {
  return <AboutPage />;
}
