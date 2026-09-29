import { CountUp, Reveal, RevealGroup } from '@/components/motion';
import { TransitionLink } from '@/components/layout/TransitionLink';
import { Icon } from '@/components/ui/Icon';
import { pricingHead, pricingPlan, talkFirst } from '@/content/pricing';

import { SectionHead } from './SectionHead';

/** article.ab-plan: the hourly plan card with the $25 count up and its bordered light sweep. */
function Plan() {
  const plan = pricingPlan;
  return (
    <Reveal as="article" className="ab-plan" variant="scale">
      <div className="ab-plan__in" data-spotlight="">
        <div className="ab-plan__top">
          <div>
            <h3 className="ab-plan__name">{plan.name}</h3>
            <p className="ab-plan__kicker label">{plan.kicker}</p>
          </div>
          <span className="icon-tile">
            <Icon name={plan.icon} aria-hidden="true" />
          </span>
        </div>
        <p className="ab-plan__price">
          <span className="ab-plan__cur">{plan.currency}</span>
          <CountUp className="ab-plan__amt" to={plan.amount} duration={plan.countDurationMs} />
          <span className="ab-plan__per">{plan.per}</span>
        </p>
        <ul className="ab-plan__list">
          {plan.features.map((f) => (
            <li key={f}>
              <Icon name="i-check" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
        <TransitionLink
          className="btn btn--primary ab-plan__cta"
          href={plan.cta.href}
          data-magnetic={String(plan.cta.magnetic)}
        >
          {plan.cta.label} <Icon name={plan.cta.icon} aria-hidden="true" />
        </TransitionLink>
        <p className="ab-plan__foot">
          {plan.foot.text}
          <TransitionLink href={plan.foot.href}>{plan.foot.linkLabel}</TransitionLink>
        </p>
      </div>
    </Reveal>
  );
}

/** aside.ab-side "Talk first": two bookable sessions, the mini stats and the notes. */
function TalkFirst() {
  return (
    <RevealGroup as="aside" className="ab-side" aria-label={talkFirst.ariaLabel} stagger={90}>
      <Reveal className="ab-side__head">
        <span className="label">{talkFirst.label}</span>
        <p className="ab-side__title">{talkFirst.title}</p>
      </Reveal>
      {talkFirst.sessions.map((s) => (
        <Reveal
          as="button"
          type="button"
          className="card card--hover ab-sess"
          data-book={s.bookType}
          data-spotlight=""
          key={s.name}
        >
          <span className="ab-sess__time">
            <b>{s.minutes}</b>
            <span>{s.unit}</span>
          </span>
          <span className="ab-sess__txt">
            <strong>{s.name}</strong>
            <span>{s.description}</span>
          </span>
          <span className="ab-sess__price">
            {s.price}
            <span>{s.priceNote}</span>
          </span>
        </Reveal>
      ))}
      <Reveal className="card ab-side__card">
        <dl className="ab-mini">
          {talkFirst.mini.map((m) => (
            <div key={m.label}>
              <dt className="label">{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="ab-side__notes">
          {talkFirst.notes.map((n) => (
            <li key={n.text}>
              <Icon name={n.icon} aria-hidden="true" />
              {n.text}
            </li>
          ))}
        </ul>
      </Reveal>
    </RevealGroup>
  );
}

/** div.ab-price (reference L3792-3843): the section head, the plan card and the Talk first aside. */
export function Pricing() {
  return (
    <div className="wrap ab-block ab-price">
      <SectionHead head={pricingHead} className="sec-head sec-head--center" />
      <div className="ab-price__grid">
        <Plan />
        <TalkFirst />
      </div>
    </div>
  );
}
