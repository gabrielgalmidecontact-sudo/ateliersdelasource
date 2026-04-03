// src/app/api/admin/competencies/route.ts
// Admin : CRUD sur les compétences globales (référentiel)
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

// GET — liste toutes les compétences du référentiel
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { data, error } = await ctx.supabase
    .from('competencies')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ competencies: data || [] })
}

// POST — créer une nouvelle compétence
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  if (!body.name) return NextResponse.json({ error: 'name requis' }, { status: 400 })

  const { data, error } = await ctx.supabase
    .from('competencies')
    .insert({
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      icon: body.icon || null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ competency: data }, { status: 201 })
}

// PATCH — mettre à jour une compétence
export async function PATCH(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const { data, error } = await ctx.supabase
    .from('competencies')
    .update({
      name: body.name,
      description: body.description,
      category: body.category,
      icon: body.icon,
      sort_order: body.sort_order,
    })
    .eq('id', body.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ competency: data })
}

// DELETE — supprimer une compétence
export async function DELETE(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await req.json()
  const { error } = await ctx.supabase.from('competencies').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
