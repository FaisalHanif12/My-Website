import type { Metadata } from 'next';

import { ApprovalsPage } from '@/features/approvals/ApprovalsPage';

export const metadata: Metadata = {
  title: 'Approvals',
  alternates: { canonical: '/approvals' },
};

export default function Page() {
  return <ApprovalsPage />;
}
