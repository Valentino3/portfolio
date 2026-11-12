import { Clip } from '@/components/case/clip';
import { Decision, Decisions, Result } from '@/components/case/decisions';
import { Diagram } from '@/components/case/diagram';
import { Figure } from '@/components/case/figure';
import { GALLERY_SIZES, Gallery } from '@/components/case/gallery';
import { ExternalLink } from '@/components/site/external-link';
import type { CaseStudy } from '../case-types';
import type { Media } from '../types';

const releases: Media = {
  src: '/img/conosur-pay-respects.webp',
  width: 2400,
  height: 1500,
  alt: 'Releases: a strip of albums and singles above the embedded player and track list',
};
const collaborators: Media = {
  src: '/img/conosur-collabs.webp',
  width: 2400,
  height: 1500,
  alt: 'Collaborators directory: filters by role, a list of 22 people and their credits per project',
};
const videos: Media = {
  src: '/img/conosur-watch.webp',
  width: 2400,
  height: 1500,
  alt: 'Videos section with a large player',
};

export const conosur: CaseStudy = {
  slug: 'conosur',
  dek: 'The website of CONOSUR, a music artist: releases with a Spotify player that falls back to YouTube, a directory of 22 collaborators, and videos, in Spanish and English. Client work: I designed and built it, and I’ve deployed and maintained it since July 2025.',
  meta: [
    'Design, build, deploy and maintenance, for CONOSUR, music artist.',
    <>
      React, TypeScript, Vite, Tailwind, Framer Motion, i18next, Nginx. Live at{' '}
      <ExternalLink href="https://conosur.tv">conosur.tv</ExternalLink>.
    </>,
  ],
  hero: {
    image: {
      src: '/img/conosur-landing.webp',
      width: 2400,
      height: 1500,
      alt: 'Conosur home: the logo over a dark mountain landscape, with navigation and social links',
    },
    caption: 'Home',
    note: 'conosur.tv',
  },
  outcomes: [
    {
      title: 'Live since July 2025',
      body: 'Maintained for more than a year: new releases, collaborators, and a rewritten deploy workflow.',
    },
    {
      title: 'Music that keeps playing when Spotify fails',
      body: 'If the Spotify player doesn’t load, the release switches to a YouTube player.',
    },
    {
      title: 'Two languages',
      body: 'Spanish and English, detected from the browser and switchable from the header.',
    },
  ],
  sections: [
    {
      id: 'context',
      title: 'Context',
      body: (
        <>
          <p>
            An artist needs one place for everything: new releases, the people who worked on them, and videos. It has
            to feel like the music, dark and cinematic, and work for listeners in Spanish and English.
          </p>
          <p>
            One dark landscape sits behind every section, with translucent panels on top and small, widely spaced
            labels, so the cover art and the people carry the color.
          </p>
        </>
      ),
    },
    {
      id: 'decisions',
      title: 'Decisions',
      body: (
        <>
          <Decisions>
            <Decision title="Spotify first, YouTube as a fallback">
              <Result>
                Instead of a single embed: if the Spotify embed hasn’t loaded after ten seconds, it retries twice;
                after that, the same release plays in a YouTube player.
              </Result>
              <p>
                Embeds fail: access tokens expire and players get blocked. A release page with a broken player is a
                dead end.
              </p>
            </Decision>
            <Decision title="Motion that follows the visitor">
              <p>
                Sections enter as you scroll and the player transitions between releases, but nobody should be forced
                to watch it.
              </p>
              <Result>
                Framer Motion for entrances and transitions; scrolling and CSS animations respect the reduced-motion
                setting.
              </Result>
            </Decision>
            <Decision title="A store, decided with the client">
              <p>
                The artist wanted to sell merch. Before writing code, I wrote a decision document with five options,
                their monthly costs, fees and build times, instead of picking a platform and building.
              </p>
              <Result>
                The result was a recommendation (a custom storefront inside the site, on top of Shopify), plus an
                early warning: none of the five options could sell show tickets.
              </Result>
            </Decision>
          </Decisions>
          <Clip
            name="conosur-releases"
            alt="Screen recording: the home scrolls into the releases section, then two releases are selected and the cover and player change"
            caption="Motion: scrolling into releases and switching between them"
          />
          <Diagram
            label="Diagram: the releases section loads the Spotify embed; if it hasn’t loaded after ten seconds, it retries twice, and then the same release plays in a YouTube player."
            rows={[
              [
                { l1: 'Release selected' },
                { l1: 'Spotify embed', l2: '10 s timeout, 2 retries', edge: 'still failing', dashed: true },
                { l1: 'YouTube player', l2: 'same release', dark: true },
              ],
            ]}
          />
          <p className="mt-6">
            Deploys run on GitHub Actions, which builds the site and ships it over SSH to a server behind Nginx.
          </p>
        </>
      ),
    },
    {
      id: 'interface',
      title: 'Interface',
      body: (
        <Gallery>
          <Figure image={releases} caption="Releases and player" sizes={GALLERY_SIZES.wide} wide zoom />
          <Figure image={collaborators} caption="Collaborators and credits" sizes={GALLERY_SIZES.half} zoom />
          <Figure image={videos} caption="Videos" sizes={GALLERY_SIZES.half} zoom />
        </Gallery>
      ),
    },
  ],
  seo: {
    description:
      'The website of CONOSUR, a music artist: releases, collaborators and videos, in Spanish and English.',
  },
};
