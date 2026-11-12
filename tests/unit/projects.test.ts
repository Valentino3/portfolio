import { existsSync } from 'node:fs';
import { expect, test } from 'vitest';
import { ALL_PROJECTS, nextProject, projectBySlug, publishedProjects } from '@/content/projects';
import type { Slug } from '@/content/types';
import { findForbiddenTerms } from '../support/forbidden-terms';

test('order and cycle', () => {
  expect(publishedProjects().map((p) => p.slug)).toEqual(['stock-tienda', 'conosur', 'dsp2', 'analyzer', 'bakery-concept']);
  expect(nextProject('bakery-concept').slug).toBe('stock-tienda');
  expect(nextProject('stock-tienda').slug).toBe('conosur');
});

test('an unpublished project is left out and skipped by the cycle', () => {
  const four = ALL_PROJECTS.map((p) => (p.slug === 'bakery-concept' ? { ...p, published: false } : p));
  expect(publishedProjects(four).map((p) => p.slug)).not.toContain('bakery-concept');
  expect(nextProject('analyzer', four).slug).toBe('stock-tienda');
});

test('projectBySlug returns the published entry, or undefined for an unknown slug', () => {
  expect(projectBySlug('dsp2')).toMatchObject({ title: 'DSP2 + Reset GUI', context: 'Reset Digital' });
  expect(projectBySlug('not-a-project' as Slug)).toBeUndefined();
});

test('every image exists, has alt text, and no unpublished terms leak', () => {
  for (const p of ALL_PROJECTS) {
    expect(existsSync(`public${p.image.src}`)).toBe(true);
    expect(p.image.alt.length).toBeGreaterThan(10);
    expect(findForbiddenTerms(JSON.stringify(p)), p.slug).toEqual([]);
  }
});
