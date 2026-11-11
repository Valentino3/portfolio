import { expect, test } from '@playwright/test';
import { hydrated } from './helpers';

test('header shows availability and a client-side clock', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Open to roles in Buenos Aires or remote')).toBeVisible();
  await expect(page.locator('time[datetime]')).toHaveText(/^\d{2}:\d{2}$/);
});

test('back to top moves focus to the header', async ({ page }) => {
  await page.goto('/');
  await hydrated(page);
  await page.getByRole('link', { name: /Back to top/ }).click();
  await expect(page.locator('#top')).toBeFocused();
});

for (const path of ['/', '/work/conosur']) {
  test(`on ${path}, the header's Contact link hands the keyboard over to the contact section`, async ({ page }) => {
    await page.goto(path);
    await hydrated(page);
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#contact')).toBeFocused();
    // The next Tab continues from the section, instead of starting over from the header.
    await page.keyboard.press('Tab');
    await expect(page.locator('#contact a[href^="mailto:"]')).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });
}

test('a modified click on an in-page link opens a new tab and leaves focus alone', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'opens a tab of its own');
  await page.goto('/');
  await hydrated(page);
  const contact = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact' });
  const [tab] = await Promise.all([context.waitForEvent('page'), contact.click({ modifiers: ['ControlOrMeta'] })]);
  await tab.close();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#contact')).not.toBeFocused();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('back to top still moves focus to the header', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Back to top/ }).click();
    await expect(page.locator('#top')).toBeFocused();
  });
});

test('external links announce new tab', async ({ page }) => {
  await page.goto('/');
  const links = await page.locator('a[target=_blank]').all();
  expect(links.length, 'the footer has external links').toBeGreaterThan(0);
  for (const a of links) await expect(a).toHaveAccessibleName(/opens in a new tab/);
});

test('availability dot pulses three times, and not at all under reduced motion', async ({ page }) => {
  const dot = () => page.locator('header [aria-hidden="true"].bg-available');
  await page.goto('/');
  await expect(dot()).toHaveCSS('animation-iteration-count', '3');
  await expect(dot()).not.toHaveCSS('animation-name', 'none');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(dot()).toHaveCSS('animation-name', 'none');
});
