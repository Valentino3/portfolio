/** What I work with, by group, in the order the home and the CV list them. */
export type StackGroup = { group: string; items: string };

export const STACK: StackGroup[] = [
  { group: 'Frontend', items: 'TypeScript, React, Next.js, Tailwind, MUI, shadcn/Radix' },
  { group: 'Backend', items: 'Node.js, Python, Go, Prisma, Drizzle' },
  { group: 'Data & auth', items: 'MySQL, PostgreSQL, Keycloak (OIDC)' },
  { group: 'Quality & ops', items: 'Jest, Vitest, Playwright, Docker, GitHub Actions' },
];
