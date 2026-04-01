// src/app/(public)/blog/page.tsx
import type { Metadata } from 'next'
import { BlogListPage } from '@/features/blog/BlogListPage'

export const metadata: Metadata = {
  title: 'Blog & Actualités',
  description: 'Articles, réflexions et actualités des Ateliers de la Source. Développement personnel, théâtre, biographie et vie intérieure.',
}

export default function BlogPage() {
  return <BlogListPage />
}
