// src/app/(member)/espace-membre/page.tsx
import type { Metadata } from 'next'
import { MemberDashboard } from '@/features/auth/MemberDashboard'

export const metadata: Metadata = { title: 'Espace membre' }

export default function EspaceMembre() {
  return <MemberDashboard />
}
