// src/app/api/admin/diagnostic/route.ts
// Diagnostic Supabase — vérifie les tables existantes et leur état
// Protégé par token admin
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

const REQUIRED_TABLES = [
  // Phase 1 — tables de base
  'profiles',
  'stage_logs',
  'member_notes',
  'trainer_notes',
  'reservations',
  'member_global_notes',
  'competencies',
  'member_competencies',
  'questionnaire_templates',
  'questionnaire_questions',
  'questionnaire_submissions',
  'questionnaire_answers',
  'journal_entries',
  'book_exports',
  'automation_logs',
  // Phase 2 — tables d'expériences et timeline
  'experiences',
  'member_experiences',
  'timeline_entries',
  'member_competency_snapshots',
]

// GET — vérifier l'état des tables
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { supabase } = ctx
  const results: Record<string, { exists: boolean; count?: number; error?: string }> = {}

  await Promise.all(
    REQUIRED_TABLES.map(async (table) => {
      try {
        const { count, error } = await (supabase as ReturnType<typeof createServerClient>)
          .from(table as 'profiles')
          .select('*', { count: 'exact', head: true })

        if (error) {
          if (error.code === '42P01') {
            results[table] = { exists: false }
          } else {
            results[table] = { exists: true, error: error.message }
          }
        } else {
          results[table] = { exists: true, count: count ?? 0 }
        }
      } catch (e) {
        results[table] = { exists: false, error: String(e) }
      }
    })
  )

  const missing = REQUIRED_TABLES.filter(t => !results[t]?.exists)
  const present = REQUIRED_TABLES.filter(t => results[t]?.exists)

  return NextResponse.json({
    status: missing.length === 0 ? 'ok' : 'incomplete',
    message: missing.length === 0
      ? 'Toutes les tables sont présentes.'
      : `${missing.length} table(s) manquante(s). Exécutez le SQL fourni dans Supabase.`,
    tables: results,
    missing,
    present,
    sqlFile: 'supabase_schema_complete.sql',
    supabaseUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/default/sql/new`,
  })
}
