/**
 * Kiểm tra nhanh logic resolveDepartment với 13 khoa.
 * Chạy: node scripts/test-resolve-department.mjs
 * Không cần test runner, không kết nối DB.
 */

// ── Dữ liệu tĩnh từ lib/hospitalData.js ─────────────────────────────────────

const DEPARTMENTS = [
  { value: "KhamBenh",          code: "KB",  label: "Khoa Khám Bệnh" },
  { value: "CapCuu",            code: "CC",  label: "Khoa Cấp Cứu" },
  { value: "B1_CTCH",           code: "B1",  label: "Khoa B1 - Chấn thương Chỉnh hình" },
  { value: "B2_NgoaiChung",     code: "B2",  label: "Khoa B2 - Ngoại Chung" },
  { value: "A1_TimThan",        code: "A1",  label: "Khoa A1 - Nội Tim - Thận - Khớp & Lọc Máu" },
  { value: "A2_TieuHoa",        code: "A2",  label: "Khoa A2 - Nội Tiêu Hóa & Bệnh Máu" },
  { value: "A3_ThanKinh",       code: "A3",  label: "Khoa A3 - Nội Thần Kinh" },
  { value: "A4_TruyenNhiem",    code: "A4",  label: "Khoa A4 - Truyền Nhiễm & Da Liễu" },
  { value: "A5_YhocCoTruyen",   code: "A5",  label: "Khoa A5 - Y Học Cổ Truyền" },
  { value: "SanAnDong",         code: "AD",  label: "Khoa Phụ Sản An Đông" },
  { value: "LienChuyenKhoa",    code: "LCK", label: "Khoa Mắt - Tai Mũi Họng - Răng Hàm Mặt" },
  { value: "CDHA_XetNghiem",    code: "CLS", label: "Khoa Chẩn Đoán Hình Ảnh & Xét Nghiệm" },
  { value: "KyThuatCao",        code: "KTC", label: "Khu Điều Trị Kỹ Thuật Cao" },
];

// DB thực tế dùng `value` làm code (theo log lỗi production)
const DB_DEPARTMENTS = DEPARTMENTS.map((d) => ({
  code: d.value,
  name: d.label,
}));

// ── Inline resolveDepartment (logic từ app/api/feedback/route.js) ─────────────

function normalize(value) {
  return String(value ?? "").trim().toLocaleLowerCase("vi");
}

function getDepartmentLabels() {
  return DEPARTMENTS.map(
    (item) => item?.name ?? item?.label ?? item?.code ?? item?.value ?? ""
  ).filter(Boolean);
}

function resolveDepartmentSync(departmentInput, list) {
  const inputNormalized = normalize(departmentInput);

  // (a) Khớp chính xác code DB
  let department = list.find((d) => normalize(d.code) === inputNormalized) || null;

  // (b) Khớp phần trước "_" — null nếu nhiều hơn 1 kết quả
  if (!department) {
    const prefixMatches = list.filter(
      (d) => normalize(d.code).split("_")[0] === inputNormalized
    );
    if (prefixMatches.length === 1) {
      department = prefixMatches[0];
    } else if (prefixMatches.length > 1) {
      return { department: null, reason: `prefix_ambiguous: ${prefixMatches.map((d) => d.code).join(",")}` };
    }
  }

  // (c) Khớp tên đã chuẩn hóa
  if (!department) {
    department = list.find((d) => normalize(d.name) === inputNormalized) || null;
  }

  // (d) Ánh xạ tĩnh: hospitalData.code/value → DB code
  if (!department) {
    const staticDept = DEPARTMENTS.find(
      (d) =>
        normalize(d.code) === inputNormalized ||
        normalize(d.value) === inputNormalized
    );
    if (staticDept) {
      const targetCode = normalize(staticDept.value);
      department = list.find((d) => normalize(d.code) === targetCode) || null;
    }
  }

  if (!department) {
    return { department: null, reason: "not_found" };
  }

  // Cross-check
  const knownDepartment = DEPARTMENTS.some(
    (d) =>
      normalize(d.value) === normalize(department.code) ||
      normalize(d.code) === normalize(department.code)
  );
  if (!knownDepartment) {
    return { department: null, reason: `crosscheck_fail: code=${department.code}` };
  }

  return { department, reason: null };
}

