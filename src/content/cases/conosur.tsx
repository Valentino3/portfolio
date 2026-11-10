import { Clip } from '@/components/case/clip';
import { DecisionCard, DecisionCards } from '@/components/case/decision-card';
import { Diagram } from '@/components/case/diagram';
import { ExternalLink } from '@/components/site/external-link';
import type { CaseStudy } from '../case-types';

export const conosur: CaseStudy = {
  slug: 'conosur',
  dek: 'The website of CONOSUR, a music artist: releases with a Spotify player that falls back to YouTube, a directory of 22 collaborators, and videos, in Spanish and English. Client work: I designed and built it, and I’ve deployed and maintained it since July 2025.',
  facts: [
    { label: 'Role', value: 'Design, build, deploy and maintenance' },
    { label: 'Client', value: 'CONOSUR, music artist' },
    { label: 'Stack', value: 'React, TypeScript, Vite, Tailwind, Framer Motion, i18next, Nginx' },
    { label: 'Live', value: <ExternalLink href="https://conosur.tv">conosur.tv</ExternalLink> },
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
          <DecisionCards>
            <DecisionCard
              title="Spotify first, YouTube as a fallback"
              rows={[
                ['Instead of', 'A single embed.'],
                [
                  'Why',
                  'Embeds fail: access tokens expire and players get blocked. A release page with a broken player is a dead end.',
                ],
                [
                  'Result',
                  'If the Spotify embed hasn’t loaded after ten seconds, it retries twice; after that, the same release plays in a YouTube player.',
                ],
              ]}
            />
            <DecisionCard
              title="Motion that follows the visitor"
              rows={[
                [
                  'Why',
                  'Sections enter as you scroll and the player transitions between releases, but nobody should be forced to watch it.',
                ],
                [
                  'Result',
                  'Framer Motion for entrances and transitions; scrolling and CSS animations respect the reduced-motion setting.',
                ],
              ]}
            />
            <DecisionCard
              title="A store, decided with the client"
              rows={[
                ['Instead of', 'Picking a platform and building.'],
                [
                  'Why',
                  'The artist wanted to sell merch. Before writing code, I wrote a decision document with five options, their monthly costs, fees and build times.',
                ],
                [
                  'Result',
                  'A recommendation (a custom storefront inside the site, on top of Shopify), plus an early warning: none of the five options could sell show tickets.',
                ],
              ]}
            />
          </DecisionCards>
          <Clip
            name="conosur-releases"
            alt="Screen recording: the home scrolls into the releases section, then two releases are selected and the cover and player change"
            caption="Motion: scrolling into releases and switching between them"
            note="conosur.tv, recorded"
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
          <p>Deploys run on GitHub Actions, which builds the site and ships it over SSH to a server behind Nginx.</p>
        </>
      ),
    },
  ],
  seo: {
    description:
      'The website of CONOSUR, a music artist: releases, collaborators and videos, in Spanish and English.',
  },
};
