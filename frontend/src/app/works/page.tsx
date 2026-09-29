import type { Metadata } from 'next';

import { WorksPage } from '@/features/works/WorksPage';

export const metadata: Metadata = {
  title: 'Works',
  alternates: { canonical: '/works' },
};

export default function Page() {
  return <WorksPage />;
}
