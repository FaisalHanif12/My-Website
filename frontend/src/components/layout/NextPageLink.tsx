import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/motion';
import { nextPageOf, nextPageCopy, type PageId } from '@/content/site';

import { TransitionLink } from './TransitionLink';

/**
 * The "Next page" link the reference core injects at the end of every page (L5101-5105):
 * div.wrap > nav.page-next[data-reveal] > a. The left label names the target ("Next page · 02",
 * "Back to the start · 01" on the last page), the right label is the CURRENT position ("1 / 5"),
 * and the target title is split so its last two letters render in the serif italic.
 */
export function NextPageLink({ from }: { from: PageId }) {
  const next = nextPageOf(from);
  return (
    <div className="wrap">
      <Reveal as="nav" className="page-next" aria-label={nextPageCopy.ariaLabel}>
        <TransitionLink href={next.href}>
          <div className="page-next__top">
            <span className="label">{next.label}</span>
            <span className="label">{next.position}</span>
          </div>
          <div className="page-next__title">
            <span className="page-next__word">
              {next.wordHead}
              <span className="serif">{next.wordTail}</span>
            </span>
            <span className="page-next__arrow">
              <Icon name="i-arrow-right" />
            </span>
          </div>
          <div className="page-next__line"></div>
        </TransitionLink>
      </Reveal>
    </div>
  );
}
