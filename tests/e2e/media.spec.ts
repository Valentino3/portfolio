import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalScroll, hydrated } from './helpers';

// Zoom links are clicked only once the page is hydrated: earlier, a click just follows the link to
// the image, which is the no-JavaScript behavior tested separately below.
const WEBSITES = /^Enlarge: Websites table/;

/** Instant, whatever the page's smooth-scroll setting says. */
async function scrollToY(page: Page, top: number) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

test('zoom opens a dialog, Escape closes it and focus returns', async ({ page }) => {
  await page.goto('/work/dsp2');
  await hydrated(page);
  const link = page.getByRole('link', { name: WEBSITES });
  await link.click();
  await expect(page.locator('dialog[open] img')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(link).toBeFocused();
});

test('the dialog shows the large image with the figure alt, and every way out returns focus to the link', async ({
  page,
}) => {
  await page.goto('/work/dsp2');
  await hydrated(page);
  const link = page.getByRole('link', { name: WEBSITES });
  const dialog = page.getByRole('dialog', { name: 'Enlarged image' });
  const image = dialog.getByRole('img', { name: /^Websites table with search, top emotions per site/ });

  await link.click();
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', '/img/dsp2-websites.webp');
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  // It never runs past the visible part of the viewport (on a phone, the browser's bars take some).
  expect(await dialog.evaluate((d) => d.getBoundingClientRect().bottom <= window.innerHeight)).toBe(true);

  // The Close button.
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();
  await expect(link).toBeFocused();
  // Closed, the dialog no longer holds the big image.
  await expect(page.locator('dialog img')).toHaveCount(0);

  // A click on the backdrop, outside the picture.
  await link.click();
  await expect(image).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).toBeHidden();
  await expect(link).toBeFocused();

  // A click on the picture itself keeps it open.
  await link.click();
  await image.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('the case hero can be enlarged too', async ({ page }) => {
  await page.goto('/work/dsp2');
  await hydrated(page);
  await page.getByRole('link', { name: /^Enlarge: Reset GUI analytics components used in DSP2/ }).click();
  await expect(page.getByRole('dialog').getByRole('img')).toHaveAttribute('src', '/img/dsp2-hero.webp');
});

test('without JS the zoom link opens the large image', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/work/dsp2');
  const href = await page.getByRole('link', { name: WEBSITES }).getAttribute('href');
  expect(href).toBe('/img/dsp2-websites.webp');
  expect((await page.request.get(href!)).status()).toBe(200);
  await context.close();
});

test('without JS a clip shows its poster and no dead Play button', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/work/conosur');
  const video = page.locator('video[data-clip]');
  const poster = await video.getAttribute('poster');
  expect(poster).toBe('/media/conosur-releases-poster.webp');
  expect((await page.request.get(poster!)).status()).toBe(200);
  await expect(page.getByRole('button', { name: /^(Play|Pause)$/ })).toHaveCount(0);
  await context.close();
});

test('clip plays when visible and can be paused', async ({ page }) => {
  await page.goto('/work/conosur');
  await hydrated(page);
  const v = page.locator('video[data-clip]');
  const paused = () => v.evaluate((e: HTMLVideoElement) => e.paused);
  await v.scrollIntoViewIfNeeded();
  await expect.poll(paused).toBe(false);
  await page.getByRole('button', { name: 'Pause' }).click();
  expect(await paused()).toBe(true);
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
});

test('a clip has a text alternative and a visible caption, and the button never claims a pressed state', async ({
  page,
}) => {
  await page.goto('/work/conosur');
  const figure = page.locator('figure', { has: page.locator('video[data-clip]') });
  await expect(figure.locator('video')).toHaveAttribute('aria-label', /^Screen recording: the home scrolls into the releases/);
  await expect(figure.locator('video')).toHaveAttribute('poster', '/media/conosur-releases-poster.webp');
  await expect(figure.locator('video')).toHaveAttribute('preload', 'none');
  await expect(figure.locator('source')).toHaveAttribute('src', '/media/conosur-releases.webm');
  await expect(figure.locator('figcaption')).toContainText('Motion: scrolling into releases and switching between them');
  // The provenance note is said once per case, on the hero; the clip is not an exception.
  await expect(figure.locator('figcaption')).not.toContainText('conosur.tv');
  await expect(figure.locator('figcaption')).not.toContainText('recorded');
  // Ruling R5: the label itself says what the button does, so there is no aria-pressed on top of it.
  await expect(figure.getByRole('button', { name: /^(Play|Pause)$/ })).not.toHaveAttribute('aria-pressed', /.*/);
});

test('a clip pauses when it leaves the view and resumes when it returns, unless the visitor paused it', async ({
  page,
}) => {
  await page.goto('/work/conosur');
  await hydrated(page);
  const v = page.locator('video[data-clip]');
  const paused = () => v.evaluate((e: HTMLVideoElement) => e.paused);
  await v.scrollIntoViewIfNeeded();
  await expect.poll(paused).toBe(false);

  // Away: the observer stops it, and the button follows.
  await scrollToY(page, 0);
  await expect.poll(paused).toBe(true);
  // Back: it plays again.
  await v.scrollIntoViewIfNeeded();
  await expect.poll(paused).toBe(false);
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();

  // The visitor pauses it: leaving and returning must not restart it.
  await page.getByRole('button', { name: 'Pause' }).click();
  await scrollToY(page, 0);
  await page.waitForTimeout(300);
  await v.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await paused()).toBe(true);
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();

  // And Play puts it back under the visitor's control.
  await page.getByRole('button', { name: 'Play' }).click();
  expect(await paused()).toBe(false);
});

