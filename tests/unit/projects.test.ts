import { existsSync } from 'node:fs';
import { expect, test } from 'vitest';
import { ALL_PROJECTS, kicker, nextProject, projectBySlug, publishedProjects } from '@/content/projects';
import type { Slug } from '@/content/types';
import { findForbiddenTerms } from '../support/forbidden-terms';

test('order, numbering and cycle', () => {
  expect(publishedProjects().map((p) => `${p.number} ${p.slug}`)).toEqual([
    '01 stock-tienda',
    '02 conosur',
    '03 dsp2',
    '04 analyzer',
    '05 bakery-concept',
  ]);
  expect(nextProject('bakery-concept').slug).toBe('stock-tienda');
  expect(nextProject('stock-tienda').slug).toBe('conosur');
});

test('unpublishing a project renumbers and skips it', () => {
  const four = ALL_PROJECTS.map((p) => (p.slug === 'bakery-concept' ? { ...p, published: false } : p));
  expect(publishedProjects(four).map((p) => p.number)).toEqual(['01', '02', '03', '04']);
  expect(nextProject('analyzer', four).slug).toBe('stock-tienda');
});

test('projectBySlug returns the numbered entry, or undefined for an unknown slug', () => {
  expect(projectBySlug('dsp2')).toMatchObject({ number: '03', title: 'DSP2 + Reset GUI' });
  expect(projectBySlug('not-a-project' as Slug)).toBeUndefined();
});

test('every image exists, has alt text, and no unpublished terms leak', () => {
  for (const p of ALL_PROJECTS) {
    expect(existsSync(`public${p.image.src}`)).toBe(true);
    expect(p.image.alt.length).toBeGreaterThan(10);
    expect(findForbiddenTerms(JSON.stringify(p)), p.slug).toEqual([]);
  }
});

test('the kicker is number, context and years', () => {
  expect(kicker(projectBySlug('dsp2')!)).toBe('03 · Reset Digital · 2024 – now');
});
