// src/app/api/member/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

// GET — notes personnelles du membre
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const supabase = createServerClient()
  const url = new URL(req.url)
  const stageLogId = url.searchParams.get('stage_log_id')

  let query = supabase
    .from('member_notes')
    .select('*')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })

  if (stageLogId) query = query.eq('stage_log_id', stageLogId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ notes: data })
}

// POST — créer une note
export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  if (!body.title || !body.content) {
    return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('member_notes')
    .insert({
      member_id: user.id,
      stage_log_id: body.stage_log_id || null,
      title: body.title,
      content: body.content,
      is_private: body.is_private !== false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ note: data }, { status: 201 })
}

// PATCH — modifier une note
export async function PATCH(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('member_notes')
    .update({ title: body.title, content: body.content, is_private: body.is_private })
    .eq('id', body.id)
    .eq('member_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ note: data })
}

// DELETE — supprimer une note
export async function DELETE(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await req.json()
  const supabase = createServerClient()
  const { error } = await supabase
    .from('member_notes')
    .delete()
    .eq('id', id)
    .eq('member_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
