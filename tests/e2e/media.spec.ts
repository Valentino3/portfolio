import { expect, test, type Locator, type Page } from '@playwright/test';
import { CLIPS, type ClipName } from '@/content/clips';
import { expectNoAxeViolations, expectNoHorizontalScroll, hydrated } from './helpers';

// Zoom links are clicked only once the page is hydrated: earlier, a click just follows the link to
// the image, which is the no-JavaScript behavior tested separately below.
const WEBSITES = /^Enlarge: Websites table/;
/** The DSP2 interface gallery: the grid of figures that is not a before/after pair. */
const GALLERY = '#interface > div.grid:not([data-before-after])';

/** Instant, whatever the page's smooth-scroll setting says. */
async function scrollToY(page: Page, top: number) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

/**
 * A clip's poster is an `<img>` under the video, at the size the registry gives: not the video's
 * own `poster` attribute, which the browser fetches while it parses the page, below the fold too.
 * Its `src` comes only when the clip is near the screen (see `expectPosterLoaded`).
 */
async function expectPosterImage(figure: Locator, name: ClipName) {
  const { width, height } = CLIPS[name];
  const img = figure.locator('img[data-clip-poster]');
  await expect(img).toHaveCount(1);
  await expect(img).toHaveAttribute('width', String(width));
  await expect(img).toHaveAttribute('height', String(height));
  await expect(img).toHaveAttribute('loading', 'lazy');
  // The video carries the text alternative; the poster is the same frame.
  await expect(img).toHaveAttribute('alt', '');
  await expect(figure.locator('video')).not.toHaveAttribute('poster', /.*/);
}

/** The image has been fetched and decoded. */
const decoded = (img: Locator) => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);

/** Scrolls the clip into view: its poster gets its `src`, and loads. */
async function expectPosterLoaded(figure: Locator, name: ClipName) {
  const img = figure.locator('img[data-clip-poster]');
  await figure.locator('video').scrollIntoViewIfNeeded();
  await expect(img).toHaveAttribute('src', `/media/${name}-poster.webp`);
  await expect.poll(() => decoded(img), { message: name }).toBe(true);
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
  const figure = page.locator('figure:has(video[data-clip])');
  // Nothing gives the poster img a src without script, so the page carries it in a noscript too.
  const poster = figure.locator('img[src="/media/conosur-releases-poster.webp"]');
  await expect(poster).toHaveCount(1);
  await expect(poster).toHaveAttribute('width', String(CLIPS['conosur-releases'].width));
  await expect(poster).toHaveAttribute('height', String(CLIPS['conosur-releases'].height));
  expect((await page.request.get('/media/conosur-releases-poster.webp')).status()).toBe(200);
  await poster.scrollIntoViewIfNeeded();
  await expect.poll(() => decoded(poster)).toBe(true);
  await expect(poster).toBeVisible();
  // The poster fills the clip's box, and the video is there but never shown over it.
  const [frame, shown] = await Promise.all([figure.locator('video').boundingBox(), poster.boundingBox()]);
  expect(shown).toEqual(frame);
  await expect(figure.locator('video')).not.toHaveAttribute('poster', /.*/);
  await expect(figure.locator('video')).toHaveCSS('opacity', '0');
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
  // Invisible until it is really playing, then it fades in over the poster.
  await expect(v).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'Pause' }).click();
  expect(await paused()).toBe(true);
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  // A paused clip keeps the frame it stopped at on screen.
  await expect(v).toHaveCSS('opacity', '1');
});

