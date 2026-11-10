import type { NumberedProject, ProjectSummary, Slug } from './types';

/** Display order. Numbers are derived from it, among published projects only. */
export const ALL_PROJECTS: ProjectSummary[] = [
  {
    slug: 'stock-tienda',
    title: 'Stock Tienda',
    context: 'Own product',
    years: '2026 – now',
    description: 'Point of sale, stock and cash control for small stores. Three stores pay for it.',
    role: 'Solo, end to end',
    kind: 'own product',
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'PostgreSQL'],
    image: {
      src: '/img/stock-reportes.webp',
      width: 1440,
      height: 900,
      alt: 'Reports screen: total for the period, products with low stock, cash closings with differences',
    },
    published: true,
  },
  {
    slug: 'conosur',
    title: 'Conosur',
    context: 'Client work',
    years: '2025 – now',
    description: 'Website for a music artist: releases, collaborators and videos, in two languages.',
    role: 'Design + build',
    kind: 'client work',
    stack: ['React', 'TypeScript', 'Framer Motion', 'i18n'],
    image: {
      src: '/img/conosur-pay-respects.webp',
      width: 2400,
      height: 1500,
      alt: 'Releases: a strip of albums and singles above the embedded player and track list',
    },
    published: true,
  },
  {
    slug: 'dsp2',
    title: 'DSP2 + Reset GUI',
    context: 'Reset Digital',
    years: '2024 – now',
    description:
      'Programmatic ad platform and the design system behind it. Led the security hardening for its first outside client.',
    role: 'Lead UI Developer',
    kind: 'ad platform + design system',
    stack: ['Next.js', 'TypeScript', 'MUI', 'Prisma'],
    image: {
      src: '/img/dsp2-hero.webp',
      width: 2400,
      height: 1500,
      alt: 'Reset GUI analytics components: emotional coverage bar chart, delivery treemap by domain and a scoring-weights panel',
    },
    published: true,
  },
  {
    slug: 'analyzer',
    title: 'Analyzer',
    context: 'Reset Digital',
    years: '2025 – now',
    description:
      'AI service that scores websites by emotional fit for ads. Auth rollout and a 500-domain study of its scores.',
    role: 'Main contributor',
    kind: 'AI site-scoring service',
    stack: ['React', 'Python', 'Keycloak'],
    image: {
      src: '/img/analyzer-hero.webp',
      width: 2400,
      height: 1500,
      alt: 'Websites table with propensity scores and the top three emotions per site, next to an emotion radar chart',
    },
    published: true,
  },
  {
    slug: 'bakery-concept',
    title: 'Bakery concept',
    context: 'Personal concept',
    years: '2026',
    description: 'Self-initiated site for a local sourdough bakery, explored in three art directions.',
    role: 'Design + build',
    kind: 'personal concept',
    stack: ['React', 'GSAP', 'Vite'],
    image: {
      src: '/img/bakery-hero.webp',
      width: 2400,
      height: 1500,
      alt: 'Editorial direction: a large serif headline beside a photo of a hand on a sourdough loaf',
    },
    published: true,
  },
];

export function publishedProjects(list: ProjectSummary[] = ALL_PROJECTS): NumberedProject[] {
  return list
    .filter((p) => p.published)
    .map((p, i) => ({ ...p, number: String(i + 1).padStart(2, '0') }));
}

/** A project's summary, published or not. A case study reuses its image instead of copying it. */
export function projectSummary(slug: Slug): ProjectSummary {
  const project = ALL_PROJECTS.find((p) => p.slug === slug);
  if (!project) throw new Error(`No project with the slug "${slug}"`);
  return project;
}

export function projectBySlug(slug: Slug): NumberedProject | undefined {
  return publishedProjects().find((p) => p.slug === slug);
}

/** The project after `slug` among the published ones, wrapping from the last to the first. */
export function nextProject(slug: Slug, list: ProjectSummary[] = ALL_PROJECTS): NumberedProject {
  const published = publishedProjects(list);
  const index = published.findIndex((p) => p.slug === slug);
  return published[(index + 1) % published.length];
}
