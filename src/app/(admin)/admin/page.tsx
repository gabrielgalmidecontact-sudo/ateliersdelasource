// src/app/(admin)/admin/page.tsx
import type { Metadata } from 'next'
import { AdminDashboard } from '@/features/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Administration — Les Ateliers de la Source',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminDashboard />
}
