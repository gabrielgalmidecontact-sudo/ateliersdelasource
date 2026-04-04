// src/app/api/admin/questionnaires/[id]/submissions/route.ts
// Admin : voir les soumissions d'un questionnaire avec leurs réponses
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

// GET — toutes les soumissions d'un questionnaire (avec réponses et profil)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id: templateId } = await params
  const { supabase } = ctx

  // Template + questions
  const [tplRes, subsRes] = await Promise.all([
    supabase
      .from('questionnaire_templates')
      .select('*, questionnaire_questions(*)')
      .eq('id', templateId)
      .single(),
    supabase
      .from('questionnaire_submissions')
      .select(`
        *,
        member:profiles(id, first_name, last_name, email),
        questionnaire_answers(*, question:questionnaire_questions(question_text, question_type))
      `)
      .eq('template_id', templateId)
      .order('submitted_at', { ascending: false }),
  ])

  if (tplRes.error) return NextResponse.json({ error: 'Questionnaire introuvable' }, { status: 404 })

  return NextResponse.json({
    template: tplRes.data,
    submissions: subsRes.data || [],
    total: subsRes.data?.length || 0,
  })
}
