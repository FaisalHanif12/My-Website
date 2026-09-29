import Image from 'next/image';

import type { CSSVars } from '@/components/motion/shared';
import { Icon } from '@/components/ui/Icon';
import { WORKS_HERO } from '@/content/projects';

/** A copy column entrance style: --d is the delay in ms of its CSS entrance (.wk-a). */
const d = (ms: number): CSSVars => ({ '--d': `${ms}ms` });

/** The left column: eyebrow, title, lead, buttons and stats (reference L4172-4193). */
function Copy() {
  const h = WORKS_HERO;
  return (
    <div className="wk-wh__copy">
      <span className="eyebrow wk-a" style={d(0)}>
        {h.eyebrow}
      </span>
      <h1 className="wk-wh__title" id="wk-title">
        <span className="wk-wl wk-wl--a">
          <span className="wk-wl__in" style={d(90)}>
            {h.titleRowA}
          </span>
          <span className="wk-wl__rule" aria-hidden="true"></span>
          <span className="wk-wl__meta" aria-hidden="true">
            {h.titleMeta.from} <i>{'→'}</i> {h.titleMeta.to}
          </span>
        </span>
        <span className="wk-wl wk-wl--b">
          <span className="wk-wl__in" style={d(180)}>
            <span className="serif grad-text">{h.titleRowB}</span>
          </span>
        </span>
      </h1>
      <p className="lead wk-wh__lead wk-a" style={d(320)}>
        {h.lead}
      </p>
      <div className="wk-wh__ctas wk-a" style={d(400)}>
        <button
          type="button"
          className="btn btn--primary"
          data-wk-cue="wk-toolbar"
          data-magnetic=""
        >
          <Icon name="i-grid" aria-hidden="true" />
          {h.browseLabel}
        </button>
        <button type="button" className="btn btn--ghost wk-wh__book" data-book="">
          <Icon name="i-calendar" aria-hidden="true" />
          {h.bookLabel}
        </button>
      </div>
      <dl className="wk-wh__stats">
        {h.stats.map((stat) => (
          <div className="wk-wh__stat wk-a" style={d(stat.delay)} key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              <span data-wk-to={stat.value}>{stat.value}</span>
              <i>{stat.suffix}</i>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The phone in the middle of the orbit (button.wk-phn, reference L4187-4204). */
function Phone() {
  const { phone } = WORKS_HERO;
  return (
    <button
      type="button"
      className="wk-phn"
      id="wk-phn"
      aria-label={phone.ariaLabel}
      aria-haspopup="dialog"
    >
      <span className="wk-phn__btn wk-phn__btn--act" aria-hidden="true"></span>
      <span className="wk-phn__btn wk-phn__btn--vu" aria-hidden="true"></span>
      <span className="wk-phn__btn wk-phn__btn--vd" aria-hidden="true"></span>
      <span className="wk-phn__btn wk-phn__btn--pw" aria-hidden="true"></span>
      <span className="wk-phn__bz">
        <span className="wk-phn__scr">
          {phone.screens.map((shot, i) => (
            <Image
              className={i === 0 ? 'wk-phn__img is-on' : 'wk-phn__img'}
              src={shot.src}
              alt=""
              width={shot.width}
              height={shot.height}
              draggable={false}
              loading="eager"
              priority={i === 0}
              unoptimized
              key={shot.src}
            />
          ))}
          <span className="wk-phn__sb" aria-hidden="true">
            <b>{phone.statusTime}</b>
            <span className="wk-phn__ic">
              <svg viewBox="0 0 18 12">
                <rect x="0" y="8" width="3" height="4" rx=".8" />
                <rect x="5" y="5.5" width="3" height="6.5" rx=".8" />
                <rect x="10" y="3" width="3" height="9" rx=".8" />
                <rect x="15" y="0" width="3" height="12" rx=".8" />
              </svg>
              <svg viewBox="0 0 16 12">
                <path d="M8 11.6 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 6.9a6.3 6.3 0 0 1 9 0l-1.4 1.5a4.3 4.3 0 0 0-6.2 0zM1.3 4.6a9.4 9.4 0 0 1 13.4 0l-1.4 1.5a7.4 7.4 0 0 0-10.6 0z" />
              </svg>
              <span className="wk-phn__bat">
                <i></i>
              </span>
            </span>
          </span>
          <span className="wk-phn__isl" aria-hidden="true"></span>
          <span className="wk-phn__glass" aria-hidden="true"></span>
        </span>
      </span>
    </button>
  );
}

/** The orbit: two SVG layers (drawn by the script), the phone, the pill and the six cards. */
function Orbit() {
  const { cards, pill, caption } = WORKS_HERO;
  return (
    <div className="wk-ob" id="wk-ob">
      <div
        className="wk-ob__stage"
        id="wk-ob-stage"
        role="group"
        aria-label={WORKS_HERO.stageAriaLabel}
      >
        <span className="wk-ob__glow" aria-hidden="true"></span>
        <svg
          className="wk-ob__svg wk-ob__svg--back"
          id="wk-ob-back"
          aria-hidden="true"
          focusable="false"
        ></svg>
        <div className="wk-ob__hub">
          <span className="wk-ob__floor" aria-hidden="true"></span>
          <Phone />
          <span className="wk-ob__pill" aria-hidden="true">
            <span className="dot-live"></span>
            <b>{pill.name}</b>
            <span>{pill.type}</span>
            <span>{pill.latest}</span>
            <span className="wk-ob__pg">
              <i className="is-on"></i>
              <i></i>
            </span>
          </span>
        </div>
        <svg
          className="wk-ob__svg wk-ob__svg--front"
          id="wk-ob-front"
          aria-hidden="true"
          focusable="false"
        ></svg>
        {cards.map((card) => (
          <button
            type="button"
            className={card.dark ? 'wk-oc wk-oc--dk' : 'wk-oc'}
            data-p={card.projectTitle}
            aria-label={card.ariaLabel}
            key={card.projectTitle}
          >
            <span className="wk-oc__win">
              <span className="wk-oc__bar" aria-hidden="true">
                <span className="wk-oc__dots">
                  <i></i>
                  <i></i>
                  <i></i>
                </span>
                <span className="wk-oc__url">{card.url}</span>
              </span>
              <span className="wk-oc__scr">
                <Image
                  src={card.image.src}
                  alt=""
                  width={card.image.width}
                  height={card.image.height}
                  draggable={false}
                  loading="eager"
                  unoptimized
                />
              </span>
              <span className="wk-oc__fog" aria-hidden="true"></span>
            </span>
            <span className="wk-oc__stem" aria-hidden="true"></span>
            <span className="wk-oc__node" aria-hidden="true"></span>
            <span className="wk-oc__lbl" aria-hidden="true">
              <b>{card.label.name}</b>
              <span>{card.label.type}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="wk-ob__cap">
        <span className="wk-ob__n">{caption.count}</span>
        <span>
          <span className="wk-ob__d">{caption.desktop}</span>
          <span className="wk-ob__m">{caption.phone}</span>
        </span>
      </p>
    </div>
  );
}

/** header.wk-hero--works: the copy column, the orbit and the scroll cue (reference L4167-4224). */
export function WorksHero() {
  return (
    <header className="page-hero wk-hero wk-hero--works" id="wk-hero">
      <div className="wk-wh__bg" aria-hidden="true">
        <span className="wk-wh__halo"></span>
      </div>
      <div className="wrap wk-wh__wrap">
        <Copy />
        <Orbit />
      </div>
      <div className="wk-wh__foot">
        <div className="wrap">
          <button type="button" className="wk-cue wk-a" style={d(760)} data-wk-cue="wk-toolbar">
            <span className="wk-cue__c">
              <Icon name="i-arrow-right" aria-hidden="true" />
            </span>
            {WORKS_HERO.cue}
          </button>
        </div>
      </div>
    </header>
  );
}
