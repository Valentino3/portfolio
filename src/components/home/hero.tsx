import Link from 'next/link';
import type { ReactNode } from 'react';
import { ExternalLink } from '@/components/site/external-link';
import { LEDE } from '@/content/profile';
import { CV_PAGE, GITHUB, HEADLINE, LINKEDIN, NAME } from '@/lib/site';

// The footer's link style: touch targets grow on coarse pointers.
const LINK = 'link-u touch-target py-1 pointer-coarse:py-2.75';

/**
 * The name and headline, the lede with the profile links under it, and the 12-column grid they
 * share with the project list. Children are grid items of that grid (a fragment keeps them direct
 * children). On a wide screen with a fine pointer it is two rows of two: name and lede, then the
 * list and the project viewer, each pair on the same top edge. Everywhere else the four stack.
 *
 * The name is the h1; the headline continues it at the same size, a step lighter, as its dek.
 * The CV comes first among the links and is the one in ink and a step heavier: it is what a
 * recruiter came for. It opens the CV page, in this tab, which offers the PDF.
 */
export function Hero({ children }: { children: ReactNode }) {
  return (
    <div className="grid-12 mt-hero-top">
      <hgroup className="col-span-full text-intro viewer:col-span-6 viewer:self-baseline">
        <h1>{NAME}</h1>
        <p className="text-text-3">{HEADLINE}</p>
      </hgroup>
      <div className="col-span-full mt-4 viewer:col-span-6 viewer:col-start-7 viewer:mt-0 viewer:self-baseline">
        <p className="max-w-[46ch] text-lead text-text-2">{LEDE}</p>
        <p data-profile-links="" className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-ui text-text-3">
          <Link href={CV_PAGE} className={`${LINK} font-medium text-ink`}>
            CV
          </Link>
          <ExternalLink href={GITHUB} className={LINK}>
            GitHub
          </ExternalLink>
          <ExternalLink href={LINKEDIN} className={LINK}>
            LinkedIn
          </ExternalLink>
        </p>
      </div>
      {children}
    </div>
  );
}
