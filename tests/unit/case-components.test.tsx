import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { CaseHeader } from '@/components/case/case-header';
import { DecisionCard } from '@/components/case/decision-card';
import { getCase } from '@/content/cases';
import { projectBySlug, publishedProjects } from '@/content/projects';

/** The inner HTML of every match of an element, in document order. */
function texts(html: string, tag: string): string[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>(.*?)</${tag}>`, 'g'))].map((m) => m[1]);
}

test('the kicker reads number · context · years, and the back link goes to the home list', () => {
  const html = renderToStaticMarkup(<CaseHeader project={projectBySlug('dsp2')!} dek="A dek." />);
  expect(html).toMatch(/<span data-kicker=""[^>]*>03 · Reset Digital · 2024 – now<\/span>/);
  expect(html).toMatch(/<a [^>]*href="\/#work"[^>]*><span aria-hidden="true"[^>]*>←<\/span> All work<\/a>/);
  expect(texts(html, 'h1')).toEqual(['DSP2 + Reset GUI']);
  expect(texts(html, 'p')).toEqual(['A dek.']);
});

test('a decision card keeps the rows it is given, in order, and leaves out the rest', () => {
  const html = renderToStaticMarkup(
    <DecisionCard
      title="Offline sales: record first, flag later"
      rows={[
        ['Instead of', 'Rejecting an offline sale.'],
        ['Result', <>The sale is <code>recorded</code>.</>],
      ]}
    />,
  );
  expect(html).toMatch(/^<article\b/);
  expect(texts(html, 'h3')).toEqual(['Offline sales: record first, flag later']);
  expect(texts(html, 'dt')).toEqual(['Instead of', 'Result']);
  expect(texts(html, 'dd')).toEqual(['Rejecting an offline sale.', 'The sale is <code>recorded</code>.']);
  expect(html).not.toContain('<figure');
});

test('a decision card shows its figure after the rows', () => {
  const html = renderToStaticMarkup(
    <DecisionCard title="Every figure in tabular mono" rows={[['Why', 'Digits line up.']]} figure={<figure>F</figure>} />,
  );
  expect(html.indexOf('</dl>')).toBeLessThan(html.indexOf('<figure>F</figure>'));
  expect(html).toMatch(/<\/article>$/);
});

test('every published project has its case, under its own slug', () => {
  for (const p of publishedProjects()) expect(getCase(p.slug).slug).toBe(p.slug);
});

test('section ids are unique in a case and never take an id the template uses', () => {
  for (const p of publishedProjects()) {
    const ids = getCase(p.slug).sections.map((s) => s.id);
    expect(new Set(ids).size, p.slug).toBe(ids.length);
    for (const id of ids) expect(['top', 'contact', 'cta'], p.slug).not.toContain(id);
  }
});
