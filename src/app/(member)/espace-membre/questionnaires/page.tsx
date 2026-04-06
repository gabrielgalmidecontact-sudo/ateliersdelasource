// src/app/(member)/espace-membre/questionnaires/page.tsx
import type { Metadata } from 'next'
import { MemberQuestionnairesPage } from '@/features/member/MemberQuestionnairesPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Questionnaires — Espace membre',
  robots: { index: false },
}

export default function Page() {
  return <MemberQuestionnairesPage />
}
