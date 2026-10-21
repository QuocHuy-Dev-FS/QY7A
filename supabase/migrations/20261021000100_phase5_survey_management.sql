-- ============================================================
-- MIGRATION: Phase 5 — Quản lý Bộ khảo sát động
-- Bệnh viện Quân y 7A - Kiosk Khảo sát Chất lượng
-- Phụ thuộc: 00000000000000_init_schema.sql,
--            20261015000100_secure_feedback_and_status_history.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Bảng bộ khảo sát
-- ============================================================
CREATE TABLE IF NOT EXISTS public.survey_forms (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  scope       text        NOT NULL DEFAULT 'hospital',
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  status      text        NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft', 'active', 'archived')),
  version     int         NOT NULL DEFAULT 1 CHECK (version >= 1),
  greeting    text        CHECK (char_length(greeting) <= 500),
  thank_you   text        CHECK (char_length(thank_you) <= 500),
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Upgrade path: nâng cấp bảng survey_forms từ schema cũ (có cột is_active)
ALTER TABLE public.survey_forms
  ADD COLUMN IF NOT EXISTS scope      text        NOT NULL DEFAULT 'hospital',
  ADD COLUMN IF NOT EXISTS status     text        NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version    int         NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS greeting   text,
  ADD COLUMN IF NOT EXISTS thank_you  text,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Thêm check constraint cho status (bỏ qua nếu đã tồn tại)
DO $$ BEGIN
  ALTER TABLE public.survey_forms
    ADD CONSTRAINT survey_forms_status_check
    CHECK (status IN ('draft', 'active', 'archived'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Migrate dữ liệu: is_active = true → status = 'active'
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'survey_forms'
      AND column_name  = 'is_active'
  ) THEN
    UPDATE public.survey_forms
      SET status = 'active'
      WHERE status = 'draft' AND is_active = true;
  END IF;
END $$;

-- Xóa unique index cũ (dựa trên cột is_active) nếu tồn tại
DROP INDEX IF EXISTS survey_forms_one_active;

-- Mỗi scope chỉ được có một bộ đang active
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
-- 3. Mở rộng bảng feedback để hỗ trợ bộ tùy chỉnh
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
-- 5. Seed bộ khảo sát mặc định (5 tiêu chí hiện tại)
-- ============================================================
DO $$
DECLARE
  v_form_id uuid := 'a0000000-7a00-0000-0000-000000000001';
BEGIN
  INSERT INTO public.survey_forms (id, scope, title, status, version, greeting, thank_you)
  VALUES (
    v_form_id,
    'hospital',
    'Bộ khảo sát chất lượng Bệnh viện Quân y 7A',
    'active',
    1,
    'Kính chào Quý người bệnh! Bệnh viện Quân y 7A trân trọng cảm ơn Quý vị đã tin tưởng điều trị tại đây. Ý kiến của Quý vị giúp chúng tôi không ngừng nâng cao chất lượng phục vụ.',
    'Cảm ơn Quý người bệnh đã dành thời gian đánh giá! Bệnh viện Quân y 7A ghi nhận mọi ý kiến để cải thiện chất lượng chăm sóc và điều trị.'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.survey_questions
    (form_id, type, title, description, required, order_index, criteria_key, weight_csat, config)
  VALUES
    (v_form_id, 'star', '1. Khả năng tiếp cận & Thời gian chờ',
     'Biển chỉ dẫn rõ ràng, nhân viên lễ tân hướng dẫn tận tình, thời gian chờ khám và xét nghiệm hợp lý.',
     true, 1, 'c1_access', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'star', '2. Minh bạch thông tin & Chi phí',
     'Bác sĩ tư vấn rõ ràng về phác đồ, công khai đơn thuốc và chi phí khám chữa bệnh minh bạch.',
     true, 2, 'c2_transparency', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'star', '3. Cơ sở vật chất & Môi trường',
     'Không gian thoáng mát, phòng vệ sinh sạch sẽ, trang thiết bị máy móc hiện đại và tiện nghi.',
     true, 3, 'c3_facilities', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'star', '4. Thái độ phục vụ & Giao tiếp',
     'Tinh thần trách nhiệm của người lính quân y: ân cần, tôn trọng, giải thích chu đáo cho người bệnh.',
     true, 4, 'c4_attitude', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'star', '5. Kết quả & Hài lòng chung',
     'Sự an tâm khi điều trị tại Bệnh viện Quân y 7A và niềm tin vào chất lượng y tế của Quân đội.',
     true, 5, 'c5_outcome', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'nps', 'Mức độ sẵn sàng giới thiệu',
     'Quý khách sẵn sàng giới thiệu Bệnh viện Quân y 7A cho người thân ở mức độ nào (0–10)?',
     true, 6, null, null, null
    ),
    (v_form_id, 'multi', 'Điểm hài lòng',
     'Chạm để chọn nhanh những điểm Quý khách hài lòng:',
     false, 7, null, null,
     '{"tags":["Bác sĩ tận tâm, chuyên môn giỏi","Điều dưỡng chu đáo, hòa nhã","Cơ sở khang trang, sạch sẽ","Chỉ dẫn đón tiếp rõ ràng","Thủ tục BHYT nhanh chóng","Phòng khám mát mẻ, tiện nghi","Giải thích đơn thuốc kỹ lưỡng","Trang thiết bị hiện đại"]}'
    ),
    (v_form_id, 'multi', 'Điểm cần cải thiện',
     'Chạm để chọn nhanh những điểm cần cải thiện:',
     false, 8, null, null,
     '{"tags":["Thời gian chờ kết quả xét nghiệm còn lâu","Cần bổ sung thêm ghế ngồi chờ tại sảnh","Khu vệ sinh cần dọn dẹp thường xuyên hơn","Bãi giữ xe cần biển chỉ dẫn rõ hơn","Cần thêm quầy hướng dẫn phát số tự động","Loa gọi tên ở khu vực đông người khó nghe","Mong muốn thêm bình nước uống miễn phí"],"urgent":true}'
    )
  ON CONFLICT DO NOTHING;
END;
$$;

-- ============================================================
-- 6. Bảo mật — REVOKE rồi GRANT tối thiểu
-- ============================================================
REVOKE ALL PRIVILEGES
  ON TABLE public.survey_forms, public.survey_questions
  FROM PUBLIC, anon, authenticated;

-- Kiosk chỉ cần đọc bộ active và câu hỏi
GRANT SELECT ON TABLE public.survey_forms    TO anon, authenticated;
GRANT SELECT ON TABLE public.survey_questions TO anon, authenticated;

-- Service role được phép ghi
GRANT ALL PRIVILEGES
  ON TABLE public.survey_forms, public.survey_questions
  TO service_role;

-- ============================================================
-- 7. Row Level Security
-- ============================================================
ALTER TABLE public.survey_forms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

-- anon/authenticated chỉ đọc được bộ active
DROP POLICY IF EXISTS survey_forms_public_read    ON public.survey_forms;
DROP POLICY IF EXISTS survey_questions_public_read ON public.survey_questions;

CREATE POLICY survey_forms_public_read
  ON public.survey_forms
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY survey_questions_public_read
  ON public.survey_questions
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_forms sf
      WHERE sf.id = form_id AND sf.status = 'active'
    )
  );

COMMIT;