test('a clip has a text alternative and a visible caption, and the button never claims a pressed state', async ({
  page,
}) => {
  await page.goto('/work/conosur');
  const figure = page.locator('figure', { has: page.locator('video[data-clip]') });
  await expect(figure.locator('video')).toHaveAttribute('aria-label', /^Screen recording of the releases section: the cursor picks/);
  await expectPosterImage(figure, 'conosur-releases');
  await expect(figure.locator('video')).toHaveAttribute('preload', 'none');
  await expect(figure.locator('source')).toHaveAttribute('src', '/media/conosur-releases.webm');
  await expect(figure.locator('figcaption')).toContainText('Releases: picking a release swaps the cover, the title and the Spotify player in place.');
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
  await expectPosterImage(page.locator('#design figure:has(video[data-clip])'), 'stock-counter');
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
  const poster = page.locator('img[data-clip-poster]');
  await expectPosterLoaded(page.locator('figure:has(video[data-clip])'), 'conosur-releases');
  await page.waitForTimeout(800);
  expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  // What shows is the poster: loaded, in view, with the video still invisible over it.
  await expect(poster).toBeInViewport();
  await expect(v).toHaveCSS('opacity', '0');
  // It still plays when the visitor asks, and then the video is what shows.
  await page.getByRole('button', { name: 'Play' }).click();
  expect(await v.evaluate((e: HTMLVideoElement) => e.paused)).toBe(false);
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await expect(v).toHaveCSS('opacity', '1');
  // Paused again, it stays shown.
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(v).toHaveCSS('opacity', '1');
  await context.close();
});

test('a gallery has two columns, a wide figure takes the whole row, and on a phone it is one column', async ({
  page,
}, testInfo) => {
  await page.goto('/work/dsp2');
  const figures = page.locator(`${GALLERY} > figure`);
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
  const images = page.locator(`${GALLERY} img`);
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

test('the dsp2 weights clip plays in view, pauses out of it, and is shown narrow at its own proportions', async ({
  page,
}, testInfo) => {
  await page.goto('/work/dsp2');
  await hydrated(page);
  const v = page.locator('#interface video[data-clip]');
  await expectPosterImage(page.locator('#interface figure:has(video[data-clip])'), 'dsp2-weights');
  await expect(v).toHaveAttribute('width', '1764');
  await expect(v).toHaveAttribute('height', '2013');
  const figure = page.locator('#interface figure:has(video[data-clip])');
  const paused = () => v.evaluate((e: HTMLVideoElement) => e.paused);
  await v.scrollIntoViewIfNeeded();
  await expect.poll(paused).toBe(false);

  const [box, text, column] = await Promise.all([
    v.boundingBox(),
    page.locator('#interface > p').first().boundingBox(),
    page.locator('#interface').boundingBox(),
  ]);
  expect(box!.width / box!.height).toBeCloseTo(1764 / 2013, 1);
  // Aligned with the text column, never wider than 32rem; on a phone, the column's width.
  expect(box!.x).toBeCloseTo(text!.x, 0);
  if (testInfo.project.name === 'desktop') expect(box!.width).toBeLessThanOrEqual(512);
  else expect(box!.width).toBeCloseTo(column!.width, 0);
  // Its whole height fits the window, so it can be watched without scrolling.
  expect(box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);

  await scrollToY(page, 0);
  await expect.poll(paused).toBe(true);
  await v.scrollIntoViewIfNeeded();
  await expect.poll(paused).toBe(false);
  await figure.getByRole('button', { name: 'Pause' }).click();
  expect(await paused()).toBe(true);
  await expect(figure.getByRole('button', { name: 'Play' })).toBeVisible();
});

test('reduced motion: the dsp2 and the new conosur clip stay paused until Play', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const [slug, name] of [
    ['dsp2', 'dsp2-weights'],
    ['conosur', 'conosur-releases'],
  ] as const) {
    await page.goto(`/work/${slug}`);
    await hydrated(page);
    const v = page.locator('video[data-clip]');
    const figure = page.locator('figure:has(video[data-clip])');
    await expectPosterImage(figure, name);
    await expectPosterLoaded(figure, name);
    await page.waitForTimeout(800);
    expect(await v.evaluate((e: HTMLVideoElement) => e.paused), slug).toBe(true);
    await expect(figure.locator('img[data-clip-poster]'), slug).toBeInViewport();
    await expect(v, slug).toHaveCSS('opacity', '0');
    await figure.getByRole('button', { name: 'Play' }).click();
    expect(await v.evaluate((e: HTMLVideoElement) => e.paused), slug).toBe(false);
    await expect(figure.getByRole('button', { name: 'Pause' })).toBeVisible();
  }
  await context.close();
});

