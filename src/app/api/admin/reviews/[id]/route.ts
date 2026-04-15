import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null

  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser(token)

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null
  return { user, supabase }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAdmin(req)
  if (!ctx) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)

  if (!body || typeof body.is_published !== 'boolean') {
    return NextResponse.json({ error: 'Champ is_published requis' }, { status: 400 })
  }

  const { supabase } = ctx

  const { data, error } = await supabase
    .from('reviews')
    .update({
      is_published: body.is_published,
      published_at: body.is_published ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ review: data })
}
