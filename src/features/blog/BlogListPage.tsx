'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { imageUrl } from '@/lib/sanity/image'

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
const BLOG_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'

function getSlug(slug: PostItem['slug']): string {
  return typeof slug === 'string' ? slug : slug.current
}

function getAuthorName(author: PostItem['author']): string {
  if (!author) return 'Les Ateliers'
  if (typeof author === 'string') return author
  return author.name
}

function getImageSrc(post: PostItem): string {
  if (post.imageUrl) return post.imageUrl
  if (post.coverImage) {
    return imageUrl(post.coverImage, 900, 600) || BLOG_FALLBACK_IMAGE
  }
  return BLOG_FALLBACK_IMAGE
}

function isValidPublishedDate(value?: string): boolean {
  if (!value) return false
  return !Number.isNaN(new Date(value).getTime())
}

function PostCard({ post, index }: { post: PostItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const slug = getSlug(post.slug)
  const authorName = getAuthorName(post.author)
  const imageSrc = getImageSrc(post)
  const hasDate = isValidPublishedDate(post.publishedAt)
  const date = hasDate ? new Date(post.publishedAt as string) : null
  const formattedDate = date
    ? `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`
    : null

  useEffect(() => {
    const el = ref.current
    if (!el) {
      setVisible(true)
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.05 }
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
            <div className="flex items-center gap-2 mb-3 text-xs font-sans text-[#7A6355] flex-wrap">
              <Calendar size={12} className="text-[#C8912A]" />
              {formattedDate ? <span>{formattedDate}</span> : <span>Date à confirmer</span>}
              <span className="text-[#D4C4A8]">·</span>
              <span>{authorName}</span>
            </div>

            <h2 className="font-serif text-xl text-[#5C3D2E] group-hover:text-[#C8912A] leading-snug mb-3 transition-colors duration-200">
              {post.title}
            </h2>

            <p className="text-sm font-sans text-[#7A6355] leading-relaxed flex-1 line-clamp-3">
              {post.excerpt || 'Article à découvrir prochainement.'}
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
  const [heroVisible, setHeroVisible] = useState(true)

  const posts = propPosts && propPosts.length > 0 ? propPosts : []

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
                Les premiers articles pourront être publiés directement depuis le Studio Sanity.
              </p>
            </div>
          )}

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
