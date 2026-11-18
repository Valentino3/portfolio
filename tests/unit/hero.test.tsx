import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { Hero } from '@/components/home/hero';
import { CV_PAGE, GITHUB, HEADLINE, LINKEDIN, NAME } from '@/lib/site';

const hero = async (): Promise<string> => renderToStaticMarkup(<Hero>{null}</Hero>);

/** The links of the profile row, as [href, text] pairs. */
function profileLinks(html: string): [string, string][] {
  const row = html.match(/<p data-profile-links=""[^>]*>(.*?)<\/p>/)?.[1] ?? '';
  return [...row.matchAll(/<a [^>]*?href="([^"]+)"[^>]*>(.*?)(?:<span|<\/a>)/g)].map((m) => [m[1], m[2]]);
}

test('the name is the one h1, and the headline is its dek in the same group', async () => {
  const html = await hero();
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(html).toMatch(new RegExp(`<hgroup[^>]*><h1>${NAME}</h1><p[^>]*>${HEADLINE}</p></hgroup>`));
  // Visible, not a screen-reader-only prefix of the headline.
  expect(html.match(/<hgroup[^>]*>.*?<\/hgroup>/)?.[0]).not.toContain('class="sr"');
});

test('the CV comes first and opens the CV page in this tab; GitHub and LinkedIn follow in a new one', async () => {
  const html = await hero();
  expect(profileLinks(html)).toEqual([
    [CV_PAGE, 'CV'],
    [GITHUB, 'GitHub'],
    [LINKEDIN, 'LinkedIn'],
  ]);
  const cv = html.match(/<a [^>]*href="\/cv"[^>]*>.*?<\/a>/)?.[0] ?? '';
  expect(cv).not.toContain('target=');
  expect(cv).not.toContain('(opens in a new tab)');
  for (const href of [GITHUB, LINKEDIN]) {
    const a = html.match(new RegExp(`<a [^>]*href="${href}"[^>]*>.*?</a>`))?.[0] ?? '';
    expect(a).toContain('target="_blank"');
    expect(a).toContain('(opens in a new tab)');
  }
});

test('the CV is the primary link: in ink and a step heavier, the others quieter', async () => {
  const html = await hero();
  expect(html).toMatch(/<p data-profile-links="" class="[^"]*\btext-text-3\b/);
  const cv = html.match(/<a [^>]*href="\/cv"[^>]*>/)?.[0] ?? '';
  expect(cv).toContain('text-ink');
  expect(cv).toContain('font-medium');
  for (const a of html.match(/<a [^>]*target="_blank"[^>]*>/g) ?? []) expect(a).not.toContain('text-ink');
});

test('profile links grow to a touch target on coarse pointers, like the footer’s', async () => {
  const html = await hero();
  for (const a of html.match(/<a [^>]*>/g) ?? []) {
    expect(a).toContain('pointer-coarse:py-2.75');
    // "CV" is two letters wide: the hit area grows sideways too, to 44px.
    expect(a).toContain('touch-target');
  }
});
