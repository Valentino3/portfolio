import { expect, test, type Page } from '@playwright/test';
import { publishedProjects } from '@/content/projects';
import { HOVER_INTENT_MS } from '@/lib/viewer-state';
import { expectNoAxeViolations, expectNoHorizontalScroll, hydrated } from './helpers';

const EMAIL = 'valentino.rota3@gmail.com';
const projects = publishedProjects();
const last = projects.length - 1;
/** The case a row (by index) links to, and its picture as the viewer requests it. */
const work = (i: number) => `/work/${projects[i].slug}`;
const imageOf = (i: number) => new RegExp(encodeURIComponent(projects[i].image.src));

/** From here on the page's time stands still: its timers fire only when the test advances the clock. */
async function stopTime(page: Page) {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1000);
}

// Hover, the viewer and tests that build their own context run only in the desktop project (1440 px,
// a mouse). The copy-email tests run in both projects.

test.describe('project viewer', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'needs a real hover');
  });

  test('viewer follows the hovered row, and focus once the pointer is off the list', async ({ page }) => {
    await page.goto('/');
    const viewerImg = page.locator('[data-viewer] img.on');
    // The first image mounts after hydration and the media query match: from then on, handlers are live.
    await expect(viewerImg).toBeVisible();
    await expect(page.locator('[data-viewer] a')).toHaveAttribute('href', work(0));
    await stopTime(page);

    await page.locator('#work li').nth(1).hover();
    await page.clock.runFor(HOVER_INTENT_MS);
    await expect(page.locator('[data-viewer] a')).toHaveAttribute('href', work(1));
    await expect(viewerImg).toHaveCount(1);
    await expect(viewerImg).toHaveAttribute('src', imageOf(1));

    // Hovered > focused > selected (spec 4.2): with the pointer off the list, focus drives the viewer.
    await page.mouse.move(5, 5);
    await page.locator('#work li a').nth(last).focus();
    await expect(page.locator('[data-viewer] a')).toHaveAttribute('href', work(last));
    await expect(viewerImg).toHaveAttribute('src', imageOf(last));
  });

  // Time stands still in these tests: nothing changes between two checks unless the test advances the
  // clock, so "not yet" is as meaningful as "now".
  test('a hovered row becomes active only once the pointer has rested on it for the hover intent', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img.on')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    const rows = page.locator('#work li');
    await stopTime(page);

    await rows.nth(1).hover();
    await page.clock.runFor(HOVER_INTENT_MS - 1);
    await expect(link).toHaveAttribute('href', work(0));
    await expect(rows.nth(1)).not.toHaveAttribute('data-active', '');
    await page.clock.runFor(2);
    await expect(link).toHaveAttribute('href', work(1));
    await expect(rows.nth(1)).toHaveAttribute('data-active', '');
  });

  test('crossing a row on the way to another never shows the crossed row', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img.on')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    const rows = page.locator('#work li');
    // Every row that becomes active, recorded as it happens: a brief flash cannot slip between two checks.
    await page.locator('#work ol').evaluate((list) => {
      const shown: number[] = [];
      Object.assign(window, { shown });
      new MutationObserver((records) => {
        for (const { target } of records)
          if ((target as Element).hasAttribute('data-active')) shown.push([...list.children].indexOf(target as Element));
      }).observe(list, { subtree: true, attributeFilter: ['data-active'] });
    });
    await stopTime(page);

    await rows.nth(3).hover();
    await page.clock.runFor(HOVER_INTENT_MS / 2);
    await rows.nth(1).hover();
    // Past the moment row 3 would have been shown, before row 1 has rested long enough.
    await page.clock.runFor(HOVER_INTENT_MS - 1);
    await expect(link).toHaveAttribute('href', work(0));
    await page.clock.runFor(2);
    await expect(link).toHaveAttribute('href', work(1));
    expect(await page.evaluate(() => (window as unknown as { shown: number[] }).shown)).toEqual([1]);
  });

  test('leaving the list cancels a pending hover, and keeps the row that was shown', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img.on')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    const rows = page.locator('#work li');
    await stopTime(page);

    // Enter row 3 and leave the list before the intent: it is cancelled.
    await rows.nth(3).hover();
    await page.mouse.move(5, 5);
    await page.clock.runFor(HOVER_INTENT_MS * 3);
    await expect(link).toHaveAttribute('href', work(0));
    await expect(rows.nth(0)).toHaveAttribute('data-active', '');
    await expect(rows.nth(3)).not.toHaveAttribute('data-active', '');

    // Settled on a row, leaving the list keeps the last one shown.
    await rows.nth(2).hover();
    await page.clock.runFor(HOVER_INTENT_MS);
    await expect(link).toHaveAttribute('href', work(2));
    await page.mouse.move(5, 5);
    await page.clock.runFor(HOVER_INTENT_MS * 3);
    await expect(link).toHaveAttribute('href', work(2));
    await expect(rows.nth(2)).toHaveAttribute('data-active', '');
  });

  test('focus shows the row and survives blur; a hovered row wins over the focused one', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img.on')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    await page.mouse.move(5, 5);
    await stopTime(page);

    await page.locator('#work li a').nth(3).focus();
    await expect(link).toHaveAttribute('href', work(3));
    await page.locator('#work li a').nth(3).blur();
    await expect(link).toHaveAttribute('href', work(3));

    // The pointer is on row 1, so focusing the last row must not move the viewer.
    await page.locator('#work li').nth(1).hover();
    await page.clock.runFor(HOVER_INTENT_MS);
    await expect(link).toHaveAttribute('href', work(1));
    await page.locator('#work li a').nth(last).focus();
    await page.clock.runFor(HOVER_INTENT_MS * 3);
    await expect(link).toHaveAttribute('href', work(1));
  });

  test('the caption follows the active project and the viewer stays out of the accessibility tree', async ({
    page,
  }) => {
    await page.goto('/');
    const viewer = page.locator('[data-viewer]');
    const cap = viewer.locator('[data-cap]');
    await expect(cap).toContainText('Solo, end to end · own product');
    await expect(cap).toContainText('Next.js · TypeScript · Tailwind · PostgreSQL');

    await page.locator('#work li').nth(3).hover();
    await expect(cap).toContainText('Main contributor · AI site-scoring service');
    await expect(cap).toContainText('React · Python · Keycloak');
    await expect(cap).toHaveCSS('opacity', '1');

    await expect(viewer).toHaveAttribute('aria-hidden', 'true');
    await expect(viewer.locator('a')).toHaveAttribute('tabindex', '-1');
    await expect(viewer.locator('img')).toHaveCount(projects.length);
    await expect(viewer.locator('img.on')).toHaveCount(1);
    await expect(viewer.getByRole('link')).toHaveCount(0); // hidden from the tree, not just unfocusable
  });

  test('the crossfade follows the motion tokens and is off under reduced motion', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('[data-viewer] img.on');
    await expect(img).toHaveCSS('transition-property', 'opacity, scale');
    await expect(img).toHaveCSS('transition-duration', '0.3s, 0.8s'); // medium for opacity, slow for the zoom
    await expect(page.locator('[data-viewer] [data-cap]')).toHaveCSS('transition-duration', '0.18s');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(img).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('[data-viewer] [data-cap]')).toHaveCSS('transition-duration', '0s');
  });

  for (const [name, viewport] of [
    ['a phone', { width: 375, height: 812 }],
    ['a touch tablet in landscape', { width: 1180, height: 820 }],
  ] as const) {
    test(`${name} never mounts viewer images`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
      try {
        const page = await ctx.newPage();
        await page.goto('/');
        // Hydrated: the viewer has already had its chance to mount (a sharper signal than `networkidle`).
        await hydrated(page);
        await expect(page.locator('[data-viewer] img')).toHaveCount(0);
        await expect(page.locator('[data-viewer]')).toBeHidden();
      } finally {
        await ctx.close();
      }
    });
  }
});

