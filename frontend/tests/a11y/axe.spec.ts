/** Automated accessibility checks (axe) on every route in both themes, and on the open modals. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const ROUTES = ['/', '/profile', '/works', '/approvals', '/contact'] as const;

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.classList.contains('is-loaded'), null, {
    timeout: 20_000,
  });
  await page.waitForTimeout(1500);
}

async function violations(page: Page, include?: string) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  if (include) builder.include(include);
  const result = await builder.analyze();
  return result.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
  );
}

for (const theme of ['light', 'dark'] as const) {
  for (const route of ROUTES) {
    test(`${route} (${theme}) has no axe violations`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('fh-theme', t), theme);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(route);
      await ready(page);
      expect(await violations(page)).toEqual([]);
    });
  }
}

test('the booking modal and the chat panel have no axe violations', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/contact');
  await ready(page);
  await page.locator('[data-book]:visible').first().click();
  await page.waitForTimeout(500);
  expect(await violations(page, '#booking')).toEqual([]);
  await page.keyboard.press('Escape');
  await page.click('#ct-chat-fab');
  await page.waitForTimeout(1500);
  expect(await violations(page, '#ct-chat')).toEqual([]);
});
