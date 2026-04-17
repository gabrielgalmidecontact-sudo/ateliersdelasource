import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createSanityClient } from '@sanity/client'
import { groq } from 'next-sanity'
import { sendEmail } from '@/lib/email/resend'
import { generateNewsletterHtml } from '@/lib/newsletter/generateNewsletterHtml'

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

const imageFields = `
  _type, asset, alt, caption, hotspot, crop
`

const newsletterByIdQuery = groq`
  *[
    _type == "newsletterIssue"
    && _id in [$id, "drafts." + $id]
  ][0]{
    _id,
    title,
    intro,
    status,
    events[]->{
      _id,
      title,
      slug,
      excerpt,
      startDate,
      coverImage { ${imageFields} }
    },
    posts[]->{
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      coverImage { ${imageFields} }
    },
    activities[]->{
      _id,
      title,
      slug,
      excerpt,
      coverImage { ${imageFields} },
      heroImage { ${imageFields} }
    }
  }
`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newsletterId = body?.newsletterId

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'newsletterId requis' },
        { status: 400 }
      )
    }

    const newsletter = await sanity.fetch(newsletterByIdQuery, { id: newsletterId })

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter introuvable' },
        { status: 404 }
      )
    }

    if (!newsletter.title) {
      return NextResponse.json(
        { error: 'La newsletter doit avoir un titre' },
        { status: 400 }
      )
    }

    if (newsletter.status === 'sent') {
      return NextResponse.json(
        { error: 'Cette newsletter est déjà marquée comme envoyée.' },
        { status: 400 }
      )
    }

    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .order('created_at', { ascending: false })

    if (subscribersError) {
      console.error('[NEWSLETTER SUBSCRIBERS ERROR]', subscribersError)
      return NextResponse.json(
        { error: 'Impossible de récupérer les abonnés' },
        { status: 500 }
      )
    }

    const emails = (subscribers || [])
      .map((row) => row.email?.trim())
      .filter(Boolean)

    if (emails.length === 0) {
      return NextResponse.json(
        { error: 'Aucun abonné newsletter trouvé' },
        { status: 400 }
      )
    }

    const html = generateNewsletterHtml({
      title: newsletter.title,
      intro: newsletter.intro,
      events: newsletter.events || [],
      posts: newsletter.posts || [],
      activities: newsletter.activities || [],
    })

    const failures: string[] = []

    for (const email of emails) {
      try {
        await sendEmail({
          to: email,
          subject: newsletter.title,
          html,
        })
      } catch (error) {
        console.error('[NEWSLETTER SEND ERROR]', email, error)
        failures.push(email)
      }
    }

    const sentCount = emails.length - failures.length
    const failedCount = failures.length

    if (sentCount > 0 && failedCount === 0) {
      try {
        const publishedId = newsletter._id.startsWith('drafts.')
          ? newsletter._id.replace(/^drafts\./, '')
          : newsletter._id

        await sanity
          .patch(publishedId)
          .set({ status: 'sent' })
          .commit()

        if (newsletter._id.startsWith('drafts.')) {
          await sanity
            .patch(newsletter._id)
            .set({ status: 'sent' })
            .commit()
        }
      } catch (patchError) {
        console.error('[NEWSLETTER STATUS PATCH ERROR]', patchError)
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      failures,
      statusUpdatedToSent: sentCount > 0 && failedCount === 0,
    })
  } catch (error) {
    console.error('[NEWSLETTER API ERROR]', error)
    return NextResponse.json(
      { error: 'Erreur lors de l’envoi de la newsletter' },
      { status: 500 }
    )
  }
}
