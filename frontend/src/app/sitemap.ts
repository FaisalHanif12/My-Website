import type { MetadataRoute } from 'next';

import { pages } from '@/content/site';
import { siteUrl } from '@/lib/siteUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: page.path === '/' ? siteUrl : `${siteUrl}${page.path}`,
    changeFrequency: 'monthly',
    priority: page.path === '/' ? 1 : 0.7,
  }));
}
