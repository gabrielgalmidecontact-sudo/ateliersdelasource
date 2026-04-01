// src/app/(public)/a-propos/page.tsx
import type { Metadata } from 'next'
import { AboutPage } from '@/features/about/AboutPage'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez l\'histoire des Ateliers de la Source, Gabriel et Amélie, et l\'esprit du lieu.',
}

export default function About() {
  return <AboutPage />
}
