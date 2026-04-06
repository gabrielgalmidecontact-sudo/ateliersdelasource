// src/app/api/admin/trainer-notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role, first_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return { user, supabase, trainerName: profile.first_name || 'Gabriel' }
}

// POST — Gabriel/Amélie ajoute une note sur un membre
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  if (!body.member_id || !body.content) {
    return NextResponse.json({ error: 'member_id et content requis' }, { status: 400 })
  }

  const { supabase, trainerName } = ctx
  const { data, error } = await supabase
    .from('trainer_notes')
    .insert({
      member_id: body.member_id,
      stage_log_id: body.stage_log_id || null,
      trainer_name: trainerName,
      content: body.content,
      category: body.category || 'general',
      is_visible_to_member: body.is_visible_to_member !== false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ note: data }, { status: 201 })
}

// PATCH — modifier une note formateur
export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  const { supabase } = ctx
  const { data, error } = await supabase
    .from('trainer_notes')
    .update({ content: body.content, category: body.category, is_visible_to_member: body.is_visible_to_member })
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ note: data })
}

// DELETE — supprimer une note formateur
export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await req.json()
  const { supabase } = ctx
  const { error } = await supabase.from('trainer_notes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
