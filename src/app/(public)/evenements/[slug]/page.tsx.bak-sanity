// src/app/(public)/evenements/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventDetailPage } from '@/features/evenements/EventDetailPage'

const events = [
  {
    id: 'e1',
    title: 'Théâtre des Doubles Karmiques',
    slug: 'theatre-doubles-karmiques-juin-2025',
    type: 'Stage',
    startDate: '2025-06-06',
    endDate: '2025-06-09',
    location: 'Les Ateliers de la Source',
    owner: 'Gabriel',
    priceLabel: 'Sur devis',
    capacity: '4 à 5 participants',
    registrationEnabled: false,
    excerpt: 'Stage de développement personnel sur 3 jours et demi. 4 à 5 participants maximum.',
    description: `Un stage pour explorer, comprendre et transformer les mécanismes répétitifs de votre vie.

En petit groupe de 4 à 5 personnes, Gabriel vous guide dans une immersion de 3 jours et demi à travers des activités de modelage, de jeux de scène et de travail intérieur.

Pour plus d'informations et pour vous inscrire, contactez Gabriel directement.`,
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1400&q=80',
  },
  {
    id: 'e2',
    title: 'Nos Émerveillements',
    slug: 'nos-emerveillements-mai-2025',
    type: 'Atelier',
    startDate: '2025-05-05',
    endDate: '2025-05-05',
    location: 'Les Ateliers de la Source',
    owner: 'Gabriel',
    priceLabel: 'Sur devis',
    capacity: 'À définir',
    registrationEnabled: false,
    excerpt: 'Atelier collectif autour de l\'émerveillement et de la présence au monde.',
    description: `Un atelier pour retrouver la capacité à s'émerveiller, à être présent, à voir le monde avec des yeux neufs.

Contactez Gabriel pour en savoir plus.`,
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1400&q=80',
  },
  {
    id: 'e3',
    title: 'Dernières Places disponibles — Stage printemps',
    slug: 'dernieres-places-stage-avril',
    type: 'Stage',
    startDate: '2025-04-21',
    endDate: '2025-04-24',
    location: 'Les Ateliers de la Source',
    owner: 'Gabriel',
    priceLabel: 'Sur devis',
    capacity: '2 places restantes',
    registrationEnabled: false,
    excerpt: 'Quelques dernières places disponibles pour ce stage de développement personnel.',
    description: `Il ne reste que quelques places pour ce stage de printemps. N'attendez pas pour vous inscrire.

Contactez Gabriel dès maintenant.`,
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80',
  },
  {
    id: 'e4',
    title: 'Rêves à 100 000 euros — Spectacle',
    slug: 'reves-100000-euros-spectacle-2025',
    type: 'Spectacle',
    startDate: '2025-07-12',
    endDate: '2025-07-12',
    location: 'À préciser',
    owner: 'Gabriel',
    priceLabel: 'Au chapeau',
    capacity: 'Tous publics',
    registrationEnabled: false,
    excerpt: 'Un soir, une histoire folle et vraie. Semi-improvisation, participation du public.',
    description: `Une soirée unique avec Galmide pour son spectacle semi-improvisé "Rêves à 100 000 euros".

Participation libre, au chapeau. Peut être organisé chez vous, dans votre salon ou dans n'importe quel espace.

Contactez Gabriel pour organiser une soirée.`,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1400&q=80',
  },
]

export async function generateStaticParams() {
  return events.map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = events.find(e => e.slug === slug)
  if (!event) return { title: 'Événement introuvable' }
  return {
    title: event.title,
    description: event.excerpt,
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = events.find(e => e.slug === slug)
  if (!event) notFound()
  return <EventDetailPage event={event} />
}
