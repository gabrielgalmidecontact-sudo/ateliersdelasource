// src/app/api/member/pdf-export/route.ts
// Génération du "Livre de Bord" en PDF — utilise jsPDF côté serveur
// Pour l'instant : génère une version texte structurée HTML → renvoyée au client
// (le vrai PDF sera généré via Puppeteer/jsPDF lors d'une étape suivante)
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

// GET — retourne les données complètes du livre de bord pour génération PDF côté client
export async function GET(req: NextRequest) {
  const ctx = await getUser(req)
  if (!ctx) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const memberId = ctx.user.id
  const { supabase } = ctx

  const [profileRes, stagesRes, notesRes, competenciesRes, journalRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', memberId).single(),
    supabase.from('stage_logs').select('*, member_notes(*)').eq('member_id', memberId).order('stage_date', { ascending: false }),
    supabase.from('trainer_notes').select('*').eq('member_id', memberId).eq('is_visible_to_member', true).order('created_at', { ascending: false }),
    supabase.from('member_competencies').select('*, competency:competencies(*)').eq('member_id', memberId),
    supabase.from('member_global_notes').select('*').eq('user_id', memberId).order('created_at', { ascending: false }),
  ])

  if (profileRes.error) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  // Log de la demande d'export
  await supabase.from('book_exports').insert({
    member_id: memberId,
    status: 'pending',
  }).then(() => null)

  return NextResponse.json({
    profile: profileRes.data,
    stages: stagesRes.data || [],
    trainerNotes: notesRes.data || [],
    competencies: competenciesRes.data || [],
    journalNotes: journalRes.data || [],
    exportedAt: new Date().toISOString(),
  })
}
