import type { CaseStudy } from '../case-types';
import { projectSummary } from '../projects';

export const bakeryConcept: CaseStudy = {
  slug: 'bakery-concept',
  dek: 'A self-initiated site concept for a local sourdough bakery, which I’m presenting to its owners. An exercise in art direction, scroll motion and an image pipeline. Here the bakery’s name and logo are replaced with a placeholder, “Horno Lento”.',
  facts: [
    { label: 'Role', value: 'Design and build' },
    { label: 'Status', value: 'Concept, being presented to the bakery' },
    { label: 'Stack', value: 'React, TypeScript, Vite, GSAP ScrollTrigger, sharp' },
    { label: 'Scope', value: 'Art direction, scroll scenes, content model, image pipeline' },
  ],
  hero: {
    image: projectSummary('bakery-concept').image,
    caption: 'Direction A, editorial',
    note: 'placeholder name',
  },
  outcomes: [
    {
      title: 'Three art directions, one codebase',
      body: 'Editorial, immersive and grid, switchable from the URL, all reusing the same content and components.',
    },
    {
      title: 'Nothing unconfirmed gets published',
      body: 'Content the business hasn’t confirmed shows in development and is left out of the build.',
    },
    {
      title: 'Photos made usable locally',
      body: 'Cutouts and WebP exports at two sizes, produced on my machine.',
    },
  ],
  sections: [
    {
      id: 'directions',
      title: 'Three directions',
      body: (
        <p>
          The site keeps its current direction, with product cutouts layered over the type. Before settling, I
          explored three alternatives on the same content: A, editorial, with photography as the lead; B, immersive,
          with full-screen photos; and C, grid, with photos in an asymmetric grid. A floating selector and a{' '}
          <code className="whitespace-nowrap">?v=</code> parameter switch between them.
        </p>
      ),
    },
  ],
  seo: {
    description:
      'A self-initiated site concept for a sourdough bakery: three art directions, scroll motion and an image pipeline.',
  },
};
