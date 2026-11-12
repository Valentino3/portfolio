import { expect, test } from '@playwright/test';
import { publishedProjects } from '@/content/projects';
import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers';

const projects = publishedProjects();

test('lists the published projects in order with their context', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('#work li');
  await expect(rows).toHaveCount(projects.length);
  for (const [i, { title, context }] of projects.entries()) {
    await expect(rows.nth(i)).toContainText(title);
    await expect(rows.nth(i)).toContainText(context);
  }
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
  for (let i = 0; i < projects.length; i++) await expect(rows.nth(i).locator('figure')).toBeVisible();
  const first = rows.first().locator('figure');
  await expect(first.locator('img')).toHaveAttribute('alt', '');
  await expect(first.locator('figcaption')).toHaveAttribute('aria-hidden', 'true');
  // One sans line: the role only, no stack line.
  await expect(first.locator('figcaption')).toHaveText('Solo, end to end');
});

test('with a viewer (desktop, fine pointer) the thumbnails are not shown', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/');
  await expect(page.locator('#work li figure').first()).toBeHidden();
});

test('a desktop window under 1280px shows inline thumbnails, no viewer', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  // Half the grid is too narrow there for a screenshot as tall as the list.
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('[data-viewer]')).toBeHidden();
  await expect(page.locator('#work li figure').first()).toBeVisible();
  await ctx.close();
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
  await expect(page.locator('#work li a')).toHaveCount(projects.length);
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
    'Stack',
    'Open source',
    'Experience',
    'About',
    'Contact',
  ]);
  for (const id of ['work', 'about', 'contact']) await expect(page.locator(`#${id}`)).toHaveCount(1);
});

test('stack, open source, experience and contact carry the owner’s copy', async ({ page }) => {
  await page.goto('/');
  const stack = page.getByRole('region', { name: 'Stack' });
  await expect(stack.locator('li b')).toHaveText(['Frontend', 'Backend', 'Data & auth', 'Quality & ops']);
  await expect(stack).toContainText('TypeScript, React, Next.js, Tailwind, MUI, shadcn/Radix');
  // No label-over-value grid on the home.
  await expect(page.locator('main dl')).toHaveCount(0);

  const oss = page.getByRole('region', { name: 'Open source' });
  await expect(oss.getByRole('link')).toHaveCount(2);
  await expect(oss.getByRole('link').nth(0)).toHaveAttribute('href', 'https://github.com/prebid/prebid-server/pull/4475');
  await expect(oss.getByRole('link').nth(1)).toHaveAttribute('href', 'https://github.com/prebid/Prebid.js/pull/14975');
  await expect(oss).toContainText('Merged, #4475');
  await expect(oss).toContainText('Merged, #14975');

  const about = page.locator('#about');
  await expect(about.locator('li')).toHaveCount(5);
  await expect(about.locator('li').nth(0)).toContainText('Jun 2022 – now');
  // What "Now" used to say, in the first entry, in the owner's words.
  await expect(about.locator('li').nth(0)).toContainText('In practice I work across the stack');
  await expect(about.locator('li').nth(0)).toContainText(
    'I lead one engineer: I review their pull requests and we have regular one-on-ones.',
  );
  const internship = about.locator('li').nth(4);
  await expect(internship).toContainText('Developer Intern, Forensic Informatics (internship)');
  // Dated like every other row, and laid out like them: the role starts where the others' do.
  await expect(internship.locator('> span.tabular-nums')).toHaveText('2018');
  const [role, firstRole] = await Promise.all([
    internship.locator('b').boundingBox(),
    about.locator('li').nth(0).locator('b').boundingBox(),
  ]);
  expect(Math.abs(role!.x - firstRole!.x)).toBeLessThan(1);
  await expect(about).not.toContainText('AI assistants');

  const contact = page.locator('#contact');
  await expect(contact).toContainText(
    'Open to design engineering and full-stack roles, in Buenos Aires or remote (UTC−3). Spanish (native), English (professional, spoken and written).',
  );
  await expect(contact.getByRole('link', { name: 'valentino.rota3@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:valentino.rota3@gmail.com',
  );
  await expect(contact.locator('[data-mail-text]')).toHaveText('valentino.rota3@gmail.com');
});

test('the About copy keeps the body line height, the lede its own', async ({ page }) => {
  await page.goto('/');
  /** Line height as a multiple of the font size, as the type scale states it. */
  const leading = (text: string) =>
    page.getByText(text).evaluate((p) => {
      const { lineHeight, fontSize } = getComputedStyle(p);
      return parseFloat(lineHeight) / parseFloat(fontSize);
    });
  expect(await leading('I like problems where the interface')).toBeCloseTo(1.55, 2);
  expect(await leading('Before I call something done')).toBeCloseTo(1.55, 2);
  expect(await leading('Five years building production web apps.')).toBeCloseTo(1.5, 2);
});

test('the home has no axe violations and no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  await expectNoAxeViolations(page);
  await expectNoHorizontalScroll(page);
});
