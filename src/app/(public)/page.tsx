// src/app/(public)/page.tsx
import type { Metadata } from 'next'
import { HeroHome } from '@/features/home/HeroHome'
import { HomeIntro } from '@/features/home/HomeIntro'
import { FounderColumns } from '@/features/home/FounderColumns'
import { FeaturedEvents } from '@/features/home/FeaturedEvents'
import { NewsletterSection } from '@/features/newsletter/NewsletterSection'

export const metadata: Metadata = {
  title: 'Les Ateliers de la Source — Stages, Ateliers & Spectacles',
  description: 'Stages de développement personnel, ateliers d\'expression parlée et corporelle, spectacles et accompagnements individuels dans un lieu de nature.',
  openGraph: {
    title: 'Les Ateliers de la Source',
    description: 'Stages de développement personnel, ateliers et spectacles.',
    images: [{ url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80' }],
  },
}

export default function HomePage() {
  return (
    <>
      <HeroHome />
      <HomeIntro />
      <FounderColumns />
      <FeaturedEvents />
      <NewsletterSection />
    </>
  )
}
