/**
 * Work history and studies, newest first. The home's Experience list shows every entry in this
 * order; the CV splits them by `kind` into Experience and Education.
 */
export type ExperienceEntry = {
  /** A date or a date range and nothing else. */
  when: string;
  role: string;
  org: string;
  summary: string;
  kind: 'work' | 'education';
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    when: 'Jun 2022 – now',
    role: 'Lead UI Developer',
    org: 'Reset Digital',
    summary:
      'UI Developer from 2022, Lead since 2025. In practice I work across the stack: product UI for the ad platform and Analyzer, the shared component library, multi-tenant authorization, and the security hardening before the first outside client. I lead one engineer: I review their pull requests and we have regular one-on-ones.',
    kind: 'work',
  },
  {
    when: 'Jul 2025 – now',
    role: 'Independent',
    // Side work next to the full-time role, and said so: two "now" rows read as a choice otherwise.
    org: 'alongside Reset Digital',
    summary:
      'Conosur, a client site I designed, built and maintain, and Stock Tienda, a point-of-sale system three stores pay for.',
    kind: 'work',
  },
  {
    when: '2020 – 2022',
    role: 'Studies',
    org: 'UTN (Universidad Tecnológica Nacional)',
    summary:
      'A year of computer engineering and a year of the programming technical degree. I left to work as a developer full-time.',
    kind: 'education',
  },
  {
    when: 'Jul 2019 – Feb 2020',
    role: 'Web Developer',
    org: 'ReplaceIT',
    summary: 'Applications and websites for several clients, in C#, ASP.NET and Node.js.',
    kind: 'work',
  },
  {
    when: '2018',
    role: 'Developer Intern',
    org: 'Forensic Informatics (internship)',
    summary: 'Computer-vision tooling for video evidence: face detection and object measurement.',
    kind: 'work',
  },
];

export const workHistory = (): ExperienceEntry[] => EXPERIENCE.filter((e) => e.kind === 'work');
export const studies = (): ExperienceEntry[] => EXPERIENCE.filter((e) => e.kind === 'education');
