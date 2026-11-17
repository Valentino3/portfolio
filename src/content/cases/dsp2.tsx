import { BeforeAfter } from '@/components/case/before-after';
import { Clip } from '@/components/case/clip';
import { Decision, Decisions, Result } from '@/components/case/decisions';
import { Diagram } from '@/components/case/diagram';
import { Figure, type Mark } from '@/components/case/figure';
import { GALLERY_SIZES, Gallery } from '@/components/case/gallery';
import { Subhead } from '@/components/case/subhead';
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

/** A whole before/after table screenshot of a Reset GUI story: what the zoom opens. */
function table(topic: string, side: 'before' | 'after', alt: string): Media {
  return { src: `/img/dsp2-${topic}-${side}.webp`, width: 1876, height: 790, alt };
}

/**
 * The close-up of a table that the page shows, cut from the whole one with the same box on both
 * sides, so the pair compares at a readable size: the badge column (header and four rows), and
 * for the sort the two ranked headers side by side, the columns between them left out.
 */
function detail(topic: 'badges' | 'sort', side: 'before' | 'after', alt: string): Media {
  return {
    src: `/img/dsp2-${topic}-${side}-detail.webp`,
    ...(topic === 'badges' ? { width: 628, height: 650 } : { width: 628, height: 132 }),
    alt,
  };
}

/** A before/after chart of a Reset GUI story, the empty margin of its canvas trimmed. */
function chart(topic: 'coverage' | 'matches', side: 'before' | 'after', alt: string): Media {
  return {
    src: `/img/dsp2-${topic}-${side}-crop.webp`,
    ...(topic === 'coverage' ? { width: 1364, height: 426 } : { width: 1116, height: 544 }),
    alt,
  };
}

/** The rank digits beside the two sort arrows, on the sort close-up. */
const SORT_RANKS: Mark[] = [
  { x: 0.302, y: 0.33, width: 0.042, height: 0.29 },
  { x: 0.912, y: 0.33, width: 0.05, height: 0.29 },
];

/**
 * The Angry (19K) and Anxious (15K) bars with their values, on the coverage chart after the
 * change: the shorter one is the darker, which only the tone can say.
 */
const COVERAGE_PAIR: Mark[] = [
  { x: 0.357, y: 0.52, width: 0.079, height: 0.312 },
  { x: 0.804, y: 0.563, width: 0.079, height: 0.269 },
];

