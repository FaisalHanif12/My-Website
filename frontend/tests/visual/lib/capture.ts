/**
 * One deterministic screenshot of one side (reference or app). Both sides get exactly the same
 * setup, see frontend sharedDecisions section 6.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Browser, Locator, Page, Request, Route as PwRoute } from '@playwright/test';
import type { Action } from './args';
import type { Theme, Viewport } from './matrix';

export type Side = 'ref' | 'app';

/**
 * Both sides start at this instant with the page clock PAUSED: Date, timers, requestAnimationFrame
 * and performance only move when the harness advances them, in the same fixed steps on both sides.
 * (A fixed Date with real timers is not enough: the About typer swaps its role every 3400ms of real
 * time even with reduced motion, so the capture moment would decide the word.)
 */
export const FIXED_TIME = new Date('2026-03-10T09:00:00Z');
/** Requests to the live origin are answered from frontend/public. */
export const LIVE_ORIGIN = 'https://faisalhanif.work';
export const PUBLIC_DIR = fileURLToPath(new URL('../../../public/', import.meta.url));
/**
 * The reference loads Google Fonts from the network. A slow or failed font request made captures
 * time out or fall back to other faces, so font responses are kept on disk after the first fetch.
 */
export const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'] as const;
export const FONT_CACHE_DIR = fileURLToPath(new URL('../out/.cache/fonts/', import.meta.url));
const FONT_FETCH_TRIES = 3;
const FONT_FETCH_TIMEOUT_MS = 20_000;

const ACTION_SETTLE_MS = 400;
const MOTION_PRELOADER_MS = 1400;
const SCROLL_STEP_MS = 150;
/** Clock step while waiting for html.is-loaded when the boot needs timers (--motion). */
const BOOT_TICK_MS = 50;
/** Real time is-loaded may take before the clock starts to move (the boot needs no timer). */
const BOOT_GRACE_MS = 1500;
const LOAD_TIMEOUT_MS = 60_000;
/** A local static server with a small backlog can refuse a connection under load: retry once. */
const NAV_TRIES = 2;
const NAV_RETRY_MS = 500;
const IMAGE_TIMEOUT_MS = 10_000;
const ACTION_TIMEOUT_MS = 10_000;
const FINAL_PAINT_MS = 100;
/** Real time for Chrome to commit a layer tree change (a few frames). */
const LAYER_FRAME_MS = 80;
/** Longest real time the finite CSS animations and transitions may take to settle. */
const ANIMATIONS_TIMEOUT_MS = 15_000;

/**
 * Chromium flags for both sides (the CLI browser and the Playwright visual project).
 * --disable-threaded-animation: CSS animations and transitions (0.001ms with reduced motion) run
 * on the main thread; on the compositor thread a layer rastered mid animation (the Approvals card
 * fan, the Profile "BS-SE" mark) kept that raster offset depending on frame timing.
 * --disable-checker-imaging: images are decoded before a tile is drawn, never drawn late.
 */
export const LAUNCH_ARGS = ['--disable-threaded-animation', '--disable-checker-imaging'] as const;

/**
 * Nothing is painted until the page has settled: every element is visibility:hidden (an adopted
 * style sheet set before any page script) during load and the scroll through, and is released
 * before the actions. Layout, fonts, lazy images and observers run as usual, but Chrome rasters
 * each layer for the first time in its final state. Otherwise a layer first painted early (text in
 * a fallback face, a transform mid entrance) kept that raster offset, a sub-pixel text shift whose
 * presence depended on machine load.
 */
const HOLD_CSS = '*,*::before,*::after{visibility:hidden!important}';
const HOLD_KEY = '__visualHold';

export interface CaptureOptions {
  side: Side;
  url: string;
  viewport: Viewport;
  theme: Theme;
  selector?: string;
  actions: readonly Action[];
  waitMs: number;
  motion: boolean;
  /** Receives every console error or warning, page error and failed request (unprefixed). */
  log: (line: string) => void;
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

/** Maps a live URL to a file under frontend/public (null when it would leave the folder). */
export function publicFileFor(url: string, publicDir: string = PUBLIC_DIR): string | null {
  const { pathname } = new URL(url);
  let rel = pathname;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    // A malformed escape: keep the raw path, it simply will not exist.
  }
  const root = resolve(publicDir);
  const file = resolve(root, `.${rel}`);
  return file === root || file.startsWith(root + sep) ? file : null;
}

