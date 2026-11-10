import { expect, test } from '@playwright/test';

test('header shows availability and a client-side clock', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Open to roles in Buenos Aires or remote')).toBeVisible();
  await expect(page.locator('time[datetime]')).toHaveText(/^\d{2}:\d{2}$/);
});

test('back to top moves focus to the header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Back to top/ }).click();
  await expect(page.locator('#top')).toBeFocused();
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
