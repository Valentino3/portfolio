import { expect, test } from '@playwright/test';
import { AVAILABILITY } from '@/content/profile';
import { hydrated } from './helpers';

test('header shows availability only; the location is in the footer, at every width; no clock', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('header');
  await expect(header.getByText(AVAILABILITY)).toBeVisible();
  // The strip says one thing. Where the owner lives is in the footer's copyright line, never the header.
  await expect(header.getByText('Mar del Plata')).toHaveCount(0);
  await expect(page.locator('footer').getByText('© 2026 Valentino Rota, Mar del Plata, Argentina')).toBeVisible();
  await expect(page.locator('time')).toHaveCount(0);
});

test('the primary nav is Work, About, Contact, CV, and the CV is a page of the site', async ({ page }) => {
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Primary' }).getByRole('link');
  await expect(links).toHaveText(['Work', 'About', 'Contact', 'CV']);
  await expect(links.last()).toHaveAttribute('href', '/cv');
  await expect(links.last()).not.toHaveAttribute('target', /.+/);
  // The footer leads with the CV too.
  const footerLinks = page.locator('footer nav').getByRole('link');
  await expect(footerLinks.first()).toHaveText(/^CV/);
  await expect(footerLinks.first()).toHaveAttribute('href', '/cv');
});

test('on /cv the header marks the CV link as the current page', async ({ page }) => {
  await page.goto('/cv');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link', { name: 'CV' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Work' })).not.toHaveAttribute('aria-current', /.+/);
});

test('the first Tab stop is "Skip to content", and Enter moves to the main landmark', async ({ page }) => {
  await page.goto('/');
  await hydrated(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator('main#main')).toHaveCount(1);
  // Every page's <main> is the target, the 404 and the CV included.
  for (const path of ['/cv', '/work/conosur', '/does-not-exist']) {
    await page.goto(path);
    await expect(page.locator('main#main')).toHaveCount(1);
  }
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
    await expect(page.getByText(AVAILABILITY)).toBeVisible();
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(main.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/');
    await expect(main.getByRole('link', { name: 'All work' })).toHaveAttribute('href', '/#work');
    // Every header link leads to a section of the home, or to the CV: this page has none of its own.
    const nav = page.getByRole('navigation', { name: 'Primary' }).getByRole('link');
    expect(await nav.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual([
      '/#work',
      '/#about',
      '/#contact',
      '/cv',
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

test('availability dot is a still status marker: no animation, with or without reduced motion', async ({ page }) => {
  const dot = page.locator('header [aria-hidden="true"].bg-available');
  await page.goto('/');
  await expect(dot).toBeVisible();
  await expect(dot).toHaveCSS('animation-name', 'none');
  await expect(dot).toHaveCSS('box-shadow', 'none');
});

test('on a touch screen every header, hero and footer link has a hit area of at least 44px', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'the larger hit area is for coarse pointers');
  await page.goto('/');
  const links = page.locator('header a, [data-profile-links] a, footer a');
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) {
    const hit = await link.evaluate((a) => {
      const box = a.getBoundingClientRect();
      const before = getComputedStyle(a, '::before');
      return {
        width: Math.max(box.width, parseFloat(before.width) || 0),
        height: Math.max(box.height, parseFloat(before.height) || 0),
      };
    });
    expect(hit.width, await link.innerText()).toBeGreaterThanOrEqual(44);
    expect(hit.height, await link.innerText()).toBeGreaterThanOrEqual(44);
  }
});

test('on a touch screen the copy button and the big email link are at least 44px tall', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the larger hit area is for coarse pointers');
  await page.goto('/');
  // The button grows itself; the link keeps its text height and grows its hit area with a ::before.
  for (const target of [page.getByRole('button', { name: 'Copy email' }), page.locator('#contact a[href^="mailto:"]').first()]) {
    const height = await target.evaluate((el) =>
      Math.max(el.getBoundingClientRect().height, parseFloat(getComputedStyle(el, '::before').height) || 0),
    );
    expect(height, await target.innerText()).toBeGreaterThanOrEqual(44);
  }
});

test('at 320px the name and the four links share one line, and the availability fits in three', async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto('/');
  const header = page.locator('header');
  const brand = await header.getByRole('link', { name: 'Valentino Rota' }).boundingBox();
  const cv = await header.getByRole('link', { name: 'CV' }).boundingBox();
  expect(Math.abs((brand?.y ?? 0) - (cv?.y ?? 1))).toBeLessThan(2);
  const line = await header.getByText(AVAILABILITY).boundingBox();
  // The line names four facts now (roles, remote, on-site, relocating): 14px type at a 1.55 line height,
  // three lines are under 70px. A fourth would push the page down on the smallest phone.
  expect(line?.height ?? 99).toBeLessThan(70);
  await ctx.close();
});

test('on a touch screen the case CTA email and CV link are at least 44px tall', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the larger hit area is for coarse pointers');
  await page.goto('/work/stock-tienda');
  for (const target of [page.locator('#contact a[href^="mailto:"]'), page.locator('#contact').getByRole('link', { name: 'CV', exact: true })]) {
    const height = await target.evaluate((el) =>
      Math.max(el.getBoundingClientRect().height, parseFloat(getComputedStyle(el, '::before').height) || 0),
    );
    expect(height, await target.innerText()).toBeGreaterThanOrEqual(44);
  }
});

test('on a touch screen the clip Play button and the mobile index links are at least 44px tall', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'the larger hit area is for coarse pointers');
  await page.goto('/work/stock-tienda');
  const play = page.getByRole('button', { name: /^(Play|Pause)$/ }).first();
  await play.scrollIntoViewIfNeeded();
  expect((await play.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.locator('details summary', { hasText: 'On this page' }).click();
  const links = page.locator('details').getByRole('link');
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) {
    const height = await link.evaluate((el) =>
      Math.max(el.getBoundingClientRect().height, parseFloat(getComputedStyle(el, '::before').height) || 0),
    );
    expect(height, await link.innerText()).toBeGreaterThanOrEqual(44);
  }
});
