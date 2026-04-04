// src/app/(admin)/admin/experiences/page.tsx
import type { Metadata } from 'next'
import { AdminExperienceBuilder } from '@/features/admin/AdminExperienceBuilder'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Expériences — Administration',
  robots: { index: false },
}

export default function Page() {
  return <AdminExperienceBuilder />
}
