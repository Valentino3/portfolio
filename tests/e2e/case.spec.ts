import { expect, test } from '@playwright/test';
import { publishedProjects } from '@/content/projects';
import { diagramLabelsOutsideBoxes, expectNoAxeViolations, expectNoHorizontalScroll, hydrated } from './helpers';

// In-page links are clicked only once the page is hydrated: earlier, a click is a native jump,
// the very thing the Back test below guards against.
const TOC = 'nav[aria-label="On this page"]';

const NEXT = /^Next: /;

test('the next case is one line, "Next: Title"', async ({ page }) => {
  await page.goto('/work/stock-tienda');
  const next = page.getByRole('link', { name: NEXT });
  await expect(next).toHaveAttribute('href', '/work/conosur');
  await expect(next).toHaveAccessibleName('Next: Conosur');
});

test('every published case is generated, and the last one cycles back to the first', async ({ page }) => {
  const cases = publishedProjects();
  for (const project of cases) {
    await page.goto(`/work/${project.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title);
    // The facts open with whose work it was and when, as a sentence.
    await expect(page.locator('[data-case-meta] p').first()).toContainText(`${project.context}, ${project.years}.`);
  }
  await expect(page.getByRole('link', { name: NEXT })).toHaveAttribute('href', `/work/${cases[0].slug}`);
});

test('the template follows the prototype: back link, facts, hero, outcomes, sections, contact', async ({ page }) => {
  await page.goto('/work/stock-tienda');
  await expect(page).toHaveTitle('Stock Tienda — Valentino Rota');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Stock, point of sale and cash control for small stores. Built and run by me; three stores pay for it.',
  );
  const main = page.locator('main');
  await expect(main.getByRole('link', { name: 'All work' })).toHaveAttribute('href', '/#work');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Stock Tienda');
  await expect(main).toContainText('Software for small stores to sell at the counter');
  // The facts are sentences: no label-over-value grid anywhere in the case.
  await expect(main.locator('dl')).toHaveCount(0);
  await expect(main.getByRole('link', { name: 'Repository (public) (opens in a new tab)' })).toHaveAttribute(
    'href',
    'https://github.com/Valentino3/stock-tienda',
  );

  // The hero is the likely LCP element: it skips the lazy loader.
  const hero = main.locator('figure').first();
  await expect(hero.locator('img')).toHaveAttribute('fetchpriority', 'high');
  await expect(hero.locator('img')).toHaveAttribute('alt', /^Reports screen/);
  await expect(hero.locator('figcaption')).toContainText('Reports: period total, low stock and cash closings');
  await expect(hero.locator('figcaption')).toContainText('test store, demo data');

  const outcomes = main.getByRole('list', { name: 'Outcomes' });
  await expect(outcomes.locator('li b')).toHaveText([
    'Three stores pay for it',
    'It keeps selling offline',
    'Electronic invoicing with ARCA',
  ]);

  // No numbering: a section heading is its name and nothing else.
  for (const name of ['Context', 'Engineering decisions'])
    await expect(main.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
  await expect(main.locator('#context h2')).toHaveText('Context');
  // Contact names its section for assistive tech only: the address is the visible heading.
  await expect(main.getByRole('heading', { level: 2, name: 'Contact', exact: true })).toHaveClass(/\bsr\b/);
  await expect(main.locator('#contact a[href="mailto:valentino.rota3@gmail.com"]')).toBeVisible();
});

test('desktop toc marks the section in view', async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.goto('/work/stock-tienda');
  await page.locator('#context').scrollIntoViewIfNeeded();
  await expect(page.locator(`${TOC} a[aria-current="location"]`)).toHaveText('Context');

  // The index follows the band at 30-40% of the viewport: put the next section's top inside it.
  await page.evaluate(() => {
    const top = document.getElementById('engineering')!.getBoundingClientRect().top;
    window.scrollTo({ top: scrollY + top - innerHeight * 0.35, behavior: 'instant' });
  });
  await expect(page.locator(`${TOC} a[aria-current="location"]`)).toHaveText('Engineering decisions');

  // Back above the first section, nothing is current.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator(`${TOC} a[aria-current]`)).toHaveCount(0);
});

test('mobile shows a collapsible index', async ({ page, isMobile }) => {
  test.skip(!isMobile);
  await page.goto('/work/stock-tienda');
  await expect(page.locator('details summary', { hasText: 'On this page' })).toBeVisible();
  await expect(page.locator(TOC)).toBeHidden();
});

test('an index link moves focus to its section, as a native jump would', async ({ page, isMobile }) => {
  await page.goto('/work/stock-tienda');
  await hydrated(page);
  if (isMobile) await page.locator('details summary', { hasText: 'On this page' }).click();
  await page.locator(isMobile ? 'details' : TOC).getByRole('link', { name: 'Engineering decisions' }).click();
  // Tab now continues inside the section, and a screen reader lands on it.
  await expect(page.locator('#engineering')).toBeFocused();
});

test('an in-page link, then another case, then Back restores the first case', async ({ page, isMobile }) => {
  await page.goto('/work/stock-tienda');
  await hydrated(page);
  if (isMobile) await page.locator('details summary', { hasText: 'On this page' }).click();
  const index = page.locator(isMobile ? 'details' : TOC);
  await index.getByRole('link', { name: 'Engineering decisions' }).click();
  await expect(page).toHaveURL(/\/work\/stock-tienda#engineering$/);

  await page.getByRole('link', { name: NEXT }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Conosur');

  await page.goBack();
  await expect(page).toHaveURL(/\/work\/stock-tienda#engineering$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stock Tienda');
});

test('diagram labels stay inside boxes, also with the fallback font', async ({ page }) => {
  await page.goto('/work/stock-tienda');
  // Not vacuous: there is a diagram, with labels inside its boxes.
  await expect(page.locator('.diagram svg rect + text').first()).toBeAttached();
  for (const font of ['Geist Mono', 'ui-monospace, Consolas, monospace'])
    expect(await diagramLabelsOutsideBoxes(page, font)).toEqual([]);
});

test('only a diagram that overflows is focusable and shows the swipe hint', async ({ page }) => {
  await page.goto('/work/stock-tienda');
  await hydrated(page);
  const diagram = page.getByRole('img', { name: /^Diagram: the counter app/ });
  const hint = page.getByText('Swipe to see the whole diagram →');

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(diagram).toHaveAttribute('tabindex', '0');
  await expect(hint).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(diagram).not.toHaveAttribute('tabindex');
  await expect(hint).toBeHidden();
});

test('before the script runs, a phone can reach the overflowing diagram by keyboard, and axe passes', async ({
  page,
}) => {
  await page.route('**/_next/static/chunks/*.js', (route) => route.abort());
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/work/stock-tienda');
  const diagram = page.getByRole('img', { name: /^Diagram: the counter app/ });
  // Not vacuous: the drawing overflows, and no script has run to measure it.
  expect(await diagram.evaluate((d) => d.scrollWidth > d.clientWidth + 1)).toBe(true);
  await expect(page.locator('html')).not.toHaveAttribute('data-hydrated');
  await expect(diagram).toHaveAttribute('tabindex', '0');
  await expectNoAxeViolations(page);
});

test('the reading progress bar follows the scroll and is removed under reduced motion', async ({ page }) => {
  await page.goto('/work/stock-tienda');
  const bar = page.locator('[data-reading-progress]');
  await expect(bar).toHaveCSS('transform', 'matrix(0, 0, 0, 1, 0, 0)');
  // To the very bottom, again until it holds: lazy content further down can still grow the page.
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      return bar.evaluate((el) => getComputedStyle(el).transform);
    })
    .toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(bar).toHaveCount(0);
});

test('the hydration signal shows up under reduced motion too, where the progress bar never mounts', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/stock-tienda');
  await hydrated(page);
  await expect(page.locator('[data-reading-progress]')).toHaveCount(0);
});

test('a case has no axe violations and no horizontal scroll', async ({ page }) => {
  await page.goto('/work/stock-tienda');
  await hydrated(page);
  // On a phone the diagram overflows: the scroll region must be focusable before axe looks at it.
  const diagram = page.getByRole('img', { name: /^Diagram: the counter app/ });
  if ((page.viewportSize()?.width ?? 0) < 640) await expect(diagram).toHaveAttribute('tabindex', '0');
  await expectNoAxeViolations(page);
  await expectNoHorizontalScroll(page);
});

test('unpublished slug is a 404', async ({ page }) => {
  const res = await page.goto('/work/not-a-project');
  expect(res?.status()).toBe(404);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a case shows every section, and back to top is a plain #top link', async ({ page }) => {
    await page.goto('/work/stock-tienda');
    for (const id of ['context', 'engineering']) await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page.locator('html')).not.toHaveAttribute('data-hydrated');
    const backToTop = page.getByRole('link', { name: /Back to top/ });
    await expect(backToTop).toHaveAttribute('href', '#top');
    await backToTop.click();
    await expect(page.locator('#top')).toBeFocused();
  });
});
