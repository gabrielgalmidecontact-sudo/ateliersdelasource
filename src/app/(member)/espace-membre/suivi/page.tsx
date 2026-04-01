// src/app/(member)/espace-membre/suivi/page.tsx
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { MemberSuiviPage } from '@/features/auth/MemberSuiviPage'

export const metadata: Metadata = {
  title: 'Mon parcours — Espace membre',
  robots: { index: false },
}

export default function Page() {
  return <MemberSuiviPage />
}
