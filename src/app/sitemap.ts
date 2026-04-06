// src/app/sitemap.ts
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/activites`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/evenements`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/politique-confidentialite`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const activitySlugs = [
    'theatre-doubles-karmiques',
    'entretien-biographique',
    'atelier-expression-parlee-corporelle',
    'reves-100000-euros',
    'vision-dante-victor-hugo',
    'massages-soins',
    'hebergement',
    'venir-sur-le-lieu',
  ]

  const activityRoutes: MetadataRoute.Sitemap = activitySlugs.map(slug => ({
    url: `${BASE_URL}/activites/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const eventSlugs = [
    'theatre-doubles-karmiques-juin-2025',
    'nos-emerveillements-mai-2025',
    'dernieres-places-stage-avril',
    'reves-100000-euros-spectacle-2025',
  ]

  const eventRoutes: MetadataRoute.Sitemap = eventSlugs.map(slug => ({
    url: `${BASE_URL}/evenements/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...activityRoutes, ...eventRoutes]
}
