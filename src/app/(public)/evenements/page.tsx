import type { Metadata } from 'next'

export const revalidate = 60
import { EventsListPage } from '@/features/evenements/EventsListPage'
import { sanityFetchArray } from '@/lib/sanity/fetch'
import { allEventsQuery } from '@/lib/sanity/queries'
import type { Event } from '@/types'

export const metadata: Metadata = {
  title: 'Stages & Événements',
  description:
    'Retrouvez tous les stages, ateliers et formations à venir aux Ateliers de la Source. Dates, descriptions et informations pratiques.',
}

export default async function EvenementsPage() {
  const sanityEvents = await sanityFetchArray<Event>(allEventsQuery)

  return <EventsListPage sanityEvents={sanityEvents} />
}
