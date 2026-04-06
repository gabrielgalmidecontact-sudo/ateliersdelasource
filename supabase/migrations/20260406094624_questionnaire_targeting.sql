BEGIN;

-- =========================================================
-- 1) Type de ciblage sur questionnaire_templates
-- =========================================================
ALTER TABLE public.questionnaire_templates
ADD COLUMN IF NOT EXISTS audience_type TEXT NOT NULL DEFAULT 'all'
CHECK (audience_type IN ('all', 'selected_members', 'groups'));

-- =========================================================
-- 2) Groupes de membres
-- =========================================================
CREATE TABLE IF NOT EXISTS public.member_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.member_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.member_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT member_group_members_unique UNIQUE (group_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_member_groups_active
  ON public.member_groups(is_active);

CREATE INDEX IF NOT EXISTS idx_member_group_members_group
  ON public.member_group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_member_group_members_member
  ON public.member_group_members(member_id);

-- =========================================================
-- 3) Assignations de questionnaires
-- =========================================================
CREATE TABLE IF NOT EXISTS public.questionnaire_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.questionnaire_templates(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.member_groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT questionnaire_assignments_target_check
    CHECK (
      (member_id IS NOT NULL AND group_id IS NULL)
      OR
      (member_id IS NULL AND group_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_assignments_template
  ON public.questionnaire_assignments(template_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_assignments_member
  ON public.questionnaire_assignments(member_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_assignments_group
  ON public.questionnaire_assignments(group_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_questionnaire_assignments_template_member_unique
  ON public.questionnaire_assignments(template_id, member_id)
  WHERE member_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_questionnaire_assignments_template_group_unique
  ON public.questionnaire_assignments(template_id, group_id)
  WHERE group_id IS NOT NULL;

-- =========================================================
-- 4) updated_at trigger pour member_groups
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_member_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_groups_updated_at ON public.member_groups;
CREATE TRIGGER trg_member_groups_updated_at
  BEFORE UPDATE ON public.member_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_member_groups_updated_at();

-- =========================================================
-- 5) RLS
-- =========================================================
ALTER TABLE public.member_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_assignments ENABLE ROW LEVEL SECURITY;

-- member_groups
DROP POLICY IF EXISTS "member_groups_select" ON public.member_groups;
CREATE POLICY "member_groups_select" ON public.member_groups
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "member_groups_write" ON public.member_groups;
CREATE POLICY "member_groups_write" ON public.member_groups
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "member_groups_service_role" ON public.member_groups;
CREATE POLICY "member_groups_service_role" ON public.member_groups
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- member_group_members
DROP POLICY IF EXISTS "member_group_members_select" ON public.member_group_members;
CREATE POLICY "member_group_members_select" ON public.member_group_members
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "member_group_members_write" ON public.member_group_members;
CREATE POLICY "member_group_members_write" ON public.member_group_members
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "member_group_members_service_role" ON public.member_group_members;
CREATE POLICY "member_group_members_service_role" ON public.member_group_members
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- questionnaire_assignments
DROP POLICY IF EXISTS "questionnaire_assignments_select" ON public.questionnaire_assignments;
CREATE POLICY "questionnaire_assignments_select" ON public.questionnaire_assignments
  FOR SELECT
  USING (
    public.is_admin()
    OR (
      member_id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.member_group_members mgm
        WHERE mgm.group_id = questionnaire_assignments.group_id
          AND mgm.member_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "questionnaire_assignments_write" ON public.questionnaire_assignments;
CREATE POLICY "questionnaire_assignments_write" ON public.questionnaire_assignments
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "questionnaire_assignments_service_role" ON public.questionnaire_assignments;
CREATE POLICY "questionnaire_assignments_service_role" ON public.questionnaire_assignments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;
