import { Reveal, RevealGroup } from '@/components/motion';
import { Icon } from '@/components/ui/Icon';
import { knowMe, knowMeHead } from '@/content/about';

import { SectionHead } from './SectionHead';

/** div#ab-know: the "Get to Know Me" bento with email, phone, live Lahore clock and availability. */
export function KnowMe() {
  const { email, phone, location, availability } = knowMe;
  return (
    <div className="wrap ab-block" id="ab-know">
      <SectionHead head={knowMeHead} className="sec-head ab-head-split" />

      <RevealGroup className="ab-bento" stagger={90}>
        <Reveal as="article" className="card ab-kc ab-kc--email" data-spotlight="" data-tilt="2.5">
          <div className="ab-kc__top">
            <span className="icon-tile icon-tile--soft">
              <Icon name={email.icon} aria-hidden="true" />
            </span>
            <span className="label">{email.label}</span>
          </div>
          <p className="ab-kc__value ab-kc__value--email">
            {email.valueLocal}
            <wbr />
            {email.valueDomain}
          </p>
          <div className="ab-kc__actions">
            <a className="ab-act" href={email.action.href}>
              {email.action.label} <Icon name={email.action.icon} aria-hidden="true" />
            </a>
            <button
              className="ab-copy"
              type="button"
              data-copy={email.copy.value}
              aria-label={email.copy.ariaLabel}
            >
              <Icon name={email.copy.icon} aria-hidden="true" />
              <span>{email.copy.label}</span>
            </button>
          </div>
        </Reveal>

        <Reveal as="article" className="card ab-kc ab-kc--phone" data-spotlight="" data-tilt="2.5">
          <div className="ab-kc__top">
            <span className="icon-tile icon-tile--soft">
              <Icon name={phone.icon} aria-hidden="true" />
            </span>
            <span className="label">{phone.label}</span>
          </div>
          <p className="ab-kc__value">{phone.value}</p>
          <div className="ab-kc__actions">
            <a className="ab-act" href={phone.action.href}>
              {phone.action.label} <Icon name={phone.action.icon} aria-hidden="true" />
            </a>
          </div>
        </Reveal>

        <Reveal as="article" className="card ab-kc ab-kc--loc" data-spotlight="" data-tilt="2.5">
          <div className="ab-kc__top">
            <span className="icon-tile icon-tile--soft">
              <Icon name={location.icon} aria-hidden="true" />
            </span>
            <span className="label">{location.label}</span>
          </div>
          <p className="ab-kc__value">{location.value}</p>
          <div className="ab-clock">
            <div className="ab-clock__row">
              <span className="ab-clock__time" id="ab-time" aria-live="off">
                {location.initialTime}
              </span>
              <span className="ab-clock__zone">
                <span className="label">{location.zoneLabel}</span>
                <span className="ab-clock__state" id="ab-state">
                  {location.initialState}
                </span>
              </span>
            </div>
            <div className="ab-day" aria-hidden="true">
              <span className="ab-day__work"></span>
              <span className="ab-day__now" id="ab-daynow"></span>
            </div>
            <div className="ab-day__ticks label" aria-hidden="true">
              {location.ticks.map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal as="article" className="ab-kc ab-kc--avail" data-tilt="2.5">
          <div className="ab-kc__top">
            <span className="ab-kc__tile">
              <Icon name={availability.icon} aria-hidden="true" />
            </span>
            <span className="label">{availability.label}</span>
          </div>
          <p className="ab-kc__value ab-kc__value--xl">
            <span className="ab-live" aria-hidden="true"></span>
            <span>
              {availability.valueText} <span className="serif">{availability.valueSerif}</span>
            </span>
          </p>
          <div className="ab-kc__actions">
            <button
              className="btn ab-btn-light"
              type="button"
              data-book={availability.book.bookType}
            >
              <Icon name={availability.book.icon} aria-hidden="true" />
              {availability.book.label}
            </button>
          </div>
          <svg
            className="ab-kc__orbit"
            data-parallax="-0.08"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <circle cx="100" cy="100" r="98" />
            <circle cx="100" cy="100" r="70" />
            <circle cx="100" cy="100" r="42" />
          </svg>
        </Reveal>
      </RevealGroup>
    </div>
  );
}
