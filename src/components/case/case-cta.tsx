import Link from 'next/link';
import { CV_PAGE, EMAIL } from '@/lib/site';

const LINK = 'link-u touch-target py-1 pointer-coarse:py-2.75';

/**
 * The contact block at the end of a case, where the header's "Contact" link lands. Shorter than
 * the home's: the reader has just finished one project, so it is one line and the two next steps,
 * the address and the CV (the page, which offers the PDF). The roles and the time zone are in the
 * header's line above. A plain mailto: the copy button belongs to the home's contact section. As
 * on the home, the heading is for assistive tech only.
 */
export function CaseCta() {
  return (
    // tabIndex -1: the header's "Contact" moves focus here (see InPageLink), without an outline.
    <section
      id="contact"
      aria-labelledby="cta-h"
      tabIndex={-1}
      className="mt-case-end border-t border-rule pt-6 focus:outline-none"
    >
      <h2 id="cta-h" className="sr">
        Contact
      </h2>
      <p className="text-base text-text-2">Questions about this project, or a role to talk about? Write to me.</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <a
          href={`mailto:${EMAIL}`}
          className="touch-target relative text-dek font-medium wrap-anywhere text-ink underline-offset-5 hover:underline focus-visible:underline"
        >
          {EMAIL}
        </a>
        <Link href={CV_PAGE} className={`${LINK} text-dek font-medium text-ink`}>
          CV
        </Link>
      </p>
    </section>
  );
}
