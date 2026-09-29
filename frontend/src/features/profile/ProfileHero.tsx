import type { CSSVars } from '@/components/motion/shared';
import { Icon } from '@/components/ui/Icon';
import { profileDesk, profileHero } from '@/content/profile';
import { site } from '@/content/site';

const idx = (i: number): CSSVars => ({ '--i': i });

/** One résumé sheet arrow (span.pf-sh__go): the up-right icon at the top of every sheet. */
function Go() {
  return (
    <span className="pf-sh__go">
      <Icon name="i-arrow-up-right" aria-hidden="true" />
    </span>
  );
}

/** The left column: eyebrow, title, lead, buttons and the three stats (reference L3807-3834). */
function Copy() {
  const h = profileHero;
  return (
    <div className="pf-hero__copy">
      <span className="eyebrow pf-hi" style={idx(0)}>
        {h.eyebrow}
      </span>
      <h1 className="pf-hero__title" id="pf-title">
        <span className="pf-ln pf-ln--a">
          <span className="pf-ln__in" style={idx(1)}>
            {h.titleLineA}
          </span>
        </span>
        <span className="pf-ln pf-ln--b">
          <span className="pf-ln__in" style={idx(2)}>
            <span className="serif grad-text">{h.titleLineB}</span>
          </span>
        </span>
      </h1>
      <p className="lead pf-hero__lead pf-hi" style={idx(4)}>
        {h.lead}
      </p>
      <div className="pf-hero__ctas pf-hi" style={idx(5)}>
        <a className="btn btn--primary pf-cv" href={site.cvPath} download data-magnetic="">
          <Icon name={h.cvCta.icon as 'i-download'} aria-hidden="true" />
          {h.cvCta.label}
        </a>
        <a className="btn btn--ghost pf-goexp" href={h.experienceCta.href}>
          <Icon name={h.experienceCta.icon as 'i-briefcase'} aria-hidden="true" />
          {h.experienceCta.label}
        </a>
      </div>
      <dl className="pf-hstats">
        {h.stats.map((stat, k) => (
          <div className="pf-hstat pf-hi" style={idx(6 + k)} key={stat.label}>
            <dt className="pf-hstat__label">{stat.label}</dt>
            {stat.kind === 'count' ? (
              <dd className="pf-hstat__val">
                <span className="pf-count" data-to={stat.to}>
                  {stat.to}
                </span>
                <span className="pf-hstat__suf">{stat.suffix}</span>
              </dd>
            ) : (
              <dd className="pf-hstat__val">
                {stat.text}
                <span className="serif grad-text pf-hstat__se">{stat.serifText}</span>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The résumé desk: education, experience and expertise sheets and the seal (L3836-3931). */
function Desk() {
  const { education: edu, experience: exp, expertise: skl, seal, hint } = profileDesk;
  return (
    <div className="pf-desk" role="group" aria-label={profileDesk.ariaLabel}>
      <div className="pf-desk__stage">
        <div className="pf-desk__tilt">
          <a className="pf-sheet pf-sheet--edu" href={edu.href} aria-label={edu.ariaLabel}>
            <span className="pf-sheet__float">
              <span className="pf-sheet__in">
                <span className="pf-sheet__body">
                  <span className="pf-sh__top">
                    <span className="pf-sh__ic">
                      <Icon name={edu.icon as 'i-grad'} aria-hidden="true" />
                    </span>
                    <span className="pf-sh__no">
                      {edu.number} <i>/</i> {edu.label}
                    </span>
                    <Go />
                  </span>
                  <span className="pf-ed__big serif">{edu.big}</span>
                  <span className="pf-ed__t">{edu.title}</span>
                  <span className="pf-ed__u">{edu.university}</span>
                  <span className="pf-ed__y">{edu.years}</span>
                  <span className="pf-ed__list">
                    {edu.rows.map((row) => (
                      <span className="pf-ed__row" key={row.level}>
                        <span>
                          {row.level} <em>{row.subject}</em>
                        </span>
                        <span>{row.years}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </span>
          </a>

          <a className="pf-sheet pf-sheet--exp" href={exp.href} aria-label={exp.ariaLabel}>
            <span className="pf-sheet__float">
              <span className="pf-sheet__in">
                <span className="pf-sheet__body">
                  <span className="pf-sh__top">
                    <span className="pf-sh__mono">{exp.mono}</span>
                    <span className="pf-sh__cv">
                      <span className="serif">{exp.cvTitle}</span>
                      <span className="pf-sh__who">{exp.who}</span>
                    </span>
                    <Go />
                  </span>
                  <span className="pf-sh__head">
                    <span className="pf-sh__no">
                      {exp.number} <i>/</i> {exp.label}
                    </span>
                    <span className="pf-sh__range">
                      {exp.rangeFrom} <i>{'→'}</i> {exp.rangeTo}
                    </span>
                  </span>
                  <span className="pf-xp">
                    {exp.rows.map((row, k) => (
                      <span
                        className={row.current ? 'pf-xp__row is-cur' : 'pf-xp__row'}
                        style={{ '--a': row.barStart, '--b': row.barEnd, '--k': k } as CSSVars}
                        key={`${row.year}-${row.company}`}
                      >
                        <span className="pf-xp__yr">{row.year}</span>
                        <span className="pf-xp__t">
                          <b>{row.title}</b>
                          <span>{row.company}</span>
                        </span>
                        {row.current ? (
                          <span className="pf-xp__now">
                            <span className="dot-live"></span>
                            {exp.currentLabel}
                          </span>
                        ) : null}
                        <span className="pf-xp__bar">
                          <i></i>
                        </span>
                      </span>
                    ))}
                  </span>
                  <span className="pf-xp__axis">
                    {exp.axis.map((year) => (
                      <span key={year}>{year}</span>
                    ))}
                  </span>
                </span>
              </span>
            </span>
          </a>

          <a className="pf-sheet pf-sheet--skl" href={skl.href} aria-label={skl.ariaLabel}>
            <span className="pf-sheet__float">
              <span className="pf-sheet__in">
                <span className="pf-sheet__body">
                  <span className="pf-sh__top">
                    <span className="pf-sh__no">
                      {skl.number} <i>/</i> {skl.label}
                    </span>
                    <Go />
                  </span>
                  <span className="pf-mr">
                    {skl.rings.map((ring, k) => (
                      <span
                        className="pf-mr__i"
                        data-v={ring.value}
                        style={{ '--k': k } as CSSVars}
                        key={ring.label}
                      >
                        <span className="pf-mr__ring">
                          <svg viewBox="0 0 60 60" aria-hidden="true">
                            <circle
                              className="pf-mr__trk"
                              cx="30"
                              cy="30"
                              r="25"
                              pathLength="100"
                            />
                            <circle
                              className="pf-mr__bar"
                              cx="30"
                              cy="30"
                              r="25"
                              pathLength="100"
                              transform="rotate(-90 30 30)"
                              style={{ '--v': ring.value } as CSSVars}
                            />
                          </svg>
                          <b className="pf-mr__n">{ring.value}</b>
                        </span>
                        <span className="pf-mr__l">{ring.label}</span>
                      </span>
                    ))}
                  </span>
                  <span className="pf-sk__foot">
                    <span className="pf-sk__chip">
                      <Icon name={skl.chip.icon as 'i-sparkles'} aria-hidden="true" />
                      {skl.chip.label}
                    </span>
                    <span className="pf-sk__more">{skl.more}</span>
                  </span>
                </span>
              </span>
            </span>
          </a>

          <span className="pf-seal" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="pf-seal-p" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
              </defs>
              <circle className="pf-seal__o" cx="60" cy="60" r="57" />
              <circle className="pf-seal__i" cx="60" cy="60" r="34" />
              <text className="pf-seal__txt">
                <textPath href="#pf-seal-p" textLength="280">
                  {seal.ringText}
                </textPath>
              </text>
              <text className="pf-seal__fh" x="60" y="68" textAnchor="middle">
                {seal.mark}
              </text>
            </svg>
          </span>
        </div>
      </div>
      <p className="pf-desk__hint">
        <span className="pf-desk__n">{hint.count}</span>
        {hint.text}
      </p>
    </div>
  );
}

/** header.pf-hero: the résumé as an object (reference L3807-3944). */
export function ProfileHero() {
  return (
    <header className="page-hero pf-hero" id="pf-hero">
      <div className="pf-hero__bg" aria-hidden="true">
        <span className="pf-hero__halo"></span>
      </div>
      <div className="wrap pf-hero__wrap">
        <Copy />
        <Desk />
      </div>
      <div className="pf-hero__foot">
        <div className="wrap">
          <a className="pf-cue pf-hi" style={idx(9)} href={profileHero.cue.href}>
            <span className="pf-cue__ring" aria-hidden="true">
              <Icon name="i-arrow-right" />
            </span>
            <span className="label">{profileHero.cue.label}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
