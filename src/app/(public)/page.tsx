import type { Metadata } from 'next'

export const revalidate = 60
import { HeroHome } from '@/features/home/HeroHome'
import { HomeIntro } from '@/features/home/HomeIntro'
import { FounderColumns } from '@/features/home/FounderColumns'
import { FeaturedEvents } from '@/features/home/FeaturedEvents'
import { HomeReviews } from '@/features/home/HomeReviews'
import { NewsletterSection } from '@/features/newsletter/NewsletterSection'
import { sanityFetch, sanityFetchArray } from '@/lib/sanity/fetch'
import {
  allActivitiesQuery,
  allEventsQuery,
  allPersonsQuery,
  homepageEventsQuery,
  siteSettingsQuery,
  upcomingEventsQuery,
} from '@/lib/sanity/queries'
import { imageUrl } from '@/lib/sanity/image'
import { createServerClient } from '@/lib/supabase/server'
import type { Activity, Event, Person, SiteSettings } from '@/types'

export const metadata: Metadata = {
  title: 'Les Ateliers de la Source — Stages, Ateliers & Spectacles',
  description: 'Stages de développement personnel, ateliers d\'expression parlée et corporelle, spectacles et accompagnements individuels dans un lieu de nature.',
  openGraph: {
    title: 'Les Ateliers de la Source',
    description: 'Stages de développement personnel, ateliers et spectacles.',
    images: [{ url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80' }],
  },
}

type HomeReview = {
  id: string
  first_name: string
  rating: number
  comment: string
  is_verified_participant?: boolean
  created_at: string
}

const FALLBACK_GABRIEL_ACTIVITIES = [
  { code: 'A1', title: 'Théâtre des Doubles Karmiques', slug: 'theatre-doubles-karmiques', excerpt: 'Stage de développement personnel sur 3 jours et demi en petit groupe.' },
  { code: 'A2', title: 'Entretien Biographique', slug: 'entretien-biographique', excerpt: "Entretiens d'une heure pour explorer le sens et les rythmes de votre vie." },
  { code: 'A3', title: "Atelier d'Expression Parlée et Corporelle", slug: 'atelier-expression-parlee-corporelle', excerpt: 'Gagner en aisance verbale et corporelle, séance par séance.' },
  { code: 'A4', title: 'Rêves à 100 000 euros', slug: 'reves-100000-euros', excerpt: 'Un seul en scène semi-improvisé, interactif et touchant — 1h30 au chapeau.' },
  { code: 'A5', title: 'La Vision de Dante de Victor Hugo', slug: 'vision-dante-victor-hugo', excerpt: 'Récitation poétique accompagnée de violoncelle ou piano — 1h30 au chapeau.' },
]

const FALLBACK_AMELIE_ACTIVITIES = [
  { code: 'A6', title: 'Massages & Soins', slug: 'massages-soins', excerpt: 'Soins corporels dans un espace dédié. Contenu à venir.' },
  { code: 'A7', title: 'Réserver un hébergement', slug: 'hebergement', excerpt: 'Informations pour réserver votre nuit sur le lieu. Contenu à venir.' },
  { code: 'A8', title: 'Venir sur le lieu', slug: 'venir-sur-le-lieu', excerpt: 'Accès, itinéraire et informations pratiques. Contenu à venir.' },
]

const FALLBACK_HOME_EVENTS = [
  { id: '1', title: 'Théâtre des Doubles Karmiques', type: 'Stage', startDate: '2025-06-06', location: 'Les Ateliers de la Source', slug: 'theatre-doubles-karmiques-juin-2025' },
  { id: '2', title: 'Nos Émerveillements', type: 'Atelier', startDate: '2025-05-05', location: 'Les Ateliers de la Source', slug: 'nos-emerveillements-mai-2025' },
  { id: '3', title: 'Dernières Places disponibles', type: 'Stage', startDate: '2025-04-21', location: 'Les Ateliers de la Source', slug: 'dernieres-places-stage-avril' },
]

function getSlugValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'current' in value) {
    const current = (value as { current?: unknown }).current
    return typeof current === 'string' ? current : ''
  }
  return ''
}

function getStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeActivity(activity: Activity) {
  const owner = activity.owner as unknown
  const ownerName =
    owner && typeof owner === 'object' && 'name' in owner
      ? getStringValue((owner as { name?: unknown }).name)
      : ''

  const code = getStringValue(activity.code).toUpperCase()

  return {
    code,
    title: getStringValue(activity.title, 'Activité'),
    slug: getSlugValue(activity.slug),
    excerpt: getStringValue(activity.excerpt, 'Description bientôt disponible.'),
    ownerName,
  }
}

function classifyActivity(activity: ReturnType<typeof normalizeActivity>) {
  const owner = activity.ownerName.toLowerCase()
  const code = activity.code

  if (owner.includes('gabriel')) return 'gabriel'
  if (owner.includes('amélie') || owner.includes('amelie')) return 'amelie'

  if (['A1', 'A2', 'A3', 'A4', 'A5'].includes(code)) return 'gabriel'
  if (['A6', 'A7', 'A8'].includes(code)) return 'amelie'

  return null
}

function findPerson(persons: Person[], keyword: string) {
  const lowered = keyword.toLowerCase()
  return persons.find((person) => {
    const name = getStringValue(person.name).toLowerCase()
    const slug = getSlugValue(person.slug).toLowerCase()
    return name.includes(lowered) || slug.includes(lowered)
  })
}

