import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventDetailPage } from '@/features/evenements/EventDetailPage'
import { sanityFetch, sanityFetchArray } from '@/lib/sanity/fetch'
import { allEventsQuery, eventBySlugQuery } from '@/lib/sanity/queries'
import { imageUrl } from '@/lib/sanity/image'
import type { Event } from '@/types'

export const revalidate = 60

type Params = { slug: string }

function getSlugValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'current' in value) {
    const current = (value as { current?: unknown }).current
    return typeof current === 'string' ? current : ''
  }
  return ''
}

function portableTextToPlainText(value: unknown): string {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''

  return value
    .map((block) => {
      if (!block || typeof block !== 'object') return ''
      const children = (block as { children?: unknown }).children
      if (!Array.isArray(children)) return ''

      return children
        .map((child) => {
          if (!child || typeof child !== 'object') return ''
          const text = (child as { text?: unknown }).text
          return typeof text === 'string' ? text : ''
        })
        .join('')
    })
    .filter(Boolean)
    .join('\n\n')
}

function getOwnerName(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name
    return typeof name === 'string' && name.trim() ? name.trim() : 'Les Ateliers'
  }
  return 'Les Ateliers'
}

function getStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function getBooleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeEventForUi(event: Event) {
  const raw = event as Event & {
    description?: unknown
    owner?: unknown
    coverImage?: unknown
    capacity?: unknown
    location?: unknown
    priceLabel?: unknown
    excerpt?: unknown
    startDate?: unknown
    endDate?: unknown
    type?: unknown
    registrationEnabled?: unknown
  }

  return {
    ...event,
    slug: getSlugValue(event.slug),
    type: getStringValue(raw.type, 'Événement'),
    owner: getOwnerName(raw.owner),
    description: portableTextToPlainText(raw.description),
    excerpt: getStringValue(raw.excerpt),
    startDate: getStringValue(raw.startDate),
    endDate: getStringValue(raw.endDate),
    location: getStringValue(raw.location),
    priceLabel: getStringValue(raw.priceLabel),
    registrationEnabled: getBooleanValue(raw.registrationEnabled, false),
    capacity:
      typeof raw.capacity === 'number'
        ? String(raw.capacity)
        : getStringValue(raw.capacity),
    imageUrl:
      raw.coverImage
        ? imageUrl(raw.coverImage, 1600, 900) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80'
        : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
  }
}

export async function generateStaticParams() {
  const events = await sanityFetchArray<Event>(allEventsQuery)

  return events
    .map((event) => {
      const slug = getSlugValue(event.slug)
      return slug ? { slug } : null
    })
    .filter(Boolean) as { slug: string }[]
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const event = await sanityFetch<Event>(eventBySlugQuery, { slug })

  if (!event) {
    return { title: 'Événement introuvable' }
  }

  return {
    title: event.title ?? 'Événement',
    description:
      typeof event.excerpt === 'string' && event.excerpt.trim().length > 0
        ? event.excerpt
        : 'Détail de l’événement',
  }
}

export default async function EventPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params
  const event = await sanityFetch<Event>(eventBySlugQuery, { slug })

  if (!event) {
    notFound()
  }

  const normalizedEvent = normalizeEventForUi(event)

  return <EventDetailPage event={normalizedEvent} />
}
