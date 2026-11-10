import { test, expect } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers';

test('home responds with the brand title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Valentino Rota — Design Engineer');
  await expectNoAxeViolations(page);
  await expectNoHorizontalScroll(page);
});
