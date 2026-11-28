import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/checkout',
        '/order-success',
        '/api/',
        '/wishlist',
        '/account',
        '/search',
        '/search/*',
        '/product-tag/*',
        '/tag/*',
        '/*?*per_page=',
        '/*?*stock_status=',
        '/*?*minPrice=',
        '/*?*maxPrice=',
        '/*?*stock=',
        '/*?*sort=',
      ],
      crawlDelay: 1,
    },
    sitemap: 'https://www.dwstore.lk/sitemap.xml',
  };
}
