import { AtAGlance } from '@/components/home/at-a-glance';
import { Contact } from '@/components/home/contact';
import { ExperienceAbout } from '@/components/home/experience-about';
import { Hero } from '@/components/home/hero';
import { OpenSource } from '@/components/home/open-source';
import { WorkIndex } from '@/components/home/work-index';
import { SiteHeader } from '@/components/site/site-header';
import { publishedProjects } from '@/content/projects';

export default function Home() {
  return (
    <>
      <SiteHeader variant="home" />
      <main>
        <Hero>
          <WorkIndex projects={publishedProjects()} />
        </Hero>
        <AtAGlance />
        <OpenSource />
        <ExperienceAbout />
        <Contact />
      </main>
    </>
  );
}
