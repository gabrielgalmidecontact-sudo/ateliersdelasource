BEGIN;

-- =========================================================
-- 1) TABLE question_options
-- =========================================================
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id
  ON public.question_options(question_id);

-- =========================================================
-- 2) QUESTION TYPES V2
--    On ajoute une nouvelle colonne "type" sans casser l'ancien système
-- =========================================================
ALTER TABLE public.questionnaire_questions
ADD COLUMN IF NOT EXISTS type TEXT;

-- Backfill depuis l'ancien champ question_type
UPDATE public.questionnaire_questions
SET type = CASE
  WHEN question_type = 'choice' THEN 'single_choice'
  WHEN question_type = 'rating' THEN 'rating'
  WHEN question_type = 'text' THEN 'text'
  WHEN question_type = 'yesno' THEN 'single_choice'
  ELSE 'text'
END
WHERE type IS NULL;

-- Valeur par défaut
ALTER TABLE public.questionnaire_questions
ALTER COLUMN type SET DEFAULT 'text';

-- Sécuriser les valeurs futures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questionnaire_questions_type_check'
  ) THEN
    ALTER TABLE public.questionnaire_questions
    ADD CONSTRAINT questionnaire_questions_type_check
    CHECK (type IN ('text', 'single_choice', 'multiple_choice', 'rating'));
  END IF;
END $$;

-- =========================================================
-- 3) REPONSES : selected_option_ids
-- =========================================================
ALTER TABLE public.questionnaire_answers
ADD COLUMN IF NOT EXISTS selected_option_ids UUID[];

-- =========================================================
-- 4) RESULTATS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.questionnaire_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.questionnaire_submissions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT questionnaire_results_submission_unique UNIQUE (submission_id)
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_results_submission_id
  ON public.questionnaire_results(submission_id);

-- =========================================================
-- 5) RLS
-- =========================================================
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_results ENABLE ROW LEVEL SECURITY;

-- question_options
DROP POLICY IF EXISTS "qoptions_select" ON public.question_options;
CREATE POLICY "qoptions_select" ON public.question_options
  FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.questionnaire_questions qq
      JOIN public.questionnaire_templates qt ON qt.id = qq.template_id
      WHERE qq.id = question_options.question_id
        AND qt.is_active = true
    )
  );

DROP POLICY IF EXISTS "qoptions_write" ON public.question_options;
CREATE POLICY "qoptions_write" ON public.question_options
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "qoptions_service_role" ON public.question_options;
CREATE POLICY "qoptions_service_role" ON public.question_options
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- questionnaire_results
DROP POLICY IF EXISTS "qresults_select" ON public.questionnaire_results;
CREATE POLICY "qresults_select" ON public.questionnaire_results
  FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.questionnaire_submissions qs
      WHERE qs.id = questionnaire_results.submission_id
        AND qs.member_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "qresults_insert" ON public.questionnaire_results;
CREATE POLICY "qresults_insert" ON public.questionnaire_results
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.questionnaire_submissions qs
      WHERE qs.id = submission_id
        AND qs.member_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "qresults_update" ON public.questionnaire_results;
CREATE POLICY "qresults_update" ON public.questionnaire_results
  FOR UPDATE
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "qresults_service_role" ON public.questionnaire_results;
CREATE POLICY "qresults_service_role" ON public.questionnaire_results
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;
