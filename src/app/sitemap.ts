import type { MetadataRoute } from 'next';
import { publishedProjects } from '@/content/projects';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, priority: 1 },
    ...publishedProjects().map(({ slug }) => ({ url: `${SITE_URL}/work/${slug}`, priority: 0.8 })),
  ];
}
