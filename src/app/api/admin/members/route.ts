// src/app/api/admin/members/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return { user, supabase }
}

// GET — liste tous les membres avec stats
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { supabase } = ctx
  const url = new URL(req.url)
  const search = url.searchParams.get('q') || ''

  // Récupérer les profils
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: profiles, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ members: [] })
  }

  // Récupérer les stats séparément — stage_logs count par membre
  const memberIds = profiles.map((p: Record<string, unknown>) => p.id as string)

  const { data: stageCounts } = await supabase
    .from('stage_logs')
    .select('member_id, stage_date')
    .in('member_id', memberIds)
    .order('stage_date', { ascending: false })

  const { data: resCounts } = await supabase
    .from('reservations')
    .select('member_id')
    .in('member_id', memberIds)

  // Agréger les comptes par membre
  const stageMap: Record<string, { count: number; lastDate: string | null }> = {}
  const resMap: Record<string, number> = {}

  for (const sl of (stageCounts || [])) {
    const id = sl.member_id as string
    if (!stageMap[id]) {
      stageMap[id] = { count: 0, lastDate: null }
    }
    stageMap[id].count += 1
    if (!stageMap[id].lastDate) {
      stageMap[id].lastDate = sl.stage_date as string
    }
  }

  for (const r of (resCounts || [])) {
    const id = r.member_id as string
    resMap[id] = (resMap[id] || 0) + 1
  }

  // Fusionner
  const members = profiles.map((p: Record<string, unknown>) => {
    const id = p.id as string
    return {
      ...p,
      stages_count: stageMap[id]?.count || 0,
      last_stage_date: stageMap[id]?.lastDate || null,
      reservations_count: resMap[id] || 0,
    }
  })

  return NextResponse.json({ members })
}
