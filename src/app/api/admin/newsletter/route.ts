import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createSanityClient } from '@sanity/client'
import { groq } from 'next-sanity'

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const newslettersQuery = groq`
  *[_type == "newsletterIssue"] | order(_updatedAt desc) {
    _id,
    _updatedAt,
    title,
    status
  }
`

export async function GET() {
  const [subscribersResult, newslettersResult] = await Promise.all([
    supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false }),
    sanity.fetch(newslettersQuery),
  ])

  const { data: subscribers, error: subscribersError } = subscribersResult

  if (subscribersError) {
    return NextResponse.json({ error: 'Erreur récupération abonnés' }, { status: 500 })
  }

  return NextResponse.json({
    subscribers: subscribers || [],
    newsletters: Array.isArray(newslettersResult) ? newslettersResult : [],
  })
}
