// src/app/api/admin/experiences/route.ts
// Admin : CRUD des expériences (entités centrales Phase 2)
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

// GET — liste toutes les expériences
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { supabase } = ctx

  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ experiences: [] })
  return NextResponse.json({ experiences: data || [] })
}

// POST — créer une expérience
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { supabase } = ctx
  const body = await req.json()

  if (!body.title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })

  const { data, error } = await supabase
    .from('experiences')
    .insert({
      title: body.title,
      type: body.type || 'stage',
      description: body.description || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      trainer: body.trainer || 'Gabriel',
      max_participants: body.max_participants || null,
      is_active: body.is_active !== false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Automation : créer entrées timeline si assignation
  return NextResponse.json({ experience: data }, { status: 201 })
}

// PATCH — modifier une expérience
export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { supabase } = ctx
  const body = await req.json()

  if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.title !== undefined)           patch.title = body.title
  if (body.type !== undefined)            patch.type = body.type
  if (body.description !== undefined)     patch.description = body.description
  if (body.start_date !== undefined)      patch.start_date = body.start_date
  if (body.end_date !== undefined)        patch.end_date = body.end_date
  if (body.trainer !== undefined)         patch.trainer = body.trainer
  if (body.max_participants !== undefined) patch.max_participants = body.max_participants
  if (body.is_active !== undefined)       patch.is_active = body.is_active

  const { data, error } = await supabase
    .from('experiences')
    .update(patch)
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ experience: data })
}

// DELETE — supprimer une expérience
export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { supabase } = ctx
  const body = await req.json()

  if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const { error } = await supabase.from('experiences').delete().eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
