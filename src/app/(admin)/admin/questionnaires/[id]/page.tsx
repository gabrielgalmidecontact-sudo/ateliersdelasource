// src/app/(admin)/admin/questionnaires/[id]/page.tsx
// Page de détail d'un questionnaire — liste des soumissions et réponses
import type { Metadata } from 'next'
import { AdminQuestionnaireDetailPage } from '@/features/admin/AdminQuestionnaireDetailPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Questionnaire — Administration',
  robots: { index: false },
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AdminQuestionnaireDetailPage questionnaireId={id} />
}
