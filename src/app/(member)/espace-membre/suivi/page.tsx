// src/app/(member)/espace-membre/suivi/page.tsx
import type { Metadata } from 'next'
import { MemberSuiviPageV2 } from '@/features/member/MemberSuiviPageV2'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mon parcours — Espace membre',
  robots: { index: false },
}

export default function Page() {
  return <MemberSuiviPageV2 />
}
