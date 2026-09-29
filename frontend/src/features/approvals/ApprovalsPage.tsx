import { NextPageLink } from '@/components/layout/NextPageLink';

import { ApprovalsBehavior } from './ApprovalsBehavior';
import { ApprovalsHero } from './ApprovalsHero';
import { CertificateRail } from './CertificateRail';

/**
 * section#approvals (reference L4268-4332): the certificate deck hero, then the filter, the
 * horizontal rail of certificates, and the next page link. `page is-current` come from the router in
 * the reference; only the mounted route is current here.
 */
export function ApprovalsPage() {
  return (
    <section
      id="approvals"
      className="section wk-sec wk-ap page is-current"
      data-page="approvals"
      aria-labelledby="wk-ap-title"
    >
      <ApprovalsHero />
      <CertificateRail />
      <NextPageLink from="approvals" />
      <ApprovalsBehavior />
    </section>
  );
}
