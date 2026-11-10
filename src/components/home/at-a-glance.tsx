import { GITHUB, LINKEDIN } from '@/lib/site';
import { ExternalLink } from '@/components/site/external-link';

const STACK: { group: string; items: string }[] = [
  { group: 'Frontend', items: 'TypeScript, React, Next.js, Tailwind, MUI, shadcn/Radix' },
  { group: 'Backend', items: 'Node.js, Python, Go, Prisma, Drizzle' },
  { group: 'Data & auth', items: 'MySQL, PostgreSQL, Keycloak (OIDC)' },
  { group: 'Quality & ops', items: 'Jest, Vitest, Playwright, Docker, GitHub Actions' },
];

/** The four-column summary under the hero: 4 columns, then 2, then 1. */
const CELL = 'col-span-3 max-lg:col-span-6 max-sm:col-span-full';
const TERM = 'mb-2 font-mono text-label text-text-3';
const LINK =
  'group/ext flex items-center justify-between gap-3 py-0.75 hover:text-ink focus-visible:text-ink pointer-coarse:min-h-11 pointer-coarse:py-2.75';
const ARROW =
  'inline-block text-text-3 transition-transform duration-medium group-hover/ext:translate-x-0.75 group-hover/ext:-translate-y-0.75 group-hover/ext:text-ink group-focus-visible/ext:translate-x-0.75 group-focus-visible/ext:-translate-y-0.75 group-focus-visible/ext:text-ink';

export function AtAGlance() {
  return (
    <section aria-label="At a glance">
      <dl className="grid-12 mt-glance-top gap-y-7 border-t border-rule pt-5 text-ui text-text-2 max-sm:border-t-0 max-sm:pt-0">
        <div className={CELL}>
          <dt className={TERM}>Now</dt>
          <dd>
            Lead UI Developer at Reset Digital since June 2022, promoted over time. In practice I work across the stack,
            and I lead one engineer: I review their pull requests and we have regular one-on-ones.
          </dd>
        </div>
        <div className={CELL}>
          <dt className={TERM}>Based</dt>
          <dd>
            Mar del Plata, Argentina. Open to Buenos Aires or remote (UTC−3). Spanish (native), English (professional,
            spoken and written).
          </dd>
        </div>
        <div className={CELL}>
          <dt className={TERM}>Stack</dt>
          <dd>
            {STACK.map(({ group, items }) => (
              <span key={group} className="block">
                <b className="mr-1.5 font-medium text-ink">{group}</b> {items}
              </span>
            ))}
          </dd>
        </div>
        <div className={CELL}>
          <dt className={TERM}>Elsewhere</dt>
          <dd>
            <ExternalLink href={GITHUB} className={LINK}>
              <span>GitHub</span>
              <span aria-hidden="true" className={ARROW}>
                ↗
              </span>
            </ExternalLink>
            <ExternalLink href={LINKEDIN} className={LINK}>
              <span>LinkedIn</span>
              <span aria-hidden="true" className={ARROW}>
                ↗
              </span>
            </ExternalLink>
          </dd>
        </div>
      </dl>
    </section>
  );
}
