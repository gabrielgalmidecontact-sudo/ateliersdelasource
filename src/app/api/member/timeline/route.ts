// src/app/api/member/timeline/route.ts
// Membre : timeline unifiée — toutes les entrées du parcours
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireMember(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return { user, supabase }
}

export async function GET(req: NextRequest) {
  const ctx = await requireMember(req)
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { user, supabase } = ctx

  // Agrégation depuis plusieurs tables pour une timeline unifiée
  const [stagesRes, journalRes, guidancesRes, competenciesRes, submissionsRes, timelineRes] = await Promise.all([
    // Expériences (stage_logs)
    supabase
      .from('stage_logs')
      .select('id, stage_title, stage_date, status, key_insight, intention_before, trainer')
      .eq('member_id', user.id)
      .order('stage_date', { ascending: false })
      .limit(20),
    // Notes journal
    supabase
      .from('journal_entries')
      .select('id, title, content, entry_type, created_at')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    // Guidances visibles
    supabase
      .from('trainer_notes')
      .select('id, content, category, trainer_name, created_at')
      .eq('member_id', user.id)
      .eq('is_visible_to_member', true)
      .order('created_at', { ascending: false })
      .limit(10),
    // Compétences validées
    supabase
      .from('member_competencies')
      .select('id, level, is_validated, validated_at, competency:competencies(name, icon)')
      .eq('member_id', user.id)
      .eq('is_validated', true)
      .order('validated_at', { ascending: false })
      .limit(10),
    // Questionnaires soumis
    supabase
      .from('questionnaire_submissions')
      .select('id, submitted_at, template:questionnaire_templates(title)')
      .eq('member_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(10),
    // Entrées timeline dédiées (Phase 2)
    supabase
      .from('timeline_entries')
      .select('*')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  // Construire la timeline unifiée
  type TLEntry = {
    id: string
    type: string
    title: string
    content: string | null
    date: string
    meta?: Record<string, unknown>
  }
  const entries: TLEntry[] = []

  // Stages
  for (const s of stagesRes.data || []) {
    entries.push({
      id: `stage-${s.id}`,
      type: 'experience',
      title: s.stage_title,
      content: s.key_insight || s.intention_before || null,
      date: s.stage_date,
      meta: { status: s.status, trainer: s.trainer },
    })
  }

  // Journal
  for (const j of journalRes.data || []) {
    entries.push({
      id: `journal-${j.id}`,
      type: 'journal',
      title: j.title || 'Note de journal',
      content: (j.content as string)?.slice(0, 120) || null,
      date: j.created_at as string,
      meta: { entry_type: j.entry_type },
    })
  }

  // Guidances
  for (const g of guidancesRes.data || []) {
    entries.push({
      id: `guidance-${g.id}`,
      type: 'guidance',
      title: `Guidance de ${g.trainer_name}`,
      content: (g.content as string)?.slice(0, 120) || null,
      date: g.created_at as string,
      meta: { category: g.category },
    })
  }

  // Compétences validées
  for (const c of competenciesRes.data || []) {
    const comp = c.competency as { name?: string; icon?: string } | null
    entries.push({
      id: `comp-${c.id}`,
      type: 'competency',
      title: `Compétence validée : ${comp?.name || '—'}`,
      content: `Niveau ${c.level}%`,
      date: (c.validated_at as string) || new Date().toISOString(),
      meta: { level: c.level, icon: comp?.icon },
    })
  }

  // Questionnaires
  for (const q of submissionsRes.data || []) {
    const tpl = q.template as { title?: string } | null
    entries.push({
      id: `quest-${q.id}`,
      type: 'questionnaire',
      title: `Questionnaire rempli : ${tpl?.title || '—'}`,
      content: null,
      date: q.submitted_at as string,
      meta: {},
    })
  }

  // Entrées timeline dédiées (évite doublons si source_id présent)
  const existingIds = new Set(entries.map(e => e.id))
  for (const t of timelineRes.data || []) {
    const tid = `tl-${t.id}`
    if (!existingIds.has(tid)) {
      entries.push({
        id: tid,
        type: t.type as string,
        title: t.title as string,
        content: t.content as string | null,
        date: t.created_at as string,
        meta: t.metadata as Record<string, unknown> | undefined,
      })
    }
  }

  // Trier par date décroissante
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({ timeline: entries, total: entries.length })
}

// POST — créer une entrée manuelle dans la timeline
export async function POST(req: NextRequest) {
  const ctx = await requireMember(req)
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { user, supabase } = ctx
  const body = await req.json()

  const { data, error } = await supabase
    .from('timeline_entries')
    .insert({
      member_id: user.id,
      type: body.type || 'note',
      title: body.title || 'Note',
      content: body.content || null,
      metadata: body.metadata || null,
      source_id: body.source_id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ entry: data }, { status: 201 })
}
