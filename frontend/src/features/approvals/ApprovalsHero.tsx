import type { CSSVars } from '@/components/motion/shared';
import { Icon } from '@/components/ui/Icon';
import {
  APPROVALS_HERO,
  CERTIFICATE_CATEGORY_LABEL,
  CERTIFICATES,
  type Certificate,
} from '@/content/certificates';
import { site } from '@/content/site';

import { GUILLOCHE_PATHS } from './guilloche';
import { pad } from '../works/wkShared';

const d = (ms: number): CSSVars => ({ '--d': `${ms}ms` });
const h = APPROVALS_HERO;

/** The left column: eyebrow, title, lead, buttons, stats and the issuers line (L4270-4295). */
function Copy() {
  return (
    <div className="wk-aph__copy">
      <span className="eyebrow wk-a" style={d(0)}>
        {h.eyebrow}
      </span>
      <h1 className="wk-aph__title" id="wk-ap-title">
        <span className="wk-ln wk-ln--a">
          <span className="wk-ln__in" style={d(90)}>
            {h.titleRowA}
          </span>
          <span className="wk-ln__rule" aria-hidden="true"></span>
          <span className="wk-ln__meta" aria-hidden="true">
            {h.titleMeta.from} <i>{'→'}</i> {h.titleMeta.to}
          </span>
        </span>
        <span className="wk-ln wk-ln--b">
          <span className="wk-ln__in" style={d(180)}>
            <span className="serif grad-text">{h.titleRowB}</span>
          </span>
        </span>
      </h1>
      <p className="lead wk-aph__lead wk-a" style={d(320)}>
        {h.lead}
      </p>
      <div className="wk-aph__ctas wk-a" style={d(400)}>
        <button
          type="button"
          className="btn btn--primary"
          data-wk-cue="wk-ap-toolbar"
          data-magnetic=""
        >
          <Icon name="i-award" aria-hidden="true" />
          {h.browseLabel}
        </button>
        <a className="btn btn--ghost wk-aph__cv" href={site.cvPath} download>
          <Icon name="i-download" aria-hidden="true" />
          {h.cvLabel}
        </a>
      </div>
      <dl className="wk-aph__stats">
        {h.stats.map((stat) => (
          <div className="wk-aph__stat wk-a" style={d(stat.delay)} key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              <span data-wk-to={stat.value}>{stat.value}</span>
              <i>{stat.suffix}</i>
            </dd>
          </div>
        ))}
      </dl>
      <div className="wk-aph__iss wk-a" style={d(680)}>
        <span className="wk-aph__stack" aria-hidden="true">
          {h.issuerChips.map((chip) => (
            <i className={chip.variant ? `wk-im wk-im--${chip.variant}` : 'wk-im'} key={chip.text}>
              {chip.text}
            </i>
          ))}
        </span>
        <p className="wk-aph__isst">
          {h.issuedBy.before} <b>{h.issuedBy.boldA}</b> {h.issuedBy.middle}{' '}
          <b>{h.issuedBy.boldB}</b>
        </p>
      </div>
    </div>
  );
}

/** The monogram of a card: <span class="wk-dk__mono[ --a][ --sm]"><b>A</b></span> (L8138). */
function Mono({ cert }: { cert: Certificate }) {
  const cls = [
    'wk-dk__mono',
    cert.issuer === 'Anthropic' ? 'wk-dk__mono--a' : '',
    cert.mono.length > 1 ? 'wk-dk__mono--sm' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={cls}>
      <b>{cert.mono}</b>
    </span>
  );
}

/** The wax seal on the top card (reference L8133-8137). */
function Seal() {
  return (
    <span className="wk-dk__seal" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path id="wk-seal-p" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <circle className="wk-seal__o" cx="60" cy="60" r="57" />
        <circle className="wk-seal__r" cx="60" cy="60" r="37" />
        <text className="wk-seal__txt">
          <textPath href="#wk-seal-p" textLength="280">
            {h.seal.ring}
          </textPath>
        </text>
        <circle className="wk-seal__in" cx="60" cy="60" r="31.5" />
        <svg className="wk-seal__g" x="29" y="29" width="62" height="62" viewBox="0 0 100 100">
          <use href="#wk-guil" />
        </svg>
        <path className="wk-seal__ck" d="M47.5 61 l8.5 8.5 l17 -18.5" />
      </svg>
    </span>
  );
}