function buildFounderData(
  person: Person | undefined,
  fallback: {
    name: string
    role: string
    bio: string
    imageUrl: string
    isPlaceholder?: boolean
  }
) {
  return {
    name: getStringValue(person?.name, fallback.name),
    role: getStringValue(person?.role, fallback.role),
    bio: getStringValue(person?.shortBio, fallback.bio),
    imageUrl: person?.photo ? imageUrl(person.photo, 1200, 900) || fallback.imageUrl : fallback.imageUrl,
    isPlaceholder: fallback.isPlaceholder,
  }
}

function normalizeHomeEvent(event: Event) {
  const slug = getSlugValue(event.slug)

  if (!slug || slug.startsWith('http://') || slug.startsWith('https://')) {
    return null
  }

  return {
    id: getStringValue(event._id, slug),
    title: getStringValue(event.title, 'Événement'),
    type: getStringValue(event.type, 'Événement'),
    startDate: getStringValue(event.startDate),
    location: getStringValue(event.location, 'Lieu à confirmer'),
    slug,
  }
}

async function getHomeReviews(): Promise<HomeReview[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('id, first_name, rating, comment, is_verified_participant, created_at')
      .eq('is_published', true)
      .eq('content_type', 'event')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('[HOME REVIEWS ERROR]', error)
      return []
    }

    return (data || []) as HomeReview[]
  } catch (error) {
    console.error('[HOME REVIEWS FETCH ERROR]', error)
    return []
  }
}

export default async function HomePage() {
  const now = new Date().toISOString()

  const [siteSettings, activities, homepageEvents, upcomingEvents, allEvents, persons, homeReviews] = await Promise.all([
    sanityFetch<SiteSettings>(siteSettingsQuery),
    sanityFetchArray<Activity>(allActivitiesQuery),
    sanityFetchArray<Event>(homepageEventsQuery),
    sanityFetchArray<Event>(upcomingEventsQuery, { now }),
    sanityFetchArray<Event>(allEventsQuery),
    sanityFetchArray<Person>(allPersonsQuery),
    getHomeReviews(),
  ])

  const normalizedActivities = activities
    .map(normalizeActivity)
    .filter((activity) => activity.slug && activity.code)

  const gabrielActivities = normalizedActivities.filter((activity) => classifyActivity(activity) === 'gabriel')
  const amelieActivities = normalizedActivities.filter((activity) => classifyActivity(activity) === 'amelie')

  const gabrielPerson = findPerson(persons, 'gabriel')
  const ameliePerson = findPerson(persons, 'amelie')

  const gabriel = {
    ...buildFounderData(gabrielPerson, {
      name: 'Gabriel',
      role: 'Comédien · Thérapeute',
      bio: "Comédien et animateur de stages de développement personnel, Gabriel vous accompagne dans une exploration de vous-même à travers le théâtre, la biographie et l'expression. Un chemin humain, créatif et profond.",
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    }),
    activities: gabrielActivities.length > 0 ? gabrielActivities : FALLBACK_GABRIEL_ACTIVITIES,
  }

  const amelie = {
    ...buildFounderData(ameliePerson, {
      name: 'Amélie',
      role: 'Praticienne · Hôte du lieu',
      bio: 'Amélie vous accueille dans cet espace de douceur et de ressourcement. Elle propose des soins corporels et des informations pratiques pour votre séjour sur le lieu. Ses offres seront détaillées prochainement.',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
      isPlaceholder: amelieActivities.length === 0,
    }),
    activities: amelieActivities.length > 0 ? amelieActivities : FALLBACK_AMELIE_ACTIVITIES,
  }

  const selectedEventsSource =
    homepageEvents.length > 0
      ? homepageEvents
      : upcomingEvents.length > 0
        ? upcomingEvents
        : allEvents

  const dynamicEvents = selectedEventsSource
    .map(normalizeHomeEvent)
    .filter(Boolean) as Array<{
      id: string
      title: string
      type: string
      startDate?: string
      location?: string
      slug: string
    }>

  const featuredEvents = [...dynamicEvents]

  for (const fallbackEvent of FALLBACK_HOME_EVENTS) {
    if (featuredEvents.length >= 3) break
    const exists = featuredEvents.some((event) => event.slug === fallbackEvent.slug)
    if (!exists) {
      featuredEvents.push(fallbackEvent)
    }
  }

  const heroTitle = getStringValue(siteSettings?.heroTitle)
  const heroSubtitle = getStringValue(siteSettings?.heroSubtitle)
  const heroImageUrl = siteSettings?.heroImage
    ? imageUrl(siteSettings.heroImage, 1920, 1200) || undefined
    : undefined

  const newsletterEnabled = siteSettings?.newsletterEnabled !== false

  return (
    <>
      <HeroHome
        title={heroTitle || undefined}
        subtitle={heroSubtitle || undefined}
        imageUrl={heroImageUrl}
      />
      <HomeIntro />
      <FounderColumns gabriel={gabriel} amelie={amelie} />
      <FeaturedEvents events={featuredEvents} />
      {newsletterEnabled ? <NewsletterSection /> : null}
      <HomeReviews reviews={homeReviews} />
    </>
  )
}