/** Paths of the poster files the page asks for, from now on. */
function watchPosterRequests(page: Page): string[] {
  const requested: string[] = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith('/media/') && pathname.endsWith('-poster.webp')) requested.push(pathname);
  });
  return requested;
}

test('clip posters are not fetched with the page: only when their clip comes near the screen', async ({ page }) => {
  // The browser's own lazy loading would not do: Chromium loads images up to about 2500px below the
  // screen, and on the bakery page the clip is under one screen down, so its poster came with the
  // page, in competition with the hero.
  const requested = watchPosterRequests(page);
  for (const [slug, name] of [
    ['bakery-concept', 'bakery-scroll'],
    ['stock-tienda', 'stock-counter'],
    ['conosur', 'conosur-releases'],
    ['dsp2', 'dsp2-weights'],
  ] as const) {
    requested.length = 0;
    await page.goto(`/work/${slug}`);
    await hydrated(page);
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => window.scrollY), slug).toBe(0);
    expect(requested, `${slug}: poster requests before scrolling`).toEqual([]);

    // Near the clip, the poster is fetched, and only that one.
    await expectPosterLoaded(page.locator('figure:has(video[data-clip])'), name);
    expect(requested, slug).toEqual([`/media/${name}-poster.webp`]);
  }
});

test('a poster is ready before its clip comes into view', async ({ page }) => {
  const requested = watchPosterRequests(page);
  await page.goto('/work/bakery-concept');
  await hydrated(page);
  const poster = page.locator('img[data-clip-poster]');
  const clip = page.locator('video[data-clip]');
  // The clip is 300px below the bottom of the screen: not in view, but its poster is on its way.
  await clip.evaluate((el) => {
    const gap = el.getBoundingClientRect().top - window.innerHeight;
    window.scrollTo({ top: window.scrollY + gap - 300, behavior: 'instant' });
  });
  await expect(clip).not.toBeInViewport();
  await expect.poll(() => decoded(poster)).toBe(true);
  expect(requested).toEqual(['/media/bakery-scroll-poster.webp']);
  // The clip does not play until it is in view: the poster is what comes first.
  expect(await clip.evaluate((e: HTMLVideoElement) => e.paused)).toBe(true);
});

test('the clip pages hydrate without console errors', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  for (const slug of ['bakery-concept', 'stock-tienda', 'conosur', 'dsp2']) {
    await page.goto(`/work/${slug}`);
    await hydrated(page);
    await page.locator('video[data-clip]').scrollIntoViewIfNeeded();
    await expect(page.locator('img[data-clip-poster]')).toHaveAttribute('src', /-poster[.]webp$/);
  }
  expect(problems).toEqual([]);
});

