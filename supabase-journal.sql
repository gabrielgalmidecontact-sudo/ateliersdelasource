-- ============================================================
-- Les Ateliers de la Source — Journal global membre
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

-- Table : notes libres hors stage (journal personnel)
CREATE TABLE IF NOT EXISTS member_global_notes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content       text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE member_global_notes ENABLE ROW LEVEL SECURITY;

-- Membre : lire / écrire / supprimer ses propres notes
CREATE POLICY "member_global_notes_select"
  ON member_global_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "member_global_notes_insert"
  ON member_global_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "member_global_notes_delete"
  ON member_global_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Admin : lire toutes les notes (service_role bypass RLS de toute façon)
CREATE POLICY "admin_global_notes_select"
  ON member_global_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Index performance
CREATE INDEX IF NOT EXISTS member_global_notes_user_id_idx
  ON member_global_notes(user_id, created_at DESC);

