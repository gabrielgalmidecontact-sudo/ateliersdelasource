import type { Metadata } from 'next'
import { AdminReservationGroupsPage } from '@/features/admin/AdminReservationGroupsPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Événements & inscriptions — Administration',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminReservationGroupsPage />
}
