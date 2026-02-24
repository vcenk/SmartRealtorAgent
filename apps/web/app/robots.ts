import type { MetadataRoute } from 'next';

const baseUrl = 'https://smartrealtoragent.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
