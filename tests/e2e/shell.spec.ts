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

for (const path of ['/work/not-a-project', '/does-not-exist']) {
  test(`${path} answers 404 with the site's header, a heading and the ways back`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle('Page not found — Valentino Rota');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    // The home's canonical URL is not this page's.
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.getByText('Open to roles in Buenos Aires or remote')).toBeVisible();
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(main.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/');
    await expect(main.getByRole('link', { name: 'All work' })).toHaveAttribute('href', '/#work');
    // Every header link leads to a section of the home: this page has none of its own.
    const nav = page.getByRole('navigation', { name: 'Primary' }).getByRole('link');
    expect(await nav.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual([
      '/#work',
      '/#about',
      '/#contact',
    ]);

    await hydrated(page);
    await page.getByRole('link', { name: /Back to top/ }).click();
    await expect(page.locator('#top')).toBeFocused();
  });
}

test('"All work" on the 404 page leads to the list of projects', async ({ page }) => {
  await page.goto('/does-not-exist');
  await hydrated(page);
  await page.getByRole('main').getByRole('link', { name: 'All work' }).click();
  await expect(page).toHaveURL(/\/#work$/);
  await expect(page.locator('#work li').first()).toBeInViewport();
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
