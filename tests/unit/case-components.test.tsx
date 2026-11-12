import { readdirSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { CaseHeader } from '@/components/case/case-header';
import { CodeToken } from '@/components/case/code-token';
import { Decision, Result } from '@/components/case/decisions';
import { Diagram } from '@/components/case/diagram';
import { getCase } from '@/content/cases';
import { projectBySlug, publishedProjects } from '@/content/projects';

/** The inner HTML of every match of an element, in document order. */
function texts(html: string, tag: string): string[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>(.*?)</${tag}>`, 'g'))].map((m) => m[1]);
}

test('the case header is the back link, the title and the dek: nothing set above the title', () => {
  const html = renderToStaticMarkup(<CaseHeader project={projectBySlug('dsp2')!} dek="A dek." />);
  // Between the back link and the h1 there is only the wrapper that holds the title and the dek.
  expect(html).toMatch(/All work<\/a><div[^>]*><h1/);
  expect(html).toMatch(/<a [^>]*href="\/#work"[^>]*><span aria-hidden="true"[^>]*>←<\/span> All work<\/a>/);
  expect(texts(html, 'h1')).toEqual(['DSP2 + Reset GUI']);
  expect(texts(html, 'p')).toEqual(['A dek.']);
});

test('a decision is a title and prose, with no labels and no box', () => {
  const html = renderToStaticMarkup(
    <Decision title="Offline sales: record first, flag later">
      <p>Rejecting it loses the record.</p>
      <Result>
        The sale is <code>recorded</code>.
      </Result>
    </Decision>,
  );
  expect(html).toMatch(/^<article\b/);
  expect(texts(html, 'h3')).toEqual(['Offline sales: record first, flag later']);
  expect(html).not.toMatch(/<(dl|dt|dd)\b/);
  expect(html).not.toMatch(/\b(rounded-panel|bg-surface)\b/);
  expect(texts(html, 'p')).toEqual(['Rejecting it loses the record.', 'The sale is <code>recorded</code>.']);
  expect(html).not.toContain('<figure');
});

test('a result is set apart by weight and ink, as a paragraph or the end of one', () => {
  expect(renderToStaticMarkup(<Result>Done.</Result>)).toBe('<p class="font-book text-ink">Done.</p>');
  expect(renderToStaticMarkup(<Result inline>done</Result>)).toBe('<span class="font-book text-ink">done</span>');
});

test('a decision shows its figure after its prose', () => {
  const html = renderToStaticMarkup(
    <Decision title="Every figure in tabular mono" figure={<figure>F</figure>}>
      <p>Digits line up.</p>
    </Decision>,
  );
  expect(html.indexOf('Digits line up.')).toBeLessThan(html.indexOf('<figure>F</figure>'));
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

// renderToStaticMarkup is the markup a visitor gets before hydration, and without JavaScript.
test('before the script runs, a diagram panel is in the tab order and the swipe hint is hidden', () => {
  const html = renderToStaticMarkup(<Diagram label="Diagram: A to B" rows={[[{ l1: 'A', edge: 'calls' }, { l1: 'B' }]]} />);
  // Without the script nothing can measure whether the drawing overflows: a keyboard must reach it anyway.
  expect(html).toMatch(/<div role="img" aria-label="Diagram: A to B" tabindex="0"/);
  expect(html).toMatch(/^<p aria-hidden="true" hidden=""[^>]*>Swipe to see the whole diagram →<\/p>/);
});

test('a code token keeps its text on one line', () => {
  expect(renderToStaticMarkup(<CodeToken>?v=</CodeToken>)).toBe('<code class="whitespace-nowrap">?v=</code>');
});

test('case content is plain markup and components: no utility classes', () => {
  const dir = 'src/content/cases';
  for (const file of readdirSync(dir)) expect(readFileSync(`${dir}/${file}`, 'utf8'), file).not.toContain('className');
});
