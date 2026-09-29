import type { ReactNode } from 'react';

import { Reveal, SplitWords } from '@/components/motion';
import type { SectionHead as SectionHeadData } from '@/content/services';

/**
 * The eyebrow, split h2 and lead shared by every About block (div.sec-head). `eyebrowNum` renders
 * `<b>01</b> About`; `extra` sits after the lead (the testimonials controls). The h2 is split into
 * words (data-split) and the lead is revealed, like the reference.
 */
export function SectionHead({
  head,
  className = 'sec-head',
  extra,
}: {
  head: SectionHeadData;
  className?: string;
  extra?: ReactNode;
}) {
  return (
    <div className={className}>
      <span className="eyebrow">
        {head.eyebrowNum ? <b>{head.eyebrowNum}</b> : null}
        {head.eyebrowNum ? ' ' : null}
        {head.eyebrow}
      </span>
      <SplitWords as="h2" className="sec-title">
        {head.titleText} <span className="serif grad-text">{head.titleAccent}</span>
      </SplitWords>
      <Reveal as="p" className="lead">
        {head.lead}
      </Reveal>
      {extra}
    </div>
  );
}
