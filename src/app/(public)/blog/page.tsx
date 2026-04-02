// src/app/(public)/blog/page.tsx
// Blog list — tente de charger depuis Sanity, fallback aux données statiques
import type { Metadata } from 'next'
import { BlogListPage } from '@/features/blog/BlogListPage'
import { sanityFetchArray } from '@/lib/sanity/fetch'
import { allPostsQuery } from '@/lib/sanity/queries'
import type { Post } from '@/types'

// Données statiques de fallback (utilisées si Sanity n'est pas configuré)
const staticPosts = [
  {
    _id: 'p1',
    title: 'Le Double : cette ombre qui nous suit',
    slug: { current: 'le-double-cette-ombre-qui-nous-suit' },
    excerpt: "Qu'est-ce que le Double Karmique ? Pourquoi certaines situations se répètent-elles dans notre vie ? Une introduction au travail que nous proposons lors de nos stages.",
    publishedAt: '2025-03-15',
    author: { name: 'Gabriel', slug: { current: 'gabriel' } },
    imageUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80',
  },
  {
    _id: 'p2',
    title: "Et si votre vie n'était pas un hasard ?",
    slug: { current: 'et-si-votre-vie-n-etait-pas-un-hasard' },
    excerpt: "L'accompagnement biographique explore les rythmes invisibles qui traversent nos vies. Une approche profonde et douce pour comprendre son chemin.",
    publishedAt: '2025-02-20',
    author: { name: 'Gabriel', slug: { current: 'gabriel' } },
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    _id: 'p3',
    title: 'Le corps parle avant les mots',
    slug: { current: 'le-corps-parle-avant-les-mots' },
    excerpt: "Découvrez comment la posture, le souffle et le geste peuvent transformer notre façon de communiquer. Les secrets d'une expression juste et incarnée.",
    publishedAt: '2025-01-10',
    author: { name: 'Gabriel', slug: { current: 'gabriel' } },
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
  },
]

export const revalidate = 3600 // ISR : regénère toutes les heures

export const metadata: Metadata = {
  title: 'Blog & Actualités',
  description: 'Articles, réflexions et actualités des Ateliers de la Source. Développement personnel, théâtre, biographie et vie intérieure.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  // Tenter de charger depuis Sanity
  const sanityPosts = await sanityFetchArray<Post>(allPostsQuery)

  // Si Sanity retourne des données : les utiliser ; sinon : données statiques
  const posts = sanityPosts.length > 0 ? sanityPosts : staticPosts

  return <BlogListPage posts={posts} fromSanity={sanityPosts.length > 0} />
}
