import { NextPageLink } from '@/components/layout/NextPageLink';

import { AboutBehavior } from './AboutBehavior';
import { AboutHero } from './AboutHero';
import { KnowMe } from './KnowMe';
import { Marquee } from './Marquee';
import { Pricing } from './Pricing';
import { Services } from './Services';
import { Testimonials } from './Testimonials';

/**
 * section#about (reference L3349-3803): the hero, the tech marquee, Get to Know Me, services,
 * testimonials and pricing, then the next page link. The router adds `page` and `is-current`
 * (L5046, L5051): only the mounted route is current, so both are in the markup.
 */
export function AboutPage() {
  return (
    <section id="about" className="ab page is-current" data-page="about" aria-labelledby="ab-name">
      <AboutHero />
      <Marquee />
      <KnowMe />
      <Services />
      <Testimonials />
      <Pricing />
      <NextPageLink from="about" />
      <AboutBehavior />
    </section>
  );
}
