// src/app/api/admin/questionnaires/[id]/questions/route.ts
// Admin : CRUD questions d'un questionnaire
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

// POST — ajouter une question
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { id: templateId } = await params
  const body = await req.json()

  if (!body.question_text) return NextResponse.json({ error: 'question_text requis' }, { status: 400 })

  const { data, error } = await ctx.supabase
    .from('questionnaire_questions')
    .insert({
      template_id: templateId,
      question_text: body.question_text,
      question_type: body.question_type || 'text',
      options: body.options || null,
      is_required: body.is_required !== false,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ question: data }, { status: 201 })
}

// PATCH — modifier une question
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  await params // templateId not needed for update
  const body = await req.json()

  if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const { data, error } = await ctx.supabase
    .from('questionnaire_questions')
    .update({
      question_text: body.question_text,
      question_type: body.question_type,
      options: body.options,
      is_required: body.is_required,
      sort_order: body.sort_order,
    })
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ question: data })
}

// DELETE — supprimer une question
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  await params
  const { id: questionId } = await req.json()
  if (!questionId) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const { error } = await ctx.supabase.from('questionnaire_questions').delete().eq('id', questionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
