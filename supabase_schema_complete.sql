-- ═══════════════════════════════════════════════════════════════════════════
-- Les Ateliers de la Source — Schéma Supabase complet
-- À exécuter dans Supabase SQL Editor (https://supabase.com/dashboard)
-- Ordre d'exécution : tables de base → tables dépendantes → RLS → triggers
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. EXTENSION uuid-ossp (si pas déjà activée) ────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 2. TABLE profiles ───────────────────────────────────────────────────
-- Liée à auth.users par l'id
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  first_name          TEXT,
  last_name           TEXT,
  phone               TEXT,
  city                TEXT,
  bio                 TEXT,
  motivation          TEXT,
  avatar_url          TEXT,
  role                TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  newsletter_global   BOOLEAN NOT NULL DEFAULT false,
  newsletter_stages   BOOLEAN NOT NULL DEFAULT false,
  newsletter_spectacles BOOLEAN NOT NULL DEFAULT false,
  newsletter_blog     BOOLEAN NOT NULL DEFAULT false,
  newsletter_amelie   BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. TABLE stage_logs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stage_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_slug          TEXT NOT NULL DEFAULT '',
  stage_title         TEXT NOT NULL,
  stage_date          DATE NOT NULL,
  trainer             TEXT NOT NULL DEFAULT 'Gabriel',
  status              TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  intention_before    TEXT,
  reflection_after    TEXT,
  key_insight         TEXT,
  integration_notes   TEXT,
  rating              SMALLINT CHECK (rating BETWEEN 1 AND 5),
  would_recommend     BOOLEAN,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. TABLE member_notes ───────────────────────────────────────────────
-- Notes personnelles du membre (liées à un stage ou libres)
CREATE TABLE IF NOT EXISTS public.member_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_log_id    UUID REFERENCES public.stage_logs(id) ON DELETE SET NULL,
  title           TEXT NOT NULL DEFAULT '',
  content         TEXT NOT NULL,
  is_private      BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. TABLE trainer_notes (guidances) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trainer_notes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_log_id          UUID REFERENCES public.stage_logs(id) ON DELETE SET NULL,
  trainer_name          TEXT NOT NULL DEFAULT 'Gabriel',
  content               TEXT NOT NULL,
  category              TEXT NOT NULL DEFAULT 'general'
                        CHECK (category IN ('observation','encouragement','piste','recommendation','general')),
  is_visible_to_member  BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. TABLE reservations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reservations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_slug        TEXT NOT NULL,
  event_title       TEXT NOT NULL,
  event_date        DATE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','cancelled','completed')),
  payment_status    TEXT NOT NULL DEFAULT 'free'
                    CHECK (payment_status IN ('free','pending','paid','refunded')),
  amount_cents      INTEGER,
  stripe_session_id TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 7. TABLE member_global_notes ────────────────────────────────────────
-- Journal libre du membre (non lié à un stage)
CREATE TABLE IF NOT EXISTS public.member_global_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 8. TABLE competencies ───────────────────────────────────────────────
-- Référentiel de compétences défini par Gabriel
CREATE TABLE IF NOT EXISTS public.competencies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  icon        TEXT,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compétences par défaut (si table vide)
INSERT INTO public.competencies (name, description, category, icon, sort_order)
SELECT * FROM (VALUES
  ('Présence corporelle', 'Être conscient de son corps et de sa place dans l''espace', 'corps', '🌿', 1),
  ('Expression orale', 'Parler avec clarté, assurance et authenticité', 'voix', '🎙️', 2),
  ('Écoute active', 'Être pleinement présent à l''autre et à ce qui se dit', 'relation', '👂', 3),
  ('Gestion du trac', 'Transformer l''émotion en énergie créatrice', 'émotions', '🌊', 4),
  ('Confiance en soi', 'Affirmer sa présence et ses choix sans se justifier', 'intérieur', '✨', 5),
  ('Créativité', 'Accéder à l''improvisation et à l''imaginaire', 'création', '🎨', 6)
) AS v(name, description, category, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.competencies LIMIT 1);

-- ─── 9. TABLE member_competencies ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.member_competencies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competency_id   UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  level           SMALLINT NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 100),
  is_validated    BOOLEAN NOT NULL DEFAULT false,
  validated_at    TIMESTAMPTZ,
  validated_by    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member_id, competency_id)
);

