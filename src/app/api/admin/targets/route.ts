// src/app/api/admin/targets/route.ts
// Admin : récupérer les membres et groupes disponibles pour le ciblage
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

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const [membersRes, groupsRes] = await Promise.all([
    ctx.supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('role', 'member')
      .order('first_name', { ascending: true }),

    ctx.supabase
      .from('member_groups')
      .select('id, name, description, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  if (membersRes.error) {
    return NextResponse.json({ error: membersRes.error.message }, { status: 400 })
  }

  if (groupsRes.error) {
    return NextResponse.json({ error: groupsRes.error.message }, { status: 400 })
  }

  return NextResponse.json({
    members: membersRes.data || [],
    groups: groupsRes.data || [],
  })
}
