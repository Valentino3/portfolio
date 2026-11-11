import { EMAIL } from '@/lib/site';

/**
 * The contact block at the end of a case, where the header's "Contact" link lands. A plain
 * mailto, as in the prototype: the copy button belongs to the home's contact section.
 */
export function CaseCta() {
  return (
    // tabIndex -1: the header's "Contact" moves focus here (see InPageLink), without an outline.
    <section
      id="contact"
      aria-labelledby="cta-h"
      tabIndex={-1}
      className="mt-case-end border-t border-rule pt-5 focus:outline-none"
    >
      <h2 id="cta-h" className="mb-2 font-mono text-label font-normal text-text-3">
        Contact
      </h2>
      <p className="text-base text-text-2">Open to design engineering and full-stack roles, in Buenos Aires or remote.</p>
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
