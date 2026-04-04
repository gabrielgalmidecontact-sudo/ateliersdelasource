// src/app/api/admin/members/[id]/add-stage/route.ts
// Admin : créer ou mettre à jour une fiche de suivi de stage
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

// POST — créer une nouvelle fiche
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id: memberId } = await params
  const body = await req.json()
  const { supabase } = ctx

  if (!body.stage_title || !body.stage_date) {
    return NextResponse.json({ error: 'stage_title et stage_date requis' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('stage_logs')
    .insert({
      member_id: memberId,
      stage_slug: body.stage_slug || body.stage_title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 80),
      stage_title: body.stage_title,
      stage_date: body.stage_date,
      trainer: body.trainer || 'Gabriel',
      status: body.status || 'upcoming',
      intention_before: body.intention_before || null,
      reflection_after: body.reflection_after || null,
      key_insight: body.key_insight || null,
      rating: body.rating || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ stage: data }, { status: 201 })
}

// PATCH — mettre à jour une fiche existante (statut, réflexion, insight, rating)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id: memberId } = await params
  const body = await req.json()
  const { supabase } = ctx

  if (!body.stage_id) {
    return NextResponse.json({ error: 'stage_id requis' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {}
  if (body.status !== undefined)          updatePayload.status = body.status
  if (body.stage_title !== undefined)     updatePayload.stage_title = body.stage_title
  if (body.stage_date !== undefined)      updatePayload.stage_date = body.stage_date
  if (body.trainer !== undefined)         updatePayload.trainer = body.trainer
  if (body.intention_before !== undefined) updatePayload.intention_before = body.intention_before
  if (body.reflection_after !== undefined) updatePayload.reflection_after = body.reflection_after
  if (body.key_insight !== undefined)     updatePayload.key_insight = body.key_insight
  if (body.integration_notes !== undefined) updatePayload.integration_notes = body.integration_notes
  if (body.rating !== undefined)          updatePayload.rating = body.rating
  if (body.would_recommend !== undefined) updatePayload.would_recommend = body.would_recommend

  const { data, error } = await supabase
    .from('stage_logs')
    .update(updatePayload)
    .eq('id', body.stage_id)
    .eq('member_id', memberId) // sécurité : ne peut modifier que les stages de ce membre
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ stage: data })
}
