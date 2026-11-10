import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CaseCta } from '@/components/case/case-cta';
import { CaseHeader } from '@/components/case/case-header';
import { Facts } from '@/components/case/facts';
import { NextProject } from '@/components/case/next-project';
import { Outcomes } from '@/components/case/outcomes';
import { ReadingProgress } from '@/components/case/reading-progress';
import { Toc } from '@/components/case/toc';
import { TocMobile } from '@/components/case/toc-mobile';
import { SiteHeader } from '@/components/site/site-header';
import type { CaseStudy } from '@/content/case-types';
import { getCase } from '@/content/cases';
import { nextProject, projectBySlug, publishedProjects } from '@/content/projects';
import type { Slug } from '@/content/types';

type Props = { params: Promise<{ slug: string }> };

// Only the published cases are built; any other slug is a 404, never rendered on demand.
export const dynamicParams = false;

export function generateStaticParams(): { slug: Slug }[] {
  return publishedProjects().map(({ slug }) => ({ slug }));
}

/** The published project behind a slug and its case, or the 404 page. */
function load(slug: string) {
  const project = projectBySlug(slug as Slug);
  if (!project) notFound();
  return { project, study: getCase(project.slug) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project, study } = load((await params).slug);
  const title = `${project.title} — Valentino Rota`;
  const { description } = study.seo;
  return {
    title,
    description,
    openGraph: { type: 'article', title, description, url: `/work/${project.slug}` },
  };
}

/** The likely LCP element, so it skips the lazy loader (no preload link: it is fetched once). */
function Hero({ hero: { image, caption, note } }: { hero: CaseStudy['hero'] }) {
  return (
    <figure className="mt-case-block">
      <div className="overflow-hidden rounded-image bg-tint ring-1 ring-rule forced-colors:border forced-colors:border-[CanvasText]">
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1312px) 1184px, 100vw"
          loading="eager"
          fetchPriority="high"
          alt={image.alt}
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 flex justify-between gap-4 font-mono text-label text-text-3 max-sm:flex-col max-sm:gap-0.5">
        <span>{caption}</span>
        <span>{note}</span>
      </figcaption>
    </figure>
  );
}

/**
 * The case study template (spec 4.3): back link, kicker, title and dek, facts, hero, outcomes,
 * then the numbered sections beside their index, the contact block and "Next project". The
 * footer comes from the layout.
 */
export default async function CasePage({ params }: Props) {
  const { project, study } = load((await params).slug);
  const index = study.sections.map(({ id, title }) => ({ id, title }));
  return (
    <>
      <ReadingProgress />
      <SiteHeader variant="case" />
      <main>
        <CaseHeader project={project} dek={study.dek} />
        <Facts facts={study.facts} />
        <Hero hero={study.hero} />
        <Outcomes outcomes={study.outcomes} />
        <div className="grid-12 mt-case-body-top">
          <Toc sections={index} />
          <div className="prose col-span-full lg:col-span-7 lg:col-start-4">
            <TocMobile sections={index} />
            {study.sections.map(({ id, title, body }, i) => (
              // tabIndex -1: the index links move focus here (see SectionLink), without an outline.
              <section
                key={id}
                id={id}
                aria-labelledby={`${id}-h`}
                tabIndex={-1}
                className={`scroll-mt-8 focus:outline-none ${i === 0 ? '' : 'mt-case-section'}`}
              >
                <h2 id={`${id}-h`} className="mb-3.5 flex items-baseline gap-3.5 text-heading font-medium">
                  <span aria-hidden="true" className="font-mono text-meta font-normal text-text-3">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {title}
                </h2>
                {body}
              </section>
            ))}
          </div>
        </div>
        <CaseCta />
        <NextProject project={nextProject(project.slug)} />
      </main>
    </>
  );
}
