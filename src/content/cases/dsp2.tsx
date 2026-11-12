import { Decision, Decisions, Result } from '@/components/case/decisions';
import { Diagram } from '@/components/case/diagram';
import { Figure } from '@/components/case/figure';
import { GALLERY_SIZES, Gallery } from '@/components/case/gallery';
import type { CaseStudy } from '../case-types';
import { projectSummary } from '../projects';
import type { Media } from '../types';

const websites: Media = {
  src: '/img/dsp2-websites.webp',
  width: 2400,
  height: 1665,
  alt: 'Websites table with search, top emotions per site and a sortable propensity score column, paginated',
};
const uplift: Media = {
  src: '/img/dsp2-uplift.webp',
  width: 2400,
  height: 789,
  alt: 'Creative-level uplift: impressions as bars and uplift as a line, for banner and video creatives',
};
const filters: Media = {
  src: '/img/dsp2-filters.webp',
  width: 1600,
  height: 1235,
  alt: 'Emotion filter builder with AND logic and three active filters',
};

export const dsp2: CaseStudy = {
  slug: 'dsp2',
  dek: 'Software that buys and sells online ad space automatically (a DSP/SSP platform), and the design system it shares with Analyzer. I led the security hardening that let the first outside client use it on its own.',
  meta: [
    'Lead UI Developer (promoted). I lead one engineer and review their pull requests. Product UI, authorization, Reset GUI.',
    'Next.js 14 (App Router), TypeScript, MUI, TanStack Table, Prisma, MySQL, next-auth, Storybook. Private codebase. Screens are Reset GUI components in Storybook, with mock data.',
  ],
  hero: {
    image: projectSummary('dsp2').image,
    caption: 'Reset GUI analytics components used in DSP2',
    note: 'Storybook, mock data',
  },
  outcomes: [
    {
      title: 'The first outside client, onboarded safely',
      body: 'Two hardening batches shipped, before and after launch. The product is in use, with no security incidents and no rollbacks.',
    },
    {
      title: 'Tested over real logins',
      body: 'An integration suite over real HTTP, with test organizations and test users (54 checks by the second batch), on top of 979 automated tests.',
    },
    {
      title: 'One authorization layer, platform-wide',
      body: 'Every read and write is scoped to the caller’s organization, with a role model that separates internal staff from client users.',
    },
  ],
  sections: [
    {
      id: 'context',
      title: 'Context',
      body: (
        <>
          <p>
            Reset Digital runs a programmatic advertising platform: advertisers buy ad space on websites through it,
            automatically. It has two products, DSP2 and Analyzer, and a design system both use.
          </p>
          <p>
            Client users and internal staff use DSP2 for campaigns, site selection and reporting over tens of
            thousands of rows. In 2026 the platform opened to outside organizations logging in on their own. Before
            that day, the API had to be safe for people outside the company.
          </p>
        </>
      ),
    },
    {
      id: 'role',
      title: 'My role',
      body: (
        <>
          <p>
            I wrote the security review and the two-batch rollout plan. I split the code review into five areas by
            risk and assigned a reviewer to each; I took login and report scoping. I designed the authorization layer.
          </p>
          <p>
            Day to day I lead one engineer: I review their pull requests and we have regular one-on-ones. I was
            promoted to Lead UI Developer over time.
          </p>
        </>
      ),
    },
    {
      id: 'decisions',
      title: 'Decisions',
      body: (
        <>
          <p>The hardening went out in two batches, around the launch.</p>
          <Diagram
            label="Diagram: a written review split into five areas, then batch one before launch with 47 integration checks, the launch with the first external client, and batch two after it with 54 checks."
            rows={[
              [
                { l1: 'Review + plan', l2: '5 areas by risk' },
                { l1: 'Batch 1', l2: '47 checks pass', dark: true },
                { l1: 'Launch', l2: 'first outside client' },
                { l1: 'Batch 2', l2: '54 checks pass', dark: true },
              ],
            ]}
            note="Both batches shipped. No security incidents, no rollbacks."
          />
          <Decisions>
            <Decision title="Ship the hardening in two batches, by risk">
              <p>
                The launch date was fixed. Instead of one release with everything, or a later launch, what a client
                could exploit on day one went first; what operations could cover for a few days went second.
              </p>
              <Result>Both batches shipped, with no incidents and no rollbacks.</Result>
            </Decision>
            <Decision title="No database migrations in the first batch">
              <p>Rollback had to be a redeploy of the previous image, nothing more.</p>
              <Result>
                A 45-minute staging QA pass and an ordered deploy checklist. The rollback was never needed.
              </Result>
            </Decision>
            <Decision title="Authorization in one layer, not per route">
              <p>Instead of checks written route by route, consistent enforcement: the same checks on every request.</p>
              <Result>
                Shared helpers that every handler calls for path ids, body ids and queries, with the integration suite
                testing cross-organization access over real HTTP.
              </Result>
            </Decision>
            <Decision title="One component library for two apps">
              <p>Teams were duplicating the same table and form logic.</p>
              <Result>
                Instead of each app keeping its own tables and forms, DSP2 and Analyzer install Reset GUI from a
                private registry and render the same websites table, score filters and analytics tabs.
              </Result>
            </Decision>
          </Decisions>
        </>
      ),
    },
    {
      id: 'architecture',
      title: 'Architecture',
      body: (
        <>
          <p>Where the authorization layer sits. Simplified.</p>
          <Diagram
            label="Diagram: the Next.js interface, built with Reset GUI, calls API routes with a next-auth session; every request goes through one authorization layer before Prisma reaches MySQL."
            rows={[
              [
                { l1: 'Next.js UI', l2: 'Reset GUI' },
                { l1: 'API routes', l2: 'next-auth session' },
                { l1: 'AuthZ layer', l2: 'org scope + roles', dark: true },
                { l1: 'Prisma', l2: 'MySQL' },
              ],
            ]}
            note="Every request passes the same checks."
          />
        </>
      ),
    },
    {
      id: 'interface',
      title: 'Interface',
      body: (
        <>
          <p>
            Reporting tables sort, filter and paginate on the server, because they run over tens of thousands of rows
            and have to export them.
          </p>
          <Gallery>
            <Figure
              image={websites}
              caption="Websites table: search, sort and pagination"
              sizes={GALLERY_SIZES.wide}
              wide
              zoom
            />
            <Figure
              image={uplift}
              caption="Creative-level uplift"
              sizes={GALLERY_SIZES.wide}
              wide
              zoom
            />
            <Figure image={filters} caption="Emotion filter builder" sizes={GALLERY_SIZES.half} zoom />
          </Gallery>
        </>
      ),
    },
  ],
  seo: {
    description: 'A programmatic advertising platform and the design system behind it, at Reset Digital.',
  },
};
