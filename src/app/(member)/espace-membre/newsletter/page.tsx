// src/app/(member)/espace-membre/newsletter/page.tsx
import type { Metadata } from 'next'
import { MemberNewsletterPage } from '@/features/auth/MemberNewsletterPage'

export const metadata: Metadata = { title: 'Préférences newsletter — Espace membre' }

export default function NewsletterPage() {
  return <MemberNewsletterPage />
}
