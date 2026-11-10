import type { CaseStudy } from '../case-types';
import { projectSummary } from '../projects';

export const analyzer: CaseStudy = {
  slug: 'analyzer',
  dek: 'An AI service that scores websites by the emotions their pages evoke, so ads can be placed where the mood fits. DSP2 uses those scores for site selection. I’m its main contributor: I took it from no authentication to Keycloak, and I ran the study that measured whether its scores could be trusted.',
  facts: [
    { label: 'Role', value: 'Main contributor, including all of the authentication work' },
    { label: 'Scope', value: 'Authentication, access model, LLM evaluation, client UI' },
    {
      label: 'Stack',
      value: 'React 19, Vite, MUI, oidc-client-ts, Python API, MySQL, Keycloak, Nginx, Docker Compose',
    },
    { label: 'Evidence', value: 'Private codebase. Screens are Reset GUI components in Storybook, with mock data.' },
  ],
  hero: {
    image: projectSummary('analyzer').image,
    caption: 'Websites ranked by propensity score, with their emotional profile',
    note: 'Storybook · mock data',
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
  ],
  seo: {
    description:
      'Reset Digital’s AI site-scoring service: an authentication rollout and a study of its LLM scores.',
  },
};
