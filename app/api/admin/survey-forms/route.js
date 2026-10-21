import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getQualityAdminFromRequest } from "@/lib/auth/admin";

const MAX_QUESTIONS = 20;
const ALLOWED_TYPES = ["star", "nps", "single", "multi", "text"];

function json(body, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function stripHtml(str) {
  return typeof str === "string" ? str.replace(/<[^>]*>/g, "").trim() : str;
}

function validateQuestion(q, index) {
  if (!q || typeof q !== "object") return `Câu hỏi #${index + 1} không hợp lệ.`;
  if (!ALLOWED_TYPES.includes(q.type)) return `Loại câu hỏi #${index + 1} không hợp lệ.`;
  const title = stripHtml(q.title ?? "");
  if (!title || title.length > 300) return `Tiêu đề câu hỏi #${index + 1} phải từ 1–300 ký tự.`;
  if (q.description && stripHtml(q.description).length > 1000)
    return `Mô tả câu hỏi #${index + 1} không vượt quá 1000 ký tự.`;
  if (q.weight_csat !== undefined && q.weight_csat !== null) {
    const w = Number(q.weight_csat);
    if (isNaN(w) || w < 0 || w > 1) return `Trọng số CSAT câu #${index + 1} phải từ 0 đến 1.`;
  }
  return null;
}

export async function GET(request) {
  const user = await getQualityAdminFromRequest(request);
  if (!user) return json({ success: false, message: "Chưa xác thực." }, 401);

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("survey_forms")
      .select("id, scope, title, status, version, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("admin survey_forms GET failed:", error.message);
      return json({ success: false, message: "Không thể tải danh sách bộ khảo sát." }, 500);
    }

    return json({ success: true, data: data || [] });
  } catch (err) {
    console.error("GET /api/admin/survey-forms:", err?.message);
    return json({ success: false, message: "Lỗi máy chủ." }, 500);
  }
}

export async function POST(request) {
  const user = await getQualityAdminFromRequest(request);
  if (!user) return json({ success: false, message: "Chưa xác thực." }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: "Dữ liệu JSON không hợp lệ." }, 400);
  }

  const title = stripHtml(body?.title ?? "");
  if (!title || title.length > 200)
    return json({ success: false, message: "Tiêu đề bộ khảo sát phải từ 1–200 ký tự." }, 400);

  const scope = body.scope || "hospital";
  if (!/^[a-z0-9_-]{1,50}$/.test(scope))
    return json({ success: false, message: "Scope không hợp lệ." }, 400);

  const greeting = body.greeting ? stripHtml(body.greeting).slice(0, 500) : null;
  const thank_you = body.thank_you ? stripHtml(body.thank_you).slice(0, 500) : null;

  const questions = Array.isArray(body.questions) ? body.questions : [];
  if (questions.length > MAX_QUESTIONS)
    return json({ success: false, message: `Tối đa ${MAX_QUESTIONS} câu hỏi mỗi bộ.` }, 400);

  for (let i = 0; i < questions.length; i++) {
    const err = validateQuestion(questions[i], i);
    if (err) return json({ success: false, message: err }, 400);
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data: form, error: formError } = await supabase
      .from("survey_forms")
      .insert({ title, scope, greeting, thank_you, status: "draft", created_by: user.id })
      .select("id, scope, title, status, version")
      .single();

    if (formError) {
      console.error("survey_forms INSERT:", formError.message);
      return json({ success: false, message: "Không thể tạo bộ khảo sát." }, 500);
    }

    if (questions.length > 0) {
      const rows = questions.map((q, i) => ({
        form_id: form.id,
        type: q.type,
        title: stripHtml(q.title),
        description: q.description ? stripHtml(q.description) : null,
        required: q.required !== false,
        order_index: Number.isInteger(q.order_index) ? q.order_index : i + 1,
        criteria_key: q.criteria_key ?? null,
        weight_csat: q.weight_csat ?? null,
        config: q.config ?? null,
      }));

      const { error: qError } = await supabase.from("survey_questions").insert(rows);
      if (qError) {
        console.error("survey_questions INSERT:", qError.message);
        await supabase.from("survey_forms").delete().eq("id", form.id);
        return json({ success: false, message: "Không thể lưu câu hỏi." }, 500);
      }
    }

    return json({ success: true, data: form }, 201);
  } catch (err) {
    console.error("POST /api/admin/survey-forms:", err?.message);
    return json({ success: false, message: "Lỗi máy chủ." }, 500);
  }
}
