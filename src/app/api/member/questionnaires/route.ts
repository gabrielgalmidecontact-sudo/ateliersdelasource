// src/app/api/member/questionnaires/route.ts
// Member : liste des questionnaires visibles pour ce membre + ses soumissions
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type AssignmentRow = {
  member_id: string | null
  group_id: string | null
}

type QuestionnaireRow = {
  id: string
  is_active: boolean
  audience_type?: 'all' | 'selected_members' | 'groups' | null
  questionnaire_assignments?: AssignmentRow[]
  questionnaire_questions?: unknown[]
}

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null
  return { user, supabase }
}

function canMemberSeeQuestionnaire(
  questionnaire: QuestionnaireRow,
  memberId: string,
  memberGroupIds: string[]
) {
  const audienceType = questionnaire.audience_type || 'all'
  const assignments = Array.isArray(questionnaire.questionnaire_assignments)
    ? questionnaire.questionnaire_assignments
    : []

  if (audienceType === 'all') return true

  if (audienceType === 'selected_members') {
    return assignments.some((a) => a.member_id === memberId)
  }

  if (audienceType === 'groups') {
    return assignments.some((a) => a.group_id && memberGroupIds.includes(a.group_id))
  }

  return false
}

// GET — questionnaires actifs + soumissions du membre
export async function GET(req: NextRequest) {
  const ctx = await getUser(req)
  if (!ctx) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const [tplRes, subRes, groupsRes] = await Promise.all([
    ctx.supabase
      .from('questionnaire_templates')
      .select(`
        *,
        questionnaire_questions(
          *,
          question_options(*)
        ),
        questionnaire_assignments(
          member_id,
          group_id
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),

    ctx.supabase
      .from('questionnaire_submissions')
      .select('*')
      .eq('member_id', ctx.user.id),

    ctx.supabase
      .from('member_group_members')
      .select('group_id')
      .eq('member_id', ctx.user.id),
  ])

  if (tplRes.error) {
    if (tplRes.error.code === '42P01') {
      return NextResponse.json({ questionnaires: [], submissions: [] })
    }
    return NextResponse.json({ error: tplRes.error.message }, { status: 400 })
  }

  if (subRes.error) {
    return NextResponse.json({ error: subRes.error.message }, { status: 400 })
  }

  const memberGroupIds = (groupsRes.data || []).map((row) => row.group_id)

  const questionnaires = ((tplRes.data || []) as QuestionnaireRow[]).filter((questionnaire) =>
    canMemberSeeQuestionnaire(questionnaire, ctx.user.id, memberGroupIds)
  )

  return NextResponse.json({
    questionnaires,
    submissions: subRes.data || [],
  })
}
