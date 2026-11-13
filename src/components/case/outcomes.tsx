import type { Outcome } from '@/content/case-types';

/** The three results, side by side from 1024px up, each under an ink rule. */
export function Outcomes({ outcomes }: { outcomes: Outcome[] }) {
  return (
    <ul aria-label="Outcomes" className="grid-12 mt-outcomes-top gap-y-7">
      {outcomes.map(({ title, body }) => (
        <li key={title} className="col-span-4 border-t border-ink pt-4 max-lg:col-span-full">
          <b className="block text-outcome font-medium">{title}</b>
          <p className="mt-2 text-ui text-text-2">{body}</p>
        </li>
      ))}
    </ul>
  );
}
