// src/app/api/member/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
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

  const supabase = createServerClient()
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
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ reservation: data }, { status: 201 })
}
