import { notFound } from 'next/navigation';
import { kicker, projectBySlug, publishedProjects } from '@/content/projects';
import type { Slug } from '@/content/types';
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og';

export const alt = 'Case study by Valentino Rota';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams(): { slug: Slug }[] {
  return publishedProjects().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = projectBySlug((await params).slug as Slug);
  if (!project) notFound();
  return ogImage({ top: kicker(project), title: project.title });
}