async function fulfilFromPublic(route: PwRoute, log: (line: string) => void): Promise<void> {
  const url = route.request().url();
  const file = publicFileFor(url);
  if (file && existsSync(file) && statSync(file).isFile()) {
    const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
    await route.fulfill({ status: 200, contentType: type, body: readFileSync(file) });
    return;
  }
  log(`404 (not in frontend/public): ${url}`);
  await route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' });
}

interface CachedMeta {
  url: string;
  contentType: string;
}

/** Answers a Google Fonts request from the disk cache, fetching it (with retries) the first time. */
async function fulfilFont(route: PwRoute, log: (line: string) => void): Promise<void> {
  const url = route.request().url();
  const file = join(FONT_CACHE_DIR, createHash('sha1').update(url).digest('hex'));
  const headers = { 'access-control-allow-origin': '*', 'cache-control': 'max-age=31536000' };
  if (existsSync(`${file}.json`) && existsSync(file)) {
    const meta = JSON.parse(readFileSync(`${file}.json`, 'utf8')) as CachedMeta;
    await route.fulfill({
      status: 200,
      contentType: meta.contentType,
      headers,
      body: readFileSync(file),
    });
    return;
  }
  let error = '';
  for (let i = 0; i < FONT_FETCH_TRIES; i++) {
    try {
      const res = await route.fetch({ timeout: FONT_FETCH_TIMEOUT_MS });
      if (!res.ok()) {
        error = `HTTP ${res.status()}`;
        continue;
      }
      const body = await res.body();
      const meta: CachedMeta = { url, contentType: res.headers()['content-type'] ?? '' };
      // Write then rename, so a parallel capture never reads half a file.
      mkdirSync(FONT_CACHE_DIR, { recursive: true });
      const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
      writeFileSync(tmp, body);
      renameSync(tmp, file);
      writeFileSync(`${tmp}.json`, JSON.stringify(meta));
      renameSync(`${tmp}.json`, `${file}.json`);
      await route.fulfill({ status: 200, contentType: meta.contentType, headers, body });
      return;
    } catch (e) {
      error = e instanceof Error ? e.message.split('\n')[0] : String(e);
    }
  }
  log(`font request failed ${FONT_FETCH_TRIES} times (${error}): ${url}`);
  await route.abort('failed');
}

/** Logs problems and returns a function that lists the requests still in flight. */
function listen(page: Page, log: (line: string) => void): () => string[] {
  const inFlight = new Set<Request>();
  page.on('request', (r) => inFlight.add(r));
  page.on('requestfinished', (r) => inFlight.delete(r));
  page.on('requestfailed', (r) => inFlight.delete(r));
  page.on('console', (m) => {
    const type = m.type();
    if (type !== 'error' && type !== 'warning') return;
    const at = m.location().url ? ` (${m.location().url}:${m.location().lineNumber})` : '';
    log(`console.${type}: ${m.text()}${at}`);
  });
  page.on('pageerror', (e) => log(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    log(`requestfailed: ${r.method()} ${r.url()} ${r.failure()?.errorText ?? ''}`.trim());
  });
  page.on('response', (r) => {
    // Misses on the live origin are already logged by fulfilFromPublic.
    if (r.status() >= 400 && !r.url().startsWith(LIVE_ORIGIN)) {
      log(`HTTP ${r.status()}: ${r.request().method()} ${r.url()}`);
    }
  });
  return () => [...inFlight].map((r) => r.url());
}

/**
 * Lets real time pass (observers, image loads, network), then moves the paused page clock by the
 * same amount, so page timers run in the same order and at the same page time on both sides.
 */
async function advance(page: Page, ms: number): Promise<void> {
  await page.waitForTimeout(ms);
  await page.clock.runFor(ms);
}

const isLoaded = () => document.documentElement.classList.contains('is-loaded');