test('the stock tienda counter clip plays in view, pauses out of it, at its own size', async ({ page }) => {
  await page.goto('/work/stock-tienda');
  await hydrated(page);
  const v = page.locator('#design video[data-clip]');
  await expect(v).toHaveAttribute('poster', '/media/stock-counter-poster.webp');
  await expect(v).toHaveAttribute('width', '1952');
  await expect(v).toHaveAttribute('height', '1226');
  // It comes after the section's intro, before the first decision.
  const [intro, clip, decision] = await Promise.all([
    page.locator('#design > p').first().boundingBox(),
    v.boundingBox(),
    page.locator('#design article').first().boundingBox(),
  ]);
  expect(intro!.y).toBeLessThan(clip!.y);
  expect(clip!.y).toBeLessThan(decision!.y);
  const figure = page.locator('#design figure:has(video[data-clip])');
  await expect(figure.locator('figcaption')).toHaveText(
    'A counter sale: search, quantity, cash price list, charge',
  );

  const paused = () => v.evaluate((e: HTMLVideoElement) => e.paused);
  await v.scrollIntoViewIfNeeded();
  await expect.poll(paused).toBe(false);
  // The reserved box has the clip's proportions: nothing letterboxed, nothing cropped.
  const box = (await v.boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(1952 / 1226, 1);
  await scrollToY(page, 0);
  await expect.poll(paused).toBe(true);
  await v.scrollIntoViewIfNeeded();
  await expect.poll(paused).toBe(false);
  await figure.getByRole('button', { name: 'Pause' }).click();
  expect(await paused()).toBe(true);
});

test('the bakery shows three direction figures, each opening its own zoom', async ({ page }, testInfo) => {
  await page.goto('/work/bakery-concept');
  await hydrated(page);
  const captions = ['A editorial', 'B immersive', 'C grid'];
  const figures = page.locator('#directions figure', { has: page.locator('a[href^="/img/bakery-direction-"]') });
  await expect(figures).toHaveCount(3);
  await expect(figures.locator('figcaption')).toHaveText(captions);
  const boxes = await Promise.all([0, 1, 2].map(async (i) => (await figures.nth(i).boundingBox())!));
  if (testInfo.project.name === 'desktop') {
    // Three columns: one row, side by side.
    expect(new Set(boxes.map((b) => Math.round(b.y))).size).toBe(1);
    expect(boxes[0].x).toBeLessThan(boxes[1].x);
    expect(boxes[1].x).toBeLessThan(boxes[2].x);
  } else {
    // One column: stacked, each the full width.
    expect(boxes[0].y).toBeLessThan(boxes[1].y);
    expect(boxes[1].y).toBeLessThan(boxes[2].y);
    expect(boxes[0].width).toBeCloseTo(boxes[1].width, 0);
  }
  const dialog = page.getByRole('dialog', { name: 'Enlarged image' });
  for (const [i, letter] of ['a', 'b', 'c'].entries()) {
    const link = page.getByRole('link', { name: `Enlarge: ${captions[i]}` });
    await link.click();
    await expect(dialog.getByRole('img')).toHaveAttribute('src', `/img/bakery-direction-${letter}.webp`);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();
  }
  // The old single strip is gone.
  await expect(page.locator('img[src*="bakery-directions"]')).toHaveCount(0);
});

test('reduced motion: clip does not autoplay', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/work/conosur');
  // Hydrated first, so the wait below gives the clip a real chance to start.
  await hydrated(page);
  const v = page.locator('video[data-clip]');
  await v.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  // It still plays when the visitor asks.
  await page.getByRole('button', { name: 'Play' }).click();
  expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await context.close();
});

test('a gallery has two columns, a wide figure takes the whole row, and on a phone it is one column', async ({
  page,
}, testInfo) => {
  await page.goto('/work/dsp2');
  const figures = page.locator('#interface figure');
  await expect(figures).toHaveCount(3);
  const [wide, wideToo, half] = await Promise.all([0, 1, 2].map((i) => figures.nth(i).boundingBox()));
  const gallery = (await figures.first().locator('xpath=..').boundingBox())!;
  expect(wide!.width).toBeCloseTo(gallery.width, 0);
  expect(wideToo!.width).toBeCloseTo(gallery.width, 0);
  if (testInfo.project.name === 'desktop') {
    // Two columns, 20px apart: the lone half-width figure is a bit under half the row.
    expect(half!.width).toBeCloseTo((gallery.width - 20) / 2, 0);
  } else {
    expect(half!.width).toBeCloseTo(gallery.width, 0);
  }
});

test('every gallery image loads, and its declared size matches the file', async ({ page }) => {
  await page.goto('/work/dsp2');
  const images = page.locator('#interface img');
  await expect(images).toHaveCount(3);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    // A wrong width or height in the content would reserve the wrong space and shift the layout.
    // (The served copy is resized and rounded to whole pixels, hence the tolerance.)
    const { natural, declared } = await image.evaluate((img: HTMLImageElement) => ({
      natural: img.naturalWidth / img.naturalHeight,
      declared: Number(img.getAttribute('width')) / Number(img.getAttribute('height')),
    }));
    expect(natural / declared).toBeCloseTo(1, 1);
  }
});

test('axe and horizontal scroll are clean on the case pages with media, with the dialog open once', async ({
  page,
}) => {
  for (const slug of ['dsp2', 'conosur']) {
    await page.goto(`/work/${slug}`);
    await hydrated(page);
    await expectNoAxeViolations(page);
    await expectNoHorizontalScroll(page);
  }
  await page.goto('/work/dsp2');
  await hydrated(page);
  const link = page.getByRole('link', { name: WEBSITES });
  await link.click();
  await expect(page.locator('dialog[open] img')).toBeVisible();
  await expectNoAxeViolations(page);
  await expectNoHorizontalScroll(page);
  await page.keyboard.press('Escape');
  await expect(link).toBeFocused();
});
