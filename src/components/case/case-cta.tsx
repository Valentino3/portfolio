import { ContactLine } from '@/components/site/contact-line';
import { EMAIL } from '@/lib/site';

/**
 * The contact block at the end of a case, where the header's "Contact" link lands. A plain
 * mailto: the copy button belongs to the home's contact section. As on the home, the heading is
 * for assistive tech only.
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
      <ContactLine />
      <p className="mt-2.5">
        <a
          href={`mailto:${EMAIL}`}
          className="text-mail font-medium wrap-anywhere underline-offset-6 hover:underline hover:decoration-2 focus-visible:underline focus-visible:decoration-2"
        >
          {EMAIL}
        </a>
      </p>
    </section>
  );
}
