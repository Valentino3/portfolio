import { DecisionCard, DecisionCards } from '@/components/case/decision-card';
import { Diagram } from '@/components/case/diagram';
import { Figure } from '@/components/case/figure';
import { GALLERY_SIZES, Gallery } from '@/components/case/gallery';
import type { CaseStudy } from '../case-types';
import { projectSummary } from '../projects';
import type { Media } from '../types';

const radar: Media = {
  src: '/img/analyzer-radar.webp',
  width: 1600,
  height: 923,
  alt: 'Emotion radar chart for one website',
};
const propensity: Media = {
  src: '/img/analyzer-propensity.webp',
  width: 2400,
  height: 578,
  alt: 'Propensity score filter: a threshold slider with high, medium and low bands',
};

export const analyzer: CaseStudy = {
  slug: 'analyzer',
  dek: 'An AI service that scores websites by the emotions their pages evoke, so ads can be placed where the mood fits. DSP2 uses those scores for site selection. I’m its main contributor: I took it from no authentication to Keycloak, and I ran the study that measured whether its scores could be trusted.',
  meta: [
    'Main contributor, including all of the authentication work. Authentication, access model, LLM evaluation, client UI.',
    'React 19, Vite, MUI, oidc-client-ts, Python API, MySQL, Keycloak, Nginx, Docker Compose. Private codebase. Screens are Reset GUI components in Storybook, with mock data.',
  ],
  hero: {
    image: projectSummary('analyzer').image,
    caption: 'Websites ranked by propensity score, with their emotional profile',
    note: 'Storybook, mock data',
  },
  outcomes: [
    {
      title: 'From no authentication to Keycloak',
      body: 'OIDC with PKCE, rolled out from staging to production.',
    },
    {
      title: 'A 500-domain study that changed the roadmap',
      body: 'It showed the scores weren’t reliable enough as they were, and set the baseline the team measures against.',
    },
    {
      title: 'Better campaigns for clients',
      body: 'Once ads were matched to sites by emotional fit, client campaigns performed better.',
    },
  ],
  sections: [
    {
      id: 'context',
      title: 'Context',
      body: (
        <p>
          Analyzer uses an LLM to give each website an emotional profile and a propensity score. DSP2 reads those
          scores when advertisers pick sites. When I started, the app had no authentication and there was no baseline
          for how reliable its scores were.
        </p>
      ),
    },
    {
      id: 'role',
      title: 'My role',
      body: (
        <p>
          I’m the main contributor, and I did all of the authentication work. I designed the access model, ran the
          rollout, and designed and ran the scoring study.
        </p>
      ),
    },
    {
      id: 'study',
      title: 'Measuring the scores',
      body: (
        <>
          <p>
            Before changing the pipeline, I measured it. The study used a random sample of 500 domains, drawn with a
            fixed seed from a real client site list, and touched nothing in production.
          </p>
          <ul>
            <li>Reruns of the same pipeline, to check whether scores were reproducible.</li>
            <li>Controls to check whether the scores depended on the page content or on something else.</li>
            <li>The cost and coverage of each way to fetch real page content.</li>
          </ul>
          <p>
            The whole study cost about USD 15 in model calls, plus scraping credits. It showed the scores weren’t
            reliable enough as they were and gave the team a baseline to measure every later change against. The
            specific figures are internal to Reset Digital.
          </p>
        </>
      ),
    },
    {
      id: 'decisions',
      title: 'Decisions',
      body: (
        <DecisionCards>
          <DecisionCard
            title="OIDC with PKCE through Keycloak"
            rows={[
              ['Why', 'The client is a browser app, which can’t keep a secret; PKCE is the flow for that case.'],
              ['Result', 'Rolled out from staging to production.'],
            ]}
          />
          <DecisionCard
            title="Roles by attribute, per entity"
            rows={[
              ['Why', 'Accounts sit in a four-level hierarchy.'],
              ['Result', 'An attribute-based access model behind per-entity roles.'],
            ]}
          />
          <DecisionCard
            title="A measuring harness outside the product"
            rows={[
              [
                'Why',
                'To measure the pipeline without changing it, the harness runs the production prompt extracted byte for byte. If the prompt differs even in whitespace, every comparison is suspect.',
              ],
              ['Result', 'Production stayed untouched while it was measured.'],
            ]}
          />
        </DecisionCards>
      ),
    },
    {
      id: 'architecture',
      title: 'Architecture',
      body: (
        <>
          <p>How a request is authenticated. Simplified.</p>
          <Diagram
            label="Diagram: the React client signs in with Keycloak using OIDC and PKCE; then it calls the Python API through Nginx, which verifies the token and checks attribute-based access before reading MySQL."
            rows={[
              [
                { l1: 'React client', l2: 'oidc-client-ts', edge: 'sign in' },
                { l1: 'Keycloak', l2: 'OIDC + PKCE', dark: true },
              ],
              [
                { l1: 'React client' },
                { l1: 'Nginx' },
                { l1: 'Python API', l2: 'verifies the token' },
                { l1: 'Access check', l2: 'attributes per entity', dark: true },
                { l1: 'MySQL' },
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: 'interface',
      title: 'Interface',
      body: (
        <Gallery>
          <Figure
            image={radar}
            caption="Emotional profile of a site"
            sizes={GALLERY_SIZES.half}
            zoom
          />
          <Figure
            image={propensity}
            caption="Propensity threshold filter"
            sizes={GALLERY_SIZES.half}
            zoom
          />
        </Gallery>
      ),
    },
  ],
  seo: {
    description:
      'Reset Digital’s AI site-scoring service: an authentication rollout and a study of its LLM scores.',
  },
};
