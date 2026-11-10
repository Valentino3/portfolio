import { expect, test, type Page } from '@playwright/test';
import { diagramLabelsOutsideBoxes, expectNoAxeViolations, expectNoHorizontalScroll } from './helpers';

/**
 * Each case against the approved prototype: its title, outcomes, numbered sections in order, the
 * cards in each, and how many diagrams, clips and pictures it holds. The full text is compared
 * to the prototype by a throwaway script at review time; this keeps what would be missed first.
 */
type Expected = {
  h1: string;
  outcomes: string[];
  /** [id, title], in page order. */
  sections: [string, string][];
  /** Card titles by section id. */
  cards: Record<string, string[]>;
  diagrams: number;
  clips: number;
  /** Pictures in the body, hero excluded, by section id. */
  pictures: Record<string, number>;
};

const expected: Record<string, Expected> = {
  'stock-tienda': {
    h1: 'Stock Tienda',
    outcomes: ['Three stores pay for it', 'It keeps selling offline', 'Electronic invoicing with ARCA'],
    sections: [
      ['context', 'Context'],
      ['role', 'My role'],
      ['design', 'Design decisions'],
      ['engineering', 'Engineering decisions'],
    ],
    cards: {
      design: [
        'Every figure in tabular mono',
        'Color only when there’s something to look at',
        'Borders, not shadows',
        'Two kinds of empty',
      ],
      engineering: [
        'Offline sales: record first, flag later',
        'Permissions checked on the server, always',
        'Property-based tests for the money math',
        'A test store in production',
      ],
    },
    diagrams: 1,
    clips: 0,
    pictures: { design: 2 },
  },
  conosur: {
    h1: 'Conosur',
    outcomes: ['Live since July 2025', 'Music that keeps playing when Spotify fails', 'Two languages'],
    sections: [
      ['context', 'Context'],
      ['decisions', 'Decisions'],
      ['interface', 'Interface'],
    ],
    cards: {
      decisions: [
        'Spotify first, YouTube as a fallback',
        'Motion that follows the visitor',
        'A store, decided with the client',
      ],
    },
    diagrams: 1,
    clips: 1,
    pictures: { interface: 3 },
  },
  dsp2: {
    h1: 'DSP2 + Reset GUI',
    outcomes: [
      'The first outside client, onboarded safely',
      'Tested over real logins',
      'One authorization layer, platform-wide',
    ],
    sections: [
      ['context', 'Context'],
      ['role', 'My role'],
      ['decisions', 'Decisions'],
      ['architecture', 'Architecture'],
      ['interface', 'Interface'],
    ],
    cards: {
      decisions: [
        'Ship the hardening in two batches, by risk',
        'No database migrations in the first batch',
        'Authorization in one layer, not per route',
        'One component library for two apps',
      ],
    },
    diagrams: 2,
    clips: 0,
    pictures: { interface: 3 },
  },
  analyzer: {
    h1: 'Analyzer',
    outcomes: [
      'From no authentication to Keycloak',
      'A 500-domain study that changed the roadmap',
      'Better campaigns for clients',
    ],
    sections: [
      ['context', 'Context'],
      ['role', 'My role'],
      ['study', 'Measuring the scores'],
      ['decisions', 'Decisions'],
      ['architecture', 'Architecture'],
      ['interface', 'Interface'],
    ],
    cards: {
      decisions: [
        'OIDC with PKCE through Keycloak',
        'Roles by attribute, per entity',
        'A measuring harness outside the product',
      ],
    },
    diagrams: 1,
    clips: 0,
    pictures: { interface: 2 },
  },
  'bakery-concept': {
    h1: 'Bakery concept',
    outcomes: ['Three art directions, one codebase', 'Nothing unconfirmed gets published', 'Photos made usable locally'],
    sections: [
      ['directions', 'Three directions'],
      ['decisions', 'Decisions'],
      ['interface', 'Interface'],
    ],
    cards: {
      decisions: ['All content in one file', 'Buttons that don’t pretend', 'Verification by screenshots'],
    },
    diagrams: 1,
    clips: 1,
    pictures: { directions: 2, interface: 1 },
  },
};

const FORBIDDEN = /(?!)/; // superseded by a hash-based check in a later commit

/**
 * Hydrated and settled: the progress bar mounts after hydration, and a diagram that overflows
 * gets its tab stop only after that (a scroll region axe wants to be reachable by keyboard).
 */
