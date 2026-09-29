/**
 * End to end checks of the running app (APP_URL, default http://localhost:3000) with no API set:
 * the reference mailto flow and the local chat responder. Needs `npm run dev` or `npm start`.
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const ROUTES = ['/', '/profile', '/works', '/approvals', '/contact'] as const;

/** Waits for the preloader to finish (html.is-loaded). */
async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.classList.contains('is-loaded'), null, {
    timeout: 20_000,
  });
  await page.waitForTimeout(400);
}

/** Stops mailto links from leaving the page and records the last one. */
async function captureMailto(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __mail: string | null }).__mail = null;
    document.addEventListener(
      'click',
      (e) => {
        const a = (e.target as Element).closest?.('a[href^="mailto:"]');
        if (a) {
          (window as unknown as { __mail: string }).__mail = (a as HTMLAnchorElement).href;
          e.preventDefault();
        }
      },
      true,
    );
  });
}

for (const route of ROUTES) {
  test(`${route}: loads with no console errors and no horizontal scroll at any width`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(route);
    await ready(page);
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(0);
    }
    expect(errors).toEqual([]);
  });
}

test('the rail links move between pages, and back and forward work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await ready(page);
  await page.locator('.rail a[href="/works"]').click();
  await expect(page).toHaveURL(/\/works$/);
  await expect(page.locator('#works.is-current, [data-page="works"].is-current')).toBeVisible();
  await page.locator('.rail a[href="/contact"]').click();
  await expect(page).toHaveURL(/\/contact$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/works$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/contact$/);
});

test('/index.html redirects to the home page and sass-app.html loads', async ({ page }) => {
  const res = await page.goto('/index.html');
  expect(new URL(page.url()).pathname).toBe('/');
  expect(res?.ok()).toBe(true);
  const sass = await page.goto('/sass-app.html');
  expect(sass?.status()).toBe(200);
});

test('the booking modal runs the whole flow and opens the mail app with the details', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/contact');
  await ready(page);
  await captureMailto(page);
  await page.locator('[data-book]:visible').first().click();
  await expect(page.locator('#booking')).toHaveClass(/is-open/);
  await page.locator('label.ct-sess').nth(1).click();
  await page.locator('[data-bk-step="1"]').click();
  await expect(page.locator('#ct-bk-s-total')).toHaveText('$50', { timeout: 3000 });
  await page.click('#ct-bk-go');
  await page.fill('#ct-bk-email', 'tester@example.com');
  await page.fill('#ct-bk-name', 'Test Person');
  await page.locator('.ct-pane[data-pane="1"] [data-bk-next]').click();
  await page.locator('.ct-cal__d:not([disabled])').first().click();
  await page.locator('.ct-slot').nth(2).click();
  await page.locator('.ct-pane[data-pane="2"] [data-bk-next]').click();
  await page.locator('label.ct-plat').first().click();
  await page.click('#ct-bk-complete');
  await expect(page.locator('#ct-bk-t3')).toHaveText('Request ready!', { timeout: 5000 });
  const mail = decodeURIComponent(
    (await page.evaluate(() => (window as unknown as { __mail: string }).__mail)) ?? '',
  );
  expect(mail).toContain('Meeting request: Technical Deep Dive');
  expect(mail).toContain('Number of sessions: 2');
  await page.keyboard.press('Escape');
  await expect(page.locator('#booking')).not.toHaveClass(/is-open/);
});

test('modals trap focus and give it back on close', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/contact');
  await ready(page);
  const opener = page.locator('[data-book]:visible').first();
  await opener.focus();
  await opener.press('Enter');
  await expect(page.locator('#booking')).toHaveClass(/is-open/);
  for (let i = 0; i < 25; i += 1) await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => !!document.activeElement?.closest('#booking'));
  expect(inside).toBe(true);
  await page.keyboard.press('Escape');
  const back = await page.evaluate(
    () =>
      document.activeElement === document.querySelector('[data-book]:not([hidden])') ||
      !!document.activeElement?.hasAttribute('data-book'),
  );
  expect(back).toBe(true);
});

test('the chat answers from the local responder and stays closed until opened', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await ready(page);
  await expect(page.locator('#ct-chat-panel')).toHaveAttribute('aria-hidden', 'true');
  await page.click('#ct-chat-fab');
  await expect(page.locator('#ct-chat-log')).toContainText("Hi! I'm Faisal's assistant", {
    timeout: 4000,
  });
  await page.fill('#ct-chat-input', 'What are your rates?');
  await page.keyboard.press('Enter');
  await expect(page.locator('#ct-chat-log')).toContainText('Professional plan', { timeout: 5000 });
});

test('the contact form shows the reference messages and then the mail flow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/contact');
  await ready(page);
  await captureMailto(page);
  await page.click('#ct-send');
  await expect(page.locator('#ct-name-err')).not.toBeEmpty();
  await expect(page.locator('#ct-email-err')).not.toBeEmpty();
  await page.fill('#ct-name', 'Test Person');
  await page.fill('#ct-email', 'tester@example.com');
  await page.locator('input[name="type"]').first().check({ force: true });
  await page.fill('#ct-details', 'I would like a portfolio site with a booking flow.');
  await page.click('#ct-send');
  await expect(page.locator('#ct-done')).toBeVisible({ timeout: 6000 });
  const mail = await page.evaluate(() => (window as unknown as { __mail: string }).__mail);
  expect(mail).toContain('mailto:');
});
