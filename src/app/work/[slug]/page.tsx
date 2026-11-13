import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CaseCta } from '@/components/case/case-cta';
import { CaseHeader, CaseMeta } from '@/components/case/case-header';
import { Figure } from '@/components/case/figure';
import { NextProject } from '@/components/case/next-project';
import { Outcomes } from '@/components/case/outcomes';
import { ReadingProgress } from '@/components/case/reading-progress';
import { Toc } from '@/components/case/toc';
import { TocMobile } from '@/components/case/toc-mobile';
import { ZoomProvider } from '@/components/case/zoom-dialog';
import { SiteHeader } from '@/components/site/site-header';
import { getCase } from '@/content/cases';
import { nextProject, projectBySlug, publishedProjects } from '@/content/projects';
import type { Slug } from '@/content/types';
import { OPEN_GRAPH_SITE } from '@/lib/site';

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
  const url = `/work/${project.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'article', title, description, url, ...OPEN_GRAPH_SITE },
  };
}

/**
 * The case study template: back link, title and dek, the facts as two short paragraphs, hero,
 * outcomes, then the sections beside their index, the contact block and the next case. The
 * footer comes from the layout. The zoom provider holds the page's one dialog for every figure
 * that can be enlarged. The hero is the likely LCP element: eager and high priority. React also
 * puts a preload link for it in the head (it does for any img that is not lazy, high priority
 * first), with the same srcset and sizes as the img, so the browser still fetches it once.
 */
export default async function CasePage({ params }: Props) {
  const { project, study } = load((await params).slug);
  const index = study.sections.map(({ id, title }) => ({ id, title }));
  return (
    <>
      <ReadingProgress />
      <SiteHeader variant="case" />
      <ZoomProvider>
        <main>
          <CaseHeader project={project} dek={study.dek} />
          <CaseMeta project={project} meta={study.meta} />
          <div className="mt-case-block">
            <Figure
              image={study.hero.image}
              caption={study.hero.caption}
              note={study.hero.note}
              sizes="(min-width: 1312px) 1184px, 100vw"
              priority
              zoom
            />
          </div>
          <Outcomes outcomes={study.outcomes} />
          <div className="grid-12 mt-case-body-top">
            <Toc sections={index} />
            <div className="prose col-span-full lg:col-span-7 lg:col-start-4">
              <TocMobile sections={index} />
              {study.sections.map(({ id, title, body }, i) => (
                // tabIndex -1: the index links move focus here (see InPageLink), without an outline.
                <section
                  key={id}
                  id={id}
                  aria-labelledby={`${id}-h`}
                  tabIndex={-1}
                  className={`scroll-mt-8 focus:outline-none ${i === 0 ? '' : 'mt-case-section'}`}
                >
                  <h2 id={`${id}-h`} className="mb-3.5 text-heading font-medium wrap-anywhere">
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
      </ZoomProvider>
    </>
  );
}
