import Link from 'next/link';
import { LOCATION } from '@/content/profile';
import { CV_PAGE, EMAIL, GITHUB, LINKEDIN, NAME } from '@/lib/site';
import { ExternalLink } from './external-link';
import { InPageLink } from './in-page-link';

const LINK = 'link-u touch-target py-1 pointer-coarse:py-2.75';

/**
 * Where the owner is now, the ways to reach them (the CV first, a page of the site like the
 * header's), and back to top. The header's line says where they can work; this one says where
 * they live, on every page and at every width.
 */
export function SiteFooter() {
  return (
    <footer className="mt-footer-top flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-rule pt-4.5 pb-8 text-small text-text-3">
      <span>
        © 2026 {NAME}, {LOCATION}
      </span>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
        <Link href={CV_PAGE} className={LINK}>
          CV
        </Link>
        <ExternalLink href={GITHUB} className={LINK}>
          GitHub
        </ExternalLink>
        <ExternalLink href={LINKEDIN} className={LINK}>
          LinkedIn
        </ExternalLink>
        <a href={`mailto:${EMAIL}`} className={LINK}>
          Email
        </a>
      </nav>
      <InPageLink href="#top" className={LINK}>
        Back to top <span aria-hidden="true">↑</span>
      </InPageLink>
    </footer>
  );
}
