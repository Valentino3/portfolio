import { expect, test, type Locator } from '@playwright/test';
import { publishedProjects } from '@/content/projects';
import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers';

const projects = publishedProjects();
const pages = ['/', ...projects.map(({ slug }) => `/work/${slug}`)];
/** A case that does not exist (or is not published) and a URL the site never had: both get the 404 page. */
const notFound = ['/work/not-a-project', '/does-not-exist'];

for (const p of [...pages, ...notFound]) {
  test(`axe + no h-scroll ${p}`, async ({ page }) => {
    const response = await page.goto(p);
    expect(response?.status()).toBe(notFound.includes(p) ? 404 : 200);
    await expectNoAxeViolations(page);
    await expectNoHorizontalScroll(page);
  });
}

/*
 * Mono has one job: data and code. On every page, any element that sets text in the mono face
 * must sit in a figure caption, a diagram or a code element. The failure names the offending text.
 */
for (const p of [...pages, notFound[0]]) {
  test(`mono only in captions, diagrams and code on ${p}`, async ({ page }) => {
    await page.goto(p);
    await page.evaluate(() => document.fonts.ready);
    const offenders = await page.evaluate(() => {
      const family = (el: Element) => getComputedStyle(el).fontFamily.replace(/["']/g, '');
      // The face the `font-mono` utility sets, read from a probe.
      const probe = document.createElement('span');
      probe.className = 'font-mono';
      document.body.append(probe);
      const mono = family(probe).split(',')[0].trim();
      probe.remove();
      if (!mono || mono === family(document.body).split(',')[0].trim()) return ['(no mono face found)'];
      return [...document.body.querySelectorAll('*')]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim()))
        .filter((el) => family(el).startsWith(mono))
        .filter((el) => !el.closest('figcaption, .diagram, code'))
        .map((el) => `<${el.tagName.toLowerCase()}> ${el.textContent!.trim().slice(0, 60)}`);
    });
    expect(offenders).toEqual([]);
  });
}

/*
 * No eyebrows: a heading never has a small text label set right above it. Links (the way back,
 * say) are controls, not labels.
 */
for (const p of pages) {
  test(`no small label directly above a heading on ${p}`, async ({ page }) => {
    await page.goto(p);
    const eyebrows = await page.evaluate(() =>
      [...document.querySelectorAll('main h1, main h2, main h3')]
        .filter((h) => h.getBoundingClientRect().height > 0)
        .flatMap((h) => {
          const above = h.previousElementSibling;
          if (!above || above.matches('a, button, details, h1, h2, h3, figure, .diagram')) return [];
          const text = above.textContent?.trim() ?? '';
          const smaller = parseFloat(getComputedStyle(above).fontSize) < parseFloat(getComputedStyle(h).fontSize);
          return text && text.length < 40 && smaller ? [`"${text}" above "${h.textContent?.trim()}"`] : [];
        }),
    );
    expect(eyebrows).toEqual([]);
  });
}

// Creates its own contexts, so only the desktop project runs it (ruling R8).
test('no horizontal scroll from 320 to 1920, also with 200% text at 320', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  test.setTimeout(120_000);
  for (const width of [320, 768, 1024, 1180, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    try {
      for (const p of [...pages, ...notFound]) {
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

test('with text at 200% on 320 px, the mail and "Next: …" stay inside the viewport', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
  try {
    for (const p of ['/', '/work/conosur']) {
      const page = await context.newPage();
      await page.goto(p);
      await page.addStyleTag({ content: 'html{font-size:200%}' });
      const targets: Locator[] = [page.locator('#contact a[href^="mailto:"]')];
      if (p !== '/') targets.push(page.getByRole('link', { name: /^Next: / }));
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

test('the dsp2 pairs and clip and the conosur clip stay inside the viewport at 320-1920, also with 200% text', async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  test.setTimeout(120_000);
  for (const [width, text] of [
    [320, '200%'],
    [375, '200%'],
    [375, '100%'],
    [640, '100%'],
    [1024, '100%'],
    [1440, '100%'],
    [1920, '100%'],
  ] as const) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    try {
      for (const p of ['/work/dsp2', '/work/conosur']) {
        const page = await context.newPage();
        await page.goto(p);
        await page.addStyleTag({ content: `html{font-size:${text}}` });
        const media = page.locator('main [data-before-after] figure, main figure:has(video[data-clip])');
        expect(await media.count(), p).toBeGreaterThan(0);
        const outside = await media.evaluateAll((figures) =>
          figures
            .map((f) => f.getBoundingClientRect())
            .filter((r) => r.left < 0 || r.right > document.documentElement.clientWidth + 0.5)
            .map((r) => `${Math.round(r.left)}-${Math.round(r.right)}`),
        );
        expect(outside, `${p} at ${width}px, text ${text}`).toEqual([]);
        await expectNoHorizontalScroll(page);
        await page.close();
      }
    } finally {
      await context.close();
    }
  }
});

test('axe is clean on dsp2 and conosur with every picture and clip loaded', async ({ page }) => {
  for (const p of ['/work/dsp2', '/work/conosur']) {
    await page.goto(p);
    expect(await expectVisibleImagesLoaded(page.locator('main img'))).toBeGreaterThan(0);
    await page.locator('video[data-clip]').scrollIntoViewIfNeeded();
    await expectNoAxeViolations(page);
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

test('the home and a case declare an absolute canonical url and their open graph type, url and site name', async ({
  page,
}) => {
  for (const [path, type] of [
    ['/', 'website'],
    ['/work/conosur', 'article'],
  ] as const) {
    await page.goto(path);
    const meta = (property: string) => page.locator(`meta[property="${property}"]`).getAttribute('content');
    expect(await meta('og:type'), path).toBe(type);
    expect(await meta('og:site_name'), path).toBe('Valentino Rota');
    const url = await meta('og:url');
    expect(url, path).toMatch(/^https?:\/\/[^/]/);
    expect(new URL(url!).pathname, path).toBe(path);
    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', url!);
  }
});

test('responses carry the baseline security headers', async ({ request }) => {
  for (const path of ['/', '/does-not-exist']) {
    const headers = (await request.get(path)).headers();
    expect(headers['x-content-type-options'], path).toBe('nosniff');
    expect(headers['referrer-policy'], path).toBe('strict-origin-when-cross-origin');
    expect(headers['x-frame-options'], path).toBe('DENY');
    expect(headers['permissions-policy'], path).toBe('camera=(), microphone=(), geolocation=()');
  }
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
  // Below the viewer breakpoint the rows show their own thumbnails; above it the viewer holds them all.
  // The viewer's images mount after hydration, so wait for all of them to exist before checking them.
  const thumbnails = page.locator('#work figure img:visible, [data-viewer] img');
  await expect(thumbnails).toHaveCount(projects.length);
  expect(await expectVisibleImagesLoaded(thumbnails)).toBe(projects.length);

  await page.goto('/work/stock-tienda');
  expect(await expectVisibleImagesLoaded(page.locator('main img'))).toBeGreaterThan(0);
});
