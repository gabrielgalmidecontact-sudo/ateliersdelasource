// src/app/api/admin/questionnaires/route.ts
// Admin : CRUD questionnaires templates
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

// GET — liste tous les questionnaires
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { data, error } = await ctx.supabase
    .from('questionnaire_templates')
    .select('*, questionnaire_questions(count)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ questionnaires: data || [] })
}

// POST — créer un questionnaire
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  if (!body.title) return NextResponse.json({ error: 'title requis' }, { status: 400 })

  const insertPayload = {
    title: body.title,
    description: body.description || null,
    is_active: body.is_active !== false,
    created_by: ctx.user.id,
  }

  const { data, error } = await ctx.supabase
    .from('questionnaire_templates')
    .insert(insertPayload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ questionnaire: data }, { status: 201 })
}
