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

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req)
  if (!ctx) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { supabase } = ctx
  const url = new URL(req.url)
  const status = url.searchParams.get('status') || 'all'

  let query = supabase
    .from('reviews')
    .select(`
      id,
      content_type,
      content_slug,
      content_title,
      member_id,
      reservation_id,
      first_name,
      email,
      rating,
      comment,
      is_published,
      is_verified_participant,
      published_at,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (status === 'pending') {
    query = query.eq('is_published', false)
  } else if (status === 'published') {
    query = query.eq('is_published', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const pendingCount = (data || []).filter((item) => !item.is_published).length

  return NextResponse.json({
    reviews: data || [],
    pendingCount,
  })
}
