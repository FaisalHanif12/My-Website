/**
 * The comparison matrix: widths (with their heights), themes, routes, and how a route maps to the
 * reference page (hash router) or to the app (real routes).
 */

export const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 891, height: 774 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 780 },
] as const;

export type Viewport = (typeof VIEWPORTS)[number];
export type Width = Viewport['width'];

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const ROUTES = ['/', '/profile', '/works', '/approvals', '/contact'] as const;
export type Route = (typeof ROUTES)[number];

/** Reference hash for each route. The root is the reference default page (About), so no hash. */
export const REF_HASH: Record<Route, string> = {
  '/': '',
  '/profile': '#profile',
  '/works': '#works',
  '/approvals': '#approvals',
  '/contact': '#contact',
};

export const WIDTHS: readonly Width[] = VIEWPORTS.map((v) => v.width);

export function isWidth(n: number): n is Width {
  return (WIDTHS as readonly number[]).includes(n);
}

export function isRoute(s: string): s is Route {
  return (ROUTES as readonly string[]).includes(s);
}

export function isTheme(s: string): s is Theme {
  return (THEMES as readonly string[]).includes(s);
}

export function viewportFor(width: Width): Viewport {
  const v = VIEWPORTS.find((x) => x.width === width);
  if (!v) throw new Error(`Unknown width ${width}`);
  return v;
}

/** Output name part for a route: the root is "about", the others drop the slash. */
export function routeSlug(route: Route): string {
  return route === '/' ? 'about' : route.slice(1);
}

/** A URL served as a single HTML file (the reference) uses the hash router. */
export function isReferenceUrl(base: string): boolean {
  return new URL(base).pathname.endsWith('.html');
}

/** The URL to open for a route on one side: hash page for the reference, real route for the app. */
export function urlFor(base: string, route: Route): string {
  const url = new URL(base);
  if (isReferenceUrl(base)) {
    url.hash = REF_HASH[route];
    return url.toString();
  }
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/$/, '') + route;
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/, '');
  return url.toString();
}

export interface Job {
  route: Route;
  viewport: Viewport;
  theme: Theme;
}

/** Every route x width x theme combination, routes outermost, in matrix order. */
export function expandJobs(
  routes: readonly Route[],
  widths: readonly Width[],
  themes: readonly Theme[],
): Job[] {
  const jobs: Job[] = [];
  for (const route of routes)
    for (const width of widths)
      for (const theme of themes) jobs.push({ route, viewport: viewportFor(width), theme });
  return jobs;
}

/** <route>_<width>_<theme>[_<tag>], the base name of the three output PNGs. */
export function outputName(job: Job, tag?: string): string {
  const parts = [routeSlug(job.route), String(job.viewport.width), job.theme];
  if (tag) parts.push(tag.replace(/[^A-Za-z0-9._-]+/g, '-'));
  return parts.join('_');
}
