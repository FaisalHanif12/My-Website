import type { CSSVars } from '@/components/motion/shared';
import { Reveal } from '@/components/motion';
import { FadeImage } from '@/components/ui/FadeImage';
import { Icon, type IconName } from '@/components/ui/Icon';
import {
  CATEGORY_ICON,
  LATEST_TITLE_PARTS,
  PROJECT_FILTERS,
  PROJECT_GRID_COPY,
  PROJECTS,
  type Project,
} from '@/content/projects';
import { pad } from './wkShared';

import { countByKey, FilterBar } from './FilterBar';
import { layoutGrid, rowDelays, type Placement } from './gridLayout';

const copy = PROJECT_GRID_COPY;

/** The badge over the screenshot: Latest (PureBody), Featured (Echo AI) or Live (reference L7563-7565). */
function Badge({ badge }: { badge: Project['badge'] }) {
  if (badge === 'latest') {
    return (
      <span className="wk-badge wk-badge--latest">
        <span className="dot-live" aria-hidden="true"></span>
        {copy.card.badgeLatest}
      </span>
    );
  }
  if (badge === 'featured') {
    return (
      <span className="wk-badge wk-badge--feat">
        <Icon name="i-star" fill aria-hidden="true" />
        {copy.card.badgeFeatured}
      </span>
    );
  }
  return (
    <span className="wk-badge">
      <span className="wk-dot" aria-hidden="true"></span>
      {copy.card.badgeLive}
    </span>
  );
}

/** One project card (article.wk-card, reference template L7573-7596). */
function Card({ project: p, index, wide }: { project: Project; index: number; wide: boolean }) {
  const n = pad(index + 1);
  const dom = p.live
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/\.html$/, '');
  const [h, a, r] = [p.cover.hue, p.cover.angle, p.cover.ring];
  const cover = {
    '--h': h,
    '--a': `${a}deg`,
    '--rx': `${r[0]}%`,
    '--ry': `${r[1]}%`,
    '--rw': `${r[2]}%`,
  } as CSSVars;
  const iconId = `i-${CATEGORY_ICON[p.category] ?? 'code'}` as IconName;
  const cls = [
    'wk-card',
    'card',
    p.badge === 'featured' ? 'wk-card--feat' : '',
    wide ? 'wk-card--wide' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <article className={cls} data-tilt="3" data-spotlight="" aria-labelledby={`wk-p${n}`}>
      <div className="wk-media">
        <div className="wk-chrome" aria-hidden="true">
          <span className="wk-dots">
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span className="wk-url">
            <Icon name="i-lock" />
            {dom}
          </span>
        </div>
        <div className="wk-screen">
          <div className="wk-cover" style={cover} aria-hidden="true">
            <span className="wk-cover__cat">
              {n} · {p.category}
            </span>
            <span className="wk-cover__ico">
              <Icon name={iconId} />
            </span>
            <span className="wk-cover__ini">{p.initials}</span>
          </div>
          <FadeImage src={p.image} alt={copy.card.imageAlt(p.title)} width={1200} height={750} />
        </div>
        <Badge badge={p.badge} />
      </div>
      <div className="wk-body">
        <p className="wk-meta">
          <span className="wk-idx">{n}</span>
          <span className="wk-cat">{p.category}</span>
        </p>
        <h3 className="wk-title" id={`wk-p${n}`}>
          {p.badge === 'latest' ? (
            <>
              {LATEST_TITLE_PARTS[0]}
              <span className="serif">{LATEST_TITLE_PARTS[1]}</span>
            </>
          ) : (
            p.title
          )}
        </h3>
        <p className="wk-desc">{p.description}</p>
        <ul className="tags wk-tags" aria-label={copy.card.tagsAriaLabel}>
          {p.tags.map((tag) => (
            <li className="tag" key={tag}>
              {tag}
            </li>
          ))}
        </ul>
        <div className="wk-actions">
          {p.modal ? (
            <button type="button" className="wk-live" data-open={p.modal} aria-haspopup="dialog">
              {copy.card.livePreview}
              <Icon name="i-arrow-up-right" aria-hidden="true" />
              <span className="sr-only">{copy.card.liveModalSr(p.title)}</span>
            </button>
          ) : (
            <a className="wk-live" href={p.live} target="_blank" rel="noopener">
              {copy.card.livePreview}
              <Icon name="i-arrow-up-right" aria-hidden="true" />
              <span className="sr-only">{copy.card.liveLinkSr(p.title)}</span>
            </a>
          )}
          {p.source ? (
            <a className="wk-src" href={p.source} target="_blank" rel="noopener">
              <Icon name="i-github" aria-hidden="true" />
              {copy.card.source}
              <span className="sr-only">{copy.card.sourceSr(p.title)}</span>
            </a>
          ) : (
            <span className="wk-closed">
              <Icon name="i-lock" aria-hidden="true" />
              {copy.card.closedSource}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * The toolbar (filter and count) and the grid (reference L4232-4247). The cards are rendered in the
 * order and with the spans the script's first layout() gives (all projects visible), and with the
 * per row reveal delays (L7638), so the first paint already has the final layout.
 */
export function ProjectGrid() {
  const inputs = PROJECTS.map((p) => ({
    hero: p.badge === 'latest',
    feat: p.badge === 'featured',
  }));
  const { order, place } = layoutGrid(inputs);
  const placementOf: Placement[] = [];
  order.forEach((idx, k) => {
    placementOf[idx] = place[k];
  });
  const delays = rowDelays(PROJECTS.length, (i) => placementOf[i].span);
  const counts = countByKey(PROJECTS, (p) => p.filterKey);

  return (
    <div className="wrap wk-main">
      <Reveal className="wk-toolbar" id="wk-toolbar">
        <FilterBar
          id="wk-filter"
          ariaLabel={copy.filterAriaLabel}
          filters={PROJECT_FILTERS}
          counts={counts}
          countAriaLabel={copy.countChipAriaLabel}
        />
        <p className="wk-count" id="wk-count" aria-live="polite">
          {copy.countPrefix} <b>{PROJECTS.length}</b> {copy.countMiddle} {PROJECTS.length}
        </p>
      </Reveal>

      <div className="wk-gridwrap">
        <div className="wk-grid" id="wk-grid">
          {order.map((idx, k) => {
            const p = PROJECTS[idx];
            const pl = place[k];
            const cellClass = [
              'wk-cell',
              pl.wide ? 'is-wide' : '',
              pl.big ? 'is-big' : '',
              pl.p5 ? 'is-p5' : '',
              pl.odd ? 'is-odd' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <Reveal
                className={cellClass}
                data-k={p.filterKey}
                data-feat={p.badge === 'featured' ? '' : undefined}
                data-hero={p.badge === 'latest' ? '' : undefined}
                style={{ '--span': pl.span, '--d': `${delays[idx]}ms` } as CSSVars}
                eager
                key={p.title}
              >
                <Card project={p} index={idx} wide={pl.wide} />
              </Reveal>
            );
          })}
        </div>
        <div className="wk-empty" id="wk-empty" hidden>
          <Icon name="i-grid" aria-hidden="true" />
          <p className="wk-empty__t">{copy.empty.title}</p>
          <p className="wk-empty__d">{copy.empty.text}</p>
        </div>
      </div>
    </div>
  );
}
