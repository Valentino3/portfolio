import type { Metadata } from 'next';
import Link from 'next/link';
import { InPageLink } from '@/components/site/in-page-link';
import { SiteHeader } from '@/components/site/site-header';

// No canonical or Open Graph URL: those in the layout belong to the home, not to a missing page.
export const metadata: Metadata = {
  title: 'Page not found — Valentino Rota',
  alternates: { canonical: null },
  openGraph: null,
};

const LINK = 'link-u py-1.5 text-text-2 pointer-coarse:py-2.75';

/**
 * Any URL the site does not have, including a case that is not published (or no longer is). The
 * header and footer of every page, a short explanation and the two ways back. Next answers 404.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader variant="other" />
      <main className="mt-back-top">
        <h1 className="text-display font-medium">Page not found</h1>
        <p className="mt-4.5 max-w-[54ch] text-dek text-text-2">There is no page at this address, or it has moved.</p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-ui-sm">
          <li>
            <Link href="/" className={LINK}>
              Home
            </Link>
          </li>
          <li>
            <InPageLink href="/#work" className={LINK}>
              All work
            </InPageLink>
          </li>
        </ul>
      </main>
    </>
  );
}
