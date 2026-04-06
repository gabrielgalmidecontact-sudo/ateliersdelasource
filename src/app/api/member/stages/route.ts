// src/app/api/member/stages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

// GET — liste des fiches de suivi du membre
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('stage_logs')
    .select(`
      *,
      trainer_notes (id, trainer_name, content, category, created_at),
      member_notes (id, title, content, is_private, created_at)
    `)
    .eq('member_id', user.id)
    .order('stage_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ stages: data })
}

// POST — créer une fiche de suivi
export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('stage_logs')
    .insert({
      member_id: user.id,
      stage_slug: body.stage_slug,
      stage_title: body.stage_title,
      stage_date: body.stage_date,
      trainer: body.trainer || 'Gabriel',
      status: 'upcoming',
      intention_before: body.intention_before || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ stage: data }, { status: 201 })
}
