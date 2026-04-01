// src/app/(auth)/connexion/page.tsx
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { LoginPage } from '@/features/auth/LoginPage'

export const metadata: Metadata = {
  title: 'Connexion — Espace membre',
  robots: { index: false },
}

export default function Page() {
  return <LoginPage />
}
