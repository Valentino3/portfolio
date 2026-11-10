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
  facts: [
    { label: 'Role', value: 'Lead UI Developer (promoted). I lead one engineer and review their pull requests.' },
    { label: 'Scope', value: 'Product UI, authorization, API hardening, Reset GUI' },
    {
      label: 'Stack',
      value: 'Next.js 14 (App Router), TypeScript, MUI, TanStack Table, Prisma, MySQL, next-auth, Storybook',
    },
    { label: 'Evidence', value: 'Private codebase. Screens are Reset GUI components in Storybook, with mock data.' },
  ],
  hero: {
    image: projectSummary('dsp2').image,
    caption: 'Reset GUI analytics components used in DSP2',
    note: 'Storybook · mock data',
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
              note="mock data"
              sizes={GALLERY_SIZES.wide}
              wide
              zoom
            />
            <Figure
              image={uplift}
              caption="Creative-level uplift"
              note="mock data"
              sizes={GALLERY_SIZES.wide}
              wide
              zoom
            />
            <Figure image={filters} caption="Emotion filter builder" note="mock data" sizes={GALLERY_SIZES.half} zoom />
          </Gallery>
        </>
      ),
    },
  ],
  seo: {
    description: 'A programmatic advertising platform and the design system behind it, at Reset Digital.',
  },
};
