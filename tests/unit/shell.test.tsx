import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { EMAIL, GITHUB, LINKEDIN } from '@/lib/site';

/** Every href inside the first <nav> whose aria-label matches. */
function navHrefs(html: string, label: string): string[] {
  const nav = html.match(new RegExp(`<nav aria-label="${label}"[^>]*>(.*?)</nav>`))?.[1] ?? '';
  return [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
}

test('home header links to sections on the same page and shows the clock', () => {
  const html = renderToStaticMarkup(<SiteHeader variant="home" />);
  expect(navHrefs(html, 'Primary')).toEqual(['#work', '#about', '#contact']);
  expect(html).toContain('local time');
  expect(html).toContain('--:--');
  expect(html).toContain('Open to roles in Buenos Aires or remote');
});

test('case header points Work and About at the home and only shows the location', () => {
  const html = renderToStaticMarkup(<SiteHeader variant="case" />);
  expect(navHrefs(html, 'Primary')).toEqual(['/#work', '/#about', '#contact']);
  expect(html).toContain('Mar del Plata, Argentina');
  expect(html).not.toContain('local time');
  expect(html).not.toContain('<time');
  expect(html).toContain('Open to roles in Buenos Aires or remote');
});

test('any other page (the 404) points all three at the home, and only shows the location', () => {
  const html = renderToStaticMarkup(<SiteHeader variant="other" />);
  expect(navHrefs(html, 'Primary')).toEqual(['/#work', '/#about', '/#contact']);
  expect(html).toContain('Mar del Plata, Argentina');
  expect(html).not.toContain('<time');
});

test('every header variant is the #top focus target of the back to top link', () => {
  for (const variant of ['home', 'case', 'other'] as const) {
    const html = renderToStaticMarkup(<SiteHeader variant={variant} />);
    expect(html).toContain('id="top"');
    expect(html).toContain('tabindex="-1"');
  }
});

test('footer has the three contact links and back to top, and no résumé link', () => {
  const html = renderToStaticMarkup(<SiteFooter />);
  expect(navHrefs(html, 'Footer')).toEqual([GITHUB, LINKEDIN, `mailto:${EMAIL}`]);
  expect(html).toContain('© 2026 Valentino Rota');
  expect(html).toContain('href="#top"');
  expect(html).toContain('Back to top');
  expect(html).not.toMatch(/r[ée]sum[ée]/i);
});

test('external links open in a new tab, safely, and say so', () => {
  const html = renderToStaticMarkup(<SiteFooter />);
  const external = html.match(/<a [^>]*target="_blank"[^>]*>.*?<\/a>/g) ?? [];
  expect(external).toHaveLength(2);
  for (const a of external) {
    expect(a).toContain('rel="noopener noreferrer"');
    expect(a).toContain('(opens in a new tab)');
  }
});
