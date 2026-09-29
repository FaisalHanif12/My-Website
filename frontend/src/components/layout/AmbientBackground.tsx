/**
 * The fixed ambient background (reference L3308-3314): three drifting soft glows, the dot grid and
 * the grain. Static markup, all motion is CSS (layout.css, reference L196-207).
 */
export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient__blob ambient__blob--a"></div>
      <div className="ambient__blob ambient__blob--b"></div>
      <div className="ambient__blob ambient__blob--c"></div>
      <div className="ambient__grid"></div>
      <div className="ambient__grain"></div>
    </div>
  );
}
