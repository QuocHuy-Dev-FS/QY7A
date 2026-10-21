import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getQualityAdminFromRequest } from "@/lib/auth/admin";

const MAX_QUESTIONS = 20;
const ALLOWED_TYPES = ["star", "nps", "single", "multi", "text"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export async function GET(request, { params }) {
  const user = await getQualityAdminFromRequest(request);
  if (!user) return json({ success: false, message: "Chưa xác thực." }, 401);

  const id = params?.id;
  if (!UUID_RE.test(id)) return json({ success: false, message: "ID không hợp lệ." }, 400);

  try {
    const supabase = createAdminSupabaseClient();

    const [{ data: form, error: fErr }, { data: questions, error: qErr }] = await Promise.all([
      supabase.from("survey_forms").select("*").eq("id", id).maybeSingle(),
      supabase.from("survey_questions").select("*").eq("form_id", id).order("order_index"),
    ]);

    if (fErr || qErr) {
      console.error("admin survey form GET:", fErr?.message || qErr?.message);
      return json({ success: false, message: "Không thể tải bộ khảo sát." }, 500);
    }
    if (!form) return json({ success: false, message: "Không tìm thấy bộ khảo sát." }, 404);

    return json({ success: true, data: { ...form, questions: questions || [] } });
  } catch (err) {
    console.error("GET /api/admin/survey-forms/[id]:", err?.message);
    return json({ success: false, message: "Lỗi máy chủ." }, 500);
  }
}

export async function PUT(request, { params }) {
  const user = await getQualityAdminFromRequest(request);
  if (!user) return json({ success: false, message: "Chưa xác thực." }, 401);

  const id = params?.id;
  if (!UUID_RE.test(id)) return json({ success: false, message: "ID không hợp lệ." }, 400);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: "Dữ liệu JSON không hợp lệ." }, 400);
  }

  const title = stripHtml(body?.title ?? "");
  if (!title || title.length > 200)
    return json({ success: false, message: "Tiêu đề bộ khảo sát phải từ 1–200 ký tự." }, 400);

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

    const { data: existing, error: fetchErr } = await supabase
      .from("survey_forms")
      .select("id, version, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) return json({ success: false, message: "Không thể tải bộ khảo sát." }, 500);
    if (!existing) return json({ success: false, message: "Không tìm thấy bộ khảo sát." }, 404);

    // Nếu đã có phiếu, tạo version mới (bản sao) thay vì sửa trực tiếp
    const { count: feedbackCount } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("survey_form_id", id);

    let targetId = id;
    let newVersion = existing.version;

    if (feedbackCount > 0) {
      // Tạo bộ mới với version tăng
      newVersion = existing.version + 1;
      const { data: newForm, error: copyErr } = await supabase
        .from("survey_forms")
        .insert({
          scope: body.scope || "hospital",
          title,
          greeting,
          thank_you,
          status: "draft",
          version: newVersion,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (copyErr) return json({ success: false, message: "Không thể tạo phiên bản mới." }, 500);
      targetId = newForm.id;
    } else {
      const { error: updateErr } = await supabase
        .from("survey_forms")
        .update({ title, greeting, thank_you })
        .eq("id", id);

      if (updateErr) return json({ success: false, message: "Không thể cập nhật bộ khảo sát." }, 500);

      // Xóa câu hỏi cũ rồi insert lại
      await supabase.from("survey_questions").delete().eq("form_id", id);
    }

    if (questions.length > 0) {
      const rows = questions.map((q, i) => ({
        form_id: targetId,
        type: q.type,
        title: stripHtml(q.title),
        description: q.description ? stripHtml(q.description) : null,
        required: q.required !== false,
        order_index: Number.isInteger(q.order_index) ? q.order_index : i + 1,
        criteria_key: q.criteria_key ?? null,
        weight_csat: q.weight_csat ?? null,
        config: q.config ?? null,
      }));

      const { error: qInsertErr } = await supabase.from("survey_questions").insert(rows);
      if (qInsertErr) return json({ success: false, message: "Không thể lưu câu hỏi." }, 500);
    }

    return json({ success: true, data: { id: targetId, version: newVersion } });
  } catch (err) {
    console.error("PUT /api/admin/survey-forms/[id]:", err?.message);
    return json({ success: false, message: "Lỗi máy chủ." }, 500);
  }
}