/**
 * The deck: the guilloche symbol, then one button per certificate, newest first in DOM order
 * (data-j is the depth, N-1 for the newest, which ends on top). The script fans them (L8143-8161).
 */
function Deck() {
  const N = CERTIFICATES.length;
  return (
    <div className="wk-deck" id="wk-deck">
      <div className="wk-deck__stage">
        <div className="wk-deck__tilt" id="wk-deck-stage" role="group" aria-label={h.deckAriaLabel}>
          <svg
            className="wk-guil-defs"
            width="0"
            height="0"
            aria-hidden="true"
            focusable="false"
            style={{ position: 'absolute', overflow: 'hidden' }}
          >
            <defs>
              <symbol id="wk-guil" className="wk-guil" viewBox="-50 -50 100 100">
                {GUILLOCHE_PATHS.map((path, i) => (
                  <path vectorEffect="non-scaling-stroke" d={path} key={i} />
                ))}
              </symbol>
            </defs>
          </svg>
          {CERTIFICATES.map((c, ci) => {
            const top = ci === 0;
            return (
              <button
                type="button"
                className={`wk-dk wk-dk--${c.filterKey}${top ? ' wk-dk--top' : ''}`}
                data-ci={ci}
                data-j={N - 1 - ci}
                key={c.title}
              >
                <span className="wk-dk__paper" aria-hidden="true">
                  <span className="wk-dk__spine">
                    <Mono cert={c} />
                    <span className="wk-dk__iss">{c.issuer}</span>
                    <span className="wk-dk__cat">{CERTIFICATE_CATEGORY_LABEL[c.filterKey]}</span>
                    <span className="wk-dk__yr">{c.year}</span>
                  </span>
                  <span className="wk-dk__face">
                    <span className="wk-dk__g">
                      <svg viewBox="0 0 100 100">
                        <use href="#wk-guil" />
                      </svg>
                    </span>
                    <span className="wk-dk__head">
                      <Mono cert={c} />
                      <span className="wk-dk__who">{c.issuer}</span>
                      {top ? null : (
                        <span className="wk-dk__medal">
                          <Icon name="i-award" aria-hidden="true" />
                        </span>
                      )}
                    </span>
                    <span className="wk-dk__kind">
                      {c.type}
                      <span>
                        {h.deckCard.numberPrefix}
                        {pad(ci + 1)}
                      </span>
                    </span>
                    <span className="wk-dk__t">{c.title}</span>
                    <span className="wk-dk__to">
                      {h.deckCard.awardedTo}
                      <b>{h.deckCard.awardee}</b>
                    </span>
                    <span className="wk-dk__foot">
                      <span className="wk-dk__line wk-dk__line--sig">
                        <b>{c.issuer}</b>
                        <span>{h.deckCard.issuedBy}</span>
                      </span>
                      <span className="wk-dk__line wk-dk__line--yr">
                        <b>{c.year}</b>
                        <span>{h.deckCard.year}</span>
                      </span>
                      <span className="wk-dk__ok">
                        <Icon name="i-check-circle" aria-hidden="true" />
                        {h.deckCard.verified}
                      </span>
                    </span>
                  </span>
                </span>
                {top ? <Seal /> : null}
                <span className="sr-only">{h.deckCard.srLabel(c.title, c.issuer, c.year)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="wk-deck__cap">
        <span className="wk-deck__n">{h.caption.count}</span>
        <span>{h.caption.text}</span>
      </p>
    </div>
  );
}

/** header.wk-hero--ap: the copy column, the certificate deck and the scroll cue (L4269-4310). */
export function ApprovalsHero() {
  return (
    <header className="page-hero wk-hero wk-hero--ap" id="wk-ap-hero">
      <div className="wk-aph__bg" aria-hidden="true">
        <span className="wk-aph__halo"></span>
      </div>
      <div className="wrap wk-aph__wrap">
        <Copy />
        <Deck />
      </div>
      <div className="wk-aph__foot">
        <div className="wrap">
          <button type="button" className="wk-cue wk-a" style={d(760)} data-wk-cue="wk-ap-toolbar">
            <span className="wk-cue__c">
              <Icon name="i-arrow-right" aria-hidden="true" />
            </span>
            {h.cue}
          </button>
        </div>
      </div>
    </header>
  );
}
