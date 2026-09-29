import { NextPageLink } from '@/components/layout/NextPageLink';

import { ProjectGrid } from './ProjectGrid';
import { WorksBehavior } from './WorksBehavior';
import { WorksHero } from './WorksHero';

/**
 * section#works (reference L4166-4266): the orbit hero, then the toolbar, filter and project grid,
 * and the next page link. `page is-current` come from the router in the reference; only the mounted
 * route is current here.
 */
export function WorksPage() {
  return (
    <section
      id="works"
      className="section wk-sec page is-current"
      data-page="works"
      aria-labelledby="wk-title"
    >
      <WorksHero />
      <ProjectGrid />
      <NextPageLink from="works" />
      <WorksBehavior />
    </section>
  );
}
