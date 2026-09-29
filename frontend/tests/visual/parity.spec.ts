/**
 * The full parity matrix (npm run test:visual): every route x width x theme, reference against the
 * app, each at most 0.5% differing pixels. The PNGs are attached to the report and also written to
 * tests/visual/out/. Env: REF_URL, APP_URL.
 */
import { expect, test } from '@playwright/test';
import { DEFAULT_MAX_PERCENT, DEFAULT_WAIT_MS, parseArgs } from './lib/args';
import { formatPercent } from './lib/diff';
import { ROUTES, THEMES, WIDTHS, expandJobs, outputName } from './lib/matrix';
import { compare } from './lib/run';

const { refUrl, appUrl } = parseArgs([], process.env);

test.describe.configure({ mode: 'parallel' });

for (const job of expandJobs(ROUTES, WIDTHS, THEMES)) {
  test(`${job.route} ${job.viewport.width} ${job.theme}`, async ({ browser }, testInfo) => {
    const result = await compare(browser, job, {
      refUrl,
      appUrl,
      actions: [],
      waitMs: DEFAULT_WAIT_MS,
      motion: false,
    });
    const name = outputName(job);
    await testInfo.attach(`${name}_ref.png`, { path: result.files.ref, contentType: 'image/png' });
    await testInfo.attach(`${name}_app.png`, { path: result.files.app, contentType: 'image/png' });
    await testInfo.attach(`${name}_diff.png`, {
      path: result.files.diff,
      contentType: 'image/png',
    });
    if (result.logs.length) {
      await testInfo.attach('console-and-network.txt', {
        body: result.logs.join('\n'),
        contentType: 'text/plain',
      });
    }
    expect(
      result.percent,
      `${name}: ${formatPercent(result.percent)} of pixels differ (limit ${DEFAULT_MAX_PERCENT}%)`,
    ).toBeLessThanOrEqual(DEFAULT_MAX_PERCENT);
  });
}