test('copy email reports success', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await hydrated(page);
  const button = page.getByRole('button', { name: 'Copy email' });
  await button.click();
  await expect(page.getByRole('status')).toHaveText('Copied to the clipboard.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
  // The label is fixed: the outcome lives in the status line, not in the button.
  await expect(button).toHaveText('Copy email');
});

test('the copy status clears itself after 6 seconds', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await hydrated(page);
  await page.clock.install();
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toHaveText('Copied to the clipboard.');
  await page.clock.fastForward(5000);
  await expect(page.getByRole('status')).toHaveText('Copied to the clipboard.');
  await page.clock.fastForward(1500);
  await expect(page.getByRole('status')).toBeEmpty();
});

test('a second copy with the same outcome is announced again', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await hydrated(page);
  const status = page.getByRole('status');
  // A live region speaks what is added to it: record every node added to the status line.
  await status.evaluate((line) => {
    const added: string[] = [];
    Object.assign(window, { added });
    new MutationObserver((records) => {
      for (const { addedNodes } of records) for (const node of addedNodes) added.push(node.textContent ?? '');
    }).observe(line, { childList: true, subtree: true });
  });
  const button = page.getByRole('button', { name: 'Copy email' });
  await button.click();
  await expect(status).toHaveText('Copied to the clipboard.');
  await button.click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { added: string[] }).added))
    .toEqual(['Copied to the clipboard.', 'Copied to the clipboard.']);
});

test('copy email failure selects the address and explains', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } });
  });
  await page.goto('/');
  await hydrated(page);
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toContainText('Couldn’t copy');
  // A touch device has no Ctrl+C: it is told to press and hold instead.
  await expect(page.getByRole('status')).toHaveText(
    isMobile
      ? 'Couldn’t copy. Press and hold the address above to copy it.'
      : 'Couldn’t copy. The address is selected: press Ctrl+C or ⌘C.',
  );
  expect(await page.evaluate(() => getSelection()?.toString())).toBe(EMAIL);
});

test('copy email falls back when there is no clipboard API at all', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
  });
  await page.goto('/');
  await hydrated(page);
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toContainText('Couldn’t copy');
  expect(await page.evaluate(() => getSelection()?.toString())).toBe(EMAIL);
});

test('no axe violations or horizontal scroll with the viewer mounted and a failure message showing', async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } });
  });
  await page.goto('/');
  await hydrated(page);
  if (!isMobile) await expect(page.locator('[data-viewer] img.on')).toBeVisible();
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toContainText('Couldn’t copy');
  await expectNoAxeViolations(page);
  await expectNoHorizontalScroll(page);
});

// Review Focus 5: a visitor who lands on a case from a shared link, never having seen the home.
test('a case opened from a shared link shows availability and contact', async ({ page }) => {
  await page.goto('/work/conosur');
  await expect(page.getByText('Open to roles in Buenos Aires or remote')).toBeVisible();
  await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();
  await expect(page.getByRole('link', { name: /All work/ })).toHaveAttribute('href', '/#work');
});
