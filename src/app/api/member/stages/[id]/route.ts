// src/app/api/member/stages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

// PATCH — mettre à jour une fiche de suivi (réflexions après stage, etc.)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const supabase = createServerClient()

  // Seuls ces champs sont modifiables par le membre
  const allowed = ['intention_before', 'reflection_after', 'key_insight', 'integration_notes', 'rating', 'would_recommend', 'status']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from('stage_logs')
    .update(updates)
    .eq('id', id)
    .eq('member_id', user.id) // sécurité : le membre ne peut modifier que SES fiches
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ stage: data })
}
