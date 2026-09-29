import type { Metadata } from 'next';

import { ContactPage } from '@/features/contact/ContactPage';

export const metadata: Metadata = {
  title: 'Contact',
  alternates: { canonical: '/contact' },
};

export default function Page() {
  return <ContactPage />;
}
