'use client'
// src/features/blog/BlogDetailPage.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, ArrowLeft } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

interface PostData {
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  author: string
  imageUrl: string
  content: string
}

export function BlogDetailPage({ post }: { post: PostData }) {
  const date = new Date(post.publishedAt)
  const formattedDate = `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[380px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D1F14]/90 via-[#2D1F14]/40 to-transparent" />
        </div>
        <div className="relative z-10 w-full pb-12 pt-24">
          <Container size="md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-sans text-white/70 hover:text-white mb-4 transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Tous les articles
              </Link>
              <h1 className="font-serif text-3xl sm:text-4xl text-white leading-tight mb-3">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 text-sm font-sans text-white/60">
                <Calendar size={13} className="text-[#E0B060]" />
                <span>{formattedDate}</span>
                <span>·</span>
                <span>Par {post.author}</span>
              </div>
            </motion.div>
          </Container>
        </div>
      </section>

      {/* Content */}
      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container size="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Lead */}
            <p className="text-lg font-sans text-[#7A6355] leading-relaxed mb-8 italic">
              {post.excerpt}
            </p>
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#D4AF50] to-transparent mb-10" />

            {/* Body */}
            <div className="prose-source space-y-0">
              {post.content.split('\n\n').map((para, i) => {
                if (para.startsWith('«') || para.startsWith('"')) {
                  return (
                    <blockquote key={i} className="border-l-4 border-[#C8912A] pl-5 my-8 italic font-serif text-lg text-[#5C3D2E]">
                      {para}
                    </blockquote>
                  )
                }
                return <p key={i} className="font-sans text-[#2D1F14] leading-relaxed mb-5">{para}</p>
              })}
            </div>

            {/* Author */}
            <div className="mt-14 pt-8 border-t border-[#D4C4A8] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white font-serif text-lg">
                G
              </div>
              <div>
                <p className="text-sm font-sans font-semibold text-[#5C3D2E]">{post.author}</p>
                <p className="text-xs font-sans text-[#7A6355]">Comédien, thérapeute, Les Ateliers de la Source</p>
              </div>
            </div>
          </motion.div>
        </Container>
      </div>
    </>
  )
}
