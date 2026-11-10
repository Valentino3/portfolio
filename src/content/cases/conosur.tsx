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
  ],
  seo: {
    description:
      'The website of CONOSUR, a music artist: releases, collaborators and videos, in Spanish and English.',
  },
};
