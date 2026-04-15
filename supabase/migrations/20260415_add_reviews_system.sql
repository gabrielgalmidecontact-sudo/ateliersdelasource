CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('event', 'activity')),
  content_slug TEXT NOT NULL,
  content_title TEXT NOT NULL,
  member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_verified_participant BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_content ON public.reviews(content_type, content_slug, is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_member_id ON public.reviews(member_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reservation_id ON public.reviews(reservation_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_published" ON public.reviews;
CREATE POLICY "reviews_select_published" ON public.reviews
  FOR SELECT USING (is_published = true OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
CREATE POLICY "reviews_insert_authenticated" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      member_id IS NULL
      OR member_id = auth.uid()
      OR public.is_admin()
      OR auth.role() = 'service_role'
    )
  );

DROP POLICY IF EXISTS "reviews_update_admin" ON public.reviews;
CREATE POLICY "reviews_update_admin" ON public.reviews
  FOR UPDATE USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "reviews_delete_admin" ON public.reviews;
CREATE POLICY "reviews_delete_admin" ON public.reviews
  FOR DELETE USING (public.is_admin() OR auth.role() = 'service_role');
