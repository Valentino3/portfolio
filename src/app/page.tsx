import { Contact } from '@/components/home/contact';
import { ExperienceAbout } from '@/components/home/experience-about';
import { Hero } from '@/components/home/hero';
import { OpenSource } from '@/components/home/open-source';
import { Stack } from '@/components/home/stack';
import { WorkIndex } from '@/components/home/work-index';
import { SiteHeader } from '@/components/site/site-header';
import { publishedProjects } from '@/content/projects';

/**
 * Heaviest first: the work, then who did it (Experience and About), then two short sections as
 * one block, then contact. Open source and Stack are a few lines each, so they share a row from
 * 1024px (in the columns Experience and About use) and sit a sub-section apart when they stack.
 */
export default function Home() {
  return (
    <>
      <SiteHeader variant="home" />
      <main id="main">
        <Hero>
          <WorkIndex projects={publishedProjects()} />
        </Hero>
        <ExperienceAbout />
        <div className="grid-12 mt-section">
          <OpenSource className="col-span-full lg:col-span-6" />
          <Stack className="col-span-full max-lg:mt-subsection lg:col-span-6" />
        </div>
        <Contact />
      </main>
    </>
  );
}