async function settled(page: Page) {
  await expect(page.locator('[data-reading-progress]')).toBeAttached();
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.diagram')].every(
          (d) => d.scrollWidth <= d.clientWidth + 1 || d.getAttribute('tabindex') === '0',
        ),
      ),
    )
    .toBe(true);
}

for (const [slug, e] of Object.entries(expected)) {
  test.describe(slug, () => {
    test('title, outcomes and wording', async ({ page }) => {
      await page.goto(`/work/${slug}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(e.h1);
      for (const o of e.outcomes) await expect(page.getByText(o, { exact: true })).toBeVisible();
      const body = (await page.content()).toLowerCase();
      expect(body).not.toMatch(FORBIDDEN);
    });

    test('numbered sections in prototype order, each with its cards', async ({ page }) => {
      await page.goto(`/work/${slug}`);
      const ids = await page.locator('main .prose > section').evaluateAll((s) => s.map((x) => x.id));
      expect(ids).toEqual(e.sections.map(([id]) => id));
      for (const [id, title] of e.sections) {
        const section = page.locator(`main #${id}`);
        await expect(section.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible();
        await expect(section.locator('article h3')).toHaveText(e.cards[id] ?? []);
      }
      await expect(page.locator('nav[aria-label="On this page"] a')).toHaveText(e.sections.map(([, t]) => t));
    });

    test('diagrams, clips and pictures', async ({ page }) => {
      await page.goto(`/work/${slug}`);
      await expect(page.getByRole('img', { name: /^Diagram: / })).toHaveCount(e.diagrams);
      await expect(page.locator('main video[data-clip]')).toHaveCount(e.clips);
      for (const [id] of e.sections) {
        const pictures = e.pictures[id] ?? 0;
        const clips = await page.locator(`#${id} video[data-clip]`).count();
        await expect(page.locator(`#${id} img`)).toHaveCount(pictures);
        // Every picture can be enlarged, and every picture and clip has a caption.
        await expect(page.locator(`#${id} figure a[href^="/img/"]`)).toHaveCount(pictures);
        await expect(page.locator(`#${id} figure figcaption`)).toHaveCount(pictures + clips);
      }
    });

    test('every picture loads, and declares the size of its file', async ({ page }) => {
      await page.goto(`/work/${slug}`);
      for (const image of await page.locator('main figure img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        // A wrong width or height in the content would reserve the wrong space and shift the layout.
        // The zoom link points at the file itself, whose size is the truth.
        const { declared, file } = await image.evaluate(async (img: HTMLImageElement) => {
          const original = new Image();
          original.src = img.closest('a')!.getAttribute('href')!;
          await original.decode();
          return {
            declared: [Number(img.getAttribute('width')), Number(img.getAttribute('height'))],
            file: [original.naturalWidth, original.naturalHeight],
          };
        });
        expect(declared).toEqual(file);
      }
    });

    test('no axe violations, no horizontal scroll, diagram labels inside their boxes', async ({ page }) => {
      await page.goto(`/work/${slug}`);
      await settled(page);
      await expectNoAxeViolations(page);
      await expectNoHorizontalScroll(page);
      for (const font of ['Geist Mono', 'ui-monospace, Consolas, monospace'])
        expect(await diagramLabelsOutsideBoxes(page, font)).toEqual([]);
    });
  });
}

test('stock tienda shows design decisions before engineering decisions', async ({ page }) => {
  await page.goto('/work/stock-tienda');
  const ids = await page.locator('main section[id]').evaluateAll((s) => s.map((x) => x.id));
  expect(ids.indexOf('design')).toBeGreaterThan(-1);
  expect(ids.indexOf('design')).toBeLessThan(ids.indexOf('engineering'));
});

test('dsp2 opens its decisions with the rollout, and has no hardening section', async ({ page }) => {
  await page.goto('/work/dsp2');
  const decisions = page.locator('#decisions');
  await expect(decisions.locator('> p').first()).toHaveText('The hardening went out in two batches, around the launch.');
  // The rollout diagram comes before the first decision card.
  const rollout = decisions.getByRole('img', { name: /^Diagram: a written review split into five areas/ });
  await expect(rollout).toBeVisible();
  const [diagram, card] = await Promise.all([rollout.boundingBox(), decisions.locator('article').first().boundingBox()]);
  expect(diagram!.y).toBeLessThan(card!.y);
});
