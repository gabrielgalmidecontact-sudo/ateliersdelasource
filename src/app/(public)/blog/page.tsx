import type { Metadata } from 'next'
import { BlogListPage } from '@/features/blog/BlogListPage'
import { sanityFetchArray } from '@/lib/sanity/fetch'
import { allPostsQuery } from '@/lib/sanity/queries'
import type { Post } from '@/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog & Actualités',
  description:
    'Articles, réflexions et actualités des Ateliers de la Source. Développement personnel, théâtre, biographie et vie intérieure.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  const sanityPosts = await sanityFetchArray<Post>(allPostsQuery)

  return <BlogListPage posts={sanityPosts} fromSanity={sanityPosts.length > 0} />
}
