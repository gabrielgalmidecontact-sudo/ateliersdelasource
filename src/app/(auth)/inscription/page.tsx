// src/app/(auth)/inscription/page.tsx
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { SignupPage } from '@/features/auth/SignupPage'

export const metadata: Metadata = {
  title: 'Créer un compte — Espace membre',
  robots: { index: false },
}

export default function Page() {
  return <SignupPage />
}
