import type { Metadata } from 'next';
import { Resume } from '@/components/cv/resume';
import { SiteHeader } from '@/components/site/site-header';
import { CV_URL } from '@/lib/site';

// Not for search engines: the home is the page to find. No canonical or Open Graph URL either,
// those in the layout belong to the home.
export const metadata: Metadata = {
  title: 'CV — Valentino Rota',
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: null,
};

/**
 * The CV as a page of the site: the header, the sheet, the footer. Printed (or exported by
 * `npm run resume`) it is the sheet alone on one A4 page: see the print rules in globals.css.
 * Every CV link on the site lands here; the PDF is one step further, the first thing above the
 * sheet, on its left edge where reading starts, and it says what the file is.
 */
export default function CvPage() {
  return (
    <>
      <div className="print:hidden">
        <SiteHeader variant="cv" />
      </div>
      <main id="main" data-cv="" className="mt-back-top print:mt-0">
        {CV_URL && (
          <p className="mx-auto mb-3 flex max-w-sheet flex-wrap items-baseline gap-x-2.5 text-ui-sm text-text-3 print:hidden">
            <a
              href={CV_URL}
              download
              className="link-u touch-target py-1 font-medium text-ink pointer-coarse:py-2.75"
            >
              Download PDF
            </a>
            <span>One A4 page, the same as below</span>
          </p>
        )}
        <Resume />
      </main>
    </>
  );
}