-- ─── 10. TABLE questionnaire_templates ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questionnaire_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  stage_slug  TEXT,          -- optionally linked to a stage type by slug
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 11. TABLE questionnaire_questions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questionnaire_questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id     UUID NOT NULL REFERENCES public.questionnaire_templates(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  question_type   TEXT NOT NULL DEFAULT 'text'
                  CHECK (question_type IN ('text','rating','choice','yesno')),
  options         JSONB,       -- pour choice: ["Option A", "Option B", ...]
  is_required     BOOLEAN NOT NULL DEFAULT true,
  sort_order      SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 12. TABLE questionnaire_submissions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questionnaire_submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id     UUID NOT NULL REFERENCES public.questionnaire_templates(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_log_id    UUID REFERENCES public.stage_logs(id) ON DELETE SET NULL,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 13. TABLE questionnaire_answers ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questionnaire_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id   UUID NOT NULL REFERENCES public.questionnaire_submissions(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
  answer_text     TEXT,
  answer_rating   SMALLINT CHECK (answer_rating BETWEEN 1 AND 10),
  answer_choice   TEXT,
  answer_yesno    BOOLEAN,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 14. TABLE journal_entries ───────────────────────────────────────────
-- Entrées de journal de transformation (avant/après, réflexion, libre)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_log_id    UUID REFERENCES public.stage_logs(id) ON DELETE SET NULL,
  title           TEXT,
  content         TEXT NOT NULL,
  entry_type      TEXT NOT NULL DEFAULT 'free'
                  CHECK (entry_type IN ('reflection','free','before','after')),
  image_url       TEXT,
  is_private      BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 15. TABLE book_exports ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.book_exports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url    TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','error')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 16. TABLE automation_logs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_type    TEXT NOT NULL,
  member_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stage_log_id    UUID REFERENCES public.stage_logs(id) ON DELETE SET NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','error')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEX
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_stage_logs_member_id ON public.stage_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_stage_logs_stage_date ON public.stage_logs(stage_date DESC);
CREATE INDEX IF NOT EXISTS idx_member_notes_member_id ON public.member_notes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_notes_stage_log_id ON public.member_notes(stage_log_id);
CREATE INDEX IF NOT EXISTS idx_trainer_notes_member_id ON public.trainer_notes(member_id);
CREATE INDEX IF NOT EXISTS idx_trainer_notes_visible ON public.trainer_notes(member_id, is_visible_to_member);
CREATE INDEX IF NOT EXISTS idx_reservations_member_id ON public.reservations(member_id);
CREATE INDEX IF NOT EXISTS idx_member_global_notes_user_id ON public.member_global_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_member_competencies_member_id ON public.member_competencies(member_id);
CREATE INDEX IF NOT EXISTS idx_qtemplate_active ON public.questionnaire_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_qquestions_template_id ON public.questionnaire_questions(template_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_qsubmissions_member_id ON public.questionnaire_submissions(member_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_member_id ON public.journal_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_member ON public.automation_logs(member_id, trigger_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_global_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- ─── Helper: is_admin ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- ─── profiles ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Service role bypass pour le serveur Next.js
DROP POLICY IF EXISTS "profiles_service_role" ON public.profiles;
CREATE POLICY "profiles_service_role" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ─── stage_logs ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "stage_logs_select" ON public.stage_logs;
CREATE POLICY "stage_logs_select" ON public.stage_logs
  FOR SELECT USING (member_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "stage_logs_insert" ON public.stage_logs;
CREATE POLICY "stage_logs_insert" ON public.stage_logs
  FOR INSERT WITH CHECK (member_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "stage_logs_update" ON public.stage_logs;
CREATE POLICY "stage_logs_update" ON public.stage_logs
  FOR UPDATE USING (member_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "stage_logs_service_role" ON public.stage_logs;
CREATE POLICY "stage_logs_service_role" ON public.stage_logs
  FOR ALL USING (auth.role() = 'service_role');

-- ─── member_notes ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "member_notes_select" ON public.member_notes;
CREATE POLICY "member_notes_select" ON public.member_notes
  FOR SELECT USING (member_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "member_notes_insert" ON public.member_notes;
CREATE POLICY "member_notes_insert" ON public.member_notes
  FOR INSERT WITH CHECK (member_id = auth.uid());

DROP POLICY IF EXISTS "member_notes_update" ON public.member_notes;
CREATE POLICY "member_notes_update" ON public.member_notes
  FOR UPDATE USING (member_id = auth.uid());

DROP POLICY IF EXISTS "member_notes_delete" ON public.member_notes;
CREATE POLICY "member_notes_delete" ON public.member_notes
  FOR DELETE USING (member_id = auth.uid());

DROP POLICY IF EXISTS "member_notes_service_role" ON public.member_notes;
CREATE POLICY "member_notes_service_role" ON public.member_notes
  FOR ALL USING (auth.role() = 'service_role');

-- ─── trainer_notes ───────────────────────────────────────────────────────
-- Membre voit ses guidances visibles ; admin voit tout
DROP POLICY IF EXISTS "trainer_notes_select" ON public.trainer_notes;
CREATE POLICY "trainer_notes_select" ON public.trainer_notes
  FOR SELECT USING (
    (member_id = auth.uid() AND is_visible_to_member = true)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "trainer_notes_insert" ON public.trainer_notes;
CREATE POLICY "trainer_notes_insert" ON public.trainer_notes
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "trainer_notes_update" ON public.trainer_notes;
CREATE POLICY "trainer_notes_update" ON public.trainer_notes
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "trainer_notes_delete" ON public.trainer_notes;
CREATE POLICY "trainer_notes_delete" ON public.trainer_notes
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "trainer_notes_service_role" ON public.trainer_notes;
CREATE POLICY "trainer_notes_service_role" ON public.trainer_notes
  FOR ALL USING (auth.role() = 'service_role');

-- ─── reservations ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "reservations_select" ON public.reservations;
CREATE POLICY "reservations_select" ON public.reservations
  FOR SELECT USING (member_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "reservations_service_role" ON public.reservations;
CREATE POLICY "reservations_service_role" ON public.reservations
  FOR ALL USING (auth.role() = 'service_role');

-- ─── member_global_notes ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "global_notes_select" ON public.member_global_notes;
CREATE POLICY "global_notes_select" ON public.member_global_notes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "global_notes_insert" ON public.member_global_notes;
CREATE POLICY "global_notes_insert" ON public.member_global_notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "global_notes_update" ON public.member_global_notes;
CREATE POLICY "global_notes_update" ON public.member_global_notes
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "global_notes_delete" ON public.member_global_notes;
CREATE POLICY "global_notes_delete" ON public.member_global_notes
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "global_notes_service_role" ON public.member_global_notes;
CREATE POLICY "global_notes_service_role" ON public.member_global_notes
  FOR ALL USING (auth.role() = 'service_role');

-- ─── competencies ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "competencies_select" ON public.competencies;
CREATE POLICY "competencies_select" ON public.competencies
  FOR SELECT USING (true); -- visible par tous les authentifiés

DROP POLICY IF EXISTS "competencies_write" ON public.competencies;
CREATE POLICY "competencies_write" ON public.competencies
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- ─── member_competencies ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "member_competencies_select" ON public.member_competencies;
CREATE POLICY "member_competencies_select" ON public.member_competencies
  FOR SELECT USING (member_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "member_competencies_write" ON public.member_competencies;
CREATE POLICY "member_competencies_write" ON public.member_competencies
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- ─── questionnaire_templates ─────────────────────────────────────────────
DROP POLICY IF EXISTS "qtemplates_select" ON public.questionnaire_templates;
CREATE POLICY "qtemplates_select" ON public.questionnaire_templates
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "qtemplates_write" ON public.questionnaire_templates;
CREATE POLICY "qtemplates_write" ON public.questionnaire_templates
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- ─── questionnaire_questions ─────────────────────────────────────────────
DROP POLICY IF EXISTS "qquestions_select" ON public.questionnaire_questions;
CREATE POLICY "qquestions_select" ON public.questionnaire_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "qquestions_write" ON public.questionnaire_questions;
CREATE POLICY "qquestions_write" ON public.questionnaire_questions
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- ─── questionnaire_submissions ───────────────────────────────────────────
DROP POLICY IF EXISTS "qsubmissions_select" ON public.questionnaire_submissions;
CREATE POLICY "qsubmissions_select" ON public.questionnaire_submissions
  FOR SELECT USING (member_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "qsubmissions_insert" ON public.questionnaire_submissions;
CREATE POLICY "qsubmissions_insert" ON public.questionnaire_submissions
  FOR INSERT WITH CHECK (member_id = auth.uid());

DROP POLICY IF EXISTS "qsubmissions_service_role" ON public.questionnaire_submissions;
CREATE POLICY "qsubmissions_service_role" ON public.questionnaire_submissions
  FOR ALL USING (auth.role() = 'service_role');

-- ─── questionnaire_answers ───────────────────────────────────────────────
DROP POLICY IF EXISTS "qanswers_select" ON public.questionnaire_answers;
CREATE POLICY "qanswers_select" ON public.questionnaire_answers
  FOR SELECT USING (
    public.is_admin() OR auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.questionnaire_submissions s
      WHERE s.id = questionnaire_answers.submission_id AND s.member_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "qanswers_service_role" ON public.questionnaire_answers;
CREATE POLICY "qanswers_service_role" ON public.questionnaire_answers
  FOR ALL USING (auth.role() = 'service_role');

-- ─── journal_entries ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "journal_entries_select" ON public.journal_entries;
CREATE POLICY "journal_entries_select" ON public.journal_entries
  FOR SELECT USING (
    (member_id = auth.uid())
    OR (public.is_admin() AND is_private = false)
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "journal_entries_insert" ON public.journal_entries;
CREATE POLICY "journal_entries_insert" ON public.journal_entries
  FOR INSERT WITH CHECK (member_id = auth.uid());

DROP POLICY IF EXISTS "journal_entries_update" ON public.journal_entries;
CREATE POLICY "journal_entries_update" ON public.journal_entries
  FOR UPDATE USING (member_id = auth.uid());

DROP POLICY IF EXISTS "journal_entries_delete" ON public.journal_entries;
CREATE POLICY "journal_entries_delete" ON public.journal_entries
  FOR DELETE USING (member_id = auth.uid());

DROP POLICY IF EXISTS "journal_entries_service_role" ON public.journal_entries;
CREATE POLICY "journal_entries_service_role" ON public.journal_entries
  FOR ALL USING (auth.role() = 'service_role');

-- ─── book_exports ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "book_exports_select" ON public.book_exports;
CREATE POLICY "book_exports_select" ON public.book_exports
  FOR SELECT USING (member_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "book_exports_service_role" ON public.book_exports;
CREATE POLICY "book_exports_service_role" ON public.book_exports
  FOR ALL USING (auth.role() = 'service_role');

-- ─── automation_logs ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "automation_logs_service_role" ON public.automation_logs;
CREATE POLICY "automation_logs_service_role" ON public.automation_logs
  FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS & FONCTIONS D'AUTOMATISATION
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Auto updated_at ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_member_notes_updated_at ON public.member_notes;
CREATE TRIGGER trg_member_notes_updated_at
  BEFORE UPDATE ON public.member_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_trainer_notes_updated_at ON public.trainer_notes;
CREATE TRIGGER trg_trainer_notes_updated_at
  BEFORE UPDATE ON public.trainer_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_member_competencies_updated_at ON public.member_competencies;
CREATE TRIGGER trg_member_competencies_updated_at
  BEFORE UPDATE ON public.member_competencies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_journal_entries_updated_at ON public.journal_entries;
CREATE TRIGGER trg_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_member_global_notes_updated_at ON public.member_global_notes;
CREATE TRIGGER trg_member_global_notes_updated_at
  BEFORE UPDATE ON public.member_global_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_questionnaire_templates_updated_at ON public.questionnaire_templates;
CREATE TRIGGER trg_questionnaire_templates_updated_at
  BEFORE UPDATE ON public.questionnaire_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Auto-création profil à l'inscription ────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_user_profile ON auth.users;
CREATE TRIGGER trg_new_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Log automatique lors d'un ajout de stage ────────────────────────────
CREATE OR REPLACE FUNCTION public.log_stage_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.automation_logs (trigger_type, member_id, stage_log_id, payload, status)
  VALUES (
    'stage_created',
    NEW.member_id,
    NEW.id,
    jsonb_build_object(
      'stage_title', NEW.stage_title,
      'stage_date', NEW.stage_date,
      'status', NEW.status
    ),
    'success'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_stage_created ON public.stage_logs;
CREATE TRIGGER trg_log_stage_created
  AFTER INSERT ON public.stage_logs
  FOR EACH ROW EXECUTE FUNCTION public.log_stage_created();

-- ─── Log automatique lors d'une complétion de stage ─────────────────────
CREATE OR REPLACE FUNCTION public.log_stage_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.automation_logs (trigger_type, member_id, stage_log_id, payload, status)
    VALUES (
      'stage_completed',
      NEW.member_id,
      NEW.id,
      jsonb_build_object(
        'stage_title', NEW.stage_title,
        'rating', NEW.rating,
        'key_insight', NEW.key_insight
      ),
      'success'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_stage_completed ON public.stage_logs;
CREATE TRIGGER trg_log_stage_completed
  AFTER UPDATE ON public.stage_logs
  FOR EACH ROW EXECUTE FUNCTION public.log_stage_completed();

-- ─── Log automatique lors d'une guidance ajoutée ─────────────────────────
CREATE OR REPLACE FUNCTION public.log_guidance_added()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.automation_logs (trigger_type, member_id, payload, status)
  VALUES (
    'guidance_added',
    NEW.member_id,
    jsonb_build_object(
      'trainer_name', NEW.trainer_name,
      'category', NEW.category,
      'is_visible', NEW.is_visible_to_member
    ),
    'success'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_guidance_added ON public.trainer_notes;
CREATE TRIGGER trg_log_guidance_added
  AFTER INSERT ON public.trainer_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_guidance_added();

-- ═══════════════════════════════════════════════════════════════════════════
-- VUES UTILES
-- ═══════════════════════════════════════════════════════════════════════════

-- Vue membre enrichi pour l'admin
CREATE OR REPLACE VIEW public.member_stats AS
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  p.city,
  p.motivation,
  p.role,
  p.created_at,
  COUNT(DISTINCT sl.id) FILTER (WHERE sl.status = 'completed') AS stages_completed,
  COUNT(DISTINCT sl.id) AS stages_total,
  COUNT(DISTINCT tn.id) FILTER (WHERE tn.is_visible_to_member) AS guidances_visible,
  COUNT(DISTINCT mc.id) AS competencies_count,
  COUNT(DISTINCT mc.id) FILTER (WHERE mc.is_validated) AS competencies_validated,
  MAX(sl.stage_date) AS last_stage_date
FROM public.profiles p
LEFT JOIN public.stage_logs sl ON sl.member_id = p.id
LEFT JOIN public.trainer_notes tn ON tn.member_id = p.id
LEFT JOIN public.member_competencies mc ON mc.member_id = p.id
WHERE p.role = 'member'
GROUP BY p.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT
-- Pour vérifier : SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- ═══════════════════════════════════════════════════════════════════════════
