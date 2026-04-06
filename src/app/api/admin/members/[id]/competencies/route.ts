// src/app/api/admin/members/[id]/competencies/route.ts
// Admin : gérer les compétences d'un membre
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
  return { user, supabase, trainerName: (profile?.first_name as string) || 'Gabriel' }
}

// GET — compétences d'un membre
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  const { supabase } = ctx

  const { data, error } = await supabase
    .from('member_competencies')
    .select('*, competency:competencies(*)')
    .eq('member_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ competencies: data || [] })
}

// POST — créer ou mettre à jour une compétence pour un membre
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id: memberId } = await params
  const { supabase, trainerName } = ctx
  const body = await req.json()

  if (!body.competency_id) {
    return NextResponse.json({ error: 'competency_id requis' }, { status: 400 })
  }

  // Upsert : si la compétence existe déjà pour ce membre, mettre à jour
  const { data: existing } = await supabase
    .from('member_competencies')
    .select('id')
    .eq('member_id', memberId)
    .eq('competency_id', body.competency_id)
    .single()

  let result
  if (existing) {
    const updatePayload: Record<string, unknown> = {
      level: body.level ?? 0,
      notes: body.notes ?? null,
      updated_at: new Date().toISOString(),
    }
    if (body.is_validated === true) {
      updatePayload.is_validated = true
      updatePayload.validated_at = new Date().toISOString()
      updatePayload.validated_by = trainerName
    } else if (body.is_validated === false) {
      updatePayload.is_validated = false
      updatePayload.validated_at = null
      updatePayload.validated_by = null
    }
    const { data, error } = await supabase
      .from('member_competencies')
      .update(updatePayload)
      .eq('id', existing.id)
      .select('*, competency:competencies(*)')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    result = data
  } else {
    const insertPayload: Record<string, unknown> = {
      member_id: memberId,
      competency_id: body.competency_id,
      level: body.level ?? 0,
      notes: body.notes ?? null,
      is_validated: body.is_validated === true,
    }
    if (body.is_validated === true) {
      insertPayload.validated_at = new Date().toISOString()
      insertPayload.validated_by = trainerName
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('member_competencies')
      .insert(insertPayload)
      .select('*, competency:competencies(*)')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    result = data
  }

  return NextResponse.json({ competency: result }, { status: 201 })
}

// DELETE — supprimer une compétence d'un membre
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id: memberId } = await params
  const { supabase } = ctx
  const url = new URL(req.url)
  const mcId = url.searchParams.get('mc_id')
  if (!mcId) return NextResponse.json({ error: 'mc_id requis' }, { status: 400 })

  const { error } = await supabase
    .from('member_competencies')
    .delete()
    .eq('id', mcId)
    .eq('member_id', memberId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
