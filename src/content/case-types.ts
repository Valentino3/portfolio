import type { ReactNode } from 'react';
import type { Media, Slug } from './types';

/**
 * A case study's own content. Title, context and years are not repeated here: the
 * template takes them from the project summary (`projects.ts`), the single source for the home
 * list, the viewer and "Next project" too.
 */
export type Outcome = { title: string; body: string };
/** A section of the body. `id` is its anchor and its entry in the index. */
export type CaseSection = { id: string; title: string; body: ReactNode };
export type CaseStudy = {
  slug: Slug;
  dek: string;
  /**
   * The facts, as two unlabelled paragraphs under the dek. The template opens the first with the
   * project's context and years; it continues with the role and who it was for. The second is
   * what it is built with, then where to see it or where the screens come from.
   */
  meta: [ReactNode, ReactNode];
  /** `note`: where the pictures of this case come from. Said once, here, on the first figure. */
  hero: { image: Media; caption: string; note: string };
  outcomes: [Outcome, Outcome, Outcome];
  sections: CaseSection[];
  seo: { description: string };
};
