import type { ReactNode } from 'react';
import { EMAIL } from '@/lib/site';
import { SectionHead } from './section-head';

/**
 * The address is a mailto link, large. `children` is the slot next to it,
 * where the copy button goes. The address text is in `[data-mail-text]` so a
 * failed copy can select it.
 */
export function Contact({ children }: { children?: ReactNode }) {
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
        {children}
      </div>
    </section>
  );
}
