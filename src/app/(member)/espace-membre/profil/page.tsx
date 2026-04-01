// src/app/(member)/espace-membre/profil/page.tsx
import type { Metadata } from 'next'
import { MemberProfilPage } from '@/features/auth/MemberProfilPage'

export const metadata: Metadata = { title: 'Mon profil — Espace membre' }

export default function ProfilPage() {
  return <MemberProfilPage />
}
