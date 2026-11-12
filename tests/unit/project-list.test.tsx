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
  // Title, then its context as a lighter continuation, then the years.
  expect(rows(html)[0]).toMatch(/>Stock Tienda<\/a><span[^>]*text-text-3[^>]*>Own product<\/span><\/span><span[^>]*tabular-nums[^>]*>2026 – now</);
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
  expect(row).toMatch(/<figcaption [^>]*>Design \+ build<\/figcaption>/);
});

test('only the first thumbnail loads eagerly, the others wait until they are near', () => {
  const imgs = [...renderToStaticMarkup(<ProjectList projects={projects} />).matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  expect(imgs).toHaveLength(projects.length);
  expect(imgs.map((img) => /\sloading="(\w+)"/.exec(img)?.[1])).toEqual(projects.map((_, i) => (i === 0 ? 'eager' : 'lazy')));
});

test('the thumbnail is decorative: empty alt and an aria-hidden caption with the role only', () => {
  const html = renderToStaticMarkup(<ProjectList projects={projects} />);
  const row = rows(html)[0];
  expect(row).toMatch(/<img[^>]*\salt=""/);
  expect(row).toContain('sizes="100vw"');
  expect(row).toMatch(/<figcaption aria-hidden="true"[^>]*>Solo, end to end<\/figcaption>/);
  expect(row).not.toMatch(/<figcaption[^>]*>[^<]*Tailwind/);
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
