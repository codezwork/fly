import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-fly-dashboard/', '/checkout/'],
    },
    sitemap: 'https://flystore.site/sitemap.xml',
  };
}
