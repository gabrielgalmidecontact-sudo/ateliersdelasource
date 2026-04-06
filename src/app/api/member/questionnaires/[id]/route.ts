// src/app/api/member/questionnaires/[id]/route.ts
// Member : soumettre un questionnaire avec scoring automatique
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type IncomingAnswer = {
  question_id: string
  answer_text?: string | null
  answer_rating?: number | null
  answer_choice?: string | null
  answer_yesno?: boolean | null
  selected_option_ids?: string[] | null
}

type QuestionRow = {
  id: string
  question_type?: string | null
  type?: string | null
}

type OptionRow = {
  id: string
  question_id: string
  is_correct: boolean
}

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null
  return { user, supabase }
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.length > 0)
    .sort()
}

function sameStringArrays(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

// POST — soumettre les réponses à un questionnaire
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getUser(req)
  if (!ctx) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id: templateId } = await params
  const body = await req.json()
  const incomingAnswers: IncomingAnswer[] = Array.isArray(body.answers) ? body.answers : []

  // 1) Créer la soumission
  const { data: submission, error: subErr } = await ctx.supabase
    .from('questionnaire_submissions')
    .insert({
      template_id: templateId,
      member_id: ctx.user.id,
      stage_log_id: body.stage_log_id || null,
    })
    .select()
    .single()

  if (subErr || !submission) {
    return NextResponse.json({ error: subErr?.message || 'Impossible de créer la soumission' }, { status: 400 })
  }

  // 2) Créer les réponses
  if (incomingAnswers.length > 0) {
    const answersToInsert = incomingAnswers.map((a) => ({
      submission_id: submission.id,
      question_id: a.question_id,
      answer_text: a.answer_text || null,
      answer_rating: a.answer_rating ?? null,
      answer_choice: a.answer_choice || null,
      answer_yesno: a.answer_yesno ?? null,
      selected_option_ids: Array.isArray(a.selected_option_ids) ? a.selected_option_ids : null,
    }))

    const { error: ansErr } = await ctx.supabase
      .from('questionnaire_answers')
      .insert(answersToInsert)

    if (ansErr) {
      return NextResponse.json({ error: ansErr.message }, { status: 400 })
    }
  }

  // 3) Récupérer questions + options pour correction automatique
  const { data: questionsData, error: questionsErr } = await ctx.supabase
    .from('questionnaire_questions')
    .select('id, question_type, type')
    .eq('template_id', templateId)
    .order('sort_order', { ascending: true })

  if (questionsErr) {
    return NextResponse.json({ error: questionsErr.message }, { status: 400 })
  }

  const questionIds = (questionsData || []).map((q) => q.id)

  let optionsData: OptionRow[] = []
  if (questionIds.length > 0) {
    const { data: optData, error: optionsErr } = await ctx.supabase
      .from('question_options')
      .select('id, question_id, is_correct')
      .in('question_id', questionIds)

    if (optionsErr) {
      return NextResponse.json({ error: optionsErr.message }, { status: 400 })
    }

    optionsData = (optData || []) as OptionRow[]
  }

  // 4) Calcul du score
  let score = 0
  let maxScore = 0

  for (const question of (questionsData || []) as QuestionRow[]) {
    const effectiveType = question.type || question.question_type || 'text'

    if (effectiveType !== 'single_choice' && effectiveType !== 'multiple_choice') {
      continue
    }

    const correctIds = normalizeStringArray(
      optionsData.filter((opt) => opt.question_id === question.id && opt.is_correct).map((opt) => opt.id)
    )

    if (correctIds.length === 0) continue

    maxScore += 1

    const userAnswer = incomingAnswers.find((a) => a.question_id === question.id)
    const selectedIds = normalizeStringArray(userAnswer?.selected_option_ids)

    if (sameStringArrays(correctIds, selectedIds)) {
      score += 1
    }
  }

  const percentage = maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(2)) : 0

  // 5) Enregistrer le résultat
  const { error: resultErr } = await ctx.supabase
    .from('questionnaire_results')
    .upsert(
      {
        submission_id: submission.id,
        score,
        max_score: maxScore,
        percentage,
      },
      { onConflict: 'submission_id' }
    )

  if (resultErr) {
    return NextResponse.json({ error: resultErr.message }, { status: 400 })
  }

  // 6) Log automation
  await ctx.supabase.from('automation_logs').insert({
    trigger_type: 'questionnaire_submitted',
    member_id: ctx.user.id,
    stage_log_id: body.stage_log_id || null,
    payload: {
      template_id: templateId,
      submission_id: submission.id,
      score,
      max_score: maxScore,
      percentage,
    },
    status: 'success',
  }).then(() => null)

  return NextResponse.json({
    submission,
    result: {
      score,
      max_score: maxScore,
      percentage,
    },
  }, { status: 201 })
}
