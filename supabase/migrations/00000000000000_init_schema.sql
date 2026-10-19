-- ============================================================
-- MIGRATION: Khởi tạo Schema ban đầu
-- Bệnh viện Quân y 7A - Cổng Khảo sát Chất lượng Kiosk
-- Chạy file này TRƯỚC tất cả migration khác.
-- ============================================================

BEGIN;

-- 1. Bảng danh mục Khoa/Phòng
CREATE TABLE IF NOT EXISTS public.departments (
  code       text         PRIMARY KEY,
  name       text         NOT NULL,
  is_active  boolean      NOT NULL DEFAULT true,
  updated_at timestamptz  NOT NULL DEFAULT now()
);

-- 2. Bảng phiếu Khảo sát
CREATE TABLE IF NOT EXISTS public.feedback (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  department_code  text         NOT NULL REFERENCES public.departments(code),
  patient_code     text,
  is_anonymous     boolean      NOT NULL DEFAULT false,

  -- 5 nhóm tiêu chí (1-5 điểm)
  c1_access        smallint     NOT NULL CHECK (c1_access        BETWEEN 1 AND 5),
  c2_transparency  smallint     NOT NULL CHECK (c2_transparency  BETWEEN 1 AND 5),
  c3_facilities    smallint     NOT NULL CHECK (c3_facilities    BETWEEN 1 AND 5),
  c4_attitude      smallint     NOT NULL CHECK (c4_attitude      BETWEEN 1 AND 5),
  c5_outcome       smallint     NOT NULL CHECK (c5_outcome       BETWEEN 1 AND 5),

  -- Chỉ số tổng hợp (được tính và lưu khi INSERT)
  csat_percent     smallint     CHECK (csat_percent BETWEEN 0 AND 100),
  nps_score        smallint     NOT NULL CHECK (nps_score BETWEEN 0 AND 10),
  nps_category     text         CHECK (nps_category IN ('Promoter', 'Passive', 'Detractor')),

  -- Phản hồi văn bản
  comment          text,
  urgent_feedback  text,

  -- Trạng thái xử lý
  status           text         NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'resolved')),

  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now()
);

-- Index tìm kiếm thường dùng
CREATE INDEX IF NOT EXISTS idx_feedback_department_code
  ON public.feedback (department_code);

CREATE INDEX IF NOT EXISTS idx_feedback_status
  ON public.feedback (status);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at
  ON public.feedback (created_at DESC);

-- 3. Bảng lịch sử thay đổi trạng thái
CREATE TABLE IF NOT EXISTS public.feedback_status_history (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  uuid         NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  old_status   text         NOT NULL,
  new_status   text         NOT NULL,
  changed_by   uuid,
  note         text,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status_history_feedback_id
  ON public.feedback_status_history (feedback_id);

-- 4. Seed dữ liệu 13 Khoa/Phòng Bệnh viện Quân y 7A
-- Tên phải khớp với trường "label" trong lib/hospitalData.js
INSERT INTO public.departments (code, name) VALUES
  ('KB',  'Khoa Khám Bệnh'),
  ('CC',  'Khoa Cấp Cứu'),
  ('B1',  'Khoa B1 - Chấn thương Chỉnh hình'),
  ('B2',  'Khoa B2 - Ngoại Chung'),
  ('A1',  'Khoa A1 - Nội Tim - Thận - Khớp & Lọc Máu'),
  ('A2',  'Khoa A2 - Nội Tiêu Hóa & Bệnh Máu'),
  ('A3',  'Khoa A3 - Nội Thần Kinh'),
  ('A4',  'Khoa A4 - Truyền Nhiễm & Da Liễu'),
  ('A5',  'Khoa A5 - Y Học Cổ Truyền'),
  ('AD',  'Khoa Phụ Sản An Đông'),
  ('LCK', 'Khoa Mắt - Tai Mũi Họng - Răng Hàm Mặt'),
  ('CLS', 'Khoa Chẩn Đoán Hình Ảnh & Xét Nghiệm'),
  ('KTC', 'Khu Điều Trị Kỹ Thuật Cao')
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name;

COMMIT;
