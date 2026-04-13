// src/app/api/admin/reservations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const ALLOWED_STATUS = ['pending', 'confirmed', 'cancelled', 'completed'] as const
const ALLOWED_PAYMENT_STATUS = ['free', 'pending', 'paid', 'refunded'] as const

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim()

  if (!token) return null

  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token)

  if (userError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') return null

  return { supabase, user }
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
  if (!id) {
    return NextResponse.json({ error: 'ID réservation manquant' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (typeof body.status === 'string') {
    if (!ALLOWED_STATUS.includes(body.status as (typeof ALLOWED_STATUS)[number])) {
      return NextResponse.json({ error: 'Statut réservation invalide' }, { status: 400 })
    }
    updates.status = body.status
  }

  if (typeof body.payment_status === 'string') {
    if (!ALLOWED_PAYMENT_STATUS.includes(body.payment_status as (typeof ALLOWED_PAYMENT_STATUS)[number])) {
      return NextResponse.json({ error: 'Statut paiement invalide' }, { status: 400 })
    }
    updates.payment_status = body.payment_status
  }

  if ('amount_cents' in body) {
    updates.amount_cents =
      body.amount_cents === null || body.amount_cents === ''
        ? null
        : Number.isFinite(Number(body.amount_cents))
          ? Number(body.amount_cents)
          : null
  }

  if ('notes' in body) {
    updates.notes =
      typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucune modification demandée' }, { status: 400 })
  }

  const { supabase } = ctx

  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ reservation: data })
}
