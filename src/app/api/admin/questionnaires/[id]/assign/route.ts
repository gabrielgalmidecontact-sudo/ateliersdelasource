// src/app/api/admin/questionnaires/[id]/assign/route.ts
// Admin : assigner un questionnaire à des membres ou à des groupes
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

  const { id: templateId } = await params

  const { data, error } = await ctx.supabase
    .from('questionnaire_assignments')
    .select('*')
    .eq('template_id', templateId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ assignments: data || [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id: templateId } = await params
  const body = await req.json()

  const memberIds: string[] = Array.isArray(body.member_ids) ? body.member_ids : []
  const groupIds: string[] = Array.isArray(body.group_ids) ? body.group_ids : []

  const { error: deleteError } = await ctx.supabase
    .from('questionnaire_assignments')
    .delete()
    .eq('template_id', templateId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 })
  }

  const rows = [
    ...memberIds.map((memberId) => ({
      template_id: templateId,
      member_id: memberId,
      group_id: null,
      created_by: ctx.user.id,
    })),
    ...groupIds.map((groupId) => ({
      template_id: templateId,
      member_id: null,
      group_id: groupId,
      created_by: ctx.user.id,
    })),
  ]

  if (rows.length === 0) {
    return NextResponse.json({ success: true, assignments: [] })
  }

  const { data, error } = await ctx.supabase
    .from('questionnaire_assignments')
    .insert(rows)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({
    success: true,
    assignments: data || [],
  })
}
