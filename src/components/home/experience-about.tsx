import { SectionHead } from './section-head';

/** `when` is a date range and nothing else: a row without one leaves the column empty. */
const EXPERIENCE: { when?: string; role: string; org: string; summary: string }[] = [
  {
    when: 'Jun 2022 – now',
    role: 'Lead UI Developer',
    org: 'Reset Digital',
    summary:
      'Promoted to Lead. Product UI for the ad platform and Analyzer, the shared component library, multi-tenant authorization, and the security hardening before the first outside client. I lead one engineer.',
  },
  {
    when: 'Jul 2025 – now',
    role: 'Independent',
    org: 'client work and my own product',
    summary:
      'Conosur, a client site I designed, built and maintain, and Stock Tienda, a point-of-sale system three stores pay for.',
  },
  {
    when: '2020 – 2022',
    role: 'Studies',
    org: 'UTN (Universidad Tecnológica Nacional)',
    summary:
      'A year of computer engineering and a year of the programming technical degree. I left to work as a developer full-time.',
  },
  {
    when: 'Jul 2019 – Feb 2020',
    role: 'Web Developer',
    org: 'ReplaceIT',
    summary: 'Applications and websites for several clients, in C#, ASP.NET and Node.js.',
  },
  {
    role: 'Developer Intern',
    org: 'Forensic Informatics (internship)',
    summary: 'Computer-vision tooling for video evidence: face detection and object measurement.',
  },
];

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
              <span className={`text-ui-sm text-text-3 tabular-nums ${when ? '' : 'max-sm:hidden'}`}>{when}</span>
              <span>
                <b className="font-medium">{role}</b>
                <span className="text-text-2">, {org}</span>
              </span>
              <p className="col-start-2 text-ui-sm text-text-2 max-sm:col-start-1">{summary}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${COLUMN} max-lg:mt-14`}>
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
