import { Reveal, RevealGroup } from '@/components/motion';
import { Icon } from '@/components/ui/Icon';
import { services, servicesDefaultOpen, servicesHead } from '@/content/services';

import { SectionHead } from './SectionHead';

/**
 * div.ab-services (reference L3625-3730): the section head with the side index, and the four
 * accordion rows. The first row is open on load; initAbout handles the clicks (one open at a
 * time) and the scroll progress of each row.
 */
export function Services() {
  return (
    <div className="wrap ab-block ab-services">
      <div className="ab-services__grid">
        <div className="ab-services__aside">
          <SectionHead head={servicesHead} />
          <Reveal as="ol" className="ab-svc-index" aria-hidden="true">
            {services.map((s, i) => (
              <li data-i={i} key={s.num}>
                {s.indexLabel}
              </li>
            ))}
          </Reveal>
        </div>

        <RevealGroup className="ab-svc-list" stagger={90}>
          {services.map((s, i) => {
            const open = i === servicesDefaultOpen;
            const className = ['ab-svc', s.variant ? `ab-svc--${s.variant}` : '', open ? 'is-open' : '']
              .filter(Boolean)
              .join(' ');
            return (
              <Reveal as="article" className={className} data-spotlight="" key={s.num}>
                <h3 className="ab-svc__h">
                  <button
                    className="ab-svc__btn"
                    type="button"
                    aria-expanded={open ? 'true' : 'false'}
                    aria-controls={`ab-svc-p${i}`}
                    id={`ab-svc-b${i}`}
                  >
                    <span className="ab-svc__num" aria-hidden="true">
                      {s.num}
                    </span>
                    <span className="ab-svc__titles">
                      <span className="label">{s.kicker}</span>
                      <span className="ab-svc__title">{s.title}</span>
                    </span>
                    <span className="ab-svc__ico" aria-hidden="true">
                      <Icon name="i-plus" />
                    </span>
                  </button>
                </h3>
                <div
                  className="ab-svc__panel"
                  id={`ab-svc-p${i}`}
                  role="region"
                  aria-labelledby={`ab-svc-b${i}`}
                >
                  <div className="ab-svc__inner">
                    <div className="ab-svc__body">
                      <p className="ab-svc__desc">{s.description}</p>
                      <ul className="ab-feats">
                        {s.features.map((f) => (
                          <li key={f}>
                            <Icon name="i-check" aria-hidden="true" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="tags">
                        {s.tags.map((t, k) => (
                          <span className="tag" key={`${t}-${k}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </RevealGroup>
      </div>
    </div>
  );
}
