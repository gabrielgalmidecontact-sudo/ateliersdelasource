// src/app/api/admin/groups/route.ts
// Admin : CRUD des groupes de membres
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

  const { data, error } = await ctx.supabase
    .from('member_groups')
    .select(`
      *,
      member_group_members(count)
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ groups: data || [] })
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  if (!body.name) {
    return NextResponse.json({ error: 'name requis' }, { status: 400 })
  }

  const { data, error } = await ctx.supabase
    .from('member_groups')
    .insert({
      name: body.name,
      description: body.description || null,
      is_active: body.is_active !== false,
      created_by: ctx.user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ group: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  if (!body.id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {}
  if (body.name !== undefined) updatePayload.name = body.name
  if (body.description !== undefined) updatePayload.description = body.description
  if (body.is_active !== undefined) updatePayload.is_active = body.is_active

  const { data, error } = await ctx.supabase
    .from('member_groups')
    .update(updatePayload)
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ group: data })
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  if (!body.id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 })
  }

  const { error } = await ctx.supabase
    .from('member_groups')
    .delete()
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
