// src/app/api/admin/members/[id]/route.ts
// Admin : profil complet d'un membre + toutes ses données
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim()
  if (!token) {
    console.warn('[requireAdmin] Pas de token dans Authorization header')
    return null
  }
  const supabase = createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) {
    console.warn('[requireAdmin] Token invalide:', userError?.message)
    return null
  }
  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profileError) {
    console.warn('[requireAdmin] Profil introuvable pour:', user.id)
    return null
  }
  if (profile?.role !== 'admin') {
    console.warn('[requireAdmin] Rôle insuffisant:', profile?.role)
    return null
  }
  return { user, supabase }
}

// GET — profil complet d'un membre
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé — vérifiez votre session' }, { status: 403 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID membre manquant' }, { status: 400 })

  const { supabase } = ctx

  // Requêtes parallèles — tolérer les tables manquantes
  const [profileRes, stagesRes, trainerNotesRes, reservationsRes, competenciesRes, submissionsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('stage_logs').select('*, member_notes(*)').eq('member_id', id).order('stage_date', { ascending: false }),
    supabase.from('trainer_notes').select('*').eq('member_id', id).order('created_at', { ascending: false }),
    supabase.from('reservations').select('*').eq('member_id', id).order('created_at', { ascending: false }),
    supabase.from('member_competencies').select('*, competency:competencies(*)').eq('member_id', id).order('created_at', { ascending: true }),
    supabase.from('questionnaire_submissions').select('*, template:questionnaire_templates(title)').eq('member_id', id).order('submitted_at', { ascending: false }),
  ])

  if (profileRes.error) {
    console.error('[GET member] Profile error:', profileRes.error.message, 'for id:', id)
    return NextResponse.json({
      error: `Membre introuvable (id: ${id})`,
      detail: profileRes.error.message,
    }, { status: 404 })
  }

  // Tolérer les tables optionnelles non encore créées
  const tolerateTable = (res: { data: unknown[] | null; error: { code?: string; message?: string } | null }) => {
    if (!res.error) return res.data || []
    if (res.error.code === '42P01') return [] // table n'existe pas
    if (res.error.code === 'PGRST116') return [] // no rows
    console.warn('[GET member] Erreur table:', res.error.message)
    return []
  }

  return NextResponse.json({
    profile: profileRes.data,
    stages: tolerateTable(stagesRes as Parameters<typeof tolerateTable>[0]),
    trainerNotes: tolerateTable(trainerNotesRes as Parameters<typeof tolerateTable>[0]),
    reservations: tolerateTable(reservationsRes as Parameters<typeof tolerateTable>[0]),
    competencies: tolerateTable(competenciesRes as Parameters<typeof tolerateTable>[0]),
    submissions: tolerateTable(submissionsRes as Parameters<typeof tolerateTable>[0]),
  })
}
