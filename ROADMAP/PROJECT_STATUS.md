# PROJECT STATUS — Bệnh viện Quân y 7A · Kiosk Khảo sát Chất lượng

Cập nhật lần cuối: **2026-10-21**

---

## Changelog

### 2026-10-21

- **TSK-SF-01** — Tạo file migration idempotent `supabase/migrations/20261021000100_survey_forms.sql`
  (tạo bảng `survey_forms`, `survey_questions`, mở rộng `feedback`, bảo mật service_role).
- **TSK-SF-02** — Tạo file seed riêng `supabase/seed_survey_forms.sql` (8 câu hỏi: 5 tiêu chí star, NPS, 2 multi-tags).
- **TSK-DEP-01** — Sửa `resolveDepartment` trong `app/api/feedback/route.js`:
  thêm bước (d) ánh xạ tĩnh hospitalData.js `code`→`value` để khớp DB dùng `value` làm khóa.
- **TSK-DEP-02** — Tạo script kiểm tra `scripts/test-resolve-department.mjs` — 27/27 PASS.

---

## Trạng thái Tasks hiện tại

### TSK-SF-01 · Migration survey_forms/survey_questions

| Hạng mục | Trạng thái |
|---|---|
| File migration | ✅ Đã tạo |
| Áp dụng lên Supabase | ⏳ **Chờ bạn chạy** |
| Kiểm thử GET /api/survey-forms/active | ⏳ Chưa thể kiểm thử (bảng chưa có trên DB) |

**File cần chạy theo thứ tự:**
1. `supabase/migrations/20261021000100_phase5_survey_management.sql` — migration chính xác (HOẶC)
2. `supabase/migrations/20261021000100_survey_forms.sql` — phiên bản idempotent

> **Lưu ý:** Hai file có cùng timestamp prefix `20261021000100_`. Supabase CLI áp dụng theo thứ tự alphabet: `phase5_survey_management` trước, `survey_forms` sau. Cả hai đều idempotent — chạy cả hai an toàn. Sau khi áp dụng, chạy thêm `supabase/seed_survey_forms.sql`.

---

### TSK-DEP-01 · Sửa resolveDepartment

| Hạng mục | Trạng thái |
|---|---|
| Code fix | ✅ Đã áp dụng |
| Test script 27/27 PASS | ✅ Xác nhận |
| Kiểm thử POST /api/feedback (DB thật) | ⏳ Chờ migration chạy xong |

**Nguyên nhân gốc:** DB production dùng `DEPARTMENTS[].value` làm mã khoa (KhamBenh, CapCuu, A1_TimThan…), trong khi form gửi `DEPARTMENTS[].code` (KB, CC, A1…). Logic khớp cũ (chỉ exact + prefix + tên) không ánh xạ được 6 khoa không có underscore.

**Bảng đối chiếu mã đầy đủ 13 khoa:**

| Mã form gửi | Mã trong DB | Bước khớp |
|---|---|---|
| KB  | KhamBenh        | (d) static map |
| CC  | CapCuu          | (d) static map |
| B1  | B1_CTCH         | (b) prefix     |
| B2  | B2_NgoaiChung   | (b) prefix     |
| A1  | A1_TimThan      | (b) prefix     |
| A2  | A2_TieuHoa      | (b) prefix     |
| A3  | A3_ThanKinh     | (b) prefix     |
| A4  | A4_TruyenNhiem  | (b) prefix     |
| A5  | A5_YhocCoTruyen | (b) prefix     |
| AD  | SanAnDong       | (d) static map |
| LCK | LienChuyenKhoa  | (d) static map |
| CLS | CDHA_XetNghiem  | (d) static map |
| KTC | KyThuatCao      | (d) static map |

---

### TSK-SF-03 · Form khảo sát chưa đọc từ API

**Trạng thái: Ghi nhận — không sửa trong sprint này**

`app/feedback/page.jsx` dùng `FALLBACK_SURVEY_FORM` từ `lib/surveyFallback.js` khi API trả 404/lỗi, nhưng khi API hoạt động nó VẪN đọc từ `/api/survey-forms/active`. Đây không phải hard-code hoàn toàn — chỉ là fallback cục bộ. Không cần viết lại form.

---

## Rủi ro ghi nhận

### ⚠ UNVERIFIED — DB thật lệch mã khoa so với seed init_schema.sql

- `init_schema.sql` seed ngắn: `KB`, `CC`, `A1`…
- DB production có mã dài: `KhamBenh`, `CapCuu`, `A1_TimThan`…
- Nguồn gốc lệch chưa xác định (có thể do seed thủ công khác).
- **Không sửa dữ liệu DB** — code đã được điều chỉnh để xử lý cả hai dạng mã.

---

## Lệnh cần chạy trên Supabase (theo thứ tự)

```sql
-- Bước 1: Chạy migration (chọn 1 trong 2 cách)
-- Cách A — Supabase CLI:
--   supabase db push  (áp dụng tất cả migration chưa chạy)
-- Cách B — Paste trực tiếp vào SQL editor:
--   Nội dung file: supabase/migrations/20261021000100_phase5_survey_management.sql

-- Bước 2: Seed dữ liệu
-- Paste vào SQL editor sau khi migration thành công:
--   Nội dung file: supabase/seed_survey_forms.sql

-- Bước 3: Kiểm tra
SELECT id, scope, title, status, version
FROM public.survey_forms
WHERE status = 'active';

SELECT type, title, criteria_key, order_index
FROM public.survey_questions
ORDER BY order_index;

-- Bước 4: Kiểm tra PostgREST nhận bảng
-- GET /api/survey-forms/active?scope=hospital
-- Kỳ vọng: { success: true, data: { id, scope, title, questions: [...8 câu] } }
```
