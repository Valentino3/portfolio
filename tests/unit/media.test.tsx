import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { Clip } from '@/components/case/clip';
import { Figure } from '@/components/case/figure';
import { GALLERY_SIZES, Gallery } from '@/components/case/gallery';
import type { Media } from '@/content/types';

const image: Media = { src: '/img/dsp2-websites.webp', width: 2400, height: 1665, alt: 'A table of websites' };

// renderToStaticMarkup is the markup a visitor gets before hydration (and without JavaScript).

test('a figure is a picture and a two-part caption, and the picture can be left unlinked', () => {
  const html = renderToStaticMarkup(
    <Figure image={image} caption="Websites table" note="mock data" sizes={GALLERY_SIZES.half} />,
  );
  expect(html).toMatch(/^<figure>/);
  expect(html).toContain('<figcaption');
  expect(html).toMatch(/<span>Websites table<\/span><span>mock data<\/span>/);
  expect(html).toMatch(/<img [^>]*alt="A table of websites"/);
  expect(html).toMatch(/<img [^>]*width="2400"[^>]*height="1665"/);
  expect(html).not.toContain('<a ');
  // Lazy by default: a figure is not the first thing on the page.
  expect(html).toMatch(/<img [^>]*loading="lazy"/);
  expect(html).not.toContain('fetchpriority');
});

test('with zoom the picture sits in a plain link to the large image, named after the caption', () => {
  const html = renderToStaticMarkup(
    <Figure image={image} caption="Websites table: search" sizes={GALLERY_SIZES.wide} zoom />,
  );
  const link = html.match(/<a [^>]*>/)![0];
  expect(link).toContain('href="/img/dsp2-websites.webp"');
  expect(link).toContain('aria-label="Enlarge: Websites table: search"');
  expect(html.indexOf('<a ')).toBeLessThan(html.indexOf('<img'));
  expect(html.indexOf('</a>')).toBeGreaterThan(html.indexOf('<img'));
  // No note, no empty span.
  expect(html.match(/<figcaption[^>]*>(.*)<\/figcaption>/)![1]).toBe('<span>Websites table: search</span>');
});

test('a priority figure skips the lazy loader and asks for high priority', () => {
  const html = renderToStaticMarkup(<Figure image={image} caption="Hero" sizes="100vw" priority />);
  expect(html).toMatch(/<img [^>]*fetchPriority="high"/);
  expect(html).toMatch(/<img [^>]*loading="eager"/);
});

test('a wide figure asks for the whole row of its gallery', () => {
  const wide = renderToStaticMarkup(<Figure image={image} caption="A" sizes="100vw" wide />);
  const half = renderToStaticMarkup(<Figure image={image} caption="A" sizes="100vw" />);
  expect(wide).toMatch(/^<figure class="col-span-full">/);
  expect(half).not.toContain('col-span-full');
});

test('a gallery is a two-column grid that stacks on a phone', () => {
  const html = renderToStaticMarkup(
    <Gallery>
      <figure>one</figure>
      <figure>two</figure>
    </Gallery>,
  );
  expect(html).toMatch(/^<div class="[^"]*\bgrid-cols-2\b[^"]*\bmax-sm:grid-cols-1\b/);
  expect(html.match(/<figure>/g)).toHaveLength(2);
});

test('before the page script runs a clip is its poster: no autoplay, no controls, no dead button', () => {
  const html = renderToStaticMarkup(
    <Clip name="bakery-scroll" alt="The page scrolls" caption="Scroll" note="recorded" />,
  );
  const video = html.match(/<video [^>]*>/)![0];
  // HTML attribute names are case-insensitive: React writes playsInline as is.
  for (const attribute of ['muted=""', 'loop=""', 'playsinline=""', 'preload="none"', 'data-clip=""']) {
    expect(video.toLowerCase()).toContain(attribute);
  }
  expect(video).toContain('poster="/media/bakery-scroll-poster.webp"');
  expect(video).toContain('width="1280"');
  expect(video).toContain('height="800"');
  expect(video).toContain('aria-label="The page scrolls"');
  expect(video).not.toMatch(/\b(autoplay|controls)\b/i);
  expect(html).toContain('<source src="/media/bakery-scroll.webm" type="video/webm"/>');
  expect(html).toMatch(/<span>Scroll<\/span><span>recorded<\/span>/);
  expect(html).not.toContain('<button');
  // Standalone in a section, so it brings its own space above, like cards, galleries and diagrams.
  expect(html).toMatch(/^<figure class="mt-4\.5">/);
});
