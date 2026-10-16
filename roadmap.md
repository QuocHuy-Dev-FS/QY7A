# LỘ TRÌNH PHÁT TRIỂN & BÁO CÁO KIỂM TOÁN HỆ THỐNG
# CỔNG KHẢO SÁT MỨC ĐỘ HÀI LÒNG NGƯỜI BỆNH & QUẢN LÝ CHẤT LƯỢNG
## BỆNH VIỆN QUÂN Y 7A – CỤC HẬU CẦN QUÂN KHU 7

---

## MỤC LỤC
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc công nghệ & Tích hợp đã xác minh](#2-kiến-trúc-công-nghệ--tích-hợp-đã-xác-minh)
3. [Hiện trạng hệ thống & Phân loại chức năng](#3-hiện-trạng-hệ-thống--phân-loại-chức-năng)
4. [Bảng tiến độ thực tế theo Module](#4-bảng-tiến-độ-thực-tế-theo-module)
5. [Roadmap thực thi theo Phase](#5-roadmap-thực-thi-theo-phase)
   - [Phase 1: Ổn định Dữ liệu, Bảo mật & Sửa lỗi Cốt lõi](#phase-1-ổn-định-dữ-liệu-bảo-mật--sửa-lỗi-cốt-lõi)
   - [Phase 2: Hoàn thiện Trải nghiệm Kiosk & Khả năng Chịu lỗi Ngoại tuyến](#phase-2-hoàn-thiện-trải-nghiệm-kiosk--khả-năng-chịu-lỗi-ngoại-tuyến)
   - [Phase 3: Nâng cấp Quản trị Chất lượng & Báo cáo Nghiệp vụ](#phase-3-nâng-cấp-quản-trị-chất-lượng--báo-cáo-nghiệp-vụ)
   - [Phase 4: Tự động hóa Kiểm thử, Tối ưu Hiệu năng & Sẵn sàng Vận hành](#phase-4-tự-động-hóa-kiểm-thử-tối-ưu-hiệu-năng--sẵn-sàng-vận-hành)
6. [Danh mục công việc còn thiếu](#6-danh-mục-công-việc-còn-thiếu)
7. [Bảng theo dõi Lỗi và Rủi ro kỹ thuật](#7-bảng-theo-dõi-lỗi-và-rủi-ro-kỹ-thuật)
8. [Bộ Tiêu chí Nghiệm thu Hệ thống (Acceptance Criteria)](#8-bộ-tiêu-chí-nghiệm-thu-hệ-thống-acceptance-criteria)
9. [Thứ tự ưu tiên xử lý tiếp theo (Action Priority Matrix)](#9-thứ-tự-ưu-tiên-xử-lý-tiếp-theo-action-priority-matrix)
10. [Giới hạn kiểm tra & Các thông tin chưa thể xác minh](#10-giới-hạn-kiểm-tra--các-thông-tin-chưa-thể-xác-minh)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mục tiêu
Hệ thống **Cổng Khảo sát mức độ hài lòng người bệnh và Quản lý chất lượng** tại **Bệnh viện Quân y 7A** (địa chỉ: Số 466 Nguyễn Trãi, Phường 8, Quận 5, TP. Hồ Chí Minh) được xây dựng nhằm:
- Thu nhận ý kiến đánh giá, mức độ hài lòng của bệnh nhân và thân nhân theo thời gian thực tại các cây Kiosk cảm ứng đặt ở sảnh chờ, khoa khám bệnh và các khoa điều trị nội trú.
- Chuẩn hóa 5 nhóm tiêu chí chất lượng y tế theo định hướng Bộ Y tế và đặc thù Bệnh viện Đa khoa Tuyến cuối - Hạng I Quân đội.
- Đo lường chỉ số hài lòng chung (CSAT) và chỉ số sẵn sàng giới thiệu bệnh viện (NPS - Net Promoter Score).
- Phát hiện kịp thời các phản ánh bức xúc, khiếu nại khẩn cấp ("phản ánh cần ưu tiên") để Ban Giám đốc và Phòng Quản lý chất lượng xử lý ngay trong ngày.
- Cung cấp Dashboard trực quan hóa số liệu phục vụ báo cáo định kỳ, giám sát xu hướng chất lượng dịch vụ theo từng khoa/phòng.

### 1.2. Phạm vi hệ thống
1. **Phân hệ Kiosk tiếp đón & khảo sát người bệnh (Frontend Public):**
   - Màn hình chính Kiosk: Điều hướng nhanh, tra cứu thông tin giới thiệu Bệnh viện Quân y 7A.
   - Luồng khảo sát trực tiếp (ẩn danh / nhanh không cần đăng nhập).
   - Luồng khảo sát theo mã bệnh nhân hoặc số Căn cước công dân (CCCD 12 số) với bàn phím cảm ứng Kiosk chuyên dụng.
   - Quy trình khảo sát 3 bước:
     - Bước 1: Chọn Khoa/Phòng điều trị và định danh người bệnh (hoặc chọn ẩn danh).
     - Bước 2: Đánh giá 5 nhóm tiêu chí chất lượng bằng hệ thống sao cảm ứng và nhãn cảm xúc emoji trực quan.
     - Bước 3: Đánh giá điểm NPS (thang điểm 0 - 10), chọn thẻ góp ý nhanh (tích cực/cải thiện), nhập góp ý và phản ánh nóng.
   - Cơ chế tự động bảo vệ Kiosk: Đếm ngược bất hoạt (Idle Timer) tự trở về trang chủ khi người bệnh rời khỏi máy, đếm ngược cảm ơn sau khi nộp phiếu.
2. **Phân hệ Quản trị & Giám sát chất lượng bệnh viện (Admin Portal):**
   - Xác thực người dùng quản trị bằng tài khoản email/mật khẩu qua Supabase Auth, kiểm tra phân quyền thông qua danh sách whitelist `QUALITY_ADMIN_EMAILS`.
   - Cơ chế bảo vệ phiên đăng nhập bằng HttpOnly Cookie (`quality_admin_access_token`).
   - Dashboard KPI thời gian thực: Tổng lượt khảo sát, CSAT trung bình (%), chỉ số NPS, số lượng phản ánh chờ xử lý.
   - Biểu đồ mạng nhện (Radar Chart) phân tích chi tiết 5 tiêu chí chất lượng.
   - Biểu đồ thanh ngang (Horizontal Bar Chart) so sánh tỷ lệ hài lòng giữa các khoa/phòng.
   - Hộp thư tiếp nhận phản ánh: Tìm kiếm theo mã phiếu/nội dung, lọc theo chuyên khoa, lọc theo trạng thái (`pending` / `resolved`), đổi trạng thái xử lý phản ánh.
   - Xuất dữ liệu báo cáo dạng bảng tính (CSV/Excel) kèm BOM UTF-8 hỗ trợ tiếng Việt có dấu.
3. **Phân hệ Tầng dữ liệu & Dịch vụ nền tảng (Backend & Database):**
   - API endpoints phục vụ lưu trữ phiếu khảo sát công khai và truy vấn/cập nhật dữ liệu quản trị.
   - Cơ sở dữ liệu PostgreSQL lưu trữ trên Supabase với chính sách phân quyền truy cập bảng, stored procedures nguyên tử ghi nhận lịch sử trạng thái.

### 1.3. Đối tượng sử dụng
- **Người bệnh và thân nhân:** Tương tác trực tiếp trên màn hình cảm ứng Kiosk tại bệnh viện; thao tác chạm lớn, không cần dùng chuột/bàn phím cơ.
- **Cán bộ Phòng Quản lý chất lượng & Điều dưỡng trưởng:** Theo dõi Dashboard, tiếp nhận và xử lý các ý kiến phản ánh nóng từ các khoa.
- **Ban Giám đốc Bệnh viện:** Đánh giá bức tranh chất lượng dịch vụ tổng thể, chỉ số hài lòng của từng khoa theo tuần/tháng/quý.
- **Quản trị viên hệ thống (IT BV 7A):** Cấu hình tài khoản quản trị, giám sát kết nối cơ sở dữ liệu và vận hành hệ thống Kiosk.

---

## 2. KIẾN TRÚC CÔNG NGHỆ & TÍCH HỢP ĐÃ XÁC MINH

### 2.1. Bảng cấu hình & Thư viện phụ thuộc chính (Verified from [`package.json`](file:///d:/Workplace/hospital-quality-survey/package.json))

| Thành phần | Công nghệ / Thư viện | Phiên bản thực tế | Mục đích sử dụng | Bằng chứng mã nguồn |
| :--- | :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.4.0` (React 19.3.0) | Nền tảng Fullstack SSR/SSG/API Routes | [`package.json:L14-L16`](file:///d:/Workplace/hospital-quality-survey/package.json#L14-L16) |
| **Styling Engine** | Tailwind CSS & Turbopack | `^4.0.0` (`@tailwindcss/turbopack`) | Thiết kế giao diện Kiosk hiện đại | [`package.json:L20-L23`](file:///d:/Workplace/hospital-quality-survey/package.json#L20-L23) |
| **Biểu đồ số liệu** | Recharts | `^3.10.1` | Biểu đồ Radar 5 tiêu chí & Bar Chart CSAT khoa | [`package.json:L17`](file:///d:/Workplace/hospital-quality-survey/package.json#L17) |
| **Icon System** | Lucide React | `^1.55.0` | Bộ icon y tế, điều hướng Kiosk | [`package.json:L13`](file:///d:/Workplace/hospital-quality-survey/package.json#L13) |
| **Cơ sở dữ liệu BaaS** | `@supabase/supabase-js` | `^2.117.3` | SDK kết nối Supabase PostgreSQL & Auth | [`package.json:L12`](file:///d:/Workplace/hospital-quality-survey/package.json#L12) |
| **Linting & Code Quality** | ESLint | `^9.0.0` (`eslint-config-next: 16.4.0`) | Kiểm tra cú pháp và quy chuẩn Next.js | [`package.json:L21-L22`](file:///d:/Workplace/hospital-quality-survey/package.json#L21-L22) |
| **Test Runner** | *Chưa tích hợp* | *Không có* | Chưa có Jest, Vitest, Playwright hay Cypress | [`package.json:L5-L10`](file:///d:/Workplace/hospital-quality-survey/package.json#L5-L10) |

### 2.2. Kiến trúc Tầng dữ liệu & Mô hình Phân quyền (Supabase / PostgreSQL)

1. **Kết nối Supabase:**
   - Client trình duyệt ([`lib/supabase/browser.js`](file:///d:/Workplace/hospital-quality-survey/lib/supabase/browser.js)): Sử dụng `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (hoặc Anon Key cũ), hỗ trợ lưu trữ session phía client.
   - Client máy chủ không trạng thái ([`lib/supabase/server.js`](file:///d:/Workplace/hospital-quality-survey/lib/supabase/server.js)): Stateless client dùng để xác thực token qua `auth.getUser()`.
   - Client máy chủ đặc quyền ([`lib/supabase/admin.js`](file:///d:/Workplace/hospital-quality-survey/lib/supabase/admin.js)): Sử dụng `SUPABASE_SERVICE_ROLE_KEY` để thực hiện các thao tác ghi nhận feedback công khai và cập nhật trạng thái quản trị bảo mật.
2. **Schema & Migration hiện có:**
   - File migration duy nhất được ghi nhận: [`supabase/migrations/20261015000100_secure_feedback_and_status_history.sql`](file:///d:/Workplace/hospital-quality-survey/supabase/migrations/20261015000100_secure_feedback_and_status_history.sql).
   - **Các bảng dữ liệu được tham chiếu:**
     - `public.departments`: Danh mục khoa phòng (`code`, `name`, `is_active`, `updated_at`).
     - `public.feedback`: Thông tin phiếu khảo sát (`id`, `department_code`, `patient_code`, `is_anonymous`, `c1_access`, `c2_transparency`, `c3_facilities`, `c4_attitude`, `c5_outcome`, `csat_percent`, `nps_score`, `nps_category`, `comment`, `urgent_feedback`, `status`, `created_at`, `updated_at`).
     - `public.feedback_status_history`: Lịch sử thay đổi trạng thái phiếu (`id`, `feedback_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`).
   - **Chính sách bảo mật (Security Policies / Permissions):**
     - Thu hồi toàn bộ quyền trực tiếp (`REVOKE ALL PRIVILEGES`) từ role `PUBLIC`, `anon`, `authenticated` trên cả 3 bảng.
     - Cấp quyền đọc (`SELECT`) bảng `departments` cho `anon, authenticated`.
     - Cấp toàn quyền (`ALL PRIVILEGES`) cho `service_role`.
   - **Hàm & Trigger PostgreSQL:**
     - Hàm `public.set_updated_at()` cập nhật cột `updated_at = now()`.
     - Triggers: `departments_set_updated_at` và `feedback_set_updated_at`.
     - Stored Procedure: `public.update_feedback_status_with_history(p_feedback_id, p_new_status, p_changed_by, p_note)` với `SECURITY DEFINER`, chỉ cấp quyền `EXECUTE` cho `service_role`, đảm bảo cập nhật trạng thái và ghi log lịch sử trong một giao dịch nguyên tử (Atomic Transaction).

### 2.3. Kiến trúc API Routes

1. **`GET /api/admin/session` & `POST /api/admin/session`** ([`app/api/admin/session/route.js`](file:///d:/Workplace/hospital-quality-survey/app/api/admin/session/route.js)):
   - Quản lý phiên làm việc của Quản trị viên.
   - Nhận Supabase Auth token, kiểm tra whitelist `QUALITY_ADMIN_EMAILS`, thiết lập cookie `quality_admin_access_token` với cờ `httpOnly`, `sameSite: lax`, `secure` (production), thời hạn 3600 giây.
   - Xử lý hành động `logout` để xóa cookie sạch sẽ.
2. **`GET /api/feedback`** ([`app/api/feedback/route.js:L105-L164`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js#L105-L164)):
   - Yêu cầu xác thực tài khoản Quản trị chất lượng qua Cookie.
   - Truy vấn toàn bộ danh sách khảo sát từ bảng `feedback` sắp xếp giảm dần theo thời gian tạo, ánh xạ mã khoa sang tên khoa từ bảng `departments`.
3. **`POST /api/feedback`** ([`app/api/feedback/route.js:L166-L444`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js#L166-L444)):
   - Tiếp nhận nộp phiếu khảo sát công khai từ màn hình Kiosk.
   - Kiểm tra định dạng dữ liệu đầu vào nghiêm ngặt: Content-Type `application/json`, độ dài `patientCode` (<= 100 ký tự), bắt buộc đầy đủ 5 tiêu chí (1-5 điểm), điểm NPS (0-10 điểm), giới hạn độ dài `comment` (<= 5.000 ký tự) và `urgentFeedback` (<= 3.000 ký tự).
   - Kiểm tra sự tồn tại của khoa/phòng trong cơ sở dữ liệu `departments`.
   - Ghi bản ghi vào Supabase với trạng thái ban đầu `pending`.
4. **`PATCH /api/feedback`** ([`app/api/feedback/route.js:L446-L558`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js#L446-L558)):
   - Yêu cầu quyền Quản trị viên.
   - Kiểm tra định dạng `id` theo chuẩn UUID regex, kiểm tra trạng thái mục tiêu (`pending` hoặc `resolved`), giới hạn ghi chú `note` <= 2.000 ký tự.
   - Gọi RPC `update_feedback_status_with_history` để cập nhật trạng thái và ghi nhận người sửa đổi.
5. **`GET /api/supabase-test`** ([`app/api/supabase-test/route.js`](file:///d:/Workplace/hospital-quality-survey/app/api/supabase-test/route.js)):
   - Endpoint kiểm tra nội bộ kết nối Supabase, chỉ cho phép thực thi trong môi trường phát triển (`NODE_ENV === "development"`).

---

## 3. HIỆN TRẠNG HỆ THỐNG & PHÂN LOẠI CHỨC NĂNG

### 3.1. Các chức năng đã triển khai hoàn chỉnh có bằng chứng mã nguồn (`DONE`)
- **Giao diện trang chủ Kiosk chuẩn nhận diện Quân y 7A:** Thiết kế tối ưu cho màn hình cảm ứng khổ lớn, hình nền đồ họa thành phố công nghệ cao kết hợp dải gradient chống lóa ([`app/page.jsx`](file:///d:/Workplace/hospital-quality-survey/app/page.jsx)).
- **Header Kiosk & Chế độ Toàn màn hình:** Logo bệnh viện, tên đơn vị Bệnh viện Quân y 7A, nút kích hoạt HTML5 Fullscreen API ([`components/KioskHeader.jsx`](file:///d:/Workplace/hospital-quality-survey/components/KioskHeader.jsx)).
- **Cửa sổ tra cứu thông tin bệnh viện:** Hotline CSKH, cấp cứu 24/7, địa chỉ, giờ khám, danh mục 13 chuyên khoa/phòng chức năng ([`components/HospitalInfoModal.jsx`](file:///d:/Workplace/hospital-quality-survey/components/HospitalInfoModal.jsx), [`lib/hospitalData.js`](file:///d:/Workplace/hospital-quality-survey/lib/hospitalData.js)).
- **Bàn phím số ảo cảm ứng cho Kiosk:** Nút số cỡ lớn, hỗ trợ xóa nhanh, lùi 1 ký tự, tiền tố mã bệnh nhân `BN-`, `7A-`, `KB-`, `CC-` và nút nạp mã mẫu ([`components/TouchNumpad.jsx`](file:///d:/Workplace/hospital-quality-survey/components/TouchNumpad.jsx)).
- **Thanh tiến trình 3 bước Kiosk:** Trực quan hóa tiến độ làm khảo sát ([`components/KioskStepProgress.jsx`](file:///d:/Workplace/hospital-quality-survey/components/KioskStepProgress.jsx)).
- **Trang xác thực người bệnh:** Nhập mã BN hoặc số CCCD 12 số, kiểm tra định dạng trước khi sang bước đánh giá ([`app/auth/page.jsx`](file:///d:/Workplace/hospital-quality-survey/app/auth/page.jsx)).
- **Form khảo sát ý kiến đa bước:** 5 nhóm tiêu chí chấm điểm 1-5 sao kèm emoji biểu cảm, thang đo NPS 0-10, hệ thống thẻ chọn nhanh khen ngợi và góp ý ([`app/feedback/page.jsx`](file:///d:/Workplace/hospital-quality-survey/app/feedback/page.jsx)).
- **Màn hình cảm ơn & Tự động điều hướng:** Thông báo hoàn tất kèm đếm ngược 12 giây tự động quay về trang chủ Kiosk ([`app/feedback/page.jsx:L212-L297`](file:///d:/Workplace/hospital-quality-survey/app/feedback/page.jsx#L212-L297)).
- **Đăng nhập quản trị viên & Kiểm soát phiên:** Trang đăng nhập bảo mật, kiểm tra email whitelist, cơ chế HttpOnly Cookie session ([`app/admin/login/page.jsx`](file:///d:/Workplace/hospital-quality-survey/app/admin/login/page.jsx), [`app/admin/layout.jsx`](file:///d:/Workplace/hospital-quality-survey/app/admin/layout.jsx)).
- **Xuất báo cáo khảo sát ra CSV:** Tính năng client-side export hỗ trợ UTF-8 BOM cho tiếng Việt ([`app/admin/AdminDashboardClient.jsx:L283-L306`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx#L283-L306)).

### 3.2. Các chức năng đã triển khai một phần (`IN PROGRESS`)
- **Đồng bộ dữ liệu Dashboard Quản trị:** Dashboard hiển thị dữ liệu từ `/api/feedback`, nhưng nếu truy vấn thất bại hoặc dữ liệu rỗng, hệ thống giữ lại 4 bản ghi mẫu tĩnh `DEFAULT_ADMIN_FEEDBACKS` ([`app/admin/AdminDashboardClient.jsx:L80-L137`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx#L80-L137)). Khi dùng dữ liệu mẫu, thao tác xử lý phản ánh sẽ bị lỗi do ID mẫu không phải là UUID.
- **Tính toán chỉ số CSAT & NPS tự động:** Trong `app/api/feedback/route.js`, câu lệnh `insert` chưa ghi cột `csat_percent` hoặc `nps_category`, trong khi cơ sở dữ liệu chưa có script trigger tự động tính hai cột này từ điểm tiêu chí và điểm NPS.
- **Xử lý phản ánh nóng:** Giao diện Dashboard cho phép bấm "Đánh dấu đã giải quyết", nhưng chưa có form nhập nội dung ghi chú xử lý (`note`) gửi kèm sang API PATCH ([`app/admin/AdminDashboardClient.jsx:L266-L281`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx#L266-L281)).

### 3.3. Các chức năng chưa triển khai theo bằng chứng hiện có (`TODO`)
- **Tập lệnh khởi tạo toàn bộ Cơ sở dữ liệu (Initial Schema Migration):** Chưa có script `00000000000000_init_tables.sql` để tạo mới các bảng `departments`, `feedback`, `feedback_status_history` và dữ liệu mẫu 13 khoa/phòng.
- **Cơ chế lưu trữ ngoại tuyến khi mất mạng (Offline Kiosk Queueing):** Chưa có cơ chế cache phiếu khảo sát vào IndexedDB/LocalStorage khi Kiosk đứt cáp mạng LAN hoặc mất Wi-Fi.
- **Hệ thống cảnh báo thời gian thực (Real-time Urgent Notifications):** Chưa sử dụng Supabase Realtime Channels để gửi thông báo tức thì lên màn hình quản trị khi có bệnh nhân gửi "Phản ánh cần ưu tiên".
- **Hệ thống kiểm thử tự động (Unit & E2E Tests):** Chưa có bất kỳ cấu hình runner hay file kịch bản kiểm thử nào.

### 3.4. Các thông tin chưa đủ bằng chứng xác minh (`UNVERIFIED`)
- **Cấu hình thực tế trên Supabase Cloud / Production:** Chưa xác minh được các bảng và trigger trên instance Supabase thật có khớp 100% với migration hay đã có trigger tính toán `csat_percent` sẵn trên database.
- **Danh sách tài khoản Admin thực tế:** Biến môi trường `QUALITY_ADMIN_EMAILS` chưa được đối chiếu trực tiếp để đảm bảo không rò rỉ thông tin nhạy cảm.
- **Phản ứng phần cứng Kiosk thực tế:** Độ nhạy cảm ứng đa điểm, độ phân giải màn hình Kiosk vật lý tại bệnh viện chưa được kiểm thử thực địa.

---

## 4. BẢNG TIẾN ĐỘ THỰC TẾ THEO MODULE

*Quy ước trạng thái:*
- `DONE`: Đã có source code hoàn chỉnh và bằng chứng logic rõ ràng.
- `IN PROGRESS`: Đã có source code nhưng còn khiếm khuyết hoặc thiếu tiêu chí hoàn thành.
- `TODO`: Chưa có source code trong repository.
- `TESTED`: Đã chạy kiểm thử thực tế và ghi nhận kết quả (Hiện tại dự án chưa có test runner tự động).
- `UNVERIFIED`: Chưa đủ dữ liệu đối chiếu với môi trường thực tế.

| Mã Module | Tên Module / Tính năng | Hiện trạng Source Code | Trạng thái Nghiệp vụ | Bằng chứng mã nguồn đối chiếu | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **MOD-01** | **Kiosk Trang chủ & Nhận diện** | Có mã nguồn | `DONE` | [`app/page.jsx`](file:///d:/Workplace/hospital-quality-survey/app/page.jsx), [`components/KioskHeader.jsx`](file:///d:/Workplace/hospital-quality-survey/components/KioskHeader.jsx) | Màu thương hiệu xanh quân y `#0f2852`, nền chuẩn, logo chuẩn |
| **MOD-02** | **Kiosk Idle Timer (Bảo vệ phiên)** | Có mã nguồn | `IN PROGRESS` | [`components/KioskIdleTimer.jsx`](file:///d:/Workplace/hospital-quality-survey/components/KioskIdleTimer.jsx) | **Rủi ro:** Đang kích hoạt cả trên trang `/admin`, cần loại trừ `/admin*` |
| **MOD-03** | **Kiosk Tra cứu Bệnh viện** | Có mã nguồn | `DONE` | [`components/HospitalInfoModal.jsx`](file:///d:/Workplace/hospital-quality-survey/components/HospitalInfoModal.jsx), [`lib/hospitalData.js`](file:///d:/Workplace/hospital-quality-survey/lib/hospitalData.js) | Đầy đủ hotline, địa chỉ, 13 chuyên khoa, cấp cứu 24/7 |
| **MOD-04** | **Kiosk Định danh Người bệnh** | Có mã nguồn | `DONE` | [`app/auth/page.jsx`](file:///d:/Workplace/hospital-quality-survey/app/auth/page.jsx), [`components/TouchNumpad.jsx`](file:///d:/Workplace/hospital-quality-survey/components/TouchNumpad.jsx) | Xác thực CCCD 12 số, mã BN >= 3 ký tự, Touch Numpad ảo |
| **MOD-05** | **Kiosk Khảo sát 3 bước** | Có mã nguồn | `DONE` | [`app/feedback/page.jsx`](file:///d:/Workplace/hospital-quality-survey/app/feedback/page.jsx), [`components/KioskStepProgress.jsx`](file:///d:/Workplace/hospital-quality-survey/components/KioskStepProgress.jsx) | 5 tiêu chí sao + emoji, NPS 0-10, thẻ góp ý nhanh |
| **MOD-06** | **Kiosk Màn hình Cảm ơn** | Có mã nguồn | `DONE` | [`app/feedback/page.jsx:L212-L297`](file:///d:/Workplace/hospital-quality-survey/app/feedback/page.jsx#L212-L297) | Đếm ngược 12 giây tự động chuyển về trang chủ an toàn |
| **MOD-07** | **API Tiếp nhận Khảo sát (POST)** | Có mã nguồn | `IN PROGRESS` | [`app/api/feedback/route.js:L166-L444`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js#L166-L444) | Thiếu lưu trữ `csat_percent` hoặc trigger tính tự động |
| **MOD-08** | **Xác thực Quản trị (Auth Session)** | Có mã nguồn | `DONE` | [`app/api/admin/session/route.js`](file:///d:/Workplace/hospital-quality-survey/app/api/admin/session/route.js), [`lib/auth/admin.js`](file:///d:/Workplace/hospital-quality-survey/lib/auth/admin.js) | HttpOnly Cookie, whitelist email, Supabase Auth |
| **MOD-09** | **Bảo vệ Định tuyến Quản trị** | Có mã nguồn | `DONE` | [`app/admin/layout.jsx`](file:///d:/Workplace/hospital-quality-survey/app/admin/layout.jsx), [`app/admin/login/page.jsx`](file:///d:/Workplace/hospital-quality-survey/app/admin/login/page.jsx) | Redirect `/admin/login`, cơ chế verify session đồng bộ |
| **MOD-10** | **Admin Dashboard KPI & Biểu đồ** | Có mã nguồn | `DONE` | [`app/admin/AdminDashboardClient.jsx:L360-L454`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx#L360-L454) | 4 thẻ KPI, RadarChart 5 tiêu chí, BarChart CSAT khoa |
| **MOD-11** | **Admin Hộp thư & Xử lý Phản ánh** | Có mã nguồn | `IN PROGRESS` | [`app/admin/AdminDashboardClient.jsx:L456-L606`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx#L456-L606), [`app/api/feedback/route.js:L446-L558`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js#L446-L558) | Chưa có modal nhập `note` xử lý, ID mẫu gây lỗi UUID |
| **MOD-12** | **Admin Xuất báo cáo CSV** | Có mã nguồn | `DONE` | [`app/admin/AdminDashboardClient.jsx:L283-L306`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx#L283-L306) | Tải file `.csv` có BOM tiếng Việt chuẩn xác |
| **MOD-13** | **Cơ sở dữ liệu & Migration Supabase** | 1 file migration | `IN PROGRESS` | [`supabase/migrations/20261015000100_...sql`](file:///d:/Workplace/hospital-quality-survey/supabase/migrations/20261015000100_secure_feedback_and_status_history.sql) | Thiếu migration tạo bảng gốc ban đầu (`init_schema.sql`) |
| **MOD-14** | **Kiểm thử tự động (Automation Test)** | Không có | `TODO` | Không có thư mục `__tests__` hay file `.test.*` | Chưa cấu hình test runner và kịch bản test |
| **MOD-15** | **Khả năng chịu lỗi Offline Kiosk** | Không có | `TODO` | [`app/feedback/page.jsx:L188-L208`](file:///d:/Workplace/hospital-quality-survey/app/feedback/page.jsx#L188-L208) | Mất mạng báo lỗi ngay, không lưu tạm IndexedDB |

---

## 5. ROADMAP THỰC THI THEO PHASE

Kế hoạch phát triển được tổ chức theo 4 giai đoạn logic, tuân thủ nguyên tắc phụ thuộc kỹ thuật: Ưu tiên bảo mật, toàn vẹn dữ liệu và khắc phục lỗi nghiêm trọng trước khi mở rộng tính năng nâng cao.

```mermaid
flowchart TD
    subgraph Phase 1: Ổn định Dữ liệu & Sửa lỗi Cốt lõi
        P1_1[Mã hóa Initial Schema Migration] --> P1_2[Chuẩn hóa Department Code & Value]
        P1_2 --> P1_3[Cập nhật Trigger tính CSAT & NPS Category]
        P1_3 --> P1_4[Khắc phục KioskIdleTimer trên trang Admin]
        P1_4 --> P1_5[Sửa lỗi UUID & Bổ sung Modal Note xử lý phản ánh]
    end

    subgraph Phase 2: Nâng cao Trải nghiệm Kiosk & Offline
        P1_5 --> P2_1[Cơ chế lưu tạm ngoại tuyến IndexedDB Offline Queue]
        P2_1 --> P2_2[Khắc phục Dead Code feedbackStore.js]
        P2_2 --> P2_3[Tối ưu hóa khả năng tiếp cận Accessibility Kiosk]
    end

    subgraph Phase 3: Nâng cấp Quản trị Chất lượng
        P2_3 --> P3_1[Tích hợp Supabase Realtime cảnh báo phản ánh khẩn]
        P3_1 --> P3_2[Bộ lọc nâng cao theo khoảng thời gian & Xuất Excel XLSX]
        P3_2 --> P3_3[Phân quyền Quản lý Chất lượng theo từng Khoa/Phòng]
    end

    subgraph Phase 4: Kiểm thử, Tối ưu & Vận hành
        P3_3 --> P4_1[Thiết lập Vitest / Testing Library kiểm thử Unit & Integration]
        P4_1 --> P4_2[Kiểm thử E2E Playwright trên luồng Kiosk cảm ứng]
        P4_2 --> P4_3[Tối ưu hóa tài nguyên hình ảnh & Kiểm tra bảo mật Security Hardening]
    end
```

---

### Phase 1: Ổn định Dữ liệu, Bảo mật & Sửa lỗi Cốt lõi
**Mục tiêu:** Xử lý triệt để các lỗi logic, hoàn thiện tầng cơ sở dữ liệu và bảo đảm toàn vẹn dữ liệu khảo sát từ Kiosk về Backend.

| Mã công việc | Tên công việc | Mô tả kỹ thuật chi tiết | Trạng thái | Ưu tiên | Phụ thuộc | Đầu ra mong đợi | Tiêu chí nghiệm thu |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **TSK-101** | **Tạo Migration khởi tạo CSDL gốc** | Viết file migration `00000000000000_init_schema.sql` chứa câu lệnh tạo bảng `departments`, `feedback`, `feedback_status_history` và seed 13 khoa/phòng | `TODO` | **Critical** | Không | File SQL migration chạy độc lập trên database sạch | `supabase db reset` hoặc chạy script trên database mới thành công 100% không báo thiếu bảng |
| **TSK-102** | **Đồng bộ mã Khoa/Phòng giữa Form và API** | Rà soát `DEPARTMENTS[].value` trong [`lib/hospitalData.js`](file:///d:/Workplace/hospital-quality-survey/lib/hospitalData.js) và logic kiểm tra `departmentInput` tại [`app/api/feedback/route.js:L362-L385`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js#L362-L385) | `TODO` | **Critical** | TSK-101 | Form gửi mã hoặc tên chuẩn, API nhận diện chính xác 13/13 khoa | Gửi khảo sát cho bất kỳ khoa nào trong 13 khoa đều trả về mã 201 Created |
| **TSK-103** | **Cơ chế tính toán CSAT & NPS Category** | Bổ sung Generated Column hoặc Function Trigger PostgreSQL tính `csat_percent = ROUND(((c1+c2+c3+c4+c5)/25.0)*100)` và gán `nps_category` khi INSERT | `TODO` | **High** | TSK-101 | Cột `csat_percent` và `nps_category` luôn có giá trị chính xác trong CSDL | Mọi bản ghi mới đều có CSAT và NPS Category tự động mà không cần tính thủ công |
| **TSK-104** | **Khắc phục KioskIdleTimer trên phân hệ Quản trị** | Sửa [`components/KioskIdleTimer.jsx`](file:///d:/Workplace/hospital-quality-survey/components/KioskIdleTimer.jsx) để bỏ qua các đường dẫn bắt đầu bằng `/admin` | `TODO` | **High** | Không | Timer chỉ chạy trên các trang Kiosk công cộng (`/`, `/auth`, `/feedback`) | Cán bộ làm việc trên `/admin` quá 60s không bị popup cảnh báo hay văng về trang chủ |
| **TSK-105** | **Sửa lỗi UUID & Bổ sung Modal Note xử lý phản ánh** | Sửa `handleResolveFeedback` trong [`AdminDashboardClient.jsx`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx) để mở Modal nhập ghi chú xử lý, kiểm tra ID hợp lệ trước khi gọi PATCH | `TODO` | **High** | TSK-101 | Giao diện cho phép cán bộ nhập nội dung khắc phục (<= 2000 ký tự) | Gọi PATCH `/api/feedback` thành công, lưu bản ghi vào `feedback_status_history` kèm note |

---

### Phase 2: Hoàn thiện Trải nghiệm Kiosk & Khả năng Chịu lỗi Ngoại tuyến
**Mục tiêu:** Đảm bảo Kiosk hoạt động bền bỉ, mượt mà trong điều kiện hạ tầng mạng bệnh viện chập chờn, loại bỏ mã nguồn rác.

| Mã công việc | Tên công việc | Mô tả kỹ thuật chi tiết | Trạng thái | Ưu tiên | Phụ thuộc | Đầu ra mong đợi | Tiêu chí nghiệm thu |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **TSK-201** | **Cơ chế ngoại tuyến Offline Queueing (IndexedDB)** | Xây dựng Service Worker hoặc module lưu trữ tạm phiếu khảo sát vào IndexedDB khi thiết bị mất kết nối mạng, tự động đồng bộ khi có mạng lại | `PLANNED` | **High** | Phase 1 | Module `lib/offlineQueue.js` tích hợp vào Form khảo sát | Rút cáp mạng LAN, làm khảo sát -> hiển thị thông báo "Đã lưu tạm", cắm lại mạng -> tự đồng bộ lên DB |
| **TSK-202** | **Dọn dẹp mã nguồn thừa (Dead Code)** | Quyết định tích hợp hoặc loại bỏ sạch sẽ [`lib/feedbackStore.js`](file:///d:/Workplace/hospital-quality-survey/lib/feedbackStore.js) và [`data/feedbacks.json`](file:///d:/Workplace/hospital-quality-survey/data/feedbacks.json) để tránh gây nhầm lẫn kiến trúc | `TODO` | **Medium** | Phase 1 | Cấu trúc thư mục tinh gọn, tài liệu kiến trúc đồng nhất | Toàn bộ dự án chỉ sử dụng một kho dữ liệu duy nhất là Supabase |
| **TSK-203** | **Cải tiến trợ năng & Trải nghiệm Kiosk (Accessibility)** | Thêm tùy chọn phóng to cỡ chữ cho người cao tuổi, tối ưu hóa âm báo chạm (chime feedback khi bấm sao), chống thao tác chạm đúp liên tục | `PLANNED` | **Medium** | Không | Giao diện thân thiện tối đa với đối tượng thương bệnh binh, người cao tuổi | Điểm Lighthouse Accessibility đạt >= 95, không có lỗi tương tác cảm ứng |

---

### Phase 3: Nâng cấp Quản trị Chất lượng & Báo cáo Nghiệp vụ
**Mục tiêu:** Cung cấp công cụ quản trị thông minh, cảnh báo thời gian thực và trích xuất dữ liệu đa chiều cho Ban Giám đốc và Phòng Quản lý chất lượng.

| Mã công việc | Tên công việc | Mô tả kỹ thuật chi tiết | Trạng thái | Ưu tiên | Phụ thuộc | Đầu ra mong đợi | Tiêu chí nghiệm thu |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **TSK-301** | **Cảnh báo thời gian thực Phản ánh Ưu tiên (Realtime Alert)** | Ứng dụng Supabase Realtime Channels lắng nghe sự kiện INSERT các phản ánh có `urgent_feedback != ''`, phát âm thanh/badge đỏ trên Dashboard | `PLANNED` | **High** | Phase 1 | Cửa sổ Dashboard tự cập nhật ngay khi có phản ánh mới mà không cần F5 | Khi Kiosk gửi phản ánh khẩn, Dashboard của cán bộ rung chuông thông báo sau < 2 giây |
| **TSK-302** | **Bộ lọc thời gian nâng cao & Xuất Excel đa định dạng** | Nâng cấp bộ lọc theo khoảng ngày (Từ ngày - Đến ngày), hỗ trợ xuất file Excel định dạng chuẩn `.xlsx` kèm định dạng bảng và màu sắc theo trạng thái | `PLANNED` | **Medium** | TSK-105 | Báo cáo chi tiết theo tuần/tháng/quý phục vụ giao ban bệnh viện | Xuất file Excel mở bằng MS Excel hiển thị đúng font tiếng Việt, có chia tab hoặc nhóm khoa |
| **TSK-303** | **Phân quyền giám sát theo Khoa/Phòng (Role-based Scope)** | Mở rộng bảng người dùng để phân quyền cho Điều dưỡng trưởng/Chủ nhiệm từng khoa chỉ xem được khảo sát của khoa mình, Ban Giám đốc xem toàn viện | `PLANNED` | **Low** | TSK-301 | Schema bảng `user_roles` và chính sách RLS lọc theo `department_code` | Đăng nhập tài khoản Khoa Cấp Cứu chỉ thấy dữ liệu khoa Cấp Cứu |

---

### Phase 4: Tự động hóa Kiểm thử, Tối ưu Hiệu năng & Sẵn sàng Vận hành
**Mục tiêu:** Thiết lập hàng rào kiểm thử tự động, tối ưu hóa tải trọng và đóng gói tài liệu bàn giao kỹ thuật cho Bệnh viện Quân y 7A.

| Mã công việc | Tên công việc | Mô tả kỹ thuật chi tiết | Trạng thái | Ưu tiên | Phụ thuộc | Đầu ra mong đợi | Tiêu chí nghiệm thu |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **TSK-401** | **Thiết lập Bộ kiểm thử Tự động (Unit & Integration Test)** | Cài đặt Vitest / React Testing Library, viết test suites kiểm thử logic validate form, API POST/PATCH, helper auth và format dữ liệu | `TODO` | **High** | Phase 1 | Thư mục `__tests__` và script `npm test` trong `package.json` | 100% test cases cốt lõi pass, độ bao phủ nhánh chính >= 80% |
| **TSK-402** | **Kiểm thử E2E Playwright trên luồng Kiosk cảm ứng** | Viết kịch bản E2E kiểm tra toàn bộ luồng: Khảo sát trực tiếp -> Đánh giá 5 sao -> NPS -> Gửi phiếu thành công -> Màn hình cảm ơn -> Tự quay về Home | `TODO` | **Medium** | TSK-401 | Script `npm run test:e2e` chạy tự động không lỗi | Luồng Kiosk chạy mượt mà từ đầu đến cuối trên trình giả lập màn hình cảm ứng |
| **TSK-403** | **Tối ưu hóa hình ảnh & Đóng gói Vận hành (Production Hardening)** | Tối ưu hóa file ảnh lớn ([`kiosk-city-bg.jpg`](file:///d:/Workplace/hospital-quality-survey/public/assets/images/kiosk-city-bg.jpg) 543KB sang WebP), thiết lập script kiểm tra sức khỏe hệ thống (Health Check) | `PLANNED` | **Medium** | Không | Giảm thời gian tải trang Kiosk ban đầu xuống < 1 giây trên mạng nội bộ | Điểm Core Web Vitals (LCP < 1.2s, CLS = 0, FID < 100ms) trên môi trường Kiosk |

---

## 6. DANH MỤC CÔNG VIỆC CÒN THIẾU

Dựa trên kết quả kiểm tra mã nguồn thực tế, các hạng mục sau đây cần được hoàn thiện:

### 6.1. Thiếu sót về Chức năng & Nghiệp vụ
1. **Thiếu Initial Migration Database:** Chưa có file SQL tạo bảng ban đầu, gây rủi ro không thể dựng lại môi trường khi triển khai trên server mới của Bệnh viện Quân y 7A.
2. **Thiếu cơ chế ngoại tuyến cho Kiosk:** Chưa có bộ đệm lưu phiếu tạm khi rớt mạng nội bộ.
3. **Thiếu modal nhập ghi chú khi xử lý phản ánh:** Phân hệ Admin có API nhận trường `note` nhưng giao diện người dùng chưa có ô nhập.
4. **Trực quan hóa thiếu bộ lọc thời gian:** Dashboard hiện chỉ hiển thị toàn bộ số liệu lũy kế, chưa lọc được theo ngày hôm nay, tuần này hay tháng này.

### 6.2. Thiếu sót về Kiểm thử & Đảm bảo chất lượng (QA/QC)
1. **Chưa có công cụ Test Runner:** `package.json` chỉ có `next dev`, `build`, `start`, `lint`. Không có Jest, Vitest, Cypress hay Playwright.
2. **Chưa có kịch bản kiểm thử tự động:** 0 file unit test, 0 file integration test, 0 file e2e test.
3. **Chưa có biên bản kiểm thử thực tế:** Chưa có tài liệu ghi nhận kết quả test tải đồng thời khi nhiều Kiosk cùng gửi phiếu.

### 6.3. Thiếu sót về Bảo mật & Kiểm soát phiên
1. **Cơ chế gia hạn phiên đăng nhập Quản trị (Refresh Token):** Cookie quản trị có thời hạn cố định 1 giờ (`maxAge: 3600`). Khi hết hạn, người dùng bị đẩy về trang đăng nhập mà không có cơ chế silent refresh an toàn.
2. **Chính sách giới hạn tần suất gửi phiếu (Rate Limiting):** Endpoint công khai `POST /api/feedback` chưa có giới hạn số lượt gửi từ một địa chỉ IP trong khoảng thời gian ngắn để chống spam hoặc phá hoại Kiosk.

### 6.4. Thiếu sót về Trải nghiệm Người dùng (UX) & Trợ năng
1. **Lỗi đếm ngược nhầm trên Dashboard Admin:** `KioskIdleTimer` chạy trên cả trang quản trị làm phiền nhân viên bệnh viện.
2. **Chưa có chế độ hỗ trợ người cao tuổi:** Cần bổ sung nút tăng cỡ chữ hoặc âm thanh hướng dẫn ngắn gọn cho bệnh nhân lớn tuổi điều trị tại các khoa nội.

---

## 7. BẢNG THEO DÕI LỖI VÀ RỦI RO KỸ THUẬT

| STT | Mã Lỗi / Rủi ro | Vị trí phát hiện | Mức độ ưu tiên | Mức ảnh hưởng | Hướng xử lý đề xuất |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **01** | **KioskIdleTimer đếm ngược và redirect trên trang Admin** | [`components/KioskIdleTimer.jsx:L20`](file:///d:/Workplace/hospital-quality-survey/components/KioskIdleTimer.jsx#L20) | **CRITICAL** | Khi cán bộ xem báo cáo trên `/admin` sau 60s không thao tác chuột sẽ bị hiện modal Kiosk và chuyển về trang chủ, làm gián đoạn công việc | Sửa logic `isHomePage` thành kiểm tra `pathname === "/" \|\| pathname.startsWith("/admin")` để vô hiệu hóa hoàn toàn timer trên `/admin*` |
| **02** | **Xử lý phản ánh lỗi UUID khi dùng dữ liệu mẫu** | [`app/admin/AdminDashboardClient.jsx:L80-L137`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx#L80-L137), [`app/api/feedback/route.js:L474-L482`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js#L474-L482) | **HIGH** | Nếu Supabase chưa có dữ liệu hoặc mất mạng, dashboard dùng dữ liệu mẫu có ID dạng `FB-7A-102`. Bấm giải quyết sẽ gửi lên API và bị từ chối do không khớp regex UUID | Tạo dữ liệu mẫu có ID là UUID chuẩn hoặc bỏ fallback tĩnh, hiển thị trạng thái rỗng (Empty State) kèm thông báo lỗi rõ ràng |
| **03** | **Cột `csat_percent` và `nps_category` bị null khi INSERT** | [`app/api/feedback/route.js:L388-L406`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js#L388-L406) | **HIGH** | Hàm insert không truyền `csat_percent` và `nps_category`. Nếu trong DB không có trigger tự động, các cột này sẽ mang giá trị NULL, làm sai lệch biểu đồ Dashboard | Bổ sung trigger tính toán tự động trong PostgreSQL hoặc tính toán trực tiếp trong API route trước khi insert |
| **04** | **Thiếu migration khởi tạo bảng gốc (departments, feedback)** | [`supabase/migrations/`](file:///d:/Workplace/hospital-quality-survey/supabase/migrations/) | **HIGH** | Không thể tái lập cơ sở dữ liệu trên môi trường mới nếu chỉ dựa vào migration hiện có (vì migration hiện tại chỉ sửa quyền và thêm procedure) | Viết và lưu trữ file migration khởi tạo hoàn chỉnh `00000000000000_init_schema.sql` vào repository |
| **05** | **Mất dữ liệu khảo sát khi Kiosk rớt mạng** | [`app/feedback/page.jsx:L188-L208`](file:///d:/Workplace/hospital-quality-survey/app/feedback/page.jsx#L188-L208) | **MEDIUM** | Mạng bệnh viện chập chờn sẽ khiến bệnh nhân nộp phiếu thất bại, gây ức chế và mất phản ánh của người bệnh | Cài đặt IndexedDB lưu trữ ngoại tuyến và tự động gửi lại (retry background) |
| **06** | **Tồn tại tệp tin thừa gây hiểu nhầm kiến trúc** | [`lib/feedbackStore.js`](file:///d:/Workplace/hospital-quality-survey/lib/feedbackStore.js), [`data/feedbacks.json`](file:///d:/Workplace/hospital-quality-survey/data/feedbacks.json) | **LOW** | Tệp tin không được sử dụng ở bất kỳ đâu nhưng vẫn tồn tại, dễ gây nhầm lẫn cho kỹ sư mới tiếp nhận dự án | Xóa bỏ hoặc ghi chú rõ ràng là deprecated scratch file |

---

## 8. BỘ TIÊU CHÍ NGHIỆM THU HỆ THỐNG (ACCEPTANCE CRITERIA)

Để nghiệm thu chính thức hệ thống Cổng Khảo sát Bệnh viện Quân y 7A đưa vào vận hành thực địa, cần thỏa mãn các tiêu chí sau:

### 8.1. Tiêu chí Phân hệ Kiosk Công cộng
1. **Thời gian phản hồi:** Mọi thao tác chạm cảm ứng (chọn khoa, bấm sao, chọn số NPS, bấm phím số) phản hồi tức thì dưới 100ms, không có hiện tượng giật/lag.
2. **Độ chính xác dữ liệu:**
   - Không cho phép gửi phiếu nếu chưa đánh giá đủ 5 nhóm tiêu chí (1-5 sao).
   - Điểm NPS bắt buộc phải nằm trong thang đo 0 đến 10.
   - Nhập số CCCD phải đúng 12 chữ số; mã bệnh nhân tối thiểu 3 ký tự.
3. **Bảo vệ màn hình Kiosk:**
   - Khi không có người tương tác tại bất kỳ bước khảo sát nào trong 60 giây, modal cảnh báo xuất hiện 15 giây; nếu không ai chạm tiếp tục, tự động reset form và quay về Trang chủ.
   - Sau khi hoàn thành gửi phiếu, màn hình cảm ơn hiển thị đếm ngược 12 giây rồi tự động xóa sạch dữ liệu phiên cũ và quay về Trang chủ.

### 8.2. Tiêu chí Phân hệ Quản trị Chất lượng
1. **Bảo mật truy cập:**
   - 100% các route `/admin` (trừ `/admin/login`) phải chặn người dùng vãng lai, chuyển hướng ngay về trang đăng nhập nếu chưa có phiên hợp lệ.
   - Chỉ tài khoản có email nằm trong danh sách whitelist cấu hình trên server mới được cấp quyền đăng nhập.
   - Phiên làm việc quản trị sử dụng HttpOnly Cookie, không lưu token nhạy cảm trong `localStorage` để chống tấn công XSS.
2. **Độ chính xác Dashboard & Báo cáo:**
   - Chỉ số CSAT trung bình toàn viện và của từng khoa phải khớp tuyệt đối theo công thức: `(Tổng điểm 5 tiêu chí / (Số phiếu * 25)) * 100`.
   - Biểu đồ Radar thể hiện điểm trung bình từng tiêu chí (1.0 đến 5.0 sao) chính xác với sai số < 0.1.
   - Thao tác "Đánh dấu đã giải quyết" phải cập nhật trạng thái `resolved` tức thì vào cơ sở dữ liệu và ghi nhận lịch sử vào bảng `feedback_status_history`.
   - File CSV xuất ra phải mở được trên phần mềm Microsoft Excel tiếng Việt mà không bị lỗi font (phải có ký tự BOM `\uFEFF`).

### 8.3. Tiêu chí Tầng Dữ liệu & Vận hành
1. **Toàn vẹn CSDL:** Bảng `feedback` và `feedback_status_history` không bị truy cập trái phép bởi các role ẩn danh bên ngoài (chính sách RLS và Revoke Privileges hoạt động chính xác).
2. **Khả năng chịu tải:** Chịu được ít nhất 10 Kiosk gửi dữ liệu đồng thời với độ trễ xử lý API < 500ms.

---

## 9. THỨ TỰ ƯU TIÊN XỬ LÝ TIẾP THEO (ACTION PRIORITY MATRIX)

Dựa trên tác động trực tiếp đến vận hành, rủi ro bảo mật và độ ổn định của hệ thống:

```
          TÁC ĐỘNG CAO
               ▲
               │  [TSK-101] Migration CSDL gốc
               │  [TSK-104] Fix IdleTimer Admin
               │  [TSK-102] Chuẩn hóa Dept Code
               │  [TSK-103] Trigger CSAT/NPS
               │
   ƯU TIÊN 2   │   ƯU TIÊN 1 (CRITICAL / HIGH)
   ────────────┼──────────────────────────────► KHẨN CẤP
               │  [TSK-105] Sửa UUID & Modal Note
               │  [TSK-201] Offline IndexedDB
               │  [TSK-401] Bộ Test tự động
               │  [TSK-301] Realtime Alerts
               │  [TSK-202] Xóa Dead Code
               │
          TÁC ĐỘNG THẤP
```

### Nhóm 1: Critical & High Priority (Thực hiện ngay)
1. **[CRITICAL] Sửa lỗi KioskIdleTimer trên trang Admin ([`components/KioskIdleTimer.jsx`](file:///d:/Workplace/hospital-quality-survey/components/KioskIdleTimer.jsx)):** Ngăn chặn việc ngắt phiên và chuyển hướng vô lý của cán bộ quản lý chất lượng.
2. **[CRITICAL] Viết Initial Migration Schema hoàn chỉnh:** Đảm bảo hệ thống có khả năng tái lập và deploy sang môi trường production của Bệnh viện Quân y 7A.
3. **[HIGH] Đồng bộ mã Khoa/Phòng giữa Client và API ([`app/api/feedback/route.js`](file:///d:/Workplace/hospital-quality-survey/app/api/feedback/route.js)):** Tránh lỗi từ chối lưu khảo sát do lệch mã khoa.
4. **[HIGH] Đảm bảo tính toán `csat_percent` & `nps_category`:** Thêm trigger hoặc gán giá trị tự động khi insert phiếu khảo sát.
5. **[HIGH] Sửa lỗi UUID và bổ sung form nhập note khi xử lý phản ánh ([`app/admin/AdminDashboardClient.jsx`](file:///d:/Workplace/hospital-quality-survey/app/admin/AdminDashboardClient.jsx)):** Hoàn thiện quy trình tiếp nhận và giải quyết phản ánh nóng.

### Nhóm 2: Medium Priority (Giai đoạn tiếp theo)
1. **Xây dựng cơ chế lưu tạm ngoại tuyến (Offline Queue):** Bảo vệ dữ liệu người bệnh khi Kiosk mất mạng LAN tạm thời.
2. **Cài đặt thư viện Vitest và viết Unit Test cho Core API & Helpers:** Tạo nền tảng kiểm thử tự động, tránh hồi quy lỗi (regression).
3. **Dọn dẹp mã nguồn thừa:** Xóa bỏ hoặc đóng gói lại [`lib/feedbackStore.js`](file:///d:/Workplace/hospital-quality-survey/lib/feedbackStore.js).
4. **Tối ưu dung lượng hình ảnh Kiosk:** Chuyển đổi các hình nền lớn sang WebP để tải Kiosk nhanh hơn.

### Nhóm 3: Low Priority & Future Enhancements (Mở rộng dài hạn)
1. **Thông báo Realtime qua Supabase Channels:** Bật popup âm thanh tức thì khi có phản ánh khẩn cấp.
2. **Phân quyền người dùng theo chuyên khoa:** Tách biệt dữ liệu quản lý giữa các khoa phòng.
3. **Bộ lọc thời gian nâng cao & Xuất Excel `.xlsx`:** Phục vụ báo cáo chuyên sâu định kỳ.

---

## 10. GIỚI HẠN KIỂM TRA & CÁC THÔNG TIN CHƯA THỂ XÁC MINH

Trong quá trình kiểm toán mã nguồn nội bộ, để tuân thủ tuyệt đối quy tắc an toàn hệ thống và bảo vệ thông tin mật:

1. **Thông tin bí mật môi trường (`.env.local`):**
   - Không đọc và không trích xuất các giá trị secret key, API key, JWT token, URL kết nối production hay địa chỉ email quản trị nhạy cảm.
   - Việc xác thực kết nối Supabase phụ thuộc vào sự hợp lệ của cấu hình trên môi trường triển khai thực tế.
2. **Cơ sở dữ liệu Supabase thực tế (Remote Database Instance):**
   - Toàn bộ kết luận về cơ sở dữ liệu dựa trên file migration duy nhất có trong repository ([`supabase/migrations/20261015000100_secure_feedback_and_status_history.sql`](file:///d:/Workplace/hospital-quality-survey/supabase/migrations/20261015000100_secure_feedback_and_status_history.sql)) và mã nguồn gọi hàm API.
   - Chưa thể kiểm tra trực tiếp trạng thái schema thực tế trên cloud xem đã được tạo bảng đầy đủ hay chưa, có trigger tính `csat_percent` riêng chưa được commit lên Git hay không.
3. **Môi trường chạy thực tế trên thiết bị Kiosk vật lý:**
   - Chưa thể kiểm tra trực tiếp hành vi cảm ứng đa điểm của phần cứng Kiosk đặt tại Bệnh viện Quân y 7A (như độ trễ cảm ứng của màn hình công nghiệp, độ phân giải màn hình Kiosk đặt đứng hay đặt ngang, trình duyệt kiosk mode Chromium).
4. **Bằng chứng kiểm thử tự động:**
   - Dự án hiện tại **chưa có test runner và test scripts**. Do đó, trạng thái kiểm thử của toàn bộ các module hiện được phân loại là `TODO` (chưa có kịch bản test tự động) hoặc chỉ dừng ở mức xác minh logic qua mã nguồn tĩnh.

---
*Tài liệu kiểm toán và lộ trình phát triển được lập bởi Senior Software Architect & Technical Project Manager.*
*Dự án: Cổng Khảo sát mức độ hài lòng người bệnh và Quản lý chất lượng – Bệnh viện Quân y 7A.*
