// src/app/api/admin/experiences/[id]/route.ts
// Admin : assigner une expérience à un membre + gérer ses participations
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return { user, supabase }
}

// POST — assigner l'expérience [id] à un membre
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id: experienceId } = await params
  const { supabase } = ctx
  const body = await req.json()

  if (!body.member_id) return NextResponse.json({ error: 'member_id requis' }, { status: 400 })

  // Créer la participation
  const { data: me, error: meError } = await supabase
    .from('member_experiences')
    .insert({
      member_id: body.member_id,
      experience_id: experienceId,
      status: body.status || 'planned',
      intention_before: body.intention_before || null,
    })
    .select()
    .single()

  if (meError) return NextResponse.json({ error: meError.message }, { status: 400 })

  // Automation : créer entrée timeline
  try {
    const { data: exp } = await supabase.from('experiences').select('title, type').eq('id', experienceId).single()
    await supabase.from('timeline_entries').insert({
      member_id: body.member_id,
      type: 'experience',
      title: exp?.title || 'Nouvelle expérience',
      content: `Assigné à : ${exp?.title || 'expérience'}`,
      metadata: { experience_id: experienceId, experience_type: exp?.type, status: 'planned' },
      source_id: me.id,
    })
  } catch {
    // Non bloquant
  }

  return NextResponse.json({ member_experience: me }, { status: 201 })
}

// GET — participations à cette expérience
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id: experienceId } = await params
  const { supabase } = ctx

  const { data, error } = await supabase
    .from('member_experiences')
    .select('*, member:profiles(id, first_name, last_name, email)')
    .eq('experience_id', experienceId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ participants: [] })
  return NextResponse.json({ participants: data || [] })
}
