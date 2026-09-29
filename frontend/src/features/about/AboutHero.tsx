import type { CSSVars } from '@/components/motion/shared';
import { Icon } from '@/components/ui/Icon';
import {
  aboutHero,
  heroRoles,
  heroRolesSrOnly,
  heroStats,
  orbitBadges,
  orbitDots,
  orbitRingText,
  orbitRings,
} from '@/content/about';
import { socials, socialsAriaLabel } from '@/content/socials';

import { PortraitImage } from './PortraitImage';

/** The About page only sprite: the tech badge icons (reference L3352-3362). */
function AboutSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="ab-ic-react" viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="10" ry="3.9" />
          <ellipse cx="12" cy="12" rx="10" ry="3.9" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="3.9" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="ab-ic-next" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M9 16.2V7.8l7.4 10.1M15.2 7.8v5.2" />
        </symbol>
        <symbol id="ab-ic-node" viewBox="0 0 24 24">
          <path d="M12 2.6l8.1 4.7v9.4L12 21.4l-8.1-4.7V7.3z" />
          <path
            d="M12 8.2l3.3 1.9v3.8L12 15.8l-3.3-1.9v-3.8z"
            fill="currentColor"
            stroke="none"
            opacity=".35"
          />
        </symbol>
        <symbol id="ab-ic-openai" viewBox="0 0 24 24">
          <g>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <path
                key={deg}
                d="M12 3.6a4.2 4.2 0 0 1 7 2.6"
                transform={deg ? `rotate(${deg} 12 12)` : undefined}
              />
            ))}
          </g>
        </symbol>
        <symbol id="ab-ic-claude" viewBox="0 0 24 24">
          <path d="M12 2.8v5.4M12 15.8v5.4M2.8 12h5.4M15.8 12h5.4M5.5 5.5l3.8 3.8M14.7 14.7l3.8 3.8M18.5 5.5l-3.8 3.8M9.3 14.7l-3.8 3.8" />
        </symbol>
        <symbol id="ab-ic-aws" viewBox="0 0 24 24">
          <text
            x="12"
            y="12.2"
            textAnchor="middle"
            style={{ fontFamily: 'var(--font-sans)' }}
            fontSize="8.6"
            fontWeight="800"
            letterSpacing="-.3"
            fill="currentColor"
            stroke="none"
          >
            aws
          </text>
          <path d="M4 15.6c4.8 2.9 11.2 2.9 16 0" />
          <path d="M17.6 14.4l2.6 1.2-.9 2.6" />
        </symbol>
        <symbol id="ab-ic-mongo" viewBox="0 0 24 24">
          <path d="M12 2.4c3.6 3.9 5.6 7.6 5.6 11.1 0 3.8-2.7 6.3-5.6 7.6-2.9-1.3-5.6-3.8-5.6-7.6 0-3.5 2-7.2 5.6-11.1z" />
          <path d="M12 6.5v15.2" />
        </symbol>
      </defs>
    </svg>
  );
}

/** h1.ab-name: the name in letters with a mask rise, "Hanif" in serif ink with the SVG flourish. */
function Name() {
  const { name } = aboutHero;
  return (
    <h1 className="ab-name" id="ab-name">
      <span className="sr-only">{name.srOnly}</span>
      <span className="ab-name__first" id="ab-first" aria-hidden="true">
        <span className="ab-name__mask">
          {Array.from(name.first).map((letter, k) => (
            <span className="ab-lt" style={{ '--k': k } as CSSVars} key={k}>
              {letter}
            </span>
          ))}
        </span>
      </span>
      <span className="ab-name__last" id="ab-last" aria-hidden="true">
        <span className="ab-name__ink serif">{name.last}</span>
        <svg className="ab-flourish" viewBox="0 0 320 34" preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id="ab-fl-g" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" className="ab-fl-s1" />
              <stop offset=".55" className="ab-fl-s2" />
              <stop offset="1" className="ab-fl-s3" />
            </linearGradient>
          </defs>
          <path
            className="ab-flourish__a"
            pathLength="1"
            d="M4 25.5C46 17 98 11.6 152 12 204 12.4 250 17.8 288 17.4 302 17.2 311 12.6 316 5"
          />
          <path className="ab-flourish__b" pathLength="1" d="M44 31C106 25.4 176 24.2 246 26.8" />
        </svg>
      </span>
    </h1>
  );
}

