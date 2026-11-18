import { expect, test } from '@playwright/test';
import { AVAILABILITY } from '@/content/profile';
import { publishedProjects } from '@/content/projects';
import { CV_URL, EMAIL, GITHUB, LINKEDIN, SITE_URL } from '@/lib/site';
import { PHONE_LIKE } from '../support/phone';
import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers';

const projects = publishedProjects();

/** Pages in a PDF: every page object, not the page tree (`/Type /Pages`). */
const pageCount = (pdf: Buffer) => (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;

test('the CV page: name, headline, where, and every way to reach the owner', async ({ page }) => {
  const response = await page.goto('/cv');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('CV — Valentino Rota');
  const sheet = page.locator('[data-cv-sheet]');
  await expect(sheet.getByRole('heading', { level: 1 })).toHaveText('Valentino Rota');
  await expect(sheet.locator('hgroup > h1 + p')).toHaveText('Design engineer');
  await expect(sheet).toContainText(`Mar del Plata, Argentina · ${AVAILABILITY}`);
  // Printed addresses: on paper the text is all there is.
  const contact = sheet.getByRole('list', { name: 'Contact' }).getByRole('link');
  await expect(contact).toHaveText([EMAIL, 'github.com/Valentino3', 'linkedin.com/in/valentino-rota-005011209']);
  expect(await contact.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual([
    `mailto:${EMAIL}`,
    GITHUB,
    LINKEDIN,
  ]);
  await expect(sheet.getByRole('heading', { level: 2 })).toHaveText([
    'Experience',
    'Selected work',
    'Open source',
    'Stack',
    'Education',
    'Languages',
  ]);
});

test('the CV prints each pull request address, since a number alone resolves to nothing on paper', async ({ page }) => {
  await page.goto('/cv');
  const oss = page.locator('[data-cv-sheet] section[aria-labelledby="cv-oss"]');
  await expect(oss).toContainText('github.com/prebid/prebid-server/pull/4475');
  await expect(oss).toContainText('github.com/prebid/Prebid.js/pull/14975');
});

test('the CV is kept out of search results, and points nowhere else as canonical', async ({ page }) => {
  await page.goto('/cv');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test('no phone number on the CV', async ({ page }) => {
  await page.goto('/cv');
  expect(await page.locator('body').innerText()).not.toMatch(PHONE_LIKE);
});

test('on screen it is a page of the site, with a link to the PDF', async ({ page, request }) => {
  await page.goto('/cv');
  await expect(page.locator('header#top')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
  const download = page.getByRole('link', { name: 'Download PDF' });
  await expect(download).toHaveAttribute('href', CV_URL!);
  await expect(download).toHaveAttribute('download', /.*/);
  // The server has the PDF it offers.
  const pdf = await request.get(CV_URL!);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  // It sits above the sheet, on its left edge.
  const link = await download.boundingBox();
  const sheet = await page.locator('[data-cv-sheet]').boundingBox();
  expect(link!.y + link!.height).toBeLessThanOrEqual(sheet!.y + 1);
  expect(Math.abs(link!.x - sheet!.x)).toBeLessThan(2);
});

test('printed, it is the sheet alone, on one A4 page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Printing does not depend on the viewport; once is enough.');
  await page.goto('/cv');
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('header#top')).toBeHidden();
  await expect(page.locator('footer')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toBeHidden();
  const pdf = await page.pdf({ preferCSSPageSize: true });
  expect(pageCount(pdf)).toBe(1);
  // A4 portrait, in points.
  const [, , width, height] = pdf.toString('latin1').match(/\/MediaBox\s*\[([\d.\s]+)\]/)![1].trim().split(/\s+/).map(Number);
  expect([Math.round(width), Math.round(height)]).toEqual([595, 842]);
});

test('no axe violations, no horizontal scroll on the CV', async ({ page }) => {
  await page.goto('/cv');
  await expectNoAxeViolations(page);
  await expectNoHorizontalScroll(page);
});

test('each Selected work title links to its case, by absolute address so the PDF keeps the link', async ({ page }) => {
  await page.goto('/cv');
  const work = page.locator('[data-cv-sheet] section[aria-labelledby="cv-work"]');
  const links = work.locator('li b a');
  expect(await links.count()).toBe(projects.length);
  expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(
    projects.map(({ slug }) => `${SITE_URL}/work/${slug}`),
  );
  await expect(links).toHaveText(projects.map(({ title }) => title));
});

test('on a phone every CV link is at least 44px tall; print is unchanged', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'the taller links are for phones');
  await page.goto('/cv');
  const sheet = page.locator('[data-cv-sheet]');
  // Every link on the sheet: contact, site address, project titles, PR numbers and their printed addresses.
  const targets = await sheet.getByRole('link').all();
  expect(targets.length).toBeGreaterThanOrEqual(13);
  for (const link of targets) {
    const hit = await link.evaluate((el) =>
      Math.max(el.getBoundingClientRect().height, parseFloat(getComputedStyle(el, '::before').height) || 0),
    );
    expect(hit, await link.innerText()).toBeGreaterThanOrEqual(44);
  }
  await expectNoHorizontalScroll(page);
});
