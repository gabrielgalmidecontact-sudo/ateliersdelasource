// src/app/(admin)/admin/membres/[id]/page.tsx
import type { Metadata } from 'next'
import { AdminMemberDetailPage } from '@/features/admin/AdminMemberDetailPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fiche membre — Administration',
  robots: { index: false },
}

export default function Page({ params }: { params: { id: string } }) {
  return <AdminMemberDetailPage memberId={params.id} />
}