test('the new conosur clip keeps its own proportions', async ({ page }) => {
  await page.goto('/work/conosur');
  const v = page.locator('video[data-clip]');
  await expect(v).toHaveAttribute('width', '2304');
  await expect(v).toHaveAttribute('height', '1720');
  await v.scrollIntoViewIfNeeded();
  const box = (await v.boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(2304 / 1720, 1);
});

test('the re-recorded bakery clip: its own size, its caption and what it shows', async ({ page }) => {
  await page.goto('/work/bakery-concept');
  const figure = page.locator('figure:has(video[data-clip])');
  const v = figure.locator('video');
  await expect(v).toHaveAttribute('width', '2560');
  await expect(v).toHaveAttribute('height', '1600');
  await expectPosterImage(figure, 'bakery-scroll');
  await expect(figure.locator('figcaption')).toHaveText(
    'Bakery concept: the hero enters, the buttons answer the pointer, and the scroll carries the cutouts into the manifesto.',
  );
  await expect(v).toHaveAttribute('aria-label', /into the manifesto ‘El buen pan se hace con tiempo\.’$/);
  await v.scrollIntoViewIfNeeded();
  const box = (await v.boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(2560 / 1600, 1);
});

test('before/after pairs: the tables one above the other at every width, the charts side by side from 640px, each opening its own zoom', async ({
  page,
}, testInfo) => {
  await page.goto('/work/dsp2');
  await hydrated(page);
  const pairs = page.locator('#interface [data-before-after]');
  await expect(pairs).toHaveCount(4);
  const column = (await page.locator('#interface').boundingBox())!;
  for (let i = 0; i < 4; i++) {
    const figures = pairs.nth(i).locator('figure');
    const [before, after] = [(await figures.nth(0).boundingBox())!, (await figures.nth(1).boundingBox())!];
    const table = i < 2;
    await expect(pairs.nth(i)).toHaveAttribute('data-before-after', table ? 'stack' : 'side');
    if (table || testInfo.project.name !== 'desktop') {
      // Before above after, each the column's full width.
      expect(before.y + before.height).toBeLessThan(after.y);
      expect(before.x).toBeCloseTo(after.x, 0);
      expect(before.width).toBeCloseTo(column.width, 0);
      expect(after.width).toBeCloseTo(column.width, 0);
    } else {
      expect(Math.round(before.y)).toBe(Math.round(after.y));
      expect(before.x).toBeLessThan(after.x);
      expect(before.width).toBeCloseTo(after.width, 0);
    }
  }
  const dialog = page.getByRole('dialog', { name: 'Enlarged image' });
  for (const [caption, file] of [
    ['Before: colour only', 'dsp2-badges-before'],
    ['After: rank beside each arrow', 'dsp2-sort-after'],
    ['After: bands by strength', 'dsp2-matches-after'],
  ]) {
    const link = page.getByRole('link', { name: `Enlarge: ${caption}`, exact: true });
    await link.click();
    await expect(dialog.getByRole('img')).toHaveAttribute('src', `/img/${file}.webp`);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();
  }
});

/** How a table picture is laid out against its frame: its scale, and which share of it shows. */
async function tableLayout(page: Page, src: string) {
  const img = page.locator(`#interface [data-before-after] img[src*="${src}"]`).first();
  await img.scrollIntoViewIfNeeded();
  return img.evaluate((el: HTMLImageElement) => {
    const frame = el.closest('figure')!.firstElementChild!.getBoundingClientRect();
    const picture = el.getBoundingClientRect();
    return {
      // The tables were captured at device scale 2: half the file's width is their size in the product.
      scale: picture.width / (Number(el.getAttribute('width')) / 2),
      from: (frame.left - picture.left) / picture.width,
      to: (frame.right - picture.left) / picture.width,
      // The strip keeps the table's full height.
      tall: Math.abs(frame.height - picture.height) <= 1,
    };
  });
}

test('table pairs: whole and at the column width on a desktop; on a phone the strip that holds what changed', async ({
  page,
}, testInfo) => {
  await page.goto('/work/dsp2');
  for (const src of ['badges-before', 'badges-after', 'sort-before', 'sort-after']) {
    const { scale, from, to, tall } = await tableLayout(page, src);
    expect(tall, src).toBe(true);
    expect(from, src).toBeGreaterThanOrEqual(-0.001);
    expect(to, src).toBeLessThanOrEqual(1.001);
    if (testInfo.project.name === 'desktop') {
      // The whole table, at about 70% of its size in the product: the badge scores and rank digits read.
      expect(from, src).toBeCloseTo(0, 2);
      expect(to, src).toBeCloseTo(1, 2);
      expect(scale, src).toBeGreaterThanOrEqual(0.65);
    } else if (src.startsWith('badges')) {
      // The badge column alone, at its size in the product or larger.
      expect(scale, src).toBeGreaterThanOrEqual(0.9);
      expect(from, src).toBeLessThanOrEqual(0.39);
      expect(to, src).toBeGreaterThanOrEqual(0.7);
    } else {
      // Both ranked headers: Website (its 1 at about 0.19 of the width) to the Propensity arrow (0.98).
      expect(from, src).toBeLessThanOrEqual(0.1);
      expect(to, src).toBeGreaterThanOrEqual(0.995);
    }
  }
});
