// src/app/api/admin/migrate/route.ts
// Migration one-shot — créer member_global_notes
// Protégée par SETUP_SECRET
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { secret } = await req.json().catch(() => ({}))
  const expected = process.env.SETUP_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServerClient()

  // Créer la table via une fonction SQL en plusieurs étapes
  // Supabase REST ne supporte pas DDL direct, on utilise une RPC custom ou on vérifie/crée via l'ORM
  // On teste l'existence de la table en tentant un SELECT
  const { error: checkError } = await supabase
    .from('member_global_notes')
    .select('id')
    .limit(1)

  if (!checkError) {
    return NextResponse.json({ success: true, message: 'Table member_global_notes déjà présente' })
  }

  // La table n'existe pas — retourner le SQL à exécuter manuellement
  const sql = `
CREATE TABLE IF NOT EXISTS member_global_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE member_global_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY mgn_own_select ON member_global_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY mgn_own_insert ON member_global_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY mgn_own_delete ON member_global_notes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS mgn_user_idx ON member_global_notes(user_id, created_at DESC);
  `.trim()

  return NextResponse.json({
    success: false,
    message: 'Table absente. Exécutez ce SQL dans Supabase Dashboard → SQL Editor :',
    sql,
  }, { status: 200 })
}
