import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogDetailPage } from '@/features/blog/BlogDetailPage'
import { sanityFetch, sanityFetchArray } from '@/lib/sanity/fetch'
import { allPostsQuery, postBySlugQuery } from '@/lib/sanity/queries'
import { imageUrl } from '@/lib/sanity/image'
import type { Post } from '@/types'

export const revalidate = 60

type Params = { slug: string }

function getSlugValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'current' in value) {
    const current = (value as { current?: unknown }).current
    return typeof current === 'string' ? current : ''
  }
  return ''
}

function getAuthorName(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name
    return typeof name === 'string' ? name : 'Les Ateliers'
  }
  return 'Les Ateliers'
}

function portableTextToPlainText(value: unknown): string {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''

  return value
    .map((block) => {
      if (!block || typeof block !== 'object') return ''
      const children = (block as { children?: unknown }).children
      if (!Array.isArray(children)) return ''

      return children
        .map((child) => {
          if (!child || typeof child !== 'object') return ''
          const text = (child as { text?: unknown }).text
          return typeof text === 'string' ? text : ''
        })
        .join('')
    })
    .filter(Boolean)
    .join('\n\n')
}

function normalizePostForUi(post: Post) {
  const raw = post as Post & {
    content?: unknown
    author?: unknown
    coverImage?: unknown
    excerpt?: unknown
    publishedAt?: unknown
  }

  return {
    ...post,
    slug: getSlugValue(post.slug),
    author: getAuthorName(raw.author),
    excerpt:
      typeof raw.excerpt === 'string' && raw.excerpt.trim().length > 0
        ? raw.excerpt
        : '',
    publishedAt:
      typeof raw.publishedAt === 'string' && raw.publishedAt.trim().length > 0
        ? raw.publishedAt
        : '',
    content: portableTextToPlainText(raw.content),
    imageUrl:
      raw.coverImage
        ? imageUrl(raw.coverImage, 1600, 900) || '/images/placeholders/blog.jpg'
        : '/images/placeholders/blog.jpg',
  }
}

export async function generateStaticParams() {
  const posts = await sanityFetchArray<Post>(allPostsQuery)

  return posts
    .map((post) => {
      const slug = getSlugValue(post.slug)
      return slug ? { slug } : null
    })
    .filter(Boolean) as { slug: string }[]
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await sanityFetch<Post>(postBySlugQuery, { slug })

  if (!post) {
    return { title: 'Article introuvable' }
  }

  return {
    title: post.title ?? 'Article',
    description:
      typeof post.excerpt === 'string' && post.excerpt.trim().length > 0
        ? post.excerpt
        : 'Article du blog',
  }
}

export default async function PostPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params
  const post = await sanityFetch<Post>(postBySlugQuery, { slug })

  if (!post) {
    notFound()
  }

  const normalizedPost = normalizePostForUi(post)

  return <BlogDetailPage post={normalizedPost} />
}
