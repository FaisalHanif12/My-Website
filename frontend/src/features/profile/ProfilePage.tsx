import { NextPageLink } from '@/components/layout/NextPageLink';

import { ProfileBehavior } from './ProfileBehavior';
import { ProfileBody } from './ProfileBody';
import { ProfileHero } from './ProfileHero';

/**
 * section#profile (reference L3805-4164): the résumé hero, then experience, education and technical
 * expertise, and the next page link. `page is-current` come from the router in the reference
 * (L5046, L5051); only the mounted route is current here.
 */
export function ProfilePage() {
  return (
    <section
      id="profile"
      className="section pf page is-current"
      data-page="profile"
      aria-labelledby="pf-title"
    >
      <ProfileHero />
      <ProfileBody />
      <NextPageLink from="profile" />
      <ProfileBehavior />
    </section>
  );
}
