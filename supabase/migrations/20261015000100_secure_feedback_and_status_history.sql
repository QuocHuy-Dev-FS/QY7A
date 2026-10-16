BEGIN;

-- 1. Thu hồi quyền truy cập trực tiếp không cần thiết.
REVOKE ALL PRIVILEGES
ON TABLE public.departments,
          public.feedback,
          public.feedback_status_history
FROM PUBLIC, anon, authenticated;

-- Khoa/phòng vẫn được đọc bởi người dùng công khai và đã đăng nhập.
GRANT SELECT ON TABLE public.departments TO anon, authenticated;

-- Server sử dụng service role sau khi xác thực và kiểm tra quyền.
GRANT ALL PRIVILEGES
ON TABLE public.departments,
          public.feedback,
          public.feedback_status_history
TO service_role;

-- 2. Hàm cập nhật updated_at.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS departments_set_updated_at
ON public.departments;

CREATE TRIGGER departments_set_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS feedback_set_updated_at
ON public.feedback;

CREATE TRIGGER feedback_set_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 3. Cập nhật trạng thái và ghi lịch sử nguyên tử.
CREATE OR REPLACE FUNCTION public.update_feedback_status_with_history(
  p_feedback_id uuid,
  p_new_status text,
  p_changed_by uuid,
  p_note text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  status text,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_old_status text;
  v_note text;
BEGIN
  IF p_feedback_id IS NULL THEN
    RAISE EXCEPTION 'feedback_id is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_changed_by IS NULL THEN
    RAISE EXCEPTION 'changed_by is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_new_status IS NULL
     OR p_new_status NOT IN ('pending', 'resolved') THEN
    RAISE EXCEPTION 'Invalid feedback status'
      USING ERRCODE = '22023';
  END IF;

  IF p_note IS NOT NULL AND char_length(p_note) > 2000 THEN
    RAISE EXCEPTION 'Note exceeds maximum length'
      USING ERRCODE = '22023';
  END IF;

  v_note := NULLIF(btrim(p_note), '');

  SELECT f.status
  INTO v_old_status
  FROM public.feedback AS f
  WHERE f.id = p_feedback_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Feedback not found'
      USING ERRCODE = 'P0002';
  END IF;

  -- Không ghi lịch sử nếu trạng thái không thay đổi.
  IF v_old_status = p_new_status THEN
    RETURN QUERY
      SELECT f.id, f.status, f.updated_at
      FROM public.feedback AS f
      WHERE f.id = p_feedback_id;

    RETURN;
  END IF;

  UPDATE public.feedback AS f
  SET
    status = p_new_status,
    updated_at = now()
  WHERE f.id = p_feedback_id;

  INSERT INTO public.feedback_status_history (
    feedback_id,
    old_status,
    new_status,
    changed_by,
    note
  )
  VALUES (
    p_feedback_id,
    v_old_status,
    p_new_status,
    p_changed_by,
    v_note
  );

  RETURN QUERY
    SELECT f.id, f.status, f.updated_at
    FROM public.feedback AS f
    WHERE f.id = p_feedback_id;
END;
$function$;

-- Chỉ service_role được gọi hàm cập nhật trạng thái.
REVOKE ALL PRIVILEGES
ON FUNCTION public.update_feedback_status_with_history(
  uuid, text, uuid, text
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.update_feedback_status_with_history(
  uuid, text, uuid, text
)
TO service_role;

COMMIT;