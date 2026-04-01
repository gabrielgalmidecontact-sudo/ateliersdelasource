// src/app/(public)/evenements/page.tsx
import type { Metadata } from 'next'
import { EventsListPage } from '@/features/evenements/EventsListPage'

export const metadata: Metadata = {
  title: 'Stages & Événements',
  description: 'Retrouvez tous les stages, ateliers et formations à venir aux Ateliers de la Source. Dates, descriptions et informations pratiques.',
}

export default function EvenementsPage() {
  return <EventsListPage />
}
