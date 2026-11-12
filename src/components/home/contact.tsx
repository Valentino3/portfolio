import { EMAIL } from '@/lib/site';
import { CopyEmailButton } from './copy-email-button';

/**
 * The address is a mailto link, large, with the copy button next to it (it wraps under the
 * address on a narrow screen) and its status line under both. No visible heading: an address
 * that size names the section by itself, so the h2 is for assistive tech only. The address text
 * is in `[data-mail-text]` so a failed copy can select it.
 */
export function Contact() {
  return (
    // tabIndex -1: an in-page link moves focus here (see InPageLink), without an outline.
    <section
      id="contact"
      aria-labelledby="contact-h"
      tabIndex={-1}
      className="mt-section scroll-mt-6 border-t border-rule pt-6 focus:outline-none"
    >
      <h2 id="contact-h" className="sr">
        Contact
      </h2>
      <p className="text-base text-text-2">
        Open to design engineering and full-stack roles, in Buenos Aires or remote.
      </p>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2.5">
        <a
          href={`mailto:${EMAIL}`}
          className="text-mail font-medium wrap-anywhere underline-offset-6 hover:underline hover:decoration-2 focus-visible:underline focus-visible:decoration-2"
        >
          <span data-mail-text>{EMAIL}</span>
        </a>
        <CopyEmailButton email={EMAIL} />
      </div>
    </section>
  );
}