/** html.is-loaded: first without moving the clock, then in small clock steps (a timed boot). */
async function waitLoaded(page: Page): Promise<void> {
  try {
    await page.waitForFunction(isLoaded, null, { timeout: BOOT_GRACE_MS, polling: 50 });
    return;
  } catch {
    // The boot waits on a page timer (the reference preloader with motion): move the clock.
  }
  const deadline = Date.now() + LOAD_TIMEOUT_MS;
  while (!(await page.evaluate(isLoaded))) {
    if (Date.now() > deadline) throw new Error('html.is-loaded never appeared');
    await advance(page, BOOT_TICK_MS);
  }
}

/**
 * Scrolls down in viewport steps (lazy images, observers), waits for the images on screen width,
 * then goes back to the top. Browser side callbacks are anonymous on purpose: tsx wraps named
 * functions in a __name() helper that does not exist in the page.
 */
async function scrollThrough(page: Page, log: (line: string) => void): Promise<void> {
  const step = Math.max(1, await page.evaluate(() => window.innerHeight));
  for (let y = 0, i = 0; i < 200; y += step, i++) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    if (y >= height) break;
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await advance(page, SCROLL_STEP_MS);
  }
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
  );
  await advance(page, SCROLL_STEP_MS);
  try {
    // Rendered images across the viewport width; lazy ones far off to the side in a rail never load.
    await page.waitForFunction(
      () =>
        Array.from(document.images).every((img) => {
          const r = img.getBoundingClientRect();
          const shown =
            img.getClientRects().length > 0 && r.right > 0 && r.left < window.innerWidth;
          return !shown || img.complete;
        }),
      null,
      { timeout: IMAGE_TIMEOUT_MS, polling: 100 },
    );
  } catch {
    log(`images still loading after ${IMAGE_TIMEOUT_MS}ms`);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await advance(page, SCROLL_STEP_MS);
}

/** True when no finite CSS animation or transition is still running (infinite ones never end). */
const animationsSettled = () =>
  document.getAnimations().every((a) => {
    if (a.playState !== 'running') return true;
    return !Number.isFinite(Number(a.effect?.getComputedTiming().endTime));
  });

/**
 * Waits in real time (the page clock stays paused) until every finite CSS animation and transition
 * has finished. Reduced motion shortens durations to 0.001ms but keeps the delays (the Works hero
 * pill waits 1s, the Profile "BS-SE" mark 250ms), and those run on real time: without this wait the
 * machine load decided whether they had played, or in which frame a layer was first rastered.
 */
async function settleAnimations(page: Page, log: (line: string) => void): Promise<void> {
  try {
    await page.waitForFunction(animationsSettled, null, {
      timeout: ANIMATIONS_TIMEOUT_MS,
      polling: 50,
    });
  } catch {
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === 'running')
        .map((a) => {
          const name =
            a instanceof CSSAnimation
              ? a.animationName
              : a instanceof CSSTransition
                ? a.transitionProperty
                : a.id || 'animation';
          const target = a.effect instanceof KeyframeEffect ? a.effect.target : null;
          const where = target
            ? `${target.tagName.toLowerCase()}.${target.classList[0] ?? ''}`
            : '';
          return `${name} ${where}`.trim();
        })
        .slice(0, 8)
        .join(', '),
    );
    log(`animations still running after ${ANIMATIONS_TIMEOUT_MS}ms: ${running}`);
  }
}

/**
 * Rebuilds every will-change layer before the capture. Chrome keeps the raster offset a
 * will-change:transform layer got at its first paint (for example the Profile title lines, first
 * painted at translateY(112%) before their entrance), so the text sub-pixel position depended on
 * how early the first frame came. Dropping will-change for a few frames and restoring it rasters
 * each layer again at its settled transform. Nothing stays changed.
 */
async function refreshLayers(page: Page): Promise<void> {
  const tag = await page.addStyleTag({
    content: '*,*::before,*::after{will-change:auto!important}',
  });
  await page.waitForTimeout(LAYER_FRAME_MS);
  await tag.evaluate((el) => el.parentNode?.removeChild(el));
  await page.waitForTimeout(LAYER_FRAME_MS);
}

