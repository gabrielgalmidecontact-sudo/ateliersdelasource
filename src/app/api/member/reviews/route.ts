import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null

  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser(token)

  return user
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, reservation_id, content_slug, content_title, is_published, created_at')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ reviews: data || [] })
}
