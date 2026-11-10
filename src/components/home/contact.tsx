import { EMAIL } from '@/lib/site';
import { CopyEmailButton } from './copy-email-button';
import { SectionHead } from './section-head';

/**
 * The address is a mailto link, large, with the copy button next to it (it
 * wraps under the address on a narrow screen) and its status line under both.
 * The address text is in `[data-mail-text]` so a failed copy can select it.
 */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-h" className="mt-section scroll-mt-6">
      <SectionHead id="contact-h" title="Contact" />
      <p className="mt-4.5 text-base text-text-2">
        Open to design engineering and full-stack roles, in Buenos Aires or remote.
      </p>
      <div className="mt-4.5 flex flex-wrap items-baseline gap-x-6 gap-y-2.5">
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
