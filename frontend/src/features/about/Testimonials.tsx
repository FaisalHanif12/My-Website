import { Reveal } from '@/components/motion';
import { Icon } from '@/components/ui/Icon';
import { testimonials, testimonialsHead, testimonialsUi } from '@/content/testimonials';

import { SectionHead } from './SectionHead';

/**
 * div.ab-tst (reference L3732-3790): the head with the previous/next controls and the counter, and
 * the carousel card with three slides and the dots. The first slide is active on load; the script
 * (initAbout) swaps slides, runs the swipe and keyboard handling and the 7s autoplay.
 */
export function Testimonials() {
  const ui = testimonialsUi;
  const count = testimonials.length;
  const controls = (
    <Reveal className="ab-tst__ctrl">
      <button className="ab-nav" type="button" data-tst="prev" aria-label={ui.prevLabel}>
        <Icon name="i-arrow-left" aria-hidden="true" />
      </button>
      <button className="ab-nav" type="button" data-tst="next" aria-label={ui.nextLabel}>
        <Icon name="i-arrow-right" aria-hidden="true" />
      </button>
      <span className="ab-tst__count label" aria-hidden="true">
        <b id="ab-tst-cur">01</b>
        {ui.counterTotal}
      </span>
    </Reveal>
  );
  return (
    <div className="wrap ab-block ab-tst">
      <div className="ab-tst__grid">
        <SectionHead head={testimonialsHead} className="sec-head ab-tst__head" extra={controls} />

        <Reveal
          className="ab-carousel card"
          id="ab-carousel"
          role="region"
          aria-roledescription={ui.carouselRole}
          aria-label={ui.carouselLabel}
          variant="scale"
        >
          <span className="ab-carousel__mark serif" aria-hidden="true" data-parallax="0.07">
            {ui.quoteMark}
          </span>
          <div className="ab-slides" id="ab-slides" aria-live="off">
            {testimonials.map((t, i) => (
              <figure
                className={i === 0 ? 'ab-slide is-active' : 'ab-slide'}
                role="group"
                aria-roledescription={ui.slideRole}
                aria-label={`${i + 1}${ui.slideLabelJoin}${count}`}
                aria-hidden={i === 0 ? undefined : 'true'}
                key={t.name}
              >
                <blockquote className="ab-quote">{t.quote}</blockquote>
                <figcaption className="ab-author">
                  <span className="ab-avatar" aria-hidden="true">
                    {t.initials}
                  </span>
                  <span className="ab-author__txt">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </span>
                </figcaption>
                <div className="tags">
                  {t.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </figure>
            ))}
          </div>
          <div className="ab-dots" role="group" aria-label={ui.dotsLabel}>
            {testimonials.map((t, i) => (
              <button
                type="button"
                className={i === 0 ? 'ab-dot is-active' : 'ab-dot'}
                aria-label={`${ui.dotLabelPrefix}${i + 1}`}
                aria-current={i === 0 ? 'true' : undefined}
                key={t.name}
              >
                <span>
                  <i></i>
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
