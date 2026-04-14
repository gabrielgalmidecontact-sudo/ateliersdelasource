// src/app/api/member/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendReservationPracticalEmail } from '@/lib/email/resend'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser(token)
  return user
}

// GET — liste des réservations du membre connecté
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('member_id', user.id)
    .order('event_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ reservations: data || [] })
}

// POST — créer une réservation (pour future utilisation)
export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  if (!body.event_slug || !body.event_title || !body.event_date) {
    return NextResponse.json({ error: 'event_slug, event_title et event_date requis' }, { status: 400 })
  }

  if (!body.accommodation_type) {
    return NextResponse.json({ error: 'Le type d’hébergement est requis' }, { status: 400 })
  }

  if (!body.transport_mode) {
    return NextResponse.json({ error: 'Le mode de transport est requis' }, { status: 400 })
  }

  if (!body.arrival_location) {
    return NextResponse.json({ error: 'Le lieu d’arrivée est requis' }, { status: 400 })
  }

  if (!body.arrival_time) {
    return NextResponse.json({ error: 'L’heure d’arrivée est requise' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, first_name, last_name, diet_type, food_allergies, food_intolerances, diet_notes, logistics_notes')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      member_id: user.id,
      event_slug: body.event_slug,
      event_title: body.event_title,
      event_date: body.event_date,
      status: 'pending',
      payment_status: 'free',
      notes: body.notes || null,
      diet_type: body.diet_type || profile?.diet_type || null,
      food_allergies: body.food_allergies || profile?.food_allergies || null,
      food_intolerances: body.food_intolerances || profile?.food_intolerances || null,
      diet_notes: body.diet_notes || profile?.diet_notes || null,
      logistics_notes: body.logistics_notes || profile?.logistics_notes || null,
      accommodation_type: body.accommodation_type || null,
      transport_mode: body.transport_mode || null,
      arrival_location: body.arrival_location || null,
      needs_transfer: Boolean(body.needs_transfer),
      arrival_time: body.arrival_time || null,
      departure_time: body.departure_time || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  try {
    const email = profile?.email || user.email
    if (email) {
      await sendReservationPracticalEmail({
        to: email,
        firstName: profile?.first_name || user.user_metadata?.first_name || null,
        eventTitle: body.event_title,
        eventDate: body.event_date,
      })
    }
  } catch (emailError) {
    console.error('[RESERVATION EMAIL ERROR]', emailError)
  }

  return NextResponse.json({ reservation: data }, { status: 201 })
}
