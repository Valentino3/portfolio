import { expect, test, type Locator } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers';

const pages = ['/', '/work/stock-tienda', '/work/conosur', '/work/dsp2', '/work/analyzer', '/work/bakery-concept'];

for (const p of pages) {
  test(`axe + no h-scroll ${p}`, async ({ page }) => {
    await page.goto(p);
    await expectNoAxeViolations(page);
    await expectNoHorizontalScroll(page);
  });
}

// Creates its own contexts, so only the desktop project runs it (ruling R8).
test('no horizontal scroll from 320 to 1920, also with 200% text at 320', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  test.setTimeout(120_000);
  for (const width of [320, 768, 1024, 1180, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    try {
      for (const p of pages) {
        const page = await context.newPage();
        await page.goto(p);
        if (width === 320) await page.addStyleTag({ content: 'html{font-size:200%}' });
        await expectNoHorizontalScroll(page);
        await page.close();
      }
    } finally {
      await context.close();
    }
  }
});

test('with text at 200% on 320 px, the mail and "Next project" stay inside the viewport', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
  try {
    for (const p of ['/', '/work/conosur']) {
      const page = await context.newPage();
      await page.goto(p);
      await page.addStyleTag({ content: 'html{font-size:200%}' });
      const targets: Locator[] = [page.locator('#contact a[href^="mailto:"]')];
      if (p !== '/') targets.push(page.getByRole('link', { name: /Next project/ }));
      for (const target of targets) {
        await target.scrollIntoViewIfNeeded();
        const box = await target.boundingBox();
        expect(box!.x, `${p} left edge`).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width, `${p} right edge`).toBeLessThanOrEqual(320);
      }
      await page.close();
    }
  } finally {
    await context.close();
  }
});

test('open graph uses absolute urls and images render', async ({ page, request }) => {
  await page.goto('/work/conosur');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toMatch(/^https?:\/\//);
  const res = await request.get(new URL(og!).pathname);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('the home has a 1200x630 open graph image, and the sitemap and robots list the site', async ({ page, request }) => {
  await page.goto('/');
  const meta = (property: string) => page.locator(`meta[property="${property}"]`).getAttribute('content');
  const og = await meta('og:image');
  expect(og).toMatch(/^https?:\/\//);
  expect([await meta('og:image:width'), await meta('og:image:height')]).toEqual(['1200', '630']);
  const image = await request.get(new URL(og!).pathname);
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/png');
  const png = await image.body();
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);

  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toMatch(/<loc>https?:\/\/[^<]+\/<\/loc>/);
  for (const p of pages.slice(1)) expect(sitemap).toMatch(new RegExp(`<loc>https?://[^<]+${p}</loc>`));

  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/Allow: \//);
  expect(robots).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
});

test('every internal link resolves', async ({ page, request }) => {
  for (const p of pages) {
    await page.goto(p);
    for (const href of await page.locator('a[href^="/"]').evaluateAll((a) => a.map((x) => x.getAttribute('href')!)))
      expect((await request.get(href.split('#')[0] || '/')).status(), href).toBe(200);
  }
});

/** Every image that is actually laid out must have decoded: a broken src gives naturalWidth 0. */
async function expectVisibleImagesLoaded(images: Locator) {
  const count = await images.count();
  let checked = 0;
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    if (!(await img.evaluate((el) => el.getClientRects().length > 0))) continue; // display: none
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), {
        message: (await img.getAttribute('src')) ?? 'image',
      })
      .toBe(true);
    checked++;
  }
  return checked;
}

test('home thumbnails (first and lower rows, or the viewer) and case images load', async ({ page }) => {
  await page.goto('/');
  // Below the viewer breakpoint the rows show their own thumbnails; above it the viewer holds all five.
  // The viewer's images mount after hydration, so wait for the five to exist before checking them.
  const thumbnails = page.locator('#work figure img:visible, [data-viewer] img');
  await expect(thumbnails).toHaveCount(5);
  expect(await expectVisibleImagesLoaded(thumbnails)).toBe(5);

  await page.goto('/work/stock-tienda');
  expect(await expectVisibleImagesLoaded(page.locator('main img'))).toBeGreaterThan(0);
});
