import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers';

test('lists five projects in order with context chips', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('#work li');
  await expect(rows).toHaveCount(5);
  await expect(rows.nth(0)).toContainText('Stock Tienda');
  await expect(rows.nth(0)).toContainText('Own product');
  await expect(rows.nth(1)).toContainText('Conosur');
  await expect(rows.nth(2)).toContainText('DSP2 + Reset GUI');
  await expect(rows.nth(3)).toContainText('Analyzer');
  await expect(rows.nth(4)).toContainText('Bakery concept');
});

test('each row links to its case and announces role and stack', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('#work li').first().getByRole('link');
  await expect(link).toHaveAttribute('href', '/work/stock-tienda');
  await expect(link).toHaveAccessibleDescription(
    'Point of sale, stock and cash control for small stores. Three stores pay for it. Solo, end to end. Next.js, TypeScript, Tailwind, PostgreSQL.',
  );
});

test('the title link is stretched over the whole row', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('#work li').nth(1);
  await row.scrollIntoViewIfNeeded();
  const box = await row.boundingBox();
  if (!box) throw new Error('row has no box');
  // A point far from the title: the bottom-right corner of the row.
  await page.mouse.click(box.x + box.width - 8, box.y + box.height - 8);
  await expect(page).toHaveURL(/\/work\/conosur$/);
});

test('whole row, including the thumbnail, opens the case (mobile)', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/');
  // The stretched link sits over the thumbnail on purpose, so Playwright's hit-target check
  // would refuse a plain click. A forced click still lands on whatever is on top, like a finger.
  await page.locator('#work li').first().locator('figure').click({ force: true });
  await expect(page).toHaveURL(/\/work\/stock-tienda$/);
});

test('without a viewer, every row shows its own thumbnail and caption', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the desktop project has the viewer, which hides the thumbnails');
  await page.goto('/');
  const rows = page.locator('#work li');
  for (let i = 0; i < 5; i++) await expect(rows.nth(i).locator('figure')).toBeVisible();
  const first = rows.first().locator('figure');
  await expect(first.locator('img')).toHaveAttribute('alt', '');
  await expect(first.locator('figcaption')).toHaveAttribute('aria-hidden', 'true');
  await expect(first.locator('figcaption')).toContainText('Solo, end to end');
  await expect(first.locator('figcaption')).toContainText('Next.js · TypeScript · Tailwind · PostgreSQL');
});

test('with a viewer (desktop, fine pointer) the thumbnails are not shown', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/');
  await expect(page.locator('#work li figure').first()).toBeHidden();
});

test('tablet landscape with touch shows inline thumbnails, no viewer', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('[data-viewer]')).toBeHidden();
  await expect(page.locator('#work li figure').first()).toBeVisible();
  await ctx.close();
});

test('works without JavaScript', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Design engineer who builds the whole product.');
  await expect(page.locator('#work li a')).toHaveCount(5);
  await ctx.close();
});

test('no CV link anywhere', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href*=".pdf"]')).toHaveCount(0);
});

test('has one h1 and an h2 for every section, with the header anchors present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Valentino Rota, Design engineer who builds the whole product.');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Selected work',
    'Open source',
    'Experience',
    'About',
    'Contact',
  ]);
  for (const id of ['work', 'about', 'contact']) await expect(page.locator(`#${id}`)).toHaveCount(1);
});

test('at a glance, open source, experience and contact carry the prototype copy', async ({ page }) => {
  await page.goto('/');
  const glance = page.getByRole('region', { name: 'At a glance' });
  await expect(glance.locator('dt')).toHaveText(['Now', 'Based', 'Stack', 'Elsewhere']);
  await expect(glance).toContainText('Lead UI Developer at Reset Digital since June 2022');
  await expect(glance).toContainText('Mar del Plata, Argentina. Open to Buenos Aires or remote (UTC−3).');
  await expect(glance.getByRole('link')).toHaveCount(2);

  const oss = page.getByRole('region', { name: 'Open source' });
  await expect(oss.getByRole('link')).toHaveCount(2);
  await expect(oss.getByRole('link').nth(0)).toHaveAttribute('href', 'https://github.com/prebid/prebid-server/pull/4475');
  await expect(oss.getByRole('link').nth(1)).toHaveAttribute('href', 'https://github.com/prebid/Prebid.js/pull/14975');
  await expect(oss).toContainText('Merged · #4475');
  await expect(oss).toContainText('Merged · #14975');

  const about = page.locator('#about');
  await expect(about.locator('li')).toHaveCount(5);
  await expect(about.locator('li').nth(0)).toContainText('Jun 2022 – now');
  await expect(about.locator('li').nth(4)).toContainText('Forensic Informatics');
  await expect(about).toContainText('I use AI assistants mainly for testing.');

  const contact = page.locator('#contact');
  await expect(contact).toContainText('Open to design engineering and full-stack roles, in Buenos Aires or remote.');
  await expect(contact.getByRole('link', { name: 'valentino.rota3@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:valentino.rota3@gmail.com',
  );
  await expect(contact.locator('[data-mail-text]')).toHaveText('valentino.rota3@gmail.com');
});

test('the home has no axe violations and no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  await expectNoAxeViolations(page);
  await expectNoHorizontalScroll(page);
});
