import { site } from '@/data/site';

export default function sitemap() {
  const routes = [
    '',
    '/about',
    '/services',
    '/portfolio',
    '/packages',
    '/testimonials',
    '/contact',
    '/booking',
  ];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
