-- ═══════════════════════════════════════════════════════════════════════════
-- Les Ateliers de la Source — Schéma Supabase PHASE 2
-- À exécuter APRÈS supabase_schema_complete.sql (Phase 1)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. TABLE experiences ────────────────────────────────────────────────────
-- Entité centrale Phase 2 — remplace progressivement la logique "stage"
CREATE TABLE IF NOT EXISTS public.experiences (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  type              TEXT NOT NULL DEFAULT 'stage'
                    CHECK (type IN ('stage','formation','activite','exercice','validation','accompagnement','autre')),
  description       TEXT,
  start_date        DATE,
  end_date          DATE,
  trainer           TEXT DEFAULT 'Gabriel',
  max_participants  INTEGER,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. TABLE member_experiences ─────────────────────────────────────────────
-- Participation d'un membre à une expérience
CREATE TABLE IF NOT EXISTS public.member_experiences (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_id     UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('planned','ongoing','completed','cancelled')),
  intention_before  TEXT,
  reflection_after  TEXT,
  key_insight       TEXT,
  rating            SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, experience_id)
);

-- ─── 3. TABLE timeline_entries ───────────────────────────────────────────────
-- Timeline unifiée du membre — agrège tous les événements
CREATE TABLE IF NOT EXISTS public.timeline_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'note'
              CHECK (type IN ('experience','note','questionnaire','competency','guidance','journal')),
  title       TEXT NOT NULL,
  content     TEXT,
  metadata    JSONB DEFAULT '{}',
  source_id   UUID,        -- id de l'entité source (member_experience, stage_log, etc.)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. TABLE competency_snapshots ───────────────────────────────────────────
-- Historique de progression des compétences
CREATE TABLE IF NOT EXISTS public.competency_snapshots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competency_id   UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  value           SMALLINT NOT NULL CHECK (value BETWEEN 0 AND 100),
  source          TEXT NOT NULL DEFAULT 'admin'
                  CHECK (source IN ('admin','questionnaire','auto')),
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. COLONNES ADDITIONNELLES sur tables existantes ─────────────────────────

-- questionnaire_templates : lier à une expérience + type de déclenchement
ALTER TABLE public.questionnaire_templates
  ADD COLUMN IF NOT EXISTS experience_id UUID REFERENCES public.experiences(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS trigger_type  TEXT CHECK (trigger_type IN ('before','after','reflection','exercise'));

-- questionnaire_submissions : lier à une member_experience
ALTER TABLE public.questionnaire_submissions
  ADD COLUMN IF NOT EXISTS member_experience_id UUID REFERENCES public.member_experiences(id) ON DELETE SET NULL;

-- journal_entries : lier à une member_experience
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS member_experience_id UUID REFERENCES public.member_experiences(id) ON DELETE SET NULL;

-- automation_logs : lier à une member_experience
ALTER TABLE public.automation_logs
  ADD COLUMN IF NOT EXISTS member_experience_id UUID REFERENCES public.member_experiences(id) ON DELETE SET NULL;

-- ─── 6. INDEX PERFORMANCE ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_member_experiences_member   ON public.member_experiences(member_id);
CREATE INDEX IF NOT EXISTS idx_member_experiences_exp      ON public.member_experiences(experience_id);
CREATE INDEX IF NOT EXISTS idx_timeline_entries_member     ON public.timeline_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_timeline_entries_created    ON public.timeline_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_competency_snapshots_member ON public.competency_snapshots(member_id);
CREATE INDEX IF NOT EXISTS idx_competency_snapshots_comp   ON public.competency_snapshots(competency_id);

-- ─── 7. RLS (Row Level Security) ─────────────────────────────────────────────
ALTER TABLE public.experiences          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_experiences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_snapshots ENABLE ROW LEVEL SECURITY;

-- Experiences : lisibles par tous les authentifiés, modifiables par admin seulement
CREATE POLICY IF NOT EXISTS "experiences_select_all"
  ON public.experiences FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "experiences_insert_admin"
  ON public.experiences FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "experiences_update_admin"
  ON public.experiences FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "experiences_delete_admin"
  ON public.experiences FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Member experiences : le membre voit les siennes, l'admin voit tout
CREATE POLICY IF NOT EXISTS "member_exp_select"
  ON public.member_experiences FOR SELECT TO authenticated
  USING (
    member_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "member_exp_insert_admin"
  ON public.member_experiences FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "member_exp_update"
  ON public.member_experiences FOR UPDATE TO authenticated
  USING (
    member_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Timeline entries : le membre voit les siennes, l'admin voit tout
CREATE POLICY IF NOT EXISTS "timeline_select"
  ON public.timeline_entries FOR SELECT TO authenticated
  USING (
    member_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "timeline_insert"
  ON public.timeline_entries FOR INSERT TO authenticated
  WITH CHECK (
    member_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Competency snapshots : le membre voit les siens, l'admin voit tout
CREATE POLICY IF NOT EXISTS "comp_snapshots_select"
  ON public.competency_snapshots FOR SELECT TO authenticated
  USING (
    member_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "comp_snapshots_insert"
  ON public.competency_snapshots FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 8. TRIGGER updated_at ───────────────────────────────────────────────────
-- Fonction (si pas déjà existante)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER member_experiences_updated_at
  BEFORE UPDATE ON public.member_experiences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── FIN ─────────────────────────────────────────────────────────────────────
-- Vérification : SELECT table_name FROM information_schema.tables WHERE table_schema='public';
