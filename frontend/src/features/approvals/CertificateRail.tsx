import { Reveal } from '@/components/motion';
import type { CSSVars } from '@/components/motion/shared';
import { FadeImage } from '@/components/ui/FadeImage';
import { Icon } from '@/components/ui/Icon';
import {
  CERTIFICATE_FILTERS,
  CERTIFICATE_RAIL_COPY,
  CERTIFICATES,
  type Certificate,
} from '@/content/certificates';

import { countByKey, FilterBar } from '../works/FilterBar';
import { pad } from '../works/wkShared';

const copy = CERTIFICATE_RAIL_COPY;

/** One certificate card of the rail (article.wk-cert, reference template L7654-7680). */
function Card({ cert: c, index }: { cert: Certificate; index: number }) {
  const n = pad(index + 1);
  const ai = c.filterKey === 'ai';
  return (
    <article className="wk-cert card" data-spotlight="" aria-labelledby={`wk-c${n}`}>
      <div className="wk-cert__media">
        <div className="wk-paper" aria-hidden="true">
          <span className="wk-paper__top">
            <span>{copy.card.paperTop}</span>
            <span>{c.year}</span>
          </span>
          <span className="wk-paper__iss">{c.issuer}</span>
          <span className="wk-paper__type">{c.type}</span>
          <span className="wk-paper__lines">
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span className="wk-seal">
            <Icon name="i-award" aria-hidden="true" />
          </span>
        </div>
        <FadeImage
          src={c.image}
          alt={copy.card.imageAlt(c.title, c.issuer)}
          width={1200}
          height={850}
        />
        {ai ? (
          <span className="wk-cert__flag">
            <Icon name="i-sparkles" aria-hidden="true" />
            {copy.card.aiFlag}
          </span>
        ) : null}
      </div>
      <div className="wk-cert__body">
        <div className="wk-issuer">
          <span className={`wk-mono wk-mono--${c.issuer.toLowerCase()}`} aria-hidden="true">
            {c.mono}
          </span>
          <span className="wk-issuer__txt">
            <b>{c.issuer}</b>
            <span>{copy.card.issuerLine(c.type, c.year)}</span>
          </span>
        </div>
        <h3 className="wk-cert__title" id={`wk-c${n}`}>
          {c.title}
        </h3>
        <p className="wk-cert__desc">{c.description}</p>
        <ul className="tags wk-tags" aria-label={copy.card.tagsAriaLabel}>
          {c.tags.map((tag) => (
            <li className="tag" key={tag}>
              {tag}
            </li>
          ))}
        </ul>
        <div className="wk-cert__foot">
          <span className="wk-verified">
            <Icon name="i-check-circle" aria-hidden="true" />
            {copy.card.verified}
          </span>
          <a className="wk-view" href={c.verifyUrl} target="_blank" rel="noopener">
            {copy.card.view}
            <Icon name="i-arrow-up-right" aria-hidden="true" />
            <span className="sr-only">{copy.card.viewSr(c.title)}</span>
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * The toolbar (filter and carousel controls), the horizontal rail of certificates and its progress
 * bar (reference L4312-4332). The buttons' disabled state and the counter are set by the script.
 */
export function CertificateRail() {
  const counts = countByKey(CERTIFICATES, (c) => c.filterKey);
  const total = pad(CERTIFICATES.length);
  return (
    <>
      <div className="wrap wk-main">
        <Reveal className="wk-toolbar" id="wk-ap-toolbar">
          <FilterBar
            id="wk-ap-filter"
            ariaLabel={copy.filterAriaLabel}
            filters={CERTIFICATE_FILTERS}
            counts={counts}
            countAriaLabel={copy.countChipAriaLabel}
          />
          <div className="wk-railctl" aria-label={copy.controlsAriaLabel} role="group">
            <p className="wk-railctl__n" aria-live="polite">
              <b id="wk-ap-cur">01</b> / <span id="wk-ap-tot">{total}</span>
            </p>
            <button
              type="button"
              className="wk-railbtn"
              id="wk-ap-prev"
              aria-label={copy.prevAriaLabel}
            >
              <Icon name="i-arrow-left" />
            </button>
            <button
              type="button"
              className="wk-railbtn"
              id="wk-ap-next"
              aria-label={copy.nextAriaLabel}
            >
              <Icon name="i-arrow-right" />
            </button>
          </div>
        </Reveal>
      </div>

      <Reveal
        className="wk-rail"
        id="wk-rail"
        role="region"
        aria-label={copy.railAriaLabel}
        tabIndex={0}
        variant="fade"
        delay={160}
      >
        <div className="wk-rail__track" id="wk-ap-track">
          {CERTIFICATES.map((c, i) => (
            <Reveal
              className={c.filterKey === 'ai' ? 'wk-cc wk-cc--feat' : 'wk-cc'}
              data-k={c.filterKey}
              style={{ '--d': `${Math.min(i, 3) * 90}ms` } as CSSVars}
              eager
              key={c.title}
            >
              <Card cert={c} index={i} />
            </Reveal>
          ))}
        </div>
      </Reveal>
      <div className="wrap">
        <div className="wk-empty" id="wk-ap-empty" hidden>
          <Icon name="i-award" aria-hidden="true" />
          <p className="wk-empty__t">{copy.empty.title}</p>
          <p className="wk-empty__d">{copy.empty.text}</p>
        </div>
        <div className="wk-progress" aria-hidden="true">
          <span id="wk-ap-bar"></span>
        </div>
      </div>
    </>
  );
}
