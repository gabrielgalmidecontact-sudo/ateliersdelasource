// src/app/api/admin/questionnaires/[id]/route.ts
// Admin : récupérer / modifier / supprimer un questionnaire et ses questions
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return { user, supabase }
}

// GET — questionnaire complet avec questions
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params

  const [tplRes, qRes] = await Promise.all([
    ctx.supabase.from('questionnaire_templates').select('*').eq('id', id).single(),
    ctx.supabase.from('questionnaire_questions').select('*').eq('template_id', id).order('sort_order'),
  ])

  if (tplRes.error) return NextResponse.json({ error: 'Questionnaire introuvable' }, { status: 404 })
  return NextResponse.json({ questionnaire: tplRes.data, questions: qRes.data || [] })
}

// PATCH — modifier titre / description / actif
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  const updatePayload = {
    updated_at: new Date().toISOString(),
  }

  if (body.title !== undefined) updatePayload.title = body.title
  if (body.description !== undefined) updatePayload.description = body.description
  if (body.is_active !== undefined) updatePayload.is_active = body.is_active
  if (body.audience_type !== undefined) updatePayload.audience_type = body.audience_type

  const { data, error } = await ctx.supabase
    .from('questionnaire_templates')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ questionnaire: data })
}

// DELETE — supprimer questionnaire + cascade questions
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id } = await params

  // Supprimer les questions d'abord (pas de cascade automatique dans Supabase sans FK)
  await ctx.supabase.from('questionnaire_questions').delete().eq('template_id', id)
  const { error } = await ctx.supabase.from('questionnaire_templates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
