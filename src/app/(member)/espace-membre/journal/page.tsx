// src/app/(member)/espace-membre/journal/page.tsx
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { MemberJournalPage } from '@/features/member/MemberJournalPage'

export const metadata: Metadata = {
  title: 'Journal — Espace membre',
  robots: { index: false },
}

export default function Page() {
  return <MemberJournalPage />
}
