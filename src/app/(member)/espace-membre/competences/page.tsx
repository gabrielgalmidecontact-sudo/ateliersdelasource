// src/app/(member)/espace-membre/competences/page.tsx
import type { Metadata } from 'next'
import { MemberCompetenciesPage } from '@/features/member/MemberCompetenciesPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mes compétences — Espace membre',
  robots: { index: false },
}

export default function Page() {
  return <MemberCompetenciesPage />
}
