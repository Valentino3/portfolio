import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { CashClosing } from '@/components/case/cash-closing';
import { getCase } from '@/content/cases';
import { publishedProjects } from '@/content/projects';

const html = renderToStaticMarkup(<CashClosing />);
/** The text of the markup, tags dropped: what the figures read as on the page. */
const text = (markup: string) => markup.replace(/<[^>]+>/g, '');

test('the server renders the closed state: figures in place, no inline styles, no script needed', () => {
  expect(html).not.toContain('style=');
  expect(html).not.toContain('undefined');
  for (const figure of ['20.000,00', '148.350,00', '(15.000,00)', '153.350,00', '0,00'])
    expect(text(html)).toContain(figure);
  // The count is set as 153.350,00 once the earlier digit (2) is hidden by CSS: both are in the
  // box, so the box never changes size while the script swaps them.
  expect(text(html)).toContain('153.2350,00');
  expect(html).toMatch(/data-k="closed">Closed</);
});

test('the ledger is hidden from assistive tech; the visible caption carries the point', () => {
  expect(html).toMatch(/^<figure\b/);
  expect(html).toMatch(/<div [^>]*aria-hidden="true"[^>]*data-ledger=""/);
  const caption = html.match(/<figcaption\b[^>]*>(.*?)<\/figcaption>/)?.[1] ?? '';
  expect(text(caption)).toBe('Closes only at zero differencedemo figures');
  // Nothing outside the ledger but the caption.
  expect(text(html.replace(/<div [^>]*aria-hidden="true"[\s\S]*<\/div><figcaption/, '<figcaption'))).toBe(
    'Closes only at zero differencedemo figures',
  );
});

test('the copy in the body is hidden from 1024px up, where the header shows it; the header copy is not', () => {
  expect(renderToStaticMarkup(<CashClosing inBody />)).toMatch(/^<figure class="[^"]*\blg:hidden\b/);
  expect(html).not.toContain('lg:hidden');
});

test('only Stock Tienda has a piece beside its header', () => {
  const withAside = publishedProjects()
    .map(({ slug }) => slug)
    .filter((slug) => getCase(slug).headerAside !== undefined);
  expect(withAside).toEqual(['stock-tienda']);
});

test('Stock Tienda opens Design decisions with the same piece, hidden where the header shows it', () => {
  const design = getCase('stock-tienda').sections.find(({ id }) => id === 'design')!;
  const body = renderToStaticMarkup(<>{design.body}</>);
  expect(body.match(/data-ledger=""/g)).toHaveLength(1);
  // Right after the paragraph that names the brief, and before the counter clip.
  expect(body).toMatch(/the numbers are the interface[\s\S]*?<\/p><figure class="[^"]*\blg:hidden\b[^"]*"><div [^>]*data-ledger/);
});
