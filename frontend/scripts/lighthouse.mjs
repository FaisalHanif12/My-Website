/**
 * npm run lighthouse [-- --url http://127.0.0.1:3002] [--runs 1]
 * Runs Lighthouse (mobile) on every route of a running production server and checks the budgets:
 * Performance 90, Accessibility 95, Best Practices 95, SEO 100. Prints one line per route and exits
 * 1 when a budget is missed. Start the server first:
 *   npm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
 *   PORT=3002 HOSTNAME=127.0.0.1 node .next/standalone/server.js
 * Uses Playwright's Chromium (CHROME_PATH overrides it).
 */
import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : fallback;
};
const BASE = flag('url', 'http://127.0.0.1:3002').replace(/\/+$/, '');
const RUNS = Number(flag('runs', '1'));
const ROUTES = ['/', '/profile', '/works', '/approvals', '/contact'];
const BUDGETS = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 100 };

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH || chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
});

let failed = false;
try {
  for (const route of ROUTES) {
    const scores = [];
    for (let i = 0; i < RUNS; i += 1) {
      const { lhr } = await lighthouse(
        BASE + route,
        { port: chrome.port, output: 'json', logLevel: 'error' },
        {
          extends: 'lighthouse:default',
          settings: {
            formFactor: 'mobile',
            screenEmulation: {
              mobile: true,
              width: 412,
              height: 823,
              deviceScaleFactor: 1.75,
              disabled: false,
            },
            onlyCategories: Object.keys(BUDGETS),
          },
        },
      );
      scores.push(
        Object.fromEntries(
          Object.entries(lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]),
        ),
      );
    }
    // Median of the runs per category.
    const med = Object.fromEntries(
      Object.keys(BUDGETS).map((k) => {
        const v = scores.map((s) => s[k]).sort((a, b) => a - b);
        return [k, v[Math.floor(v.length / 2)]];
      }),
    );
    const misses = Object.entries(BUDGETS)
      .filter(([k, min]) => med[k] < min)
      .map(([k]) => k);
    if (misses.length) failed = true;
    console.log(
      `${route.padEnd(11)} perf ${med.performance}  a11y ${med.accessibility}  best ${med['best-practices']}  seo ${med.seo}  ${misses.length ? 'BELOW BUDGET: ' + misses.join(', ') : 'ok'}`,
    );
  }
} finally {
  await chrome.kill();
}
process.exit(failed ? 1 : 0);
