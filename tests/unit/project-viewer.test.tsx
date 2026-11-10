import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { ProjectViewer } from '@/components/home/project-viewer';
import { WorkIndex } from '@/components/home/work-index';
import { publishedProjects } from '@/content/projects';

const projects = publishedProjects();

// renderToStaticMarkup uses the server snapshot, the same markup a visitor gets before hydration:
// no media query has matched yet, so the viewer must be an empty, hidden, aria-hidden container.
test('before the media query matches, the viewer is an empty container with no images', () => {
  const html = renderToStaticMarkup(<ProjectViewer projects={projects} activeIndex={0} />);
  expect(html).toMatch(/^<div data-viewer="" aria-hidden="true" class="hidden /);
  expect(html).not.toContain('<img');
  expect(html).not.toContain('<a ');
});

test('the viewer container is only displayed under the viewer variant', () => {
  const html = renderToStaticMarkup(<ProjectViewer projects={projects} activeIndex={0} />);
  expect(html).toContain('viewer:block');
  expect(html).toContain('viewer:col-start-7');
});

test('WorkIndex renders the list with only the first row active, then the viewer', () => {
  const html = renderToStaticMarkup(<WorkIndex projects={projects} />);
  const rows = [...html.matchAll(/<li\b[^>]*>/g)].map((m) => m[0]);
  expect(rows).toHaveLength(5);
  expect(rows[0]).toMatch(/\sdata-active=""/);
  // The attribute itself, not the `data-active:` utility classes that mention it.
  rows.slice(1).forEach((row) => expect(row).not.toMatch(/\sdata-active=""/));
  expect(html.indexOf('id="work"')).toBeLessThan(html.indexOf('data-viewer'));
  expect(html.slice(html.indexOf('data-viewer'))).not.toContain('<img');
});
