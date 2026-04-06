// src/app/api/member/competencies/route.ts
// Member : lire ses compétences (lecture seule — Gabriel les valide)
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null
  return { user, supabase }
}

// GET — compétences du membre connecté
export async function GET(req: NextRequest) {
  const ctx = await getUser(req)
  if (!ctx) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await ctx.supabase
    .from('member_competencies')
    .select('*, competency:competencies(*)')
    .eq('member_id', ctx.user.id)
    .order('created_at', { ascending: true })

  if (error) {
    // Table n'existe pas encore → retourner vide silencieusement
    if (error.code === '42P01') return NextResponse.json({ competencies: [] })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ competencies: data || [] })
}
