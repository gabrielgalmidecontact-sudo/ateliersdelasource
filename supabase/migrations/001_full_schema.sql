-- ============================================================
-- Les Ateliers de la Source — Migration complète Supabase
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. TABLES EXISTANTES (déjà présentes, rappel structure)
-- ──────────────────────────────────────────────────────────────

-- profiles, stage_logs, member_notes, trainer_notes, reservations, member_global_notes
-- → supposées déjà créées. Ajouter les colonnes manquantes si besoin :

ALTER TABLE IF EXISTS trainer_notes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS member_notes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ──────────────────────────────────────────────────────────────
-- 2. COMPÉTENCES — référentiel global
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competencies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,                    -- ex: 'corps', 'voix', 'relation', 'intérieur'
  icon        TEXT,                    -- emoji ou nom d'icône
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Données initiales (compétences de base des Ateliers de la Source)
INSERT INTO competencies (name, description, category, icon, sort_order) VALUES
  ('Présence corporelle',    'Capacité à habiter son corps pleinement dans l''espace', 'corps',     '🌿', 1),
  ('Expression orale',       'Confiance et clarté dans la prise de parole',            'voix',      '🎵', 2),
  ('Écoute profonde',        'Qualité de présence à l''autre et à soi',                'relation',  '👂', 3),
  ('Ancrage émotionnel',     'Capacité à accueillir et traverser ses émotions',        'intérieur', '🔥', 4),
  ('Créativité spontanée',   'Liberté dans l''expression créative improvisée',         'corps',     '✨', 5),
  ('Relation à l''espace',   'Conscience et utilisation de l''espace scénique',        'corps',     '🌀', 6)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 3. COMPÉTENCES DES MEMBRES
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS member_competencies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competency_id  UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  level          INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 100),
  is_validated   BOOLEAN NOT NULL DEFAULT FALSE,
  validated_at   TIMESTAMPTZ,
  validated_by   TEXT,                -- nom du formateur
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, competency_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_member_competencies_member ON member_competencies(member_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_competencies_updated_at ON member_competencies;
CREATE TRIGGER member_competencies_updated_at
  BEFORE UPDATE ON member_competencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE member_competencies ENABLE ROW LEVEL SECURITY;

-- Admin : tout voir et modifier
CREATE POLICY IF NOT EXISTS "admin_all_member_competencies"
  ON member_competencies
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Membre : voir uniquement les siennes
CREATE POLICY IF NOT EXISTS "member_read_own_competencies"
  ON member_competencies
  FOR SELECT
  USING (member_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- 4. QUESTIONNAIRES — templates
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS questionnaire_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  stage_log_id UUID,                  -- optionnel : lié à un type d'expérience
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS questionnaire_templates_updated_at ON questionnaire_templates;
CREATE TRIGGER questionnaire_templates_updated_at
  BEFORE UPDATE ON questionnaire_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admin_all_questionnaire_templates"
  ON questionnaire_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "member_read_active_questionnaires"
  ON questionnaire_templates FOR SELECT
  USING (is_active = TRUE);

-- ──────────────────────────────────────────────────────────────
-- 5. QUESTIONS D'UN QUESTIONNAIRE
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS questionnaire_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id    UUID NOT NULL REFERENCES questionnaire_templates(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  question_type  TEXT NOT NULL DEFAULT 'text'
                   CHECK (question_type IN ('text','rating','choice','yesno')),
  options        JSONB,               -- pour type 'choice' : ["option1","option2",...]
  is_required    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_template ON questionnaire_questions(template_id);

ALTER TABLE questionnaire_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admin_all_questionnaire_questions"
  ON questionnaire_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "member_read_questionnaire_questions"
  ON questionnaire_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questionnaire_templates qt
      WHERE qt.id = template_id AND qt.is_active = TRUE
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 6. SOUMISSIONS DE QUESTIONNAIRES
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS questionnaire_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID NOT NULL REFERENCES questionnaire_templates(id),
  member_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_log_id  UUID REFERENCES stage_logs(id),
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_member ON questionnaire_submissions(member_id);
CREATE INDEX IF NOT EXISTS idx_submissions_template ON questionnaire_submissions(template_id);

ALTER TABLE questionnaire_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admin_all_submissions"
  ON questionnaire_submissions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "member_own_submissions"
  ON questionnaire_submissions FOR ALL
  USING (member_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- 7. RÉPONSES AUX QUESTIONS
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS questionnaire_answers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  UUID NOT NULL REFERENCES questionnaire_submissions(id) ON DELETE CASCADE,
  question_id    UUID NOT NULL REFERENCES questionnaire_questions(id),
  answer_text    TEXT,
  answer_rating  INTEGER CHECK (answer_rating BETWEEN 1 AND 10),
  answer_choice  TEXT,
  answer_yesno   BOOLEAN,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_submission ON questionnaire_answers(submission_id);

ALTER TABLE questionnaire_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admin_all_answers"
  ON questionnaire_answers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "member_own_answers"
  ON questionnaire_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM questionnaire_submissions qs
      WHERE qs.id = submission_id AND qs.member_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 8. JOURNAL DE TRANSFORMATION (entrées enrichies)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS journal_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_log_id  UUID REFERENCES stage_logs(id),
  title         TEXT,
  content       TEXT NOT NULL,
  entry_type    TEXT NOT NULL DEFAULT 'free'
                  CHECK (entry_type IN ('reflection','free','before','after')),
  image_url     TEXT,
  is_private    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_member ON journal_entries(member_id);

DROP TRIGGER IF EXISTS journal_entries_updated_at ON journal_entries;
CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admin_all_journal_entries"
  ON journal_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "member_own_journal"
  ON journal_entries FOR ALL
  USING (member_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- 9. EXPORTS PDF
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS book_exports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url    TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','ready','error')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE book_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admin_all_book_exports"
  ON book_exports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "member_own_exports"
  ON book_exports FOR ALL
  USING (member_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- 10. LOGS D'AUTOMATISATION
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS automation_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type  TEXT NOT NULL,        -- 'stage_created', 'questionnaire_submitted', etc.
  member_id     UUID REFERENCES profiles(id),
  stage_log_id  UUID REFERENCES stage_logs(id),
  payload       JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','error')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_member ON automation_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_trigger ON automation_logs(trigger_type);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admin_all_automation_logs"
  ON automation_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ──────────────────────────────────────────────────────────────
-- 11. TRIGGER AUTOMATION — création stage_log
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION on_stage_log_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO automation_logs (trigger_type, member_id, stage_log_id, payload)
  VALUES (
    'stage_created',
    NEW.member_id,
    NEW.id,
    jsonb_build_object(
      'stage_title', NEW.stage_title,
      'stage_date',  NEW.stage_date,
      'status',      NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_stage_log_created ON stage_logs;
CREATE TRIGGER trigger_stage_log_created
  AFTER INSERT ON stage_logs
  FOR EACH ROW EXECUTE FUNCTION on_stage_log_created();

-- ──────────────────────────────────────────────────────────────
-- 12. TRIGGER AUTOMATION — complétion d'un stage
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION on_stage_log_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO automation_logs (trigger_type, member_id, stage_log_id, payload)
    VALUES (
      'stage_completed',
      NEW.member_id,
      NEW.id,
      jsonb_build_object(
        'stage_title',    NEW.stage_title,
        'completion_date', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_stage_log_completed ON stage_logs;
CREATE TRIGGER trigger_stage_log_completed
  AFTER UPDATE ON stage_logs
  FOR EACH ROW EXECUTE FUNCTION on_stage_log_completed();

-- ──────────────────────────────────────────────────────────────
-- 13. TRIGGER AUTOMATION — guidance ajoutée
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION on_trainer_note_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO automation_logs (trigger_type, member_id, payload)
  VALUES (
    'guidance_added',
    NEW.member_id,
    jsonb_build_object(
      'trainer',   NEW.trainer_name,
      'category',  NEW.category,
      'visible',   NEW.is_visible_to_member
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_trainer_note_created ON trainer_notes;
CREATE TRIGGER trigger_trainer_note_created
  AFTER INSERT ON trainer_notes
  FOR EACH ROW EXECUTE FUNCTION on_trainer_note_created();

-- ──────────────────────────────────────────────────────────────
-- RÉSUMÉ
-- ──────────────────────────────────────────────────────────────
-- Tables créées/mises à jour :
--   competencies, member_competencies,
--   questionnaire_templates, questionnaire_questions,
--   questionnaire_submissions, questionnaire_answers,
--   journal_entries, book_exports, automation_logs
-- Triggers : stage_created, stage_completed, guidance_added
-- RLS : admin = tout | membre = ses données
