// src/app/(public)/activites/page.tsx
// Fetch depuis Sanity (server component) avec fallback statique
import type { Metadata } from 'next'
import { ActivitesListPage } from '@/features/activites/ActivitesListPage'
import { sanityFetchArray } from '@/lib/sanity/fetch'
import { allActivitiesQuery } from '@/lib/sanity/queries'
import type { Activity } from '@/types'

export const metadata: Metadata = {
  title: 'Activités',
  description:
    "Découvrez toutes les activités proposées aux Ateliers de la Source : stages de développement personnel, ateliers d'expression, spectacles et accompagnements.",
}

export default async function ActivitesPage() {
  // Tente de récupérer les activités depuis Sanity (retourne [] si non configuré)
  const sanityActivities = await sanityFetchArray<Activity>(allActivitiesQuery)

  return <ActivitesListPage sanityActivities={sanityActivities.length > 0 ? sanityActivities : null} />
}
