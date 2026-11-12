import { SectionHead } from './section-head';

const STACK: { group: string; items: string }[] = [
  { group: 'Frontend', items: 'TypeScript, React, Next.js, Tailwind, MUI, shadcn/Radix' },
  { group: 'Backend', items: 'Node.js, Python, Go, Prisma, Drizzle' },
  { group: 'Data & auth', items: 'MySQL, PostgreSQL, Keycloak (OIDC)' },
  { group: 'Quality & ops', items: 'Jest, Vitest, Playwright, Docker, GitHub Actions' },
];

/** What I work with, under the project list: four run-in groups, two per row from 640px up. */
export function Stack() {
  return (
    <section aria-labelledby="stack-h" className="mt-section">
      <SectionHead id="stack-h" title="Stack" />
      <ul className="mt-4 grid grid-cols-2 gap-x-(--spacing-grid-gap) gap-y-1.5 text-text-2 max-sm:grid-cols-1">
        {STACK.map(({ group, items }) => (
          <li key={group}>
            <b className="mr-1.5 font-medium text-ink">{group}</b> {items}
          </li>
        ))}
      </ul>
    </section>
  );
}
