import type { Outcome } from '@/content/case-types';

/**
 * The three results, side by side from 1024px up, each under an ink rule. They are what a reader
 * skimming the case should take away, so each title is set a step above body text, between the dek
 * and a case h2. The block
 * names itself with a heading that only assistive tech reads: on screen the rules and the size say
 * enough, and heading navigation still reaches "Outcomes" and every result in it.
 */
export function Outcomes({ outcomes }: { outcomes: Outcome[] }) {
  return (
    <section aria-labelledby="outcomes-h" className="mt-case-block">
      <h2 id="outcomes-h" className="sr">
        Outcomes
      </h2>
      <ul aria-labelledby="outcomes-h" className="grid-12 gap-y-7">
        {outcomes.map(({ title, body }) => (
          <li key={title} className="col-span-4 border-t border-ink pt-4 max-lg:col-span-full">
            <h3 className="text-outcome text-ink">{title}</h3>
            <p className="mt-2.5 text-ui text-text-2">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
