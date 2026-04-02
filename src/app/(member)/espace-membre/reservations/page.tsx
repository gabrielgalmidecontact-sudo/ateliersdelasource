// src/app/(member)/espace-membre/reservations/page.tsx
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { MemberReservationsPage } from '@/features/auth/MemberReservationsPage'

export const metadata: Metadata = { title: 'Mes réservations — Espace membre' }

export default function ReservationsPage() {
  return <MemberReservationsPage />
}
