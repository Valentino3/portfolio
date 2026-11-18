import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * React has hydrated the page (`data-hydrated` on <html>, see HydrationFlag): the router owns the
 * in-page links and the buttons work. Clicked earlier, a link is a native jump and a button does
 * nothing.
 */
export async function hydrated(page: Page): Promise<void> {
  await expect(page.locator('html[data-hydrated]')).toBeAttached();
}

/** Fails with a readable list of rule ids, impact and offending selectors. */
export async function expectNoAxeViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  const summary = violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
  );
  expect(summary, 'axe violations').toEqual([]);
}

/** The document must never be wider than the viewport. */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'document scrollWidth vs viewport clientWidth').toBeLessThanOrEqual(clientWidth);
}

/**
 * Diagram labels that run past the right edge of their box, with the diagram font swapped for
 * `font` (the web font, or what the browser falls back to while it has not loaded).
 */
export async function diagramLabelsOutsideBoxes(page: Page, font: string): Promise<(string | null)[]> {
  await page.addStyleTag({ content: `.diagram text{font-family:${font} !important}` });
  return page.evaluate(() =>
    [...document.querySelectorAll('.diagram svg')].flatMap((svg) => {
      const rects = [...svg.querySelectorAll('rect')];
      return [...svg.querySelectorAll('text')]
        .filter((t) => {
          const b = t.getBBox();
          const r = rects.find(
            (r) =>
              b.x >= +r.getAttribute('x')! - 1 &&
              b.x <= +r.getAttribute('x')! + +r.getAttribute('width')! &&
              b.y >= +r.getAttribute('y')! - 2 &&
              b.y <= +r.getAttribute('y')! + +r.getAttribute('height')!,
          );
          return r && b.x + b.width > +r.getAttribute('x')! + +r.getAttribute('width')! - 2;
        })
        .map((t) => t.textContent);
    }),
  );
}

/**
 * The cash-closing ledger (stock-tienda) plays once when it is on screen, and a half-faded figure
 * is not a contrast failure worth reporting. A ledger in view is waited out until the animation
 * rests (it clears its inline styles); one below the fold has not started and is measured as is.
 */
export async function ledgerAtRest(page: Page): Promise<void> {
  const sheet = page.locator('figure:visible [data-ledger]');
  if (!(await sheet.count())) return;
  const inView = await sheet.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  });
  if (inView) await expect(sheet.locator('[style]')).toHaveCount(0, { timeout: 15_000 });
}
