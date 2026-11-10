import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalScroll } from './helpers';

const EMAIL = 'valentino.rota3@gmail.com';

// Hover, the viewer and tests that build their own context run only in the desktop project (1440 px,
// a mouse). The copy-email tests run in both projects.

test.describe('project viewer', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'needs a real hover');
  });

  test('viewer follows hover intent and focus', async ({ page }) => {
    await page.goto('/');
    const viewerImg = page.locator('[data-viewer] img.on');
    // The first image mounts after hydration and the media query match: from then on, handlers are live.
    await expect(viewerImg).toBeVisible();
    await expect(page.locator('[data-viewer] a')).toHaveAttribute('href', '/work/stock-tienda');

    await page.locator('#work li').nth(1).hover();
    await page.waitForTimeout(200);
    await expect(page.locator('[data-viewer] a')).toHaveAttribute('href', '/work/conosur');
    await expect(viewerImg).toHaveCount(1);
    await expect(viewerImg).toHaveAttribute('src', /conosur-pay-respects/);

    await page.locator('#work li').nth(3).hover();
    await page.locator('#work li').nth(0).hover(); // crossing in < 110 ms
    await expect(page.locator('[data-viewer] a')).toHaveAttribute('href', '/work/stock-tienda');

    // Hovered > focused > selected (spec 4.2): with the pointer off the list, focus drives the viewer.
    await page.mouse.move(5, 5);
    await page.locator('#work li a').nth(4).focus();
    await expect(page.locator('[data-viewer] a')).toHaveAttribute('href', '/work/bakery-concept');
    await expect(viewerImg).toHaveAttribute('src', /bakery-hero/);
  });

  test('a row only becomes active after the hover intent, and leaving the list cancels it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img.on')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    const rows = page.locator('#work li');

    // Enter row 3 and leave the list straight away: the pending intent is cancelled.
    await rows.nth(3).hover();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(300);
    await expect(link).toHaveAttribute('href', '/work/stock-tienda');
    await expect(rows.nth(0)).toHaveAttribute('data-active', '');
    await expect(rows.nth(3)).not.toHaveAttribute('data-active', '');

    // Settled on a row, leaving the list keeps the last one shown.
    await rows.nth(2).hover();
    await expect(link).toHaveAttribute('href', '/work/dsp2');
    await expect(rows.nth(2)).toHaveAttribute('data-active', '');
    await page.mouse.move(5, 5);
    await page.waitForTimeout(300);
    await expect(link).toHaveAttribute('href', '/work/dsp2');
    await expect(rows.nth(2)).toHaveAttribute('data-active', '');
  });

  test('focus shows the row and survives blur; a hovered row wins over the focused one', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img.on')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    await page.mouse.move(5, 5);

    await page.locator('#work li a').nth(3).focus();
    await expect(link).toHaveAttribute('href', '/work/analyzer');
    await page.locator('#work li a').nth(3).blur();
    await expect(link).toHaveAttribute('href', '/work/analyzer');

    // The pointer is on row 1, so focusing row 4 must not move the viewer.
    await page.locator('#work li').nth(1).hover();
    await expect(link).toHaveAttribute('href', '/work/conosur');
    await page.locator('#work li a').nth(4).focus();
    await page.waitForTimeout(300);
    await expect(link).toHaveAttribute('href', '/work/conosur');
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
    await expect(viewer.locator('img')).toHaveCount(5);
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
        // The header clock starts in an effect after hydration, so a real time means the page is live and the
        // viewer has already had its chance to mount. (`networkidle` would never settle while the /work/*
        // prefetches 404, and gives no better signal.)
        await expect(page.locator('time').first()).not.toHaveText('--:--');
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
  await page.clock.install();
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toHaveText('Copied to the clipboard.');
  await page.clock.fastForward(5000);
  await expect(page.getByRole('status')).toHaveText('Copied to the clipboard.');
  await page.clock.fastForward(1500);
  await expect(page.getByRole('status')).toBeEmpty();
});

test('copy email failure selects the address and explains', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } });
  });
  await page.goto('/');
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
  if (!isMobile) await expect(page.locator('[data-viewer] img.on')).toBeVisible();
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toContainText('Couldn’t copy');
  await expectNoAxeViolations(page);
  await expectNoHorizontalScroll(page);
});

// Passes once Task 6 adds the /work/[slug] route and its header, contact CTA and "All work" link.
test.fixme('a case opened from a shared link shows availability and contact', async ({ page }) => {
  await page.goto('/work/conosur');
  await expect(page.getByText('Open to roles in Buenos Aires or remote')).toBeVisible();
  await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();
  await expect(page.getByRole('link', { name: /All work/ })).toHaveAttribute('href', '/#work');
});
