import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cart', '/checkout', '/order-success', '/api/'],
    },
    sitemap: 'https://www.dwstore.lk/sitemap.xml',
  };
}
