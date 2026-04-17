import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ActivityDetailPage } from '@/features/activites/ActivityDetailPage'
import { sanityFetch, sanityFetchArray } from '@/lib/sanity/fetch'
import { activityBySlugQuery, allActivitiesQuery, allEventsQuery } from '@/lib/sanity/queries'
import { imageUrl } from '@/lib/sanity/image'
import type { Activity, Event } from '@/types'
import { getActivityFallbackDate } from '@/lib/reservations/activityFallbackDates'

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

function getEventStartDate(event: Event): string {
  const raw = event as Event & {
    dates?: { startDate?: unknown }
    startDate?: unknown
  }

  const nestedStartDate = raw.dates?.startDate
  if (typeof nestedStartDate === 'string' && nestedStartDate.trim()) {
    return nestedStartDate.trim()
  }

  if (typeof raw.startDate === 'string' && raw.startDate.trim()) {
    return raw.startDate.trim()
  }

  return ''
}

function findNextEventDateForActivity(activity: Activity, events: Event[]): string {
  const activitySlug = getSlugValue(activity.slug).toLowerCase()
  const activityTitle = getStringValue(activity.title).toLowerCase()
  const now = new Date()

  const candidates = events
    .map((event) => {
      const eventSlug = getSlugValue(event.slug).toLowerCase()
      const eventTitle = getStringValue(event.title).toLowerCase()
      const startDate = getEventStartDate(event)
      const parsedDate = startDate ? new Date(startDate) : null

      const matchesSlug = Boolean(activitySlug) && eventSlug.includes(activitySlug)
      const matchesTitle = Boolean(activityTitle) && eventTitle.includes(activityTitle)

      return {
        startDate,
        parsedDate,
        matches: matchesSlug || matchesTitle,
      }
    })
    .filter(
      (item) =>
        item.matches &&
        item.startDate &&
        item.parsedDate &&
        !Number.isNaN(item.parsedDate.getTime()) &&
        item.parsedDate >= now
    )
    .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime())

  if (candidates.length > 0) return candidates[0].startDate

  return getActivityFallbackDate({
    slug: getSlugValue(activity.slug),
    title: getStringValue(activity.title),
  })
}

function normalizeActivityForUi(activity: Activity, events: Event[] = []) {
  const raw = activity as Activity & {
    owner?: unknown
    content?: unknown
    duration?: unknown
    price?: unknown
    coverImage?: unknown
    heroImage?: unknown
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
    imageUrl: raw.heroImage
      ? imageUrl(raw.heroImage, 1600, 900) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'
      : raw.coverImage
        ? imageUrl(raw.coverImage, 1600, 900) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'
        : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    nextEventDate: findNextEventDateForActivity(activity, events),
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

  const [activity, allActivities, allEvents] = await Promise.all([
    sanityFetch<Activity>(activityBySlugQuery, { slug }),
    sanityFetchArray<Activity>(allActivitiesQuery),
    sanityFetchArray<Event>(allEventsQuery),
  ])

  if (!activity) {
    notFound()
  }

  const normalizedActivity = normalizeActivityForUi(activity, allEvents)
  const normalizedActivities = allActivities.map((item) => normalizeActivityForUi(item, allEvents))

  return (
    <ActivityDetailPage
      activity={normalizedActivity}
      allActivities={normalizedActivities}
    />
  )
}