export const dsp2: CaseStudy = {
  slug: 'dsp2',
  // The first outside client is outcome 1's title, so the dek leaves it out.
  dek: 'Software that buys and sells ad space automatically, and its design system. I designed and built the screens shown here and led the security hardening.',
  meta: [
    'UI Developer, promoted to Lead in 2025. Product UI, authorization, Reset GUI.',
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
      title: 'Tables you can scan without hovering',
      body: 'Emotion badges now print the score only a hover tooltip showed, and a two-column sort numbers its headers. I designed and built both in Reset GUI.',
    },
    {
      title: 'Tested over real logins',
      body: 'An integration suite over real HTTP, with test organizations and test users (54 checks by the second batch), on top of 979 automated tests.',
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
            automatically. It has two products: DSP2, which buys and sells that space (a DSP/SSP), and Analyzer.
            Client users and internal staff use DSP2 for campaigns, site selection and reporting over tens of
            thousands of rows.
          </p>
          <p>
            In 2026 the platform opened to outside organizations logging in on their own. Before that day, the API had
            to be safe for people outside the company.
          </p>
          {/* Last, so the reader goes into My role and Interface thinking of the screens. */}
          <p>
            Both products are built from one design system, Reset GUI: the tables, filters and charts in this case
            are its components.
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
            On the interface, I build product UI for DSP2 and components for Reset GUI, the library it shares with
            Analyzer. I designed and built the screens in this case.
          </p>
          <p>
            On security, I led the hardening. I wrote the security review and the two-batch rollout
            plan. I split the code review into five areas by risk and assigned a reviewer to each; I took login and
            report scoping. I designed the authorization layer.
          </p>
          <p>
            Day to day I lead one engineer: I review their pull requests and we have regular one-on-ones.
          </p>
        </>
      ),
    },
    {
      id: 'interface',
      title: 'Interface',
      body: (
        <>
          {/* The design-system decision frames the screens: every change below lives in the shared library. */}
          <p>
            Teams were duplicating the same table and form logic, so Reset GUI is one component library for two apps:
            DSP2 and Analyzer install it from a private registry and render the same websites table, score filters
            and analytics tabs, and neither app keeps its own.
          </p>
          {/* My role says the screens are mine; this says what in them is not. */}
          <p>The color and type theme of the screens below is the team’s.</p>
          <Subhead>The score, printed on the badge</Subhead>
          <p>
            The badge color encodes the emotion’s score in three bands and nothing said so: the same emotion came out
            green on one row and orange on the next, and the whole column read as random. The number was only in the
            hover tooltip, one badge at a time, which is no use when scanning a table. Printing it beside the name
            makes the color self-explanatory and needs no legend.
          </p>
          <BeforeAfter
            before={{
              image: detail(
                'badges',
                'before',
                'Top emotions column, close up: badges with only the emotion name, Joy orange on one row and green on the next',
              ),
              zoom: table(
                'badges',
                'before',
                'Websites table, top emotions column: badges with only the emotion name, Joy green on one row and orange on the next',
              ),
              caption: 'Before: color only',
            }}
            after={{
              image: detail(
                'badges',
                'after',
                'The same column with the score on each badge: Joy 7.8 in orange, Joy 8.5 in green, Anticipation 8.0 in green and Surprise 7.9 in orange',
              ),
              zoom: table(
                'badges',
                'after',
                'The same rows with the score printed on each badge, such as Joy 8.5 in green and Joy 7.8 in orange',
              ),
              caption: 'After: the score on the badge',
            }}
          />
          <Subhead>Sorting by two columns, made visible</Subhead>
          <p>
            A planner needs to rank by propensity score together with CTR or avails, not one at a time. Shift-click
            already added a second column to the sort, but nothing showed that it had joined or in what order the
            columns applied. A header now shows its position in the sort once more than one column takes part.
          </p>
          <BeforeAfter
            before={{
              image: detail(
                'sort',
                'before',
                'The Website and Propensity Score headers, close up, the columns between them left out: each shows a sort arrow and nothing else',
              ),
              zoom: table(
                'sort',
                'before',
                'Websites table sorted by website and by propensity score: both headers show an arrow and nothing else',
              ),
              caption: 'Before: no sign of a second sort column',
            }}
            after={{
              image: detail(
                'sort',
                'after',
                'The same two headers with a 1 beside the Website arrow and a 2 beside the Propensity Score arrow, each outlined',
              ),
              zoom: table(
                'sort',
                'after',
                'The same table with a 1 beside the website arrow and a 2 beside the propensity score arrow',
              ),
              marks: SORT_RANKS,
              caption: 'After: rank beside each arrow',
            }}
          />
          <Subhead>Color that carries data</Subhead>
          <p>
            Every bar was drawn in the same blue, which left the charts saying nothing the height was not already
            saying. The spec asked for darker bars at higher CTR, so a short bar that converted well still reads as
            one. Shading runs against the highest CTR on screen rather than a fixed scale: rates differ by an order of
            magnitude between campaigns, and a fixed scale would flatten most of them into one tone. Match strength
            uses the bands the propensity filter already states in its own tooltip, which keeps one definition of a
            strong match, not two.
          </p>
          <BeforeAfter
            layout="stack"
            before={{
              image: chart('coverage', 'before', 'Bar chart of ten emotions, from 10K to 45K, every bar the same blue'),
              caption: 'Before: flat blue',
            }}
            after={{
              image: chart(
                'coverage',
                'after',
                'The same chart with each bar in a lighter or darker violet: Surprised is the darkest and Disgusted the lightest, and Anxious, at 15K, is darker than Angry at 19K',
              ),
              marks: COVERAGE_PAIR,
              caption: 'After: tone by CTR. Anxious is shorter than Angry but darker: its CTR is higher.',
            }}
          />
          <BeforeAfter
            before={{
              image: chart(
                'matches',
                'before',
                'Horizontal bar chart of ten websites, from 9.4 down to 5.3, every bar the same blue',
              ),
              caption: 'Before: flat blue',
            }}
            after={{
              image: chart(
                'matches',
                'after',
                'The same chart with the bars from 9.4 to 7.2 in green and those from 6.9 to 5.3 in orange',
              ),
              caption: 'After: bands by strength',
            }}
          />
          <Clip
            name="dsp2-weights"
            alt="Screen recording of the Scoring Weights control: the cursor drags the Alpha (Quality) slider from 75% to 40%, Beta follows to 60%, and the percentages, the sentence and the formula update; then the Coverage Focus preset sets 20% and 80%, and the reset button returns both to 75% and 25%."
            caption="Scoring weights: the sentence and the formula rewrite themselves as the sliders move."
          />
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
    {
      id: 'decisions',
      // The id stays "decisions" for existing links; the title says these are the security ones.
      title: 'Security decisions',
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
          />
          <Decisions>
            <Decision title="Ship the hardening in two batches, by risk">
              <p>
                The launch date was fixed, so the plan neither bundled everything into one release nor moved the
                launch: what a client could exploit on day one went first; what operations could cover for a few
                days went second.
              </p>
              <Result>The launch kept its date: batch one went out before it, batch two after.</Result>
            </Decision>
            <Decision title="No database migrations in the first batch">
              <p>Rollback had to be a redeploy of the previous image, nothing more.</p>
              <Result>A 45-minute staging QA pass and an ordered deploy checklist.</Result>
            </Decision>
            <Decision title="Authorization in one layer, not per route">
              <p>The point was consistent enforcement: whichever route a request hits, the checks are the same.</p>
              <Result>
                Shared helpers that every handler calls for path ids, body ids and queries, with the integration suite
                testing cross-organization access over real HTTP.
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
  ],
  seo: {
    description: 'A programmatic advertising platform and the design system behind it, at Reset Digital.',
  },
};
