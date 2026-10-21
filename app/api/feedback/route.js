import { NextResponse } from "next/server";

import { DEPARTMENTS } from "@/lib/hospitalData";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getQualityAdminFromRequest } from "@/lib/auth/admin";

const SCORE_KEYS = [
  "c1_access",
  "c2_transparency",
  "c3_facilities",
  "c4_attitude",
  "c5_outcome",
];

const ALLOWED_STATUSES = ["pending", "resolved"];

function json(body, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function normalize(value) {
  return String(value ?? "").trim().toLocaleLowerCase("vi");
}

function getDepartmentLabels() {
  if (!Array.isArray(DEPARTMENTS)) {
    return [];
  }

  return DEPARTMENTS.map((item) => {
    if (typeof item === "string") {
      return item;
    }

    return item?.name ?? item?.label ?? item?.code ?? item?.value ?? "";
  }).filter(Boolean);
}

function mapFeedback(row, departmentMap) {
  const departmentName =
    departmentMap.get(row.department_code) || row.department_code;

  const scores = {
    c1_access: row.c1_access,
    c2_transparency: row.c2_transparency,
    c3_facilities: row.c3_facilities,
    c4_attitude: row.c4_attitude,
    c5_outcome: row.c5_outcome,
  };

  return {
    id: row.id,
    department: departmentName,
    departmentCode: row.department_code,
    department_code: row.department_code,

    patientCode: row.patient_code,
    patient_code: row.patient_code,

    isAnonymous: row.is_anonymous,
    is_anonymous: row.is_anonymous,

    scores,

    ...scores,

    csat: row.csat_percent,
    csatPercent: row.csat_percent,
    csat_percent: row.csat_percent,

    nps: row.nps_score,
    npsScore: row.nps_score,
    nps_score: row.nps_score,
    npsCategory: row.nps_category,
    nps_category: row.nps_category,

    comment: row.comment,
    urgentFeedback: row.urgent_feedback,
    urgent_feedback: row.urgent_feedback,

    status: row.status,

    surveyFormId: row.survey_form_id ?? null,
    survey_form_id: row.survey_form_id ?? null,
    surveyFormVersion: row.survey_form_version ?? null,
    answers: row.answers ?? null,

    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

async function getDepartmentMap(supabase) {
  const { data, error } = await supabase
    .from("departments")
    .select("code, name")
    .eq("is_active", true);

  if (error) {
    const isAuthErr = /api.?key|invalid key|unauthorized/i.test(error.message ?? "");
    console.error(
      "getDepartmentMap DB error:",
      isAuthErr
        ? "Supabase auth error — kiểm tra SUPABASE_SERVICE_ROLE_KEY trong .env.local"
        : error.message
    );
    throw new Error("Không thể tải danh mục khoa/phòng.");
  }

  return new Map((data || []).map((item) => [item.code, item.name]));
}

export async function GET(request) {
  const user = await getQualityAdminFromRequest(request);

  if (!user) {
    return json(
      {
        success: false,
        message: "Bạn cần đăng nhập bằng tài khoản quản trị được cấp quyền.",
      },
      401
    );
  }

  try {
    const supabase = createAdminSupabaseClient();

    const [{ data, error }, departmentMap] = await Promise.all([
      supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false }),
      getDepartmentMap(supabase),
    ]);

    if (error) {
      console.error("Admin feedback query failed:", error.message);

      return json(
        {
          success: false,
          message: "Không thể tải dữ liệu khảo sát.",
        },
        500
      );
    }

    const feedbacks = (data || []).map((row) =>
      mapFeedback(row, departmentMap)
    );

    return json({
      success: true,
      data: feedbacks,
      total: feedbacks.length,
    });
  } catch (error) {
    console.error(
      "GET /api/feedback failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return json(
      {
        success: false,
        message: "Không thể tải dữ liệu khảo sát từ Supabase.",
      },
      500
    );
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseCommonFields(body) {
  const patientCodeInput = body.patientCode ?? body.patient_code ?? null;
  if (patientCodeInput !== null && typeof patientCodeInput !== "string") {
    return { error: json({ success: false, message: "Mã bệnh nhân không hợp lệ." }, 400) };
  }
  const patientCode = typeof patientCodeInput === "string" ? patientCodeInput.trim() : "";
  if (patientCode.length > 100) {
    return { error: json({ success: false, message: "Mã bệnh nhân vượt quá 100 ký tự." }, 400) };
  }
  if (body.isAnonymous !== undefined && typeof body.isAnonymous !== "boolean") {
    return { error: json({ success: false, message: "Giá trị ẩn danh không hợp lệ." }, 400) };
  }
  const isAnonymous = body.isAnonymous ?? !patientCode;
  if (!isAnonymous && !patientCode) {
    return { error: json({ success: false, message: "Vui lòng nhập mã bệnh nhân hoặc chọn gửi khảo sát ẩn danh." }, 400) };
  }
  const departmentInput =
    typeof body.department === "string" ? body.department.trim()
    : typeof body.departmentCode === "string" ? body.departmentCode.trim()
    : typeof body.department_code === "string" ? body.department_code.trim()
    : "";
  if (!departmentInput) {
    return { error: json({ success: false, message: "Vui lòng chọn khoa/phòng." }, 400) };
  }
  const comment = body.comment ?? "";
  const urgentFeedback = body.urgentFeedback ?? body.urgent_feedback ?? "";
  if (typeof comment !== "string") {
    return { error: json({ success: false, message: "Nội dung góp ý không hợp lệ." }, 400) };
  }
  if (typeof urgentFeedback !== "string") {
    return { error: json({ success: false, message: "Nội dung phản ánh không hợp lệ." }, 400) };
  }
  const trimmedComment = comment.trim();
  const trimmedUrgentFeedback = urgentFeedback.trim();
  if (trimmedComment.length > 5000) {
    return { error: json({ success: false, message: "Góp ý không được vượt quá 5.000 ký tự." }, 400) };
  }
  if (trimmedUrgentFeedback.length > 3000) {
    return { error: json({ success: false, message: "Phản ánh cần ưu tiên không được vượt quá 3.000 ký tự." }, 400) };
  }
  return { patientCode, isAnonymous, departmentInput, trimmedComment, trimmedUrgentFeedback };
}

async function resolveDepartment(supabase, departmentInput) {
  const { data: departments, error } = await supabase
    .from("departments")
    .select("code, name")
    .eq("is_active", true);
  if (error) {
    const isAuthErr = /api.?key|invalid key|unauthorized/i.test(error.message ?? "");
    console.error(
      "resolveDepartment DB error:",
      isAuthErr
        ? "Supabase auth error — kiểm tra SUPABASE_SERVICE_ROLE_KEY trong .env.local"
        : error.message
    );
    throw new Error("Không thể xác minh khoa/phòng.");
  }

  const inputNormalized = normalize(departmentInput);
  const list = departments || [];

  // (a) Khớp chính xác code DB
  let department = list.find((d) => normalize(d.code) === inputNormalized) || null;

  // (b) Khớp phần trước "_" của code DB; trả null nếu nhiều hơn 1 kết quả (tránh nhập nhằng)
  if (!department) {
    const prefixMatches = list.filter(
      (d) => normalize(d.code).split("_")[0] === inputNormalized
    );
    if (prefixMatches.length === 1) {
      department = prefixMatches[0];
    } else if (prefixMatches.length > 1) {
      console.warn(
        `resolveDepartment: input="${departmentInput}" khớp nhiều khoa qua tiền tố: [${prefixMatches.map((d) => d.code).join(",")}]`
      );
      return null;
    }
  }

  // (c) Khớp tên đã chuẩn hóa
  if (!department) {
    department = list.find((d) => normalize(d.name) === inputNormalized) || null;
  }

  // (d) Ánh xạ tĩnh: mã ngắn (hospitalData.code) hoặc value → code trong DB
  // Cần thiết khi DB dùng `value` làm code (KB→KhamBenh, CC→CapCuu, v.v.)
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
    console.warn(
      `resolveDepartment: input="${departmentInput}" (normalized="${inputNormalized}") không tìm thấy trong ${list.length} khoa từ DB. DB codes=[${list.map((d) => d.code).join(",")}]`
    );
    return null;
  }

  // Cross-check: code trong DB phải khớp với ít nhất một mục trong hospitalData.js
  const knownDepartment = DEPARTMENTS.some(
    (d) =>
      normalize(d.value) === normalize(department.code) ||
      normalize(d.code) === normalize(department.code)
  );
  if (!knownDepartment) {
    console.warn(
      `resolveDepartment: department code="${department.code}" name="${department.name}" không khớp dữ liệu tĩnh hospitalData.js. Kiểm tra seed DB.`
    );
    return null;
  }

  return department;
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return json(
      { success: false, message: "Yêu cầu phải sử dụng Content-Type application/json." },
      415
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: "Dữ liệu JSON không hợp lệ." }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ success: false, message: "Dữ liệu khảo sát không hợp lệ." }, 400);
  }

  const common = parseCommonFields(body);
  if (common.error) return common.error;
  const { patientCode, isAnonymous, departmentInput, trimmedComment, trimmedUrgentFeedback } = common;

  const surveyFormId = body.surveyFormId ?? body.survey_form_id ?? null;
  const isCustomForm = surveyFormId && UUID_RE.test(surveyFormId);

  try {
    const supabase = createAdminSupabaseClient();

    const department = await resolveDepartment(supabase, departmentInput);
    if (!department) {
      return json({ success: false, message: "Khoa/phòng không tồn tại hoặc hiện không hoạt động." }, 400);
    }

    // ── Nhánh 1: Bộ tùy chỉnh ──────────────────────────────────────────────
    if (isCustomForm) {
      const answers = body.answers ?? {};
      if (typeof answers !== "object" || Array.isArray(answers)) {
        return json({ success: false, message: "Câu trả lời không hợp lệ." }, 400);
      }

      const { data: form, error: formErr } = await supabase
        .from("survey_forms")
        .select("id, version, status")
        .eq("id", surveyFormId)
        .maybeSingle();

      if (formErr || !form) {
        return json({ success: false, message: "Bộ khảo sát không tồn tại." }, 400);
      }
      if (form.status === "archived") {
        return json({ success: false, message: "Bộ khảo sát đã lưu trữ, không thể gửi phiếu." }, 400);
      }

      const { data: rawQuestions, error: qErr } = await supabase
        .from("survey_questions")
        .select("id, type, required, order_index, criteria_key, weight_csat")
        .eq("form_id", surveyFormId)
        .order("order_index", { ascending: true })
        .order("id", { ascending: true });

      if (qErr) return json({ success: false, message: "Không thể tải câu hỏi khảo sát." }, 500);

      // Deduplicate by order_index (consistent with GET /api/survey-forms/active)
      const seenIdx = new Set();
      const questions = (rawQuestions || []).filter((q) => {
        if (seenIdx.has(q.order_index)) return false;
        seenIdx.add(q.order_index);
        return true;
      });

      // Validate câu bắt buộc
      for (const q of questions) {
        if (q.required && (answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === "")) {
          return json({ success: false, message: "Vui lòng trả lời đầy đủ các câu hỏi bắt buộc." }, 400);
        }
      }

      // Tính NPS
      const npsQuestion = (questions || []).find((q) => q.type === "nps");
      const npsScore = npsQuestion ? Number(answers[npsQuestion.id]) : null;
      if (npsQuestion && (!Number.isInteger(npsScore) || npsScore < 0 || npsScore > 10)) {
        return json({ success: false, message: "Điểm NPS phải là số nguyên từ 0 đến 10." }, 400);
      }

      // Map criteria_key → c1..c5 nếu có
      const criteriaScores = {};
      for (const q of (questions || [])) {
        if (q.criteria_key && q.type === "star" && answers[q.id] !== undefined) {
          criteriaScores[q.criteria_key] = Number(answers[q.id]);
        }
      }

      const { data: inserted, error: insertError } = await supabase
        .from("feedback")
        .insert({
          department_code: department.code,
          patient_code: isAnonymous ? null : patientCode,
          is_anonymous: isAnonymous,
          survey_form_id: surveyFormId,
          survey_form_version: form.version,
          answers,
          c1_access: criteriaScores["c1_access"] ?? null,
          c2_transparency: criteriaScores["c2_transparency"] ?? null,
          c3_facilities: criteriaScores["c3_facilities"] ?? null,
          c4_attitude: criteriaScores["c4_attitude"] ?? null,
          c5_outcome: criteriaScores["c5_outcome"] ?? null,
          nps_score: npsScore,
          comment: trimmedComment,
          urgent_feedback: trimmedUrgentFeedback,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Custom feedback insert failed:", insertError.message);
        return json({ success: false, message: "Không thể lưu khảo sát. Vui lòng thử lại." }, 500);
      }

      return json({ success: true, persisted: true, message: "Cảm ơn bạn đã gửi đánh giá.", data: { id: inserted.id } }, 201);
    }

    // ── Nhánh 2: Bộ mặc định (legacy) ──────────────────────────────────────
    const scores = body.scores;
    if (
      !scores ||
      typeof scores !== "object" ||
      Array.isArray(scores) ||
      Object.keys(scores).length !== SCORE_KEYS.length ||
      !SCORE_KEYS.every((key) => Object.prototype.hasOwnProperty.call(scores, key)) ||
      !SCORE_KEYS.every((key) => Number.isInteger(scores[key]) && scores[key] >= 1 && scores[key] <= 5)
    ) {
      return json({ success: false, message: "Mỗi tiêu chí khảo sát phải có điểm nguyên từ 1 đến 5." }, 400);
    }

    const npsScore = body.npsScore ?? body.nps_score ?? body.nps;
    if (!Number.isInteger(npsScore) || npsScore < 0 || npsScore > 10) {
      return json({ success: false, message: "Điểm NPS phải là số nguyên từ 0 đến 10." }, 400);
    }

    const { data: inserted, error: insertError } = await supabase
      .from("feedback")
      .insert({
        department_code: department.code,
        patient_code: isAnonymous ? null : patientCode,
        is_anonymous: isAnonymous,
        c1_access: scores.c1_access,
        c2_transparency: scores.c2_transparency,
        c3_facilities: scores.c3_facilities,
        c4_attitude: scores.c4_attitude,
        c5_outcome: scores.c5_outcome,
        nps_score: npsScore,
        comment: trimmedComment,
        urgent_feedback: trimmedUrgentFeedback,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Feedback insert failed:", insertError.message);
      return json({ success: false, message: "Không thể lưu khảo sát. Vui lòng thử lại." }, 500);
    }

    return json(
      { success: true, persisted: true, message: "Cảm ơn bạn đã gửi đánh giá.", data: { id: inserted.id } },
      201
    );
  } catch (error) {
    console.error("POST /api/feedback failed:", error instanceof Error ? error.message : "Unknown error");
    return json({ success: false, message: "Hệ thống chưa thể lưu khảo sát vào Supabase." }, 500);
  }
}

export async function PATCH(request) {
  const user = await getQualityAdminFromRequest(request);

  if (!user) {
    return json(
      {
        success: false,
        message: "Bạn không có quyền cập nhật phản hồi.",
      },
      401
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      { success: false, message: "Dữ liệu JSON không hợp lệ." },
      400
    );
  }

  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const status =
    typeof body?.status === "string" ? body.status.trim() : "";

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    return json(
      { success: false, message: "Mã phản hồi không hợp lệ." },
      400
    );
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return json(
      {
        success: false,
        message: "Trạng thái chỉ được là pending hoặc resolved.",
      },
      400
    );
  }

  const note =
    typeof body.note === "string" ? body.note.trim() : "";

  if (note.length > 2000) {
    return json(
      { success: false, message: "Ghi chú không được vượt quá 2.000 ký tự." },
      400
    );
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase.rpc(
      "update_feedback_status_with_history",
      {
        p_feedback_id: id,
        p_new_status: status,
        p_changed_by: user.id,
        p_note: note || null,
      }
    );

    if (error) {
      if (error.code === "P0002") {
        return json(
          { success: false, message: "Không tìm thấy phản hồi." },
          404
        );
      }

      console.error("Feedback status update failed:", error.message);

      return json(
        {
          success: false,
          message:
            "Không thể cập nhật trạng thái. Hãy xác nhận migration đã được áp dụng.",
        },
        500
      );
    }

    const updated = Array.isArray(data) ? data[0] : data;

    return json({
      success: true,
      message: "Đã cập nhật trạng thái phản hồi.",
      data: updated || null,
    });
  } catch (error) {
    console.error(
      "PATCH /api/feedback failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return json(
      {
        success: false,
        message: "Không thể cập nhật trạng thái phản hồi.",
      },
      500
    );
  }
}