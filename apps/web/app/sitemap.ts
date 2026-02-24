import type { MetadataRoute } from 'next';
import { getBlogSlugs } from '@/lib/seo-content';

const baseUrl = 'https://smartrealtoragent.com';
const marketingSlugs = [
  'features',
  'how-it-works',
  'pricing',
  'faq',
  'security',
  'use-cases',
  'vs-generic-ai-chatbot',
  'technical-architecture',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blogSlugs = getBlogSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now },
    ...marketingSlugs.map((slug) => ({ url: `${baseUrl}/${slug}`, lastModified: now })),
    { url: `${baseUrl}/blog`, lastModified: now },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...blogRoutes];
}
