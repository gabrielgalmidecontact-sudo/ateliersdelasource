// src/app/robots.ts
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/espace-membre/', '/api/', '/studio/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
