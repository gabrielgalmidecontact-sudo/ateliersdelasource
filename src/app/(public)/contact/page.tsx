// src/app/(public)/contact/page.tsx
import type { Metadata } from 'next'
import { ContactPage } from '@/features/contact/ContactPage'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez les Ateliers de la Source pour toute question sur nos stages, ateliers, spectacles et accompagnements.',
}

export default function Contact() {
  return <ContactPage />
}
