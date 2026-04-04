// src/app/api/member/experiences/route.ts
// Membre : ses expériences (participations)
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function requireMember(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return { user, supabase }
}

// GET — toutes les participations du membre
export async function GET(req: NextRequest) {
  const ctx = await requireMember(req)
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { user, supabase } = ctx

  const { data, error } = await supabase
    .from('member_experiences')
    .select('*, experience:experiences(*)')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ experiences: [] })
  return NextResponse.json({ experiences: data || [] })
}

// PATCH — mettre à jour sa participation (intention, réflexion, rating)
export async function PATCH(req: NextRequest) {
  const ctx = await requireMember(req)
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { user, supabase } = ctx
  const body = await req.json()

  if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.intention_before !== undefined)  patch.intention_before = body.intention_before
  if (body.reflection_after !== undefined)  patch.reflection_after = body.reflection_after
  if (body.key_insight !== undefined)       patch.key_insight = body.key_insight
  if (body.rating !== undefined)            patch.rating = body.rating

  const { data, error } = await supabase
    .from('member_experiences')
    .update(patch)
    .eq('id', body.id)
    .eq('member_id', user.id)  // sécurité
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Automation : si complété, enrichir timeline
  if (body.key_insight) {
    try {
      await supabase.from('timeline_entries').insert({
        member_id: user.id,
        type: 'note',
        title: 'Insight noté',
        content: body.key_insight,
        source_id: body.id,
      })
    } catch { /* non bloquant */ }
  }

  return NextResponse.json({ member_experience: data })
}
