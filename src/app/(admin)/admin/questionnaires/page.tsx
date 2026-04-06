// src/app/(admin)/admin/questionnaires/page.tsx
import type { Metadata } from 'next'
import { AdminQuestionnairesPage } from '@/features/admin/AdminQuestionnairesPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Questionnaires — Administration',
  robots: { index: false },
}

export default function Page() {
  return <AdminQuestionnairesPage />
}
