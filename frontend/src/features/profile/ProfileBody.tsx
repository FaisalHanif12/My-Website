import { Reveal, RevealGroup, SplitWords } from '@/components/motion';
import { Icon } from '@/components/ui/Icon';
import { education } from '@/content/education';
import { experience, experienceYearBox } from '@/content/experience';
import { profileBlockHeads, type BlockHead } from '@/content/profile';
import { coreExpertiseCard, languagesCard, skillTabs, skillTabsLabel } from '@/content/skills';

/** The index label, split title and sub line of a block (div.pf-bhead, reference L3959-3964). */
function BlockTitle({ head, as = 'h3' }: { head: BlockHead; as?: 'h3' }) {
  return (
    <>
      <Reveal as="span" className="label pf-bhead__idx" variant="fade">
        {head.index}
      </Reveal>
      <SplitWords as={as} className="pf-bhead__title" id={head.titleId}>
        {head.title} <span className="serif grad-text">{head.titleAccent}</span>
      </SplitWords>
    </>
  );
}

/** The sticky head and the big year of the experience block, then the scroll-drawn timeline. */
function Experience() {
  const head = profileBlockHeads.experience;
  const first = experience[0];
  return (
    <div className="pf-block pf-exp" id="pf-exp" aria-labelledby={head.titleId} role="region">
      <div className="pf-exp__aside">
        <div className="pf-exp__sticky">
          <div className="pf-bhead">
            <BlockTitle head={head} />
            <Reveal as="p" className="pf-bhead__sub" delay={150}>
              {head.sub}
            </Reveal>
          </div>
          <Reveal className="pf-year" aria-hidden="true" variant="fade" delay={250}>
            <div className="pf-year__line pf-year__line--from">
              <span className="pf-year__txt is-cur">{first.from}</span>
            </div>
            <div className="pf-year__line pf-year__line--to">
              <span className="pf-year__txt is-cur">{first.to}</span>
            </div>
            <div className="pf-year__meta">
              <span className="pf-year__count">
                <b className="pf-year__n">{first.number}</b> / {experienceYearBox.total}
              </span>
              <span className="pf-year__role">{first.yearBoxRole}</span>
            </div>
            <div className="pf-year__ticks">
              {experience.map((role, i) => (
                <i className={i === 0 ? 'is-on' : undefined} key={role.id}></i>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="pf-tl">
        <div className="pf-tl__track" aria-hidden="true">
          <span className="pf-tl__fill"></span>
        </div>
        <ol className="pf-tl__list" role="list">
          {experience.map((role) => (
            <li
              className="pf-role"
              id={role.id}
              data-from={role.from}
              data-to={role.to}
              data-role={role.yearBoxRole}
              key={role.id}
            >
              <span className="pf-link" aria-hidden="true"></span>
              <span className="pf-node" aria-hidden="true">
                <span>{role.number}</span>
              </span>
              <Reveal as="article" className="card pf-role__card" data-spotlight="" variant="left">
                <div className="pf-role__top">
                  {role.status === 'current' ? (
                    <span className="pf-badge pf-badge--live">
                      <span className="dot-live" aria-hidden="true"></span>
                      {role.statusLabel}
                    </span>
                  ) : role.status === 'closed' ? (
                    <span className="pf-badge pf-badge--closed">
                      <span className="pf-badge__dot" aria-hidden="true"></span>
                      {role.statusLabel}
                    </span>
                  ) : null}
                  <span className="pf-role__date">
                    <Icon name="i-calendar" aria-hidden="true" />
                    {role.dateLabel}
                  </span>
                </div>
                <h4 className="pf-role__title">{role.title}</h4>
                <p className="pf-role__co">
                  <span className="pf-co-ic" aria-hidden="true">
                    <Icon name={role.companyIcon as 'i-code'} />
                  </span>
                  {role.company}
                </p>
                <p className="pf-role__desc">{role.description}</p>
                <ul className="tags pf-tags" role="list">
                  {role.tags.map((tag) => (
                    <li className="tag" key={tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** The featured degree and the two smaller schools (reference L4053-4092). */
function Education() {
  const head = profileBlockHeads.education;
  return (
    <div className="pf-block pf-edu-block" aria-labelledby={head.titleId} role="region">
      <div className="pf-bhead pf-bhead--row">
        <div>
          <BlockTitle head={head} />
        </div>
        <Reveal as="p" className="pf-bhead__sub" delay={150}>
          {head.sub}
        </Reveal>
      </div>

      <div className="pf-edu-grid">
        {education.map((e) =>
          e.variant === 'featured' ? (
            <Reveal
              as="article"
              className="card pf-edu pf-edu--feat"
              id={e.id}
              data-spotlight=""
              variant="fade"
              key={e.id}
            >
              <span className="pf-edu__sheen" aria-hidden="true"></span>
              <span className="pf-edu__mark" aria-hidden="true">
                {e.watermark}
              </span>
              <div className="pf-edu__top">
                <span className="pf-edu__ic" aria-hidden="true">
                  <Icon name={e.icon as 'i-grad'} />
                </span>
                <span className="pf-badge pf-badge--onbrand">{e.badge}</span>
              </div>
              <p className="pf-edu__yrs pf-edu__yrs--big">{e.years}</p>
              <h4 className="pf-edu__title">
                {e.title} <span className="serif">{e.titleSerif}</span>
              </h4>
              <p className="pf-edu__inst">
                <Icon name={e.institutionIcon as 'i-building'} aria-hidden="true" />
                <span>{e.institution}</span>
              </p>
              <p className="pf-edu__desc">{e.description}</p>
              <ul className="tags pf-tags" role="list">
                {e.tags.map((tag) => (
                  <li className="tag" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : (
            <Reveal
              as="article"
              className="card card--hover pf-edu pf-edu--sm"
              id={e.id}
              data-spotlight=""
              delay={e.revealDelay}
              key={e.id}
            >
              <div className="pf-edu__top">
                <span className="pf-badge">{e.badge}</span>
                <span className="pf-edu__yrs">{e.years}</span>
              </div>
              <h4 className="pf-edu__title">
                {e.title} <span className="serif">{e.titleSerif}</span>
              </h4>
              <p className="pf-edu__inst">
                <Icon name={e.institutionIcon as 'i-pin'} aria-hidden="true" />
                <span>{e.institution}</span>
              </p>
              <p className="pf-edu__desc">{e.description}</p>
              <ul className="tags pf-tags" role="list">
                {e.tags.map((tag) => (
                  <li className="tag" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            </Reveal>
          ),
        )}
      </div>
    </div>
  );
}

/** The skill tabs with progress rings, the languages card and the core expertise chips. */
function Tech() {
  const head = profileBlockHeads.tech;
  return (
    <div className="pf-block pf-tech" aria-labelledby={head.titleId} role="region">
      <div className="pf-bhead pf-bhead--row">
        <div>
          <BlockTitle head={head} />
        </div>
        <Reveal as="p" className="pf-bhead__sub" delay={150}>
          {head.sub}
        </Reveal>
      </div>

      <div className="pf-tech-grid">
        <Reveal className="card pf-skills" id="pf-skills">
          <div className="pf-tabs" role="tablist" aria-label={skillTabsLabel}>
            <span className="pf-tabs__ind" aria-hidden="true"></span>
            {skillTabs.map((tab, i) => (
              <button
                className="pf-tab"
                role="tab"
                id={tab.tabId}
                aria-controls={tab.panelId}
                aria-selected={i === 0 ? 'true' : 'false'}
                tabIndex={i === 0 ? 0 : -1}
                key={tab.tabId}
              >
                <Icon name={tab.icon as 'i-code'} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="pf-panels">
            {skillTabs.map((tab, i) => (
              <div
                className={i === 0 ? 'pf-panel is-active' : 'pf-panel'}
                role="tabpanel"
                id={tab.panelId}
                aria-labelledby={tab.tabId}
                tabIndex={0}
                key={tab.panelId}
              >
                <ul className="pf-rings" role="list">
                  {tab.skills.map((skill) => (
                    <li className="pf-skill" data-v={skill.value} key={skill.name}>
                      <span className="pf-ring">
                        <svg viewBox="0 0 120 120" aria-hidden="true">
                          <circle
                            className="pf-ring__track"
                            cx="60"
                            cy="60"
                            r="52"
                            pathLength="100"
                          />
                          <circle
                            className="pf-ring__bar"
                            cx="60"
                            cy="60"
                            r="52"
                            pathLength="100"
                            transform="rotate(-90 60 60)"
                          />
                        </svg>
                        <span className="pf-ring__num" aria-hidden="true">
                          0%
                        </span>
                      </span>
                      <span className="pf-skill__name">
                        {skill.name}
                        <span className="sr-only">: {skill.value}%</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="article" className="card pf-lang" delay={120}>
          <div className="pf-card-head">
            <span className="icon-tile icon-tile--soft" aria-hidden="true">
              <Icon name={languagesCard.icon as 'i-globe'} />
            </span>
            <h4 className="pf-card-head__title">{languagesCard.title}</h4>
          </div>
          <ul className="pf-lang__list" role="list">
            {languagesCard.items.map((item) => (
              <li className="pf-lang__row" key={item.name}>
                <span className="pf-lang__mono" aria-hidden="true">
                  {item.mono}
                </span>
                <span className="pf-lang__name">{item.name}</span>
                <span
                  className={item.native ? 'pf-lang__lvl pf-lang__lvl--native' : 'pf-lang__lvl'}
                >
                  {item.level}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="article" className="card pf-core" delay={80}>
          <div className="pf-card-head">
            <span className="icon-tile icon-tile--soft" aria-hidden="true">
              <Icon name={coreExpertiseCard.icon as 'i-zap'} />
            </span>
            <h4 className="pf-card-head__title">{coreExpertiseCard.title}</h4>
          </div>
          <RevealGroup as="ul" className="pf-chips" role="list" stagger={45}>
            {coreExpertiseCard.chips.map((chip) => (
              <Reveal as="li" className="pf-chipw" key={chip.label}>
                <span className="pf-chip">
                  <Icon name={chip.icon as 'i-sparkles'} aria-hidden="true" />
                  {chip.label}
                </span>
              </Reveal>
            ))}
          </RevealGroup>
        </Reveal>
      </div>
    </div>
  );
}

/** div.pf-body: the gradient defs for the rings, then the three blocks (reference L3947-4162). */
export function ProfileBody() {
  return (
    <div className="wrap pf-body">
      <svg className="pf-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pf-ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop className="pf-stop-a" offset="0" />
            <stop className="pf-stop-b" offset="1" />
          </linearGradient>
        </defs>
      </svg>
      <Experience />
      <Education />
      <Tech />
    </div>
  );
}
