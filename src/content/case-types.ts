import type { ReactNode } from 'react';
import type { Media, Slug } from './types';

/**
 * A case study's own content. Title, number, context and years are not repeated here: the
 * template takes them from the project summary (`projects.ts`), the single source for the home
 * list, the viewer and "Next project" too.
 */
export type Fact = { label: string; value: ReactNode };
export type Outcome = { title: string; body: string };
/** A numbered section of the body. `id` is its anchor and its entry in the index. */
export type CaseSection = { id: string; title: string; body: ReactNode };
export type CaseStudy = {
  slug: Slug;
  dek: string;
  facts: [Fact, Fact, Fact, Fact];
  hero: { image: Media; caption: string; note: string };
  outcomes: [Outcome, Outcome, Outcome];
  sections: CaseSection[];
  seo: { description: string };
};
