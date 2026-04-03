// src/app/api/member/questionnaires/[id]/route.ts
// Member : soumettre un questionnaire
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null
  return { user, supabase }
}

// POST — soumettre les réponses à un questionnaire
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getUser(req)
  if (!ctx) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const { id: templateId } = await params
  const body = await req.json()

  // Créer la soumission
  const { data: submission, error: subErr } = await ctx.supabase
    .from('questionnaire_submissions')
    .insert({
      template_id: templateId,
      member_id: ctx.user.id,
      stage_log_id: body.stage_log_id || null,
    })
    .select()
    .single()

  if (subErr) return NextResponse.json({ error: subErr.message }, { status: 400 })

  // Créer les réponses
  if (body.answers && Array.isArray(body.answers) && body.answers.length > 0) {
    const answersToInsert = body.answers.map((a: {
      question_id: string
      answer_text?: string | null
      answer_rating?: number | null
      answer_choice?: string | null
      answer_yesno?: boolean | null
    }) => ({
      submission_id: submission.id,
      question_id: a.question_id,
      answer_text: a.answer_text || null,
      answer_rating: a.answer_rating ?? null,
      answer_choice: a.answer_choice || null,
      answer_yesno: a.answer_yesno ?? null,
    }))

    const { error: ansErr } = await ctx.supabase
      .from('questionnaire_answers')
      .insert(answersToInsert)

    if (ansErr) return NextResponse.json({ error: ansErr.message }, { status: 400 })
  }

  // Log automation
  await ctx.supabase.from('automation_logs').insert({
    trigger_type: 'questionnaire_submitted',
    member_id: ctx.user.id,
    stage_log_id: body.stage_log_id || null,
    payload: { template_id: templateId, submission_id: submission.id },
    status: 'success',
  }).then(() => null) // fire-and-forget

  return NextResponse.json({ submission }, { status: 201 })
}
