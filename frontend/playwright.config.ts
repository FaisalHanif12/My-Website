/**
 * Playwright projects: visual (reference parity, tests/visual), e2e (tests/e2e) and a11y
 * (tests/a11y). Chromium only. No webServer: the app (APP_URL, default http://localhost:3000),
 * the reference (REF_URL) and the API run outside the tests.
 */
import { defineConfig, devices } from '@playwright/test';
import { LAUNCH_ARGS } from './tests/visual/lib/capture';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export default defineConfig({
  testMatch: '**/*.spec.ts',
  outputDir: 'test-results',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    browserName: 'chromium',
    baseURL: APP_URL,
  },
  projects: [
    {
      name: 'visual',
      testDir: './tests/visual',
      // Two full page captures (reference and app) per test.
      timeout: 180_000,
      // Exactly the CLI setup (npm run visual): the same Chromium flags, and no device preset or
      // trace, because Playwright Test applies `use` to the contexts the harness creates as well.
      use: { launchOptions: { args: [...LAUNCH_ARGS] }, trace: 'off' },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'], trace: 'retain-on-failure' },
    },
    {
      name: 'a11y',
      testDir: './tests/a11y',
      use: { ...devices['Desktop Chrome'], trace: 'retain-on-failure' },
    },
  ],
});