/** Paints the page for the first time (removes the hold style sheet) and lets Chrome raster it. */
async function release(page: Page): Promise<void> {
  await page.evaluate((key) => {
    const w = window as unknown as Record<string, CSSStyleSheet | undefined>;
    const sheet = w[key];
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet);
    delete w[key];
  }, HOLD_KEY);
  await page.waitForTimeout(LAYER_FRAME_MS);
}

/** First visible match of a selector, with a clear error when there is none. */
async function firstVisible(
  page: Page,
  side: Side,
  what: string,
  selector: string,
): Promise<Locator> {
  const all = page.locator(selector);
  const count = await all.count();
  if (count === 0) throw new Error(`${side}: ${what} "${selector}" matches nothing`);
  const visible = all.filter({ visible: true });
  if ((await visible.count()) === 0) {
    throw new Error(`${side}: ${what} "${selector}" matches ${count} element(s), none visible`);
  }
  return visible.first();
}

/** Opens the page with the shared setup and returns the PNG screenshot. */
export async function capture(browser: Browser, o: CaptureOptions): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: { width: o.viewport.width, height: o.viewport.height },
    deviceScaleFactor: 1,
    reducedMotion: o.motion ? 'no-preference' : 'reduce',
    locale: 'en-US',
    timezoneId: 'Asia/Karachi',
    colorScheme: 'light',
  });
  try {
    await context.addInitScript((theme: string) => {
      try {
        localStorage.setItem('fh-theme', theme);
      } catch {
        // Storage blocked: the page falls back to its own default.
      }
    }, o.theme);
    await context.addInitScript(
      ({ css, key }) => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
        (window as unknown as Record<string, CSSStyleSheet>)[key] = sheet;
      },
      { css: HOLD_CSS, key: HOLD_KEY },
    );
    await context.route(`${LIVE_ORIGIN}/**`, (route) => fulfilFromPublic(route, o.log));
    for (const origin of FONT_ORIGINS) {
      await context.route(`${origin}/**`, (route) => fulfilFont(route, o.log));
    }
    const page = await context.newPage();
    const pending = listen(page, o.log);
    // Installed a minute early so the pause always lands on FIXED_TIME (a clock cannot go back).
    await page.clock.install({ time: FIXED_TIME.getTime() - 60_000 });
    await page.clock.pauseAt(FIXED_TIME);

    for (let attempt = 1; ; attempt++) {
      try {
        await page.goto(o.url, { waitUntil: 'load', timeout: LOAD_TIMEOUT_MS });
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message.split('\n')[0] : String(e);
        if (attempt < NAV_TRIES && msg.includes('net::ERR_')) {
          o.log(`navigation retried after: ${msg}`);
          await page.waitForTimeout(NAV_RETRY_MS);
          continue;
        }
        const open = pending();
        const list = open.length ? `; still loading: ${open.slice(0, 5).join(', ')}` : '';
        throw new Error(`${o.side}: ${msg}${list}`);
      }
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await waitLoaded(page);
    if (o.motion) await advance(page, MOTION_PRELOADER_MS);
    await page.addStyleTag({ content: '#preloader{visibility:hidden!important}' });

    await scrollThrough(page, o.log);
    await settleAnimations(page, o.log);
    await release(page);
    await advance(page, o.waitMs);

    for (const action of o.actions) {
      const target = await firstVisible(page, o.side, `--${action.type}`, action.selector);
      if (action.type === 'hover') await target.hover({ timeout: ACTION_TIMEOUT_MS });
      else await target.click({ timeout: ACTION_TIMEOUT_MS });
      await advance(page, ACTION_SETTLE_MS);
    }
    await settleAnimations(page, o.log);
    await refreshLayers(page);
    await page.waitForTimeout(FINAL_PAINT_MS);

    if (o.selector) {
      const el = await firstVisible(page, o.side, '--selector', o.selector);
      return await el.screenshot({ animations: 'allow', caret: 'hide', scale: 'css' });
    }
    return await page.screenshot({
      fullPage: true,
      animations: 'allow',
      caret: 'hide',
      scale: 'css',
    });
  } finally {
    await context.close();
  }
}
