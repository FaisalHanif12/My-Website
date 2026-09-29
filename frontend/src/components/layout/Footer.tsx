import { Icon } from '@/components/ui/Icon';
import { footerCopy } from '@/content/site';

import { FooterYear } from './FooterYear';
import { TransitionLink } from './TransitionLink';

/**
 * footer.footer (reference L4597-4606). It sits inside main.site, after the current page, so it
 * shows under every route. The year is written at run time in the reference (L5149); FooterYear
 * renders the build year on the server and updates it on the client.
 */
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__big" aria-hidden="true">
          {footerCopy.bigPlain} <span className="serif">{footerCopy.bigSerif}</span>
        </div>
        <div className="footer__row">
          <span>
            {footerCopy.copyright}
            <FooterYear initial={new Date().getFullYear()} />
            {footerCopy.line}
          </span>
          <TransitionLink className="link-arrow" href="/">
            {footerCopy.backToTop} <Icon name="i-arrow-up-right" />
          </TransitionLink>
        </div>
      </div>
    </footer>
  );
}