// ── Kịch bản kiểm tra ────────────────────────────────────────────────────────

const TEST_CASES = [
  // [input, expectedValue, mô tả]
  // Mã ngắn (form gửi dept.code)
  ["KB",  "KhamBenh",       "Mã ngắn KB"],
  ["CC",  "CapCuu",         "Mã ngắn CC"],
  ["B1",  "B1_CTCH",        "Mã ngắn B1"],
  ["B2",  "B2_NgoaiChung",  "Mã ngắn B2"],
  ["A1",  "A1_TimThan",     "Mã ngắn A1"],
  ["A2",  "A2_TieuHoa",     "Mã ngắn A2"],
  ["A3",  "A3_ThanKinh",    "Mã ngắn A3"],
  ["A4",  "A4_TruyenNhiem", "Mã ngắn A4"],
  ["A5",  "A5_YhocCoTruyen","Mã ngắn A5"],
  ["AD",  "SanAnDong",      "Mã ngắn AD"],
  ["LCK", "LienChuyenKhoa", "Mã ngắn LCK"],
  ["CLS", "CDHA_XetNghiem", "Mã ngắn CLS"],
  ["KTC", "KyThuatCao",     "Mã ngắn KTC"],
  // Mã dài (dept.value = DB code) — fallback khi selectedDeptObj null
  ["KhamBenh",       "KhamBenh",       "Mã dài KhamBenh"],
  ["A1_TimThan",     "A1_TimThan",     "Mã dài A1_TimThan"],
  ["CDHA_XetNghiem", "CDHA_XetNghiem", "Mã dài CDHA_XetNghiem"],
  ["LienChuyenKhoa", "LienChuyenKhoa", "Mã dài LienChuyenKhoa"],
  // Chữ hoa/thường
  ["kb",  "KhamBenh",       "Lowercase kb"],
  ["a1",  "A1_TimThan",     "Lowercase a1"],
  ["KtC", "KyThuatCao",     "Mixed case KtC"],
  ["khambenh", "KhamBenh",  "Lowercase khambenh"],
  // Tên đầy đủ (step c)
  ["Khoa Khám Bệnh",            "KhamBenh",    "Tên đầy đủ KB"],
  ["Khoa Cấp Cứu",              "CapCuu",      "Tên đầy đủ CC"],
  ["Khu Điều Trị Kỹ Thuật Cao", "KyThuatCao", "Tên đầy đủ KTC"],
  // Không hợp lệ — phải trả null
  ["XYZ",    null, "Mã không tồn tại"],
  ["",       null, "Chuỗi rỗng"],
  ["   ",    null, "Khoảng trắng"],
];

// ── Chạy kiểm tra ─────────────────────────────────────────────────────────────

let pass = 0;
let fail = 0;

console.log("=".repeat(72));
console.log("resolveDepartment — Test Suite (13 khoa × nhiều kiểu input)");
console.log("=".repeat(72));

for (const [input, expectedValue, desc] of TEST_CASES) {
  const { department, reason } = resolveDepartmentSync(input, DB_DEPARTMENTS);
  const got = department?.code ?? null;
  const ok = got === expectedValue;

  if (ok) {
    pass++;
    console.log(`  PASS  [${desc}]  input="${input}" → code="${got}"`);
  } else {
    fail++;
    console.log(
      `  FAIL  [${desc}]  input="${input}" → got="${got}" (expected="${expectedValue}"${reason ? `, reason=${reason}` : ""})`
    );
  }
}

console.log("-".repeat(72));
console.log(`Kết quả: ${pass} PASS / ${fail} FAIL / ${TEST_CASES.length} tổng`);
console.log("=".repeat(72));

if (fail > 0) {
  process.exit(1);
}
