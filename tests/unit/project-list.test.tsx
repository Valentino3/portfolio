import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { ProjectList } from '@/components/home/project-list';
import { publishedProjects } from '@/content/projects';

const projects = publishedProjects();
/** The attribute itself, not the `data-active:` utility classes that mention it. */
const ACTIVE = /\sdata-active=""/;

/** The markup of each <li> of the list (the home list has no nested lists). */
function rows(html: string): string[] {
  return [...html.matchAll(/<li\b[^>]*>(.*?)<\/li>/g)].map((m) => m[0]);
}

test('renders one row per project: no index, no pill, no arrow', () => {
  const html = renderToStaticMarkup(<ProjectList projects={projects} />);
  expect(rows(html)).toHaveLength(projects.length);
  expect(html).toContain('<h2 id="work-h" class="sr">Selected work</h2>');
  expect(html).not.toMatch(/>0\d</);
  expect(html).not.toContain('→');
  // Title, then its context as a smaller continuation, then the years, in the mono.
  expect(rows(html)[0]).toMatch(
    /<a [^>]*>Stock Tienda<\/a><span[^>]*text-ui[^>]*>Own product<\/span><\/span><span[^>]*><span class="figures">2026 – now</,
  );
});

test('one step per role: title 18px, description 16px, context and years 15px, none in the faintest color', () => {
  // The years sit in the 15px step and set themselves at 0.9em of it, in the mono.
  const row = rows(renderToStaticMarkup(<ProjectList projects={projects} />))[0];
  expect(row).toMatch(/<a [^>]*class="text-card [^"]*"[^>]*>Stock Tienda</);
  expect(row).toMatch(/<p id="desc-stock-tienda" class="[^"]*text-base text-text-2/);
  expect(row).toMatch(/<span class="text-ui text-text-2">Own product</);
  expect(row).toMatch(/<span class="[^"]*text-ui text-text-2"[^>]*><span class="figures">2026 – now</);
  // Only the role stays in text-3, once: it closes the row's text at every width.
  expect(row.match(/text-text-3/g)).toHaveLength(1);
});

test('the title is the only link in a row and it points at the case', () => {
  const html = renderToStaticMarkup(<ProjectList projects={projects} />);
  projects.forEach((p, i) => {
    const row = rows(html)[i];
    expect(row.match(/<a\b/g)).toHaveLength(1);
    expect(row).toContain(`href="/work/${p.slug}"`);
  });
});

test('aria-describedby points at the description and the role and stack text', () => {
  const html = renderToStaticMarkup(<ProjectList projects={projects} />);
  const row = rows(html)[3];
  expect(row).toContain('aria-describedby="desc-analyzer meta-analyzer"');
  expect(row).toMatch(/<p id="desc-analyzer"[^>]*>AI service that scores websites/);
  expect(row).toMatch(/<span id="meta-analyzer" class="sr">Main contributor\. React, Python, Keycloak\.<\/span>/);
});

test('the role is spoken, not typeset: "Design + build" is read as "Design and build"', () => {
  const row = rows(renderToStaticMarkup(<ProjectList projects={projects} />))[1];
  expect(row).toContain('>Design and build. React, TypeScript, Framer Motion, i18n.</span>');
  expect(row).toMatch(/<p aria-hidden="true"[^>]*>Design \+ build<\/p>/);
});

test('only the first thumbnail loads eagerly, the others wait until they are near', () => {
  const imgs = [...renderToStaticMarkup(<ProjectList projects={projects} />).matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  expect(imgs).toHaveLength(projects.length);
  expect(imgs.map((img) => /\sloading="(\w+)"/.exec(img)?.[1])).toEqual(projects.map((_, i) => (i === 0 ? 'eager' : 'lazy')));
});

test('the thumbnail is decorative: empty alt, no caption; the role is aria-hidden text before it', () => {
  const html = renderToStaticMarkup(<ProjectList projects={projects} />);
  const row = rows(html)[0];
  expect(row).toMatch(/<img[^>]*\salt=""/);
  // Cropped on a phone, so drawn wider there; a 15rem column beside the text from 1024px.
  expect(row).toContain('sizes="(max-width: 639px) 200vw, (min-width: 1024px) 240px, 100vw"');
  // The role sits in the row's text, ahead of the picture, so on a phone it is not left hanging
  // under the picture next to the following row.
  expect(row).toMatch(/<p aria-hidden="true"[^>]*>Solo, end to end<\/p><figure\b/);
  expect(row).not.toContain('<figcaption');
  expect(row).not.toMatch(/<p aria-hidden="true"[^>]*>[^<]*Tailwind/);
});

test('no row is active unless a parent says which one', () => {
  expect(renderToStaticMarkup(<ProjectList projects={projects} />)).not.toMatch(ACTIVE);
  const html = renderToStaticMarkup(<ProjectList projects={projects} activeIndex={2} />);
  const active = rows(html).map((r) => ACTIVE.test(r));
  expect(active).toEqual(projects.map((_, i) => i === 2));
});

test('works with fewer projects when one is unpublished', () => {
  const html = renderToStaticMarkup(<ProjectList projects={projects.slice(0, 4)} />);
  expect(rows(html)).toHaveLength(4);
  expect(html).not.toContain('Bakery concept');
});

test('a phone thumbnail zooms into the project’s crop; one without a crop shows the whole screenshot', () => {
  const html = renderToStaticMarkup(<ProjectList projects={projects} />);
  const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  projects.forEach((p, i) => {
    if (p.crop) {
      expect(imgs[i], p.slug).toContain(`--crop-origin:${p.crop.x}% ${p.crop.y}%;--crop-zoom:${p.crop.zoom}`);
      expect(imgs[i], p.slug).toContain('max-sm:scale-(--crop-zoom)');
    } else {
      expect(imgs[i], p.slug).not.toContain('--crop-zoom');
      expect(imgs[i], p.slug).toContain('sizes="(min-width: 1024px) 240px, 100vw"');
    }
  });
});

test('every crop keeps its region inside the picture', () => {
  for (const { slug, crop } of projects) {
    if (!crop) continue;
    expect(crop.zoom, slug).toBeGreaterThan(1);
    for (const v of [crop.x, crop.y]) {
      expect(v, slug).toBeGreaterThanOrEqual(0);
      expect(v, slug).toBeLessThanOrEqual(100);
    }
  }
});
