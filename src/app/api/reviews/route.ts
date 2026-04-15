import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type ReviewContentType = 'event' | 'activity'

function isValidContentType(value: unknown): value is ReviewContentType {
  return value === 'event' || value === 'activity'
}

function cleanString(value: unknown, max = 1000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function parseLimit(value: string | null, fallback = 3, max = 12) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, max)
}

async function getOptionalUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null

  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser(token)

  return user
}

// GET /api/reviews?contentType=event&contentSlug=mon-slug&limit=6
// GET /api/reviews?featured=true&limit=3
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get('featured') === 'true'
    const contentType = searchParams.get('contentType')
    const contentSlug = searchParams.get('contentSlug')
    const limit = parseLimit(searchParams.get('limit'), featured ? 3 : 6)

    const supabase = createServerClient()

    let query = supabase
      .from('reviews')
      .select('id, content_type, content_slug, content_title, first_name, rating, comment, is_verified_participant, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (featured) {
      query = query.eq('content_type', 'event')
    } else {
      if (!isValidContentType(contentType) || !contentSlug?.trim()) {
        return NextResponse.json(
          { error: 'Paramètres requis : contentType (event/activity) et contentSlug' },
          { status: 400 }
        )
      }

      query = query
        .eq('content_type', contentType)
        .eq('content_slug', contentSlug.trim())
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reviews: data || [] })
  } catch (error) {
    console.error('[REVIEWS GET ERROR]', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des avis.' }, { status: 500 })
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const contentType = body?.contentType
    const contentSlug = cleanString(body?.contentSlug, 200)
    const contentTitle = cleanString(body?.contentTitle, 200)
    const firstName = cleanString(body?.firstName, 120)
    const email = cleanString(body?.email, 200).toLowerCase()
    const comment = cleanString(body?.comment, 3000)
    const rating = Number(body?.rating)

    if (!isValidContentType(contentType)) {
      return NextResponse.json({ error: 'contentType invalide.' }, { status: 400 })
    }

    if (!contentSlug || !contentTitle) {
      return NextResponse.json({ error: 'contentSlug et contentTitle sont requis.' }, { status: 400 })
    }

    if (!firstName) {
      return NextResponse.json({ error: 'Le prénom est requis.' }, { status: 400 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Un email valide est requis.' }, { status: 400 })
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La note doit être comprise entre 1 et 5.' }, { status: 400 })
    }

    if (!comment || comment.length < 10) {
      return NextResponse.json(
        { error: 'Le commentaire doit contenir au moins 10 caractères.' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const user = await getOptionalUser(req)

    let memberId: string | null = null
    let reservationId: string | null = null
    let isVerifiedParticipant = false

    if (user?.id) {
      memberId = user.id
    }

    if (contentType === 'event') {
      const { data: reservation } = await supabase
        .from('reservations')
        .select('id, member_id, event_slug, status')
        .eq('event_slug', contentSlug)
        .eq('status', 'completed')
        .eq('member_id', memberId || '00000000-0000-0000-0000-000000000000')
        .maybeSingle()

      if (reservation?.id) {
        reservationId = reservation.id
        memberId = reservation.member_id
        isVerifiedParticipant = true
      }

      if (!reservation?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .maybeSingle()

        if (profile?.id) {
          memberId = profile.id

          const { data: reservationByEmail } = await supabase
            .from('reservations')
            .select('id, member_id, event_slug, status')
            .eq('event_slug', contentSlug)
            .eq('member_id', profile.id)
            .eq('status', 'completed')
            .maybeSingle()

          if (reservationByEmail?.id) {
            reservationId = reservationByEmail.id
            isVerifiedParticipant = true
          }
        }
      }
    }

    const payload = {
      content_type: contentType,
      content_slug: contentSlug,
      content_title: contentTitle,
      member_id: memberId,
      reservation_id: reservationId,
      first_name: firstName,
      email,
      rating,
      comment,
      is_published: false,
      is_verified_participant: isVerifiedParticipant,
      published_at: null,
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(payload)
      .select('id, is_published, is_verified_participant, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        review: data,
        message: 'Merci. Votre avis a bien été enregistré et sera publié après validation.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REVIEWS POST ERROR]', error)
    return NextResponse.json({ error: 'Erreur lors de l’envoi de l’avis.' }, { status: 500 })
  }
}
