import { Reveal, RevealGroup } from '@/components/motion';
import { Icon, type IconName } from '@/components/ui/Icon';
import { contactKicker, contactMethodCtaIcon, contactMethods, lahoreMap } from '@/content/contact';

import { ContactForm } from './ContactForm';
import { MapArt } from './MapArt';

/** The "05 Ways to reach me" kicker and the four-method ledger (reference L4398-4448). */
function Ledger() {
  return (
    <>
      <Reveal className="ct-kicker" id="ct-ways" variant="fade">
        <span className="eyebrow">
          <b>{contactKicker.number}</b> {contactKicker.text}
        </span>
        <span className="ct-kicker__line" aria-hidden="true"></span>
      </Reveal>

      <Reveal className="card ct-ledger" data-spotlight="">
        <RevealGroup className="ct-ledger__row" stagger={80} delay={80}>
          {contactMethods.map((m) => (
            <Reveal as="article" className="ct-method" variant="fade" key={m.no}>
              <div className="ct-method__top">
                <span className="icon-tile icon-tile--soft ct-method__ic">
                  <Icon name={m.icon as IconName} />
                </span>
                <span className="ct-method__no mono" aria-hidden="true">
                  {m.no}
                </span>
              </div>
              <h3 className="ct-method__t">{m.title}</h3>
              <p className="ct-method__d">{m.description}</p>
              {m.value.href ? (
                <a className="ct-method__v" href={m.value.href}>
                  {m.value.text}
                </a>
              ) : (
                <p className="ct-method__v">{m.value.text}</p>
              )}
              <p className="ct-method__n">
                <Icon name={m.note.icon as IconName} aria-hidden="true" />
                {m.note.text}
              </p>
              {m.cta.kind === 'book' ? (
                <button type="button" className="link-arrow ct-method__cta" data-book="">
                  {m.cta.label} <Icon name={contactMethodCtaIcon as IconName} aria-hidden="true" />
                </button>
              ) : (
                <a
                  className="link-arrow ct-method__cta"
                  href={m.cta.href}
                  {...(m.cta.external ? { target: '_blank', rel: 'noopener' } : {})}
                >
                  {m.cta.label} <Icon name={contactMethodCtaIcon as IconName} aria-hidden="true" />
                </a>
              )}
            </Reveal>
          ))}
        </RevealGroup>
      </Reveal>
    </>
  );
}

/** The map card: the generated art, the clock chip and the location panel (L4452-4489). */
function LahoreMap() {
  const m = lahoreMap;
  return (
    <aside className="ct-aside">
      <Reveal as="figure" className="card ct-map" variant="scale" aria-labelledby="ct-map-title">
        <MapArt />
        <div className="ct-map__top">
          <span className="ct-map__chip label">{m.chip}</span>
          <span className="ct-map__chip ct-map__time" aria-live="off">
            <span className="dot-live" aria-hidden="true"></span>
            <span className="sr-only">{m.timeSrLabel}</span>
            <span className="mono" id="ct-clock">
              {m.timePlaceholder}
            </span>
            <span className="ct-map__tz">{m.tz}</span>
          </span>
        </div>
        <figcaption className="ct-map__panel">
          <div>
            <span className="ct-map__title" id="ct-map-title">
              {m.title}
            </span>
            <span className="ct-map__coords mono">{m.coords}</span>
          </div>
          <a
            className="btn btn--ghost btn--sm ct-map__cta"
            href={m.cta.href}
            target="_blank"
            rel="noopener"
          >
            {m.cta.label} <Icon name={m.cta.icon as IconName} aria-hidden="true" />
          </a>
        </figcaption>
      </Reveal>
    </aside>
  );
}

/** div.ct-body: the ledger, then the map beside the form (reference L4397-4595). */
export function ContactBody() {
  return (
    <div className="wrap ct-body">
      <Ledger />
      <div className="ct-grid">
        <LahoreMap />
        <div className="ct-formcol">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
