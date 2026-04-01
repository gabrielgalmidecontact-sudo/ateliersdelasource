// src/app/api/admin/members/[id]/route.ts
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

// GET — profil complet d'un membre + toutes ses fiches + notes formateur
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params
  const { supabase } = ctx

  const [profileRes, stagesRes, trainerNotesRes, reservationsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('stage_logs').select(`*, member_notes(*)`).eq('member_id', id).order('stage_date', { ascending: false }),
    supabase.from('trainer_notes').select('*').eq('member_id', id).order('created_at', { ascending: false }),
    supabase.from('reservations').select('*').eq('member_id', id).order('created_at', { ascending: false }),
  ])

  if (profileRes.error) return NextResponse.json({ error: profileRes.error.message }, { status: 404 })

  return NextResponse.json({
    profile: profileRes.data,
    stages: stagesRes.data || [],
    trainerNotes: trainerNotesRes.data || [],
    reservations: reservationsRes.data || [],
  })
}
