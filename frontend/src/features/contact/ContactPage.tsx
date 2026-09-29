import { NextPageLink } from '@/components/layout/NextPageLink';

import { ContactBehavior } from './ContactBehavior';
import { ContactBody } from './ContactBody';
import { ContactHero } from './ContactHero';

/** The two icons only this page uses (reference L4335-4338): copy and the down arrow. */
function ContactSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <symbol id="ct-i-copy" viewBox="0 0 24 24">
        <rect x="9" y="9" width="12" height="12" rx="2.5" />
        <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5V4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
      </symbol>
      <symbol id="ct-i-down" viewBox="0 0 24 24">
        <path d="M12 5v14M6 13l6 6 6-6" />
      </symbol>
    </svg>
  );
}

/**
 * section#contact (reference L4334-4595): the globe hero, then the ways to reach me, the map and the
 * form, and the next page link. `page is-current` come from the router in the reference; only the
 * mounted route is current here.
 */
export function ContactPage() {
  return (
    <section
      className="section ct page is-current"
      id="contact"
      data-page="contact"
      aria-labelledby="ct-title"
    >
      <ContactSprite />
      <ContactHero />
      <ContactBody />
      <NextPageLink from="contact" />
      <ContactBehavior />
    </section>
  );
}
