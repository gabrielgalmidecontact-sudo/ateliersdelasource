// src/app/api/admin/members/[id]/add-stage/route.ts
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

// POST — Gabriel crée une fiche de suivi pour un membre
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id: memberId } = await params
  const body = await req.json()

  if (!body.stage_title || !body.stage_date) {
    return NextResponse.json({ error: 'stage_title et stage_date requis' }, { status: 400 })
  }

  const { supabase } = ctx
  const { data, error } = await supabase
    .from('stage_logs')
    .insert({
      member_id: memberId,
      stage_slug: body.stage_slug || body.stage_title.toLowerCase().replace(/\s+/g, '-'),
      stage_title: body.stage_title,
      stage_date: body.stage_date,
      trainer: body.trainer || 'Gabriel',
      status: body.status || 'upcoming',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ stage: data }, { status: 201 })
}
