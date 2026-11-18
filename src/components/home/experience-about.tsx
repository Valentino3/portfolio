import { EXPERIENCE } from '@/content/experience';
import { SectionHead } from './section-head';

/** Two columns from 1024px up: Experience on the left, About on the right. */
const COLUMN = 'col-span-full lg:col-span-6';

export function ExperienceAbout() {
  return (
    // tabIndex -1: an in-page link moves focus here (see InPageLink), without an outline.
    <section
      id="about"
      aria-label="Experience and about"
      tabIndex={-1}
      className="grid-12 mt-section scroll-mt-6 focus:outline-none"
    >
      <div className={COLUMN}>
        <SectionHead title="Experience" />
        <ul>
          {EXPERIENCE.map(({ when, role, org, summary }) => (
            <li
              key={role}
              className="grid grid-cols-[9.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-b border-rule py-4 max-sm:grid-cols-1"
            >
              <span className="text-ui text-text-2">
                <span className="figures">{when}</span>
              </span>
              <span className="text-base">
                <b className="font-medium">{role}</b>
                <span className="text-text-2">, {org}</span>
              </span>
              <p className="col-start-2 text-base text-text-2 max-sm:col-start-1">{summary}</p>
            </li>
          ))}
        </ul>
      </div>
      {/* About is a third of Experience's height. Side by side it stays in view while Experience
          scrolls past (sticky, inside this section only), so its column is never left empty. */}
      <div className={`${COLUMN} max-lg:mt-subsection lg:sticky lg:top-8 lg:self-start`}>
        <SectionHead title="About" />
        <p className="mt-4 max-w-[52ch] text-lead leading-body text-text-2">
          I like problems where the interface and the system behind it have to agree: a cash count that adds up, a
          report that only shows a client its own numbers, a table that doesn’t jump while it loads.
        </p>
        <p className="mt-4 max-w-[52ch] text-lead leading-body text-text-2">
          Before I call something done, I prove it works, with tests and measurements.
        </p>
      </div>
    </section>
  );
}
