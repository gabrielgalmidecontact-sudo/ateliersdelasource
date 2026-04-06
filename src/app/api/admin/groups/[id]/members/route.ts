// src/app/api/admin/groups/[id]/members/route.ts
// Admin : gérer les membres d'un groupe
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id: groupId } = await params

  const { data, error } = await ctx.supabase
    .from('member_group_members')
    .select(`
      id,
      group_id,
      member_id,
      created_at,
      member:profiles!member_group_members_member_id_fkey(
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ members: data || [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id: groupId } = await params
  const body = await req.json()
  const memberIds: string[] = Array.isArray(body.member_ids) ? body.member_ids : []

  if (memberIds.length === 0) {
    return NextResponse.json({ error: 'member_ids requis' }, { status: 400 })
  }

  const rows = memberIds.map((memberId) => ({
    group_id: groupId,
    member_id: memberId,
  }))

  const { data, error } = await ctx.supabase
    .from('member_group_members')
    .upsert(rows, { onConflict: 'group_id,member_id' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, rows: data || [] })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id: groupId } = await params
  const body = await req.json()

  if (!body.member_id) {
    return NextResponse.json({ error: 'member_id requis' }, { status: 400 })
  }

  const { error } = await ctx.supabase
    .from('member_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('member_id', body.member_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
