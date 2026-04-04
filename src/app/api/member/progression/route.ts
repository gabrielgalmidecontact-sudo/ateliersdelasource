// src/app/api/member/progression/route.ts
// Membre : statistiques de progression, snapshots compétences, résumé global
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const sb = supabase as any

  // Charger toutes les données en parallèle
  const [stagesRes, competenciesRes, journalRes, submissionsRes, snapshotsRes] = await Promise.all([
    sb.from('stage_logs')
      .select('id, stage_title, stage_date, status, rating, created_at')
      .eq('member_id', user.id)
      .order('stage_date', { ascending: true }),

    sb.from('member_competencies')
      .select('id, level, is_validated, validated_at, competency:competencies(id, name, category, icon)')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false }),

    sb.from('journal_entries')
      .select('id, created_at, entry_type')
      .eq('member_id', user.id),

    sb.from('questionnaire_submissions')
      .select('id, submitted_at')
      .eq('member_id', user.id)
      .order('submitted_at', { ascending: false }),

    // Snapshots compétences pour l'historique (si la table existe)
    sb.from('member_competency_snapshots')
      .select('competency_id, value, source, created_at, competency:competencies(name)')
      .eq('member_id', user.id)
      .order('created_at', { ascending: true })
      .limit(100),
  ])

  const stages: any[] = stagesRes.data || []
  const competencies: any[] = competenciesRes.data || []
  const journal: any[] = journalRes.data || []
  const submissions: any[] = submissionsRes.data || []
  const snapshots: any[] = snapshotsRes.data || []

  // ─── Statistiques globales ──────────────────────────────────────────────────
  const completedStages  = stages.filter(s => s.status === 'completed')
  const validatedComps   = competencies.filter(c => c.is_validated)
  const journalNotes     = journal.filter(j => j.entry_type === 'note' || j.entry_type === 'journal')
  const avgRating        = completedStages.length > 0
    ? completedStages.reduce((a: number, s: any) => a + (s.rating || 0), 0) / completedStages.length
    : null

  // ─── Courbe d'évolution mensuelle (12 derniers mois) ───────────────────────
  const now = new Date()
  const monthlyEvolution = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short' })
    const monthStages = stages.filter((s: any) => {
      const sd = new Date(s.stage_date)
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth()
    })
    const monthJournal = journal.filter((j: any) => {
      const jd = new Date(j.created_at)
      return jd.getFullYear() === d.getFullYear() && jd.getMonth() === d.getMonth()
    })
    const monthSubmissions = submissions.filter((s: any) => {
      const sd = new Date(s.submitted_at)
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth()
    })

    const ratedStages = monthStages.filter((s: any) => s.rating)
    const monthRating = ratedStages.length > 0
      ? ratedStages.reduce((a: number, s: any) => a + s.rating, 0) / ratedStages.length
      : 0

    monthlyEvolution.push({
      key,
      label: monthLabel,
      stages: monthStages.length,
      completed: monthStages.filter((s: any) => s.status === 'completed').length,
      notes: monthJournal.length,
      questionnaires: monthSubmissions.length,
      avgRating: ratedStages.length > 0 ? Math.round(monthRating * 10) / 10 : null,
      // Score composite pour le graphe (0-100)
      score: Math.min(100, Math.round(
        (monthStages.length > 0 ? 40 : 0) +
        (monthJournal.length > 0 ? 20 : 0) +
        (monthSubmissions.length > 0 ? 20 : 0) +
        ((monthRating / 5) * 20)
      )),
    })
  }

  // ─── Snapshots compétences regroupés par compétence ─────────────────────────
  const competencyHistory: Record<string, Array<{ date: string; value: number; source: string }>> = {}
  for (const snap of snapshots) {
    const name = (snap.competency as { name?: string } | null)?.name || snap.competency_id
    if (!competencyHistory[name]) competencyHistory[name] = []
    competencyHistory[name].push({
      date: snap.created_at,
      value: snap.value,
      source: snap.source,
    })
  }

  // ─── Dernière activité ───────────────────────────────────────────────────────
  const allDates = [
    ...stages.map((s: any) => s.stage_date),
    ...journal.map((j: any) => j.created_at),
    ...submissions.map((s: any) => s.submitted_at),
  ].filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const lastActivity = allDates[0] || null

  return NextResponse.json({
    stats: {
      totalStages: stages.length,
      completedStages: completedStages.length,
      totalCompetencies: competencies.length,
      validatedCompetencies: validatedComps.length,
      journalNotes: journalNotes.length,
      questionnaires: submissions.length,
      avgRating,
      lastActivity,
    },
    monthlyEvolution,
    competencyHistory,
    recentCompetencies: validatedComps.slice(0, 5),
  })
}
