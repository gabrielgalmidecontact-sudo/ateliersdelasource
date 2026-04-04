// src/app/api/admin/assign-experience/route.ts
// Admin : assigner une expérience à un membre (ou la retirer)
// Crée une entrée dans member_experiences + entrée timeline
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  const { data: profile } = await (supabase as any).from('profiles').select('role, name').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return { user, supabase: supabase as any, trainerName: (profile?.name as string) || 'Gabriel' }
}

// POST — assigner une expérience à un membre
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { supabase } = ctx
  const body = await req.json()

  const { member_id, experience_id, status = 'planned' } = body
  if (!member_id || !experience_id) {
    return NextResponse.json({ error: 'member_id et experience_id requis' }, { status: 400 })
  }

  // Vérifier si déjà assigné
  const { data: existing } = await supabase
    .from('member_experiences')
    .select('id')
    .eq('member_id', member_id)
    .eq('experience_id', experience_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Expérience déjà assignée à ce membre' }, { status: 409 })
  }

  // Récupérer les détails de l'expérience
  const { data: experience } = await supabase
    .from('experiences')
    .select('title, type, start_date')
    .eq('id', experience_id)
    .single()

  // Créer l'assignation
  const { data: assignment, error: assignError } = await supabase
    .from('member_experiences')
    .insert({ member_id, experience_id, status })
    .select()
    .single()

  if (assignError) {
    return NextResponse.json({ error: assignError.message }, { status: 400 })
  }

  // Automation non-bloquante : créer entrée timeline
  if (experience) {
    supabase.from('timeline_entries').insert({
      member_id,
      type: 'experience',
      title: `Inscription : ${experience.title}`,
      content: `Vous avez été inscrit(e) à l'expérience "${experience.title}"`,
      metadata: {
        experience_id,
        experience_type: experience.type,
        start_date: experience.start_date,
        status,
      },
    }).then(() => null).catch(() => null)
  }

  // Automation non-bloquante : créer un stage_log correspondant (compatibilité Phase 1)
  if (experience && body.create_stage_log !== false) {
    supabase.from('stage_logs').insert({
      member_id,
      stage_title: experience.title,
      stage_date: experience.start_date || new Date().toISOString().split('T')[0],
      trainer: ctx.trainerName,
      status: status === 'planned' ? 'upcoming' : status,
    }).then(() => null).catch(() => null)
  }

  return NextResponse.json({ assignment }, { status: 201 })
}

// DELETE — retirer l'assignation
export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { supabase } = ctx
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const member_id = searchParams.get('member_id')

  if (!id && !member_id) {
    return NextResponse.json({ error: 'id ou member_id requis' }, { status: 400 })
  }

  let query = supabase.from('member_experiences').delete()
  if (id) {
    query = query.eq('id', id)
  } else {
    const experience_id = searchParams.get('experience_id')
    if (!experience_id) return NextResponse.json({ error: 'experience_id requis' }, { status: 400 })
    query = query.eq('member_id', member_id!).eq('experience_id', experience_id)
  }

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

// GET — liste les expériences d'un membre (par membre_id en query)
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { supabase } = ctx
  const { searchParams } = new URL(req.url)
  const member_id = searchParams.get('member_id')

  if (!member_id) return NextResponse.json({ error: 'member_id requis' }, { status: 400 })

  const { data, error } = await supabase
    .from('member_experiences')
    .select('*, experience:experiences(*)')
    .eq('member_id', member_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ assignments: [] })
  return NextResponse.json({ assignments: data || [] })
}
