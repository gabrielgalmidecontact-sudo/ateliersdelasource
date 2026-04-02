'use client'
// src/features/blog/BlogListPage.tsx
// Accepte les données de Sanity (via page.tsx) ou utilise les données statiques intégrées
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'

// Type de post normalisé (compatible Sanity + statique)
interface PostItem {
  _id?: string
  title: string
  slug: { current: string } | string
  excerpt?: string
  publishedAt?: string
  author?: { name: string; slug?: { current: string } } | string
  imageUrl?: string
  coverImage?: { asset: { _ref: string }; alt?: string }
}

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

// Normalize slug (string ou {current: string})
function getSlug(slug: PostItem['slug']): string {
  return typeof slug === 'string' ? slug : slug.current
}

// Normalize author name
function getAuthorName(author: PostItem['author']): string {
  if (!author) return 'Les Ateliers'
  if (typeof author === 'string') return author
  return author.name
}

function PostCard({ post, index }: { post: PostItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const slug = getSlug(post.slug)
  const authorName = getAuthorName(post.author)
  const date = post.publishedAt ? new Date(post.publishedAt) : null
  const formattedDate = date
    ? `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`
    : null

  // Image source : url directe ou Sanity CDN
  const imageSrc = post.imageUrl || '/images/placeholders/blog.jpg'

  useEffect(() => {
    const el = ref.current
    if (!el) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms`,
      }}
    >
      <Link href={`/blog/${slug}`} className="group block h-full" aria-label={`Lire : ${post.title}`}>
        <article className="h-full flex flex-col bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="h-52 overflow-hidden bg-[#D4C4A8] relative">
            <Image
              src={imageSrc}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center gap-2 mb-3 text-xs font-sans text-[#7A6355]">
              <Calendar size={12} className="text-[#C8912A]" />
              {formattedDate && <span>{formattedDate}</span>}
              {formattedDate && <span className="text-[#D4C4A8]">·</span>}
              <span>{authorName}</span>
            </div>
            <h2 className="font-serif text-xl text-[#5C3D2E] group-hover:text-[#C8912A] leading-snug mb-3 transition-colors duration-200">
              {post.title}
            </h2>
            <p className="text-sm font-sans text-[#7A6355] leading-relaxed flex-1 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="mt-5 flex items-center gap-1 text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors duration-200">
              Lire l&apos;article
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}

interface BlogListPageProps {
  posts?: PostItem[]
  fromSanity?: boolean
}

export function BlogListPage({ posts: propPosts, fromSanity }: BlogListPageProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)

  // Données statiques intégrées (utilisées quand pas de props)
  const staticPosts: PostItem[] = [
    {
      _id: 'p1',
      title: 'Le Double : cette ombre qui nous suit',
      slug: { current: 'le-double-cette-ombre-qui-nous-suit' },
      excerpt: "Qu'est-ce que le Double Karmique ? Pourquoi certaines situations se répètent-elles dans notre vie ? Une introduction au travail que nous proposons lors de nos stages.",
      publishedAt: '2025-03-15',
      author: { name: 'Gabriel' },
      imageUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80',
    },
    {
      _id: 'p2',
      title: "Et si votre vie n'était pas un hasard ?",
      slug: { current: 'et-si-votre-vie-n-etait-pas-un-hasard' },
      excerpt: "L'accompagnement biographique explore les rythmes invisibles qui traversent nos vies. Une approche profonde et douce pour comprendre son chemin.",
      publishedAt: '2025-02-20',
      author: { name: 'Gabriel' },
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    },
    {
      _id: 'p3',
      title: 'Le corps parle avant les mots',
      slug: { current: 'le-corps-parle-avant-les-mots' },
      excerpt: "Découvrez comment la posture, le souffle et le geste peuvent transformer notre façon de communiquer. Les secrets d'une expression juste et incarnée.",
      publishedAt: '2025-01-10',
      author: { name: 'Gabriel' },
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
    },
  ]

  const posts = propPosts && propPosts.length > 0 ? propPosts : staticPosts

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  return (
    <>
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <div
            ref={heroRef}
            className="text-center"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(24px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-4">Réflexions</p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#F5EDD8] mb-4">Blog &amp; Actualités</h1>
            <p className="text-base font-sans text-[#C8A888] max-w-lg mx-auto">
              Articles, témoignages et réflexions sur le développement personnel, le théâtre, la biographie et la vie intérieure.
            </p>
          </div>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <PostCard key={post._id || getSlug(post.slug)} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-serif text-xl text-[#7A6355]">Aucun article pour le moment.</p>
              <p className="text-sm font-sans text-[#7A6355] mt-2">
                Revenez bientôt pour découvrir nos premières publications.
              </p>
            </div>
          )}

          {/* Indicateur en dev si Sanity est actif */}
          {fromSanity && process.env.NODE_ENV === 'development' && (
            <p className="mt-8 text-center text-xs font-sans text-[#7A6355] opacity-50">
              ✓ Données chargées depuis Sanity CMS
            </p>
          )}
        </Container>
      </div>
    </>
  )
}
