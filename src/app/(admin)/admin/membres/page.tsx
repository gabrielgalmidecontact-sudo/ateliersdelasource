// src/app/(admin)/admin/membres/page.tsx
import type { Metadata } from 'next'
import { AdminMembersPage } from '@/features/admin/AdminMembersPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Membres — Administration',
  robots: { index: false },
}

export default function Page() {
  return <AdminMembersPage />
}
