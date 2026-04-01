'use client'
// src/features/blog/BlogListPage.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const posts = [
  {
    title: 'Le Double : cette ombre qui nous suit',
    slug: 'le-double-cette-ombre-qui-nous-suit',
    excerpt: 'Qu\'est-ce que le Double Karmique ? Pourquoi certaines situations se répètent-elles dans notre vie ? Une introduction au travail que nous proposons lors de nos stages.',
    publishedAt: '2025-03-15',
    author: 'Gabriel',
    imageUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80',
  },
  {
    title: 'Et si votre vie n\'était pas un hasard ?',
    slug: 'et-si-votre-vie-n-etait-pas-un-hasard',
    excerpt: 'L\'accompagnement biographique explore les rythmes invisibles qui traversent nos vies. Une approche profonde et douce pour comprendre son chemin.',
    publishedAt: '2025-02-20',
    author: 'Gabriel',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    title: 'Le corps parle avant les mots',
    slug: 'le-corps-parle-avant-les-mots',
    excerpt: 'Découvrez comment la posture, le souffle et le geste peuvent transformer notre façon de communiquer. Les secrets d\'une expression juste et incarnée.',
    publishedAt: '2025-01-10',
    author: 'Gabriel',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
  },
]

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

function PostCard({ post, index }: { post: typeof posts[0]; index: number }) {
  const date = new Date(post.publishedAt)
  const formattedDate = `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full" aria-label={`Lire : ${post.title}`}>
        <article className="h-full flex flex-col bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="h-52 overflow-hidden bg-[#D4C4A8]">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center gap-2 mb-3 text-xs font-sans text-[#7A6355]">
              <Calendar size={12} className="text-[#C8912A]" />
              <span>{formattedDate}</span>
              <span className="text-[#D4C4A8]">·</span>
              <span>{post.author}</span>
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
    </motion.div>
  )
}

export function BlogListPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-4">Réflexions</p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#F5EDD8] mb-4">Blog &amp; Actualités</h1>
            <p className="text-base font-sans text-[#C8A888] max-w-lg mx-auto">
              Articles, témoignages et réflexions sur le développement personnel, le théâtre, la biographie et la vie intérieure.
            </p>
          </motion.div>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => <PostCard key={post.slug} post={post} index={i} />)}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-16">
              <p className="font-serif text-xl text-[#7A6355]">Aucun article pour le moment.</p>
              <p className="text-sm font-sans text-[#7A6355] mt-2">Revenez bientôt pour découvrir nos premières publications.</p>
            </div>
          )}
        </Container>
      </div>
    </>
  )
}
