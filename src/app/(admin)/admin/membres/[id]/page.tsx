// src/app/(admin)/admin/membres/[id]/page.tsx
// Next.js 16 : params est une Promise — on doit l'awaiter dans un Server Component async
import type { Metadata } from 'next'
import { AdminMemberDetailPage } from '@/features/admin/AdminMemberDetailPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fiche membre — Administration',
  robots: { index: false },
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AdminMemberDetailPage memberId={id} />
}
