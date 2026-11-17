import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { CV_PAGE, EMAIL, GITHUB, LINKEDIN } from '@/lib/site';

/** Every href inside the first <nav> whose aria-label matches. */
function navHrefs(html: string, label: string): string[] {
  const nav = html.match(new RegExp(`<nav aria-label="${label}"[^>]*>(.*?)</nav>`))?.[1] ?? '';
  return [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
}

/** The availability line, as the header renders it (the middot and the minus sign as they are). */
const STATUS = 'Design engineering and full-stack roles · remote (UTC−3) or on-site in Buenos Aires (relocating)';

test('home header links to sections on the same page, then the CV page, and states roles and where, no clock', () => {
  const html = renderToStaticMarkup(<SiteHeader variant="home" />);
  expect(navHrefs(html, 'Primary')).toEqual(['#work', '#about', '#contact', CV_PAGE]);
  expect(html).toContain(STATUS);
  expect(html).not.toContain('<time');
  // The location is the footer's: the header's line already says where.
  expect(html).not.toContain('Mar del Plata');
});

test('case header points Work and About at the home, keeps its own Contact, and links the CV page', () => {
  const html = renderToStaticMarkup(<SiteHeader variant="case" />);
  expect(navHrefs(html, 'Primary')).toEqual(['/#work', '/#about', '#contact', CV_PAGE]);
  expect(html).toContain(STATUS);
  expect(html).not.toContain('<time');
});

test('any other page (the 404) points the sections at the home, and links the CV page', () => {
  const html = renderToStaticMarkup(<SiteHeader variant="other" />);
  expect(navHrefs(html, 'Primary')).toEqual(['/#work', '/#about', '/#contact', CV_PAGE]);
  expect(html).toContain(STATUS);
});

test('the CV link opens in this tab, and on the CV page it is the current page, in ink', () => {
  for (const variant of ['home', 'case', 'other'] as const) {
    const cv = renderToStaticMarkup(<SiteHeader variant={variant} />).match(/<a [^>]*href="\/cv"[^>]*>/)?.[0] ?? '';
    expect(cv).not.toContain('aria-current');
    expect(cv).not.toContain('target=');
    expect(cv).not.toContain('text-ink');
  }
  const html = renderToStaticMarkup(<SiteHeader variant="cv" />);
  expect(navHrefs(html, 'Primary')).toEqual(['/#work', '/#about', '/#contact', CV_PAGE]);
  const cv = html.match(/<a [^>]*href="\/cv"[^>]*>/)?.[0] ?? '';
  expect(cv).toContain('aria-current="page"');
  expect(cv).toContain('text-ink');
  expect(html.match(/aria-current/g)).toHaveLength(1);
});

test('every header variant is the #top focus target of the back to top link', () => {
  for (const variant of ['home', 'case', 'cv', 'other'] as const) {
    const html = renderToStaticMarkup(<SiteHeader variant={variant} />);
    expect(html).toContain('id="top"');
    expect(html).toContain('tabindex="-1"');
  }
});

test('footer has the CV page, the three contact links, where the owner lives, and back to top', () => {
  const html = renderToStaticMarkup(<SiteFooter />);
  expect(navHrefs(html, 'Footer')).toEqual([CV_PAGE, GITHUB, LINKEDIN, `mailto:${EMAIL}`]);
  // At every width, not on a phone only: the header no longer shows it.
  expect(html).toContain('© 2026 Valentino Rota, Mar del Plata, Argentina</span>');
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

test('the availability dot is a still status marker, and every header and footer link is a touch target', () => {
  for (const variant of ['home', 'case', 'cv', 'other'] as const) {
    const html = renderToStaticMarkup(<SiteHeader variant={variant} />);
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*bg-available[^"]*"><\/span>/);
    expect(html).not.toContain('animate-');
    for (const a of html.match(/<a [^>]*>/g) ?? []) expect(a).toContain('touch-target');
  }
  for (const a of renderToStaticMarkup(<SiteFooter />).match(/<a [^>]*>/g) ?? []) expect(a).toContain('touch-target');
});
