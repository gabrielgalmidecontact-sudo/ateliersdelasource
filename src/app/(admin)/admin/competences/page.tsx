// src/app/(admin)/admin/competences/page.tsx
import type { Metadata } from 'next'
import { AdminCompetenciesPage } from '@/features/admin/AdminCompetenciesPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Compétences — Administration',
  robots: { index: false },
}

export default function Page() {
  return <AdminCompetenciesPage />
}
