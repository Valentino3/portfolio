import { Clip } from '@/components/case/clip';
import { DecisionCard, DecisionCards } from '@/components/case/decision-card';
import { Diagram } from '@/components/case/diagram';
import { Figure } from '@/components/case/figure';
import { GALLERY_SIZES, Gallery } from '@/components/case/gallery';
import type { CaseStudy } from '../case-types';
import { projectSummary } from '../projects';
import type { Media } from '../types';

const directions: Media = {
  src: '/img/bakery-directions.webp',
  width: 2400,
  height: 489,
  alt: 'The three alternative directions side by side: editorial, immersive and grid',
};
const cutouts: Media = {
  src: '/img/bakery-cutouts.webp',
  width: 2400,
  height: 1500,
  alt: 'Current direction: a large serif headline with product cutouts floating over and around the letters',
};
const products: Media = {
  src: '/img/bakery-productos.webp',
  width: 2400,
  height: 1500,
  alt: 'Product showcase with category filters and three product cards',
};

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
        <>
          <p>
            The site keeps its current direction, with product cutouts layered over the type. Before settling, I
            explored three alternatives on the same content: A, editorial, with photography as the lead; B, immersive,
            with full-screen photos; and C, grid, with photos in an asymmetric grid. A floating selector and a{' '}
            <code className="whitespace-nowrap">?v=</code> parameter switch between them.
          </p>
          <Clip
            name="bakery-scroll"
            alt="Screen recording: the headline and product cutouts animate in, then the page scrolls into the manifesto section"
            caption="Motion: entrance and scroll into the manifesto"
            note="placeholder name, recorded"
          />
          <Gallery>
            <Figure
              image={directions}
              caption="A editorial · B immersive · C grid"
              note="placeholder name"
              sizes={GALLERY_SIZES.wide}
              wide
              zoom
            />
            <Figure
              image={cutouts}
              caption="Current direction: cutouts over the type"
              note="placeholder name"
              sizes={GALLERY_SIZES.wide}
              wide
              zoom
            />
          </Gallery>
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
              title="All content in one file"
              rows={[
                [
                  'Why',
                  'Products, process, services, FAQ, gallery and image metadata live in one config. Items marked as unconfirmed render in development, with a mark, and never reach the build.',
                ],
                ['Result', 'The site can’t publish a price or an opening hour the business hasn’t confirmed.'],
              ]}
            />
            <DecisionCard
              title="Buttons that don’t pretend"
              rows={[
                ['Why', 'A link to nowhere is worse than no link.'],
                [
                  'Result',
                  'If the WhatsApp number or the address is missing, the button says so clearly instead of linking nowhere.',
                ],
              ]}
            />
            <DecisionCard
              title="Verification by screenshots"
              rows={[
                ['Why', 'Scroll scenes break in ways a code review can’t see.'],
                [
                  'Result',
                  'Scripts that capture the whole page, product sheets and keyboard states against the preview build.',
                ],
              ]}
            />
          </DecisionCards>
          <Diagram
            label="Diagram: a product photo goes through local background removal, edge cleanup and WebP export at 800 and 1600 pixels before it reaches a scroll scene."
            rows={[
              [
                { l1: 'Product photo' },
                { l1: 'Background removal', l2: 'runs locally' },
                { l1: 'Clean edges', l2: 'WebP 800 / 1600' },
                { l1: 'Scroll scene', l2: 'GSAP', dark: true },
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: 'interface',
      title: 'Interface',
      body: (
        <Gallery>
          <Figure
            image={products}
            caption="Product showcase with filters"
            note="placeholder name"
            sizes={GALLERY_SIZES.wide}
            wide
            zoom
          />
        </Gallery>
      ),
    },
  ],
  seo: {
    description:
      'A self-initiated site concept for a sourdough bakery: three art directions, scroll motion and an image pipeline.',
  },
};
