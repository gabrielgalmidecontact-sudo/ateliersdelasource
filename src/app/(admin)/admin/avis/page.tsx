import type { Metadata } from 'next'
import { AdminReviewsPage } from '@/features/admin/AdminReviewsPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Avis — Administration',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminReviewsPage />
}