/** The left column: greeting, name, role, CTAs, socials and stats (reference L3363-3452). */
function Copy() {
  const { roleChip, cv, book } = aboutHero;
  return (
    <div className="ab-hero__copy ab-lc" id="ab-hero-copy">
      <div className="ab-hi ab-in">
        <p className="ab-hello">{aboutHero.greeting}</p>
        <span className="ab-status">
          <span className="ab-status__dot"></span>
          {aboutHero.status}
        </span>
      </div>

      <Name />
      <p className="sr-only">{aboutHero.srOnlyStatus}</p>

      <p className="ab-role ab-in">
        <span className="ab-chip">
          <Icon name={roleChip.icon} aria-hidden="true" />
          {roleChip.label}
        </span>
        <span className="ab-link" aria-hidden="true">
          <i></i>
        </span>
        <span className="ab-roll" id="ab-roll" aria-hidden="true">
          {heroRoles.map((role, i) => (
            <span className={i === 0 ? 'ab-roll__w is-on' : 'ab-roll__w'} key={role}>
              {role}
            </span>
          ))}
        </span>
        <span className="sr-only">{heroRolesSrOnly}</span>
      </p>

      <div className="ab-cta ab-in">
        <a className="btn btn--primary ab-dl" href={cv.href} download data-cv="" data-magnetic="">
          <svg
            className="i ab-dl__ic"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <g className="ab-dl__arrow">
              <path d="M12 3.5v10.5" />
              <path d="M7.6 9.8 12 14.2l4.4-4.4" />
            </g>
            <path
              className="ab-dl__tray"
              d="M4 14.5v3.2A2.3 2.3 0 0 0 6.3 20h11.4a2.3 2.3 0 0 0 2.3-2.3v-3.2"
            />
          </svg>
          <span>{cv.label}</span>
        </a>
        <button className="btn btn--ghost ab-bk" type="button" data-book={book.bookType}>
          <Icon name={book.icon} aria-hidden="true" />
          <span>{book.label}</span>
        </button>
      </div>

      <ul className="ab-soc ab-in" aria-label={socialsAriaLabel}>
        {socials.map((s) => {
          const external = s.href.startsWith('http');
          return (
            <li key={s.id}>
              <a
                href={s.href}
                {...(external ? { target: '_blank', rel: 'noopener' } : {})}
                aria-label={s.label}
                data-tip={s.tip}
              >
                <Icon name={s.icon} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>

      <dl className="ab-stats ab-in">
        {heroStats.map((stat) => (
          <div className="ab-stat" key={stat.label}>
            <dt className="label">{stat.label}</dt>
            <dd>
              <span className="ab-num" data-to={stat.value}>
                {stat.value}
              </span>
              <span className="ab-plus">{stat.suffix}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** One ring badge: span.ab-sat > span.ab-sat__pill > icon tile + label (L3384-3392). */
function Badge({ badge }: { badge: (typeof orbitBadges)[number] }) {
  return (
    <span className="ab-sat" data-a={badge.angleDeg}>
      <span className="ab-sat__pill">
        <span className="ab-sat__ic">
          <svg className="i">
            <use href={`#${badge.icon}`} />
          </svg>
        </span>
        <span className="ab-sat__txt">{badge.label}</span>
      </span>
    </span>
  );
}

/** The orbital portrait: halo, three rings with badges and dots, the text band and the photo. */
function Orbit() {
  return (
    <div className="ab-hero__visual">
      <div className="ab-orb-exit" id="ab-orb-exit">
        <div className="ab-orb is-pre" id="ab-orb">
          <span className="ab-orb__halo" aria-hidden="true"></span>

          {orbitRings.map((ring) => (
            <div
              className={`ab-orb__layer ab-orb__ring ab-orb__ring--${ring.n}`}
              data-ring={ring.n}
              data-drift={ring.drift || undefined}
              aria-hidden="true"
              key={ring.n}
            >
              <svg className="ab-orb__svg" focusable="false">
                <circle
                  className="ab-orb__line"
                  cx="50%"
                  cy="50%"
                  r={ring.svgR}
                  pathLength="360"
                />
              </svg>
              {orbitDots
                .filter((dot) => dot.ring === ring.n)
                .map((dot) => (
                  <span
                    className={dot.small ? 'ab-orb__dot ab-orb__dot--sm' : 'ab-orb__dot'}
                    data-w={dot.lapsPer100s}
                    data-a={dot.angleDeg}
                    key={dot.angleDeg}
                  ></span>
                ))}
              {orbitBadges
                .filter((badge) => badge.ring === ring.n)
                .map((badge) => (
                  <Badge badge={badge} key={badge.label} />
                ))}
            </div>
          ))}

          <div className="ab-orb__layer ab-orb__core">
            <svg
              className="ab-orb__text"
              viewBox="-1000 -1000 2000 2000"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <path id="ab-ring-path" d="M-880,0A880,880 0 1,1 880,0A880,880 0 1,1 -880,0" />
              </defs>
              <text dominantBaseline="central">
                <textPath href="#ab-ring-path" textLength="5529.2" lengthAdjust="spacing">
                  {orbitRingText}
                </textPath>
              </text>
            </svg>
            <PortraitImage />
          </div>
        </div>
      </div>
    </div>
  );
}

/** div.ab-hero: the copy column, the orbital portrait and the "Scroll to explore" cue. */
export function AboutHero() {
  return (
    <>
      <AboutSprite />
      <div className="ab-hero" id="ab-hero">
        <div className="wrap ab-hero__grid">
          <Copy />
          <Orbit />
          <a className="ab-scroll" href={aboutHero.scrollCue.href}>
            <span className="label">{aboutHero.scrollCue.label}</span>
            <span className="ab-scroll__btn" aria-hidden="true">
              <Icon name="i-arrow-right" />
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
