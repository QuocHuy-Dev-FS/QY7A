-- ============================================================
-- SEED: Bộ khảo sát mặc định – Bệnh viện Quân y 7A
--
-- Chạy SAU khi đã áp dụng migration:
--   20261021000100_survey_forms.sql  (hoặc phase5_survey_management.sql)
--
-- Idempotent: sử dụng ON CONFLICT DO NOTHING, an toàn chạy lại.
--
-- Cấu trúc câu hỏi khớp với:
--   - lib/surveyFallback.js  (FALLBACK_SURVEY_FORM)
--   - lib/hospitalData.js    (CRITERIA_GROUPS)
--   - app/api/feedback/route.js  (SCORE_KEYS: c1_access..c5_outcome)
-- ============================================================

BEGIN;

DO $$
DECLARE
  v_form_id uuid := 'a0000000-7a00-0000-0000-000000000001';
BEGIN
  -- Bộ khảo sát chính
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

  -- Câu hỏi — type/criteria_key khớp chính xác với app/api/feedback/route.js (SCORE_KEYS)
  -- và lib/surveyFallback.js (FALLBACK_SURVEY_FORM.questions)
  INSERT INTO public.survey_questions
    (form_id, type, title, description, required, order_index, criteria_key, weight_csat, config)
  VALUES
    -- 5 tiêu chí đánh giá (type='star', criteria_key='c1_access'..'c5_outcome')
    (v_form_id, 'star',
     '1. Khả năng tiếp cận & Thời gian chờ',
     'Biển chỉ dẫn rõ ràng, nhân viên lễ tân hướng dẫn tận tình, thời gian chờ khám và xét nghiệm hợp lý.',
     true, 1, 'c1_access', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'star',
     '2. Minh bạch thông tin & Chi phí',
     'Bác sĩ tư vấn rõ ràng về phác đồ, công khai đơn thuốc và chi phí khám chữa bệnh minh bạch.',
     true, 2, 'c2_transparency', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'star',
     '3. Cơ sở vật chất & Môi trường',
     'Không gian thoáng mát, phòng vệ sinh sạch sẽ, trang thiết bị máy móc hiện đại và tiện nghi.',
     true, 3, 'c3_facilities', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'star',
     '4. Thái độ phục vụ & Giao tiếp',
     'Tinh thần trách nhiệm của người lính quân y: ân cần, tôn trọng, giải thích chu đáo cho người bệnh.',
     true, 4, 'c4_attitude', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    (v_form_id, 'star',
     '5. Kết quả & Hài lòng chung',
     'Sự an tâm khi điều trị tại Bệnh viện Quân y 7A và niềm tin vào chất lượng y tế của Quân đội.',
     true, 5, 'c5_outcome', 0.2,
     '{"labels":{"1":"Rất không hài lòng","2":"Chưa hài lòng","3":"Bình thường","4":"Hài lòng","5":"Rất hài lòng"}}'
    ),
    -- NPS (type='nps', criteria_key=null)
    (v_form_id, 'nps',
     'Mức độ sẵn sàng giới thiệu',
     'Quý khách sẵn sàng giới thiệu Bệnh viện Quân y 7A cho người thân ở mức độ nào (0–10)?',
     true, 6, null, null, null
    ),
    -- Positive tags (type='multi', criteria_key=null)
    (v_form_id, 'multi',
     'Điểm hài lòng',
     'Chạm để chọn nhanh những điểm Quý khách hài lòng:',
     false, 7, null, null,
     '{"tags":["Bác sĩ tận tâm, chuyên môn giỏi","Điều dưỡng chu đáo, hòa nhã","Cơ sở khang trang, sạch sẽ","Chỉ dẫn đón tiếp rõ ràng","Thủ tục BHYT nhanh chóng","Phòng khám mát mẻ, tiện nghi","Giải thích đơn thuốc kỹ lưỡng","Trang thiết bị hiện đại"]}'
    ),
    -- Improvement tags (type='multi', criteria_key=null, urgent=true)
    (v_form_id, 'multi',
     'Điểm cần cải thiện',
     'Chạm để chọn nhanh những điểm cần cải thiện:',
     false, 8, null, null,
     '{"tags":["Thời gian chờ kết quả xét nghiệm còn lâu","Cần bổ sung thêm ghế ngồi chờ tại sảnh","Khu vệ sinh cần dọn dẹp thường xuyên hơn","Bãi giữ xe cần biển chỉ dẫn rõ hơn","Cần thêm quầy hướng dẫn phát số tự động","Loa gọi tên ở khu vực đông người khó nghe","Mong muốn thêm bình nước uống miễn phí"],"urgent":true}'
    )
  ON CONFLICT DO NOTHING;
END;
$$;

COMMIT;
