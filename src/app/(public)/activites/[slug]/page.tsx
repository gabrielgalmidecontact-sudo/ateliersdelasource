import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ActivityDetailPage } from '@/features/activites/ActivityDetailPage'
import { sanityFetch, sanityFetchArray } from '@/lib/sanity/fetch'
import { activityBySlugQuery, allActivitiesQuery } from '@/lib/sanity/queries'
import { imageUrl } from '@/lib/sanity/image'
import type { Activity } from '@/types'

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

function getOwner(value: unknown) {
  if (value && typeof value === 'object') {
    const record = value as { name?: unknown; role?: unknown }
    return {
      name: typeof record.name === 'string' && record.name.trim() ? record.name : 'Les Ateliers',
      role: typeof record.role === 'string' ? record.role : '',
    }
  }

  if (typeof value === 'string' && value.trim()) {
    return { name: value, role: '' }
  }

  return { name: 'Les Ateliers', role: '' }
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

function getDuration(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const record = value as { value?: unknown; label?: unknown }
    if (typeof record.value === 'string' && record.value.trim()) return record.value
    if (typeof record.label === 'string' && record.label.trim()) return record.label
  }
  return 'À confirmer'
}

function getPrice(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const record = value as { label?: unknown; amount?: unknown; note?: unknown }
    if (typeof record.label === 'string' && record.label.trim()) return record.label
    if (typeof record.amount === 'number') return `${record.amount} €`
    if (typeof record.note === 'string' && record.note.trim()) return record.note
  }
  return 'Sur demande'
}

function getStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function normalizeActivityForUi(activity: Activity) {
  const raw = activity as Activity & {
    owner?: unknown
    content?: unknown
    duration?: unknown
    price?: unknown
    coverImage?: unknown
    participants?: unknown
    location?: unknown
    excerpt?: unknown
    code?: unknown
  }

  return {
    ...activity,
    code: getStringValue(raw.code),
    slug: getSlugValue(activity.slug),
    owner: getOwner(raw.owner),
    excerpt: getStringValue(raw.excerpt),
    content: portableTextToPlainText(raw.content),
    duration: getDuration(raw.duration),
    participants: getStringValue(raw.participants, 'À confirmer'),
    price: getPrice(raw.price),
    location: getStringValue(raw.location, 'Lieu à confirmer'),
    type: 'Activité',
    imageUrl: raw.coverImage
      ? imageUrl(raw.coverImage, 1600, 900) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'
      : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  }
}

export async function generateStaticParams() {
  const activities = await sanityFetchArray<Activity>(allActivitiesQuery)

  return activities
    .map((activity) => {
      const slug = getSlugValue(activity.slug)
      return slug ? { slug } : null
    })
    .filter(Boolean) as { slug: string }[]
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const activity = await sanityFetch<Activity>(activityBySlugQuery, { slug })

  if (!activity) {
    return { title: 'Activité introuvable' }
  }

  return {
    title: activity.title ?? 'Activité',
    description:
      typeof activity.excerpt === 'string' && activity.excerpt.trim().length > 0
        ? activity.excerpt
        : 'Détail de l’activité',
  }
}

export default async function ActivityPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params

  const [activity, allActivities] = await Promise.all([
    sanityFetch<Activity>(activityBySlugQuery, { slug }),
    sanityFetchArray<Activity>(allActivitiesQuery),
  ])

  if (!activity) {
    notFound()
  }

  const normalizedActivity = normalizeActivityForUi(activity)
  const normalizedActivities = allActivities.map(normalizeActivityForUi)

  return (
    <ActivityDetailPage
      activity={normalizedActivity}
      allActivities={normalizedActivities}
    />
  )
}
