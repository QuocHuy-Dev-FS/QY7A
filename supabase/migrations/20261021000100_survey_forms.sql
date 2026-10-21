-- ============================================================
-- MIGRATION: Bảng survey_forms + survey_questions (idempotent)
-- Bệnh viện Quân y 7A – Kiosk Khảo sát Chất lượng
--
-- Phụ thuộc:
--   00000000000000_init_schema.sql
--   20261015000100_secure_feedback_and_status_history.sql
--
-- Idempotent: an toàn chạy lặp lại và không xung đột với
--   20261021000100_phase5_survey_management.sql (nếu đã áp dụng).
--
-- Bảo mật: chỉ service_role truy cập (route dùng createAdminSupabaseClient).
-- Nếu cần kiosk đọc trực tiếp qua anon key, thêm RLS policy SELECT riêng.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Bảng bộ khảo sát
-- ============================================================
CREATE TABLE IF NOT EXISTS public.survey_forms (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  scope       text        NOT NULL DEFAULT 'hospital'
              CHECK (scope ~ '^[a-z0-9_-]{1,50}$'),
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  status      text        NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft', 'active', 'archived')),
  version     int         NOT NULL DEFAULT 1 CHECK (version >= 1),
  greeting    text        CHECK (char_length(greeting) <= 500),
  thank_you   text        CHECK (char_length(thank_you) <= 500),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Mỗi scope chỉ được có một bộ đang active (route dùng .maybeSingle()).
-- Tên index khớp với phase5_survey_management để IF NOT EXISTS bỏ qua nếu tồn tại.
CREATE UNIQUE INDEX IF NOT EXISTS survey_forms_one_active_per_scope
  ON public.survey_forms (scope)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_survey_forms_scope_status
  ON public.survey_forms (scope, status);

-- ============================================================
-- 2. Bảng câu hỏi
-- ============================================================
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id      uuid        NOT NULL REFERENCES public.survey_forms(id) ON DELETE CASCADE,
  type         text        NOT NULL
               CHECK (type IN ('star', 'nps', 'single', 'multi', 'text')),
  title        text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  description  text        CHECK (char_length(description) <= 1000),
  required     boolean     NOT NULL DEFAULT true,
  order_index  int         NOT NULL,
  criteria_key text,
  weight_csat  numeric     CHECK (weight_csat IS NULL OR (weight_csat >= 0 AND weight_csat <= 1)),
  config       jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_questions_form_id
  ON public.survey_questions (form_id, order_index);

-- ============================================================
-- 3. Mở rộng bảng feedback để hỗ trợ bộ tùy chỉnh (idempotent)
-- ============================================================
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS survey_form_id      uuid REFERENCES public.survey_forms(id),
  ADD COLUMN IF NOT EXISTS survey_form_version int,
  ADD COLUMN IF NOT EXISTS answers             jsonb;

-- Cho phép c1..c5 NULL khi dùng bộ tùy chỉnh
ALTER TABLE public.feedback
  ALTER COLUMN c1_access       DROP NOT NULL,
  ALTER COLUMN c2_transparency DROP NOT NULL,
  ALTER COLUMN c3_facilities   DROP NOT NULL,
  ALTER COLUMN c4_attitude     DROP NOT NULL,
  ALTER COLUMN c5_outcome      DROP NOT NULL;

-- Bảo toàn: phiếu legacy (không có form_id) phải có đủ c1..c5
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'feedback_scores_consistency'
      AND conrelid = 'public.feedback'::regclass
  ) THEN
    ALTER TABLE public.feedback
      ADD CONSTRAINT feedback_scores_consistency CHECK (
        (survey_form_id IS NULL
          AND c1_access IS NOT NULL
          AND c2_transparency IS NOT NULL
          AND c3_facilities IS NOT NULL
          AND c4_attitude IS NOT NULL
          AND c5_outcome IS NOT NULL)
        OR survey_form_id IS NOT NULL
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_feedback_survey_form_id
  ON public.feedback (survey_form_id)
  WHERE survey_form_id IS NOT NULL;

-- ============================================================
-- 4. Trigger updated_at cho survey_forms
-- ============================================================
DROP TRIGGER IF EXISTS survey_forms_set_updated_at ON public.survey_forms;
CREATE TRIGGER survey_forms_set_updated_at
  BEFORE UPDATE ON public.survey_forms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 5. Bảo mật — chỉ service_role truy cập (cùng mô hình migration 20261015000100)
-- ============================================================
ALTER TABLE public.survey_forms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES
  ON TABLE public.survey_forms, public.survey_questions
  FROM PUBLIC, anon, authenticated;

GRANT ALL PRIVILEGES
  ON TABLE public.survey_forms, public.survey_questions
  TO service_role;

-- ============================================================
-- 6. Báo PostgREST tải lại schema cache
-- ============================================================
NOTIFY pgrst, 'reload schema';

COMMIT;
