import type { CSSVars } from '@/components/motion/shared';
import { SplitWords } from '@/components/motion';
import { Icon, type IconName } from '@/components/ui/Icon';
import { clockCard, contactHero } from '@/content/contact';

const i = (n: number): CSSVars => ({ '--i': n });
const h = contactHero;

/** An icon of the Contact page sprite (ct-i-*), which the shell Icon type does not cover. */
function PageIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className ? `i ${className}` : 'i'} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

/** The left column: the title, lead, buttons, email pill and the three stats (reference L4351-4377). */
function Copy() {
  return (
    <div className="ct-hero__l" id="ct-hero-l">
      <SplitWords
        as="h2"
        className="hero-title ct-title"
        id="ct-title"
        observe={false}
        base={170}
        step={130}
      >
        <span className="ct-title__a">{h.title.a}</span>
        <br />
        <span className="serif grad-text">{h.title.b}</span>
      </SplitWords>
      <p className="lead ct-hero__lead ct-in" style={i(5)}>
        {h.lead}
      </p>
      <div className="ct-hero__acts">
        <a
          className="btn btn--primary ct-hact ct-in"
          style={i(6)}
          href={h.primaryCta.href}
          data-magnetic={String(h.primaryCta.magnetic)}
        >
          {h.primaryCta.label}
          <span className="ct-hact__ic" aria-hidden="true">
            <PageIcon id={h.primaryCta.icon} />
          </span>
        </a>
        <button type="button" className="btn btn--ghost ct-hact ct-in" style={i(7)} data-book="">
          <Icon name={h.bookCta.icon as IconName} aria-hidden="true" />
          {h.bookCta.label}
        </button>
        <div className="ct-mail ct-in" style={i(8)}>
          <a className="ct-mail__a" href={h.emailPill.href} title={h.emailPill.title}>
            <Icon name={h.emailPill.icon as IconName} aria-hidden="true" />
            <span>{h.emailPill.label}</span>
          </a>
          <button
            type="button"
            className="ct-mail__copy"
            id="ct-copy"
            data-copy={h.emailPill.copyValue}
            aria-label={h.emailPill.copyAriaLabel}
          >
            <PageIcon id="ct-i-copy" className="ct-mail__ic1" />
            <Icon name="i-check" className="ct-mail__ic2" aria-hidden="true" />
            <span className="ct-mail__tip" aria-hidden="true">
              {h.emailPill.tip}
            </span>
          </button>
        </div>
      </div>
      <dl className="ct-stats ct-hero__stats">
        {h.stats.map((stat, k) => (
          <div className="ct-stat ct-in" style={i(9 + k)} key={stat.label}>
            <dt>{stat.label}</dt>
            <dd className="stat-num">
              <span data-ct-count={stat.to} data-suffix={stat.suffix}>
                {stat.to}
                {stat.suffix}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The right column: the live globe and dial (drawn by the script) and the clock card. */
function Orb() {
  const d = clockCard.defaults;
  return (
    <div className="ct-hero__r" id="ct-hero-r">
      <figure className="ct-orb" id="ct-orb">
        <svg
          className="ct-orb__svg"
          id="ct-orb-svg"
          viewBox="0 0 500 500"
          aria-hidden="true"
          focusable="false"
        ></svg>
        <figcaption className="ct-clock ct-in" style={i(9)} id="ct-clock-card">
          <span className="sr-only" id="ct-orb-sr"></span>
          <div className="ct-clock__status" aria-hidden="true">
            <span className="ct-clock__dot"></span>
            <span id="ct-h-status">{d.status}</span>
          </div>
          <div className="ct-clock__row ct-clock__row--main" aria-hidden="true">
            <span className="ct-clock__k">
              {clockCard.lahoreKey} <em>{clockCard.lahoreTz}</em>
            </span>
            <span className="ct-clock__v mono" id="ct-h-lhr">
              {d.lahore}
            </span>
          </div>
          <div className="ct-clock__row" aria-hidden="true">
            <span className="ct-clock__k">
              {clockCard.youKey} <em id="ct-h-city">{d.city}</em>
            </span>
            <span className="ct-clock__v mono" id="ct-h-you">
              {d.you}
            </span>
          </div>
          <p className="ct-clock__diff" aria-hidden="true">
            <Icon name="i-globe" aria-hidden="true" />
            <span id="ct-h-diff">{d.diff}</span>
          </p>
          <p className="ct-clock__hrs" aria-hidden="true">
            <span>{clockCard.hoursKey}</span>
            <b className="mono" id="ct-h-hrs">
              {d.hours}
            </b>
          </p>
        </figcaption>
      </figure>
    </div>
  );
}

/** header.ct-hero: the pill bar, the copy, the globe and the scroll cue (reference L4341-4396). */
export function ContactHero() {
  return (
    <header className="page-hero ct-hero" id="ct-hero">
      <div className="wrap ct-hero__wrap">
        <div className="ct-hero__bar ct-in" style={i(0)}>
          <div className="ct-hero__meta">
            <span className="pill ct-hero__pill">
              <span className="dot-live" aria-hidden="true"></span>
              {h.pill}
            </span>
          </div>
        </div>

        <div className="ct-hero__grid">
          <Copy />
          <Orb />
        </div>

        <a className="ct-cue ct-in" style={i(12)} href={h.cue.href}>
          <span className="ct-cue__c" aria-hidden="true">
            <PageIcon id={h.cue.icon} />
          </span>
          <span className="label">{h.cue.label}</span>
        </a>
      </div>
    </header>
  );
}
