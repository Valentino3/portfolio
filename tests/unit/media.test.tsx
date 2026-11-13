import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { BeforeAfter } from '@/components/case/before-after';
import { Clip } from '@/components/case/clip';
import { Figure } from '@/components/case/figure';
import { GALLERY_SIZES, Gallery } from '@/components/case/gallery';
import { CLIPS, type ClipName } from '@/content/clips';
import type { Media } from '@/content/types';

const image: Media = { src: '/img/dsp2-websites.webp', width: 2400, height: 1665, alt: 'A table of websites' };

// renderToStaticMarkup is the markup a visitor gets before hydration (and without JavaScript).

test('a figure is a picture and a two-part caption, and the picture can be left unlinked', () => {
  const html = renderToStaticMarkup(
    <Figure image={image} caption="Websites table" note="mock data" sizes={GALLERY_SIZES.half} />,
  );
  expect(html).toMatch(/^<figure>/);
  expect(html).toContain('<figcaption');
  // On a phone the note runs on after the caption in parentheses; from 640px up it sits at the end of the row.
  const caption = html.match(/<figcaption[^>]*>(.*)<\/figcaption>/)![1];
  expect(caption.replace(/<[^>]+>/g, '')).toBe('Websites table (mock data)');
  expect(caption).toMatch(/^<span>Websites table<\/span> <span><span class="sm:hidden">\(<\/span>mock data/);
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
  const html = renderToStaticMarkup(<Clip name="bakery-scroll" alt="The page scrolls" caption="Scroll" />);
  const video = html.match(/<video [^>]*>/)![0];
  // HTML attribute names are case-insensitive: React writes playsInline as is.
  for (const attribute of ['muted=""', 'loop=""', 'playsinline=""', 'preload="none"', 'data-clip=""']) {
    expect(video.toLowerCase()).toContain(attribute);
  }
  expect(video).toContain('poster="/media/bakery-scroll-poster.webp"');
  expect(video).toContain('width="2560"');
  expect(video).toContain('height="1600"');
  expect(video).toContain('aria-label="The page scrolls"');
  expect(video).not.toMatch(/\b(autoplay|controls)\b/i);
  expect(html).toContain('<source src="/media/bakery-scroll.webm" type="video/webm"/>');
  expect(html.match(/<figcaption[^>]*>(.*)<\/figcaption>/)![1]).toBe('<span>Scroll</span>');
  expect(html).not.toContain('<button');
  // Standalone in a section, so it brings its own space above, like galleries and diagrams.
  expect(html).toMatch(/^<figure class="mt-6">/);
});

test('a clip reserves its own size from the registry, not an assumed 1280x800', () => {
  for (const [name, { width, height }] of Object.entries(CLIPS)) {
    const html = renderToStaticMarkup(<Clip name={name as ClipName} alt="A clip" caption="Clip" />);
    const video = html.match(/<video [^>]*>/)![0];
    expect(video, name).toContain(`width="${width}"`);
    expect(video, name).toContain(`height="${height}"`);
  }
  expect(CLIPS['stock-counter']).toEqual({ width: 1952, height: 1226 });
});

test('a three-column gallery stacks on a phone', () => {
  const html = renderToStaticMarkup(
    <Gallery columns={3}>
      <figure>one</figure>
    </Gallery>,
  );
  expect(html).toMatch(/^<div class="[^"]*\bgrid-cols-3\b[^"]*\bmax-sm:grid-cols-1\b/);
});

test('a narrow clip (near square or portrait) is capped and aligned with the text; a wide one is not', () => {
  const narrow = renderToStaticMarkup(<Clip name="dsp2-weights" alt="Sliders move" caption="Weights" />);
  expect(narrow).toMatch(/^<figure class="mt-6 max-w-lg">/);
  expect(narrow).not.toContain('mx-auto');
  const wide = renderToStaticMarkup(<Clip name="conosur-releases" alt="Releases" caption="Releases" />);
  expect(wide).toMatch(/^<figure class="mt-6">/);
});

const before: Media = { src: '/img/dsp2-badges-before.webp', width: 1876, height: 790, alt: 'Badges, names only' };
const after: Media = { src: '/img/dsp2-badges-after.webp', width: 1876, height: 790, alt: 'Badges with scores' };

test('a before/after pair is two captioned figures, side by side from 640px, each opening its own zoom', () => {
  const html = renderToStaticMarkup(
    <BeforeAfter
      before={{ image: before, caption: 'Before: colour only' }}
      after={{ image: after, caption: 'After: the score on the badge' }}
    />,
  );
  expect(html).toMatch(/^<div class="[^"]*\bgrid-cols-2\b[^"]*\bmax-sm:grid-cols-1\b/);
  expect(html.match(/<figure>/g)).toHaveLength(2);
  expect([...html.matchAll(/<figcaption[^>]*>(.*?)<\/figcaption>/g)].map((m) => m[1])).toEqual([
    '<span>Before: colour only</span>',
    '<span>After: the score on the badge</span>',
  ]);
  const links = [...html.matchAll(/<a [^>]*>/g)].map((m) => m[0]);
  expect(links).toHaveLength(2);
  expect(links[0]).toContain('href="/img/dsp2-badges-before.webp"');
  expect(links[0]).toContain('aria-label="Enlarge: Before: colour only"');
  expect(links[1]).toContain('href="/img/dsp2-badges-after.webp"');
  expect(html).toMatch(/<img [^>]*alt="Badges, names only"/);
  expect(html).toMatch(/<img [^>]*alt="Badges with scores"/);
  expect(html.match(/<img [^>]*width="1876"[^>]*height="790"/g)).toHaveLength(2);
  // Half the column from 640px up, the whole screen below; no crop unless asked for.
  expect(html).toContain('sizes="(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw"');
  expect(html).not.toContain('--crop');
  // Nothing set above the pictures: the captions say which is which.
  expect(html.indexOf('<figure>')).toBe(html.indexOf('>') + 1);
});

test('a cropped pair shows the same strip of both pictures on a phone, larger, and whole from 640px up', () => {
  const html = renderToStaticMarkup(
    <BeforeAfter
      crop={{ x: 0.4, width: 0.25 }}
      before={{ image: before, caption: 'Before' }}
      after={{ image: after, caption: 'After' }}
    />,
  );
  const images = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  expect(images).toHaveLength(2);
  for (const img of images) {
    expect(img).toMatch(/style="[^"]*--crop-x:0.4;--crop-width:0.25/);
    // Every crop rule is behind max-sm: from 640px up the picture is whole.
    for (const rule of ['w-[calc(100%/var(--crop-width))]', 'max-w-none', 'translate-x-[calc(-100%*var(--crop-x))]'])
      expect(img).toContain(`max-sm:${rule}`);
    expect(img).toContain('class="block h-auto w-full ');
    // On a phone it is laid out four times the screen's width, so it asks for a copy that wide.
    expect(img).toContain('sizes="(min-width: 1024px) 330px, (min-width: 640px) 50vw, 400vw"');
  }
  // The zoom still opens the whole file.
  expect(html).toContain('href="/img/dsp2-badges-before.webp"');
});
