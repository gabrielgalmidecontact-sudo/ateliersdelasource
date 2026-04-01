// src/app/(member)/espace-membre/page.tsx
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { MemberDashboard } from '@/features/auth/MemberDashboard'

export const metadata: Metadata = { title: 'Espace membre' }

export default function EspaceMembre() {
  return <MemberDashboard />
}
