import { preloader } from '@/content/site';

/**
 * The first load preloader (reference L3294-3299). Server markup, visible from the first paint
 * (z-index 100); its ring, arc and text animations are CSS only (layout.css, L255-264). AppShell
 * adds is-done 1250ms after hydration. Rendered once by the root layout, so client navigation
 * never shows it again. The arc strokes url(#pl-g) from IconSprite.
 */
export function Preloader() {
  return (
    <div className="preloader" id="preloader" aria-hidden="true">
      <div className="preloader__mark">
        <svg viewBox="0 0 90 90">
          <circle className="pl-ring" cx="45" cy="45" r="40" />
          <circle className="pl-arc" cx="45" cy="45" r="40" transform="rotate(-90 45 45)" />
          <text className="pl-txt" x="45" y="54" textAnchor="middle">
            {preloader.mark}
          </text>
        </svg>
        <span className="label">{preloader.label}</span>
      </div>
    </div>
  );
}
