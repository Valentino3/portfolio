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
    const viewerImg = page.locator('[data-viewer] img[data-shown]');
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
  test('the row follows the pointer at once; the viewer only once the pointer has rested on it', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img[data-shown]')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    const rows = page.locator('#work li');
    await stopTime(page);

    await rows.nth(1).hover();
    await expect(rows.nth(1)).toHaveAttribute('data-active', '');
    await expect(rows.nth(0)).not.toHaveAttribute('data-active', '');
    await page.clock.runFor(HOVER_INTENT_MS - 1);
    await expect(link).toHaveAttribute('href', work(0));
    await page.clock.runFor(2);
    await expect(link).toHaveAttribute('href', work(1));
  });

  test('crossing a row on the way to another never shows the crossed row', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img[data-shown]')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    const rows = page.locator('#work li');
    // Every picture the viewer puts on show, recorded as it happens: a brief flash cannot slip between two checks.
    await page.locator('[data-viewer] a').evaluate((frame) => {
      const shown: number[] = [];
      Object.assign(window, { shown });
      new MutationObserver((records) => {
        for (const { target } of records)
          if ((target as Element).hasAttribute('data-shown')) shown.push([...frame.children].indexOf(target as Element));
      }).observe(frame, { subtree: true, attributeFilter: ['data-shown'] });
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

  test('leaving the list keeps the row the pointer was last on, and the viewer catches up with it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img[data-shown]')).toBeVisible();
    const link = page.locator('[data-viewer] a');
    const rows = page.locator('#work li');
    await stopTime(page);

    // Enter row 3 and leave the list before the intent: the bar already marks row 3, and the viewer
    // follows it rather than disagree with the bar.
    await rows.nth(3).hover();
    await page.mouse.move(5, 5);
    await expect(rows.nth(3)).toHaveAttribute('data-active', '');
    await page.clock.runFor(HOVER_INTENT_MS);
    await expect(link).toHaveAttribute('href', work(3));

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
    await expect(page.locator('[data-viewer] img[data-shown]')).toBeVisible();
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
    // One sans line: the role, nothing else.
    await expect(cap).toHaveText('Solo, end to end');

    await page.locator('#work li').nth(3).hover();
    await expect(cap).toHaveText('Main contributor');

    await expect(viewer).toHaveAttribute('aria-hidden', 'true');
    await expect(viewer.locator('a')).toHaveAttribute('tabindex', '-1');
    await expect(viewer.locator('img')).toHaveCount(projects.length);
    await expect(viewer.locator('img[data-shown]')).toHaveCount(1);
    await expect(viewer.getByRole('link')).toHaveCount(0); // hidden from the tree, not just unfocusable
  });

  test('the incoming picture settles in on a spring; under reduced motion it is in place at once', async ({ page }) => {
    await page.goto('/');
    const shown = page.locator('[data-viewer] img[data-shown]');
    await expect(shown).toBeVisible();
    const style = () => shown.evaluate((img: HTMLImageElement) => [img.style.opacity, img.style.scale]);

    await page.locator('#work li').nth(2).hover();
    await expect(shown).toHaveAttribute('src', imageOf(2));
    // It arrives: fully opaque, at its own size.
    await expect.poll(style).toEqual(['1', '1']);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await stopTime(page);
    await page.locator('#work li').nth(4).hover();
    await page.clock.runFor(HOVER_INTENT_MS);
    // No frame has run since the swap, and none needs to: the end state is already painted.
    await expect(shown).toHaveAttribute('src', imageOf(4));
    expect(await style()).toEqual(['1', '1']);
  });

  test('one shared bar marks the active row and follows it; rows never draw their own', async ({ page }) => {
    await page.goto('/');
    await hydrated(page);
    const bar = page.locator('#work [data-indicator]');
    await expect(bar).toHaveCount(1);
    await expect(bar).toBeVisible();
    const rows = page.locator('#work li');
    // A row's own bar is its ::before; it exists only when generated (content) and displayed.
    const ownBars = () =>
      rows.evaluateAll(
        (items) =>
          items.filter((li) => {
            const before = getComputedStyle(li, '::before');
            return before.content !== 'none' && before.display !== 'none';
          }).length,
      );
    expect(await ownBars()).toBe(0);

    /** The bar's vertical extent sits inside the row's. */
    const onRow = (i: number) =>
      page.evaluate((index) => {
        const b = document.querySelector('#work [data-indicator]')!.getBoundingClientRect();
        const r = document.querySelectorAll('#work li')[index].getBoundingClientRect();
        return b.height > 4 && b.top >= r.top - 1 && b.bottom <= r.bottom + 1;
      }, i);
    expect(await onRow(0)).toBe(true);
    await rows.nth(3).hover();
    await expect.poll(() => onRow(3)).toBe(true);
    expect(await ownBars()).toBe(0);
  });

  test('sweeping the list paints one picture at most and one bar, on every frame', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-viewer] img[data-shown]')).toBeVisible();
    // Sampled on every animation frame while the pointer sweeps down and back up.
    await page.evaluate(() => {
      const peaks = { pictures: 0, bars: 0, frames: 0 };
      Object.assign(window, { peaks });
      const sample = () => {
        const painted = [...document.querySelectorAll<HTMLImageElement>('[data-viewer] img')].filter((img) => {
          const s = getComputedStyle(img);
          return s.visibility !== 'hidden' && parseFloat(s.opacity) > 0;
        });
        const bars = [...document.querySelectorAll('#work [data-indicator], #work li')].filter((el) => {
          if (!el.matches('li')) return getComputedStyle(el).display !== 'none';
          const before = getComputedStyle(el, '::before');
          return before.content !== 'none' && before.display !== 'none';
        });
        peaks.pictures = Math.max(peaks.pictures, painted.length);
        peaks.bars = Math.max(peaks.bars, bars.length);
        peaks.frames += 1;
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    const rows = page.locator('#work li');
    const centers = await Promise.all(
      [0, 1, 2, 3, 4].map(async (i) => {
        const box = (await rows.nth(i).boundingBox())!;
        return [box.x + box.width / 2, box.y + box.height / 2] as const;
      }),
    );
    for (const [x, y] of [...centers, ...centers.slice().reverse(), centers[2], centers[4], centers[1]]) {
      await page.mouse.move(x, y, { steps: 4 });
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(600);
    const peaks = await page.evaluate(() => (window as unknown as { peaks: Record<string, number> }).peaks);
    expect(peaks.frames).toBeGreaterThan(20);
    expect(peaks.pictures).toBe(1);
    expect(peaks.bars).toBe(1);
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
  if (!isMobile) await expect(page.locator('[data-viewer] img[data-shown]')).toBeVisible();
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toContainText('Couldn’t copy');
  // The message rises in from transparent: axe judges its contrast once it has arrived.
  await page.getByRole('status').evaluate((status) =>
    Promise.all(status.getAnimations({ subtree: true }).map((animation) => animation.finished)),
  );
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
