import type { Metadata } from 'next';

import { ProfilePage } from '@/features/profile/ProfilePage';

export const metadata: Metadata = {
  title: 'Profile',
  alternates: { canonical: '/profile' },
};

export default function Page() {
  return <ProfilePage />;
}
