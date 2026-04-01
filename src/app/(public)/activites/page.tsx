// src/app/(public)/activites/page.tsx
import type { Metadata } from 'next'
import { ActivitesListPage } from '@/features/activites/ActivitesListPage'

export const metadata: Metadata = {
  title: 'Activités',
  description: 'Découvrez toutes les activités proposées aux Ateliers de la Source : stages de développement personnel, ateliers d\'expression, spectacles et accompagnements.',
}

export default function ActivitesPage() {
  return <ActivitesListPage />
}
