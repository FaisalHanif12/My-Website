'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';

import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { pages, shellCopy } from '@/content/site';
import { pageIdOfPath, type PageId } from '@/lib/routes';
import { subscribe } from '@/lib/scrollFrame';

import { TransitionLink } from './TransitionLink';

/** The page of the current route; null on a route that is not one of the five pages. */
function useActivePage(): PageId | null {
  return pageIdOfPath(usePathname() ?? '/');
}

/** One rail or dock link: a.rail__link[data-nav] with the icon and the label (L2977-2981). */
function NavLink({ page, active }: { page: (typeof pages)[number]; active: boolean }) {
  return (
    <TransitionLink
      className={active ? 'rail__link is-active' : 'rail__link'}
      href={page.path}
      data-nav={page.id}
      blurOnMouse
    >
      <Icon name={page.navIcon} />
      <span>{page.title}</span>
    </TransitionLink>
  );
}

/**
 * FH.setActive's rail indicator (L5040): the indicator gets opacity 1 and translateY(offsetTop of
 * the active link). The reference only measures when the page changes, so after widening from a
 * phone to a desktop the indicator stayed on About while the rail was still hidden (offsetTop 0).
 * It is measured again on resize, which changes nothing else (orchestrator decision).
 */
function useRailIndicator(nav: React.RefObject<HTMLElement | null>, active: PageId | null) {
  useLayoutEffect(() => {
    const root = nav.current;
    if (!root) return;
    const place = () => {
      const ind = root.querySelector<HTMLElement>('.rail__ind');
      const link = active ? root.querySelector<HTMLElement>(`[data-nav="${active}"]`) : null;
      if (!ind || !link) return;
      ind.style.opacity = '1';
      ind.style.transform = 'translateY(' + link.offsetTop + 'px)';
    };
    place();
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [nav, active]);
}

/** aside.rail: logo, the five links with the sliding indicator, a separator and the theme toggle. */
export function Rail() {
  const active = useActivePage();
  const navRef = useRef<HTMLElement>(null);
  useRailIndicator(navRef, active);
  return (
    <aside className="rail" aria-label={shellCopy.navLabel}>
      <TransitionLink
        className="rail__logo"
        href="/"
        aria-label={shellCopy.logoAriaLabel}
        blurOnMouse
      >
        {shellCopy.logoText}
      </TransitionLink>
      <nav className="rail__nav" data-navgroup="" ref={navRef}>
        <div className="rail__ind" aria-hidden="true"></div>
        {pages.map((page) => (
          <NavLink key={page.id} page={page} active={page.id === active} />
        ))}
      </nav>
      <div className="rail__sep"></div>
      <ThemeToggle variant="rail" />
    </aside>
  );
}

/**
 * header.topbar#topbar: brand, theme toggle and the Book button (L3333-3343). It gets is-scrolled
 * once the page is scrolled past 12px, in the shared scroll frame (L5036). The class is toggled
 * through the ref, never through state, so scrolling does not re-render.
 */
export function TopBar() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (y: number) => el.classList.toggle('is-scrolled', y > 12);
    update(window.scrollY);
    return subscribe(update);
  }, []);
  return (
    <header className="topbar" id="topbar" ref={ref}>
      <TransitionLink className="topbar__brand" href="/">
        <span className="rail__logo">{shellCopy.logoText}</span>
        {shellCopy.brandName}
      </TransitionLink>
      <div className="topbar__actions">
        <ThemeToggle variant="topbar" />
        <button className="btn btn--primary btn--sm" data-book="">
          <Icon name="i-calendar" />
          {shellCopy.bookButton}
        </button>
      </div>
    </header>
  );
}

/** nav.dock: the mobile bottom bar with the same five links (L3345-3351). */
export function Dock() {
  const active = useActivePage();
  return (
    <nav className="dock" aria-label={shellCopy.navLabel} data-navgroup="">
      {pages.map((page) => (
        <NavLink key={page.id} page={page} active={page.id === active} />
      ))}
    </nav>
  );
}
