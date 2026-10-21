import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function json(body, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function sanitizeForm(form, questions) {
  return {
    id: form.id,
    scope: form.scope,
    title: form.title,
    version: form.version,
    greeting: form.greeting ?? null,
    thank_you: form.thank_you ?? null,
    questions: questions.map((q) => ({
      id: q.id,
      type: q.type,
      title: q.title,
      description: q.description ?? null,
      required: q.required,
      order_index: q.order_index,
      criteria_key: q.criteria_key ?? null,
      weight_csat: q.weight_csat ?? null,
      config: q.config ?? null,
    })),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") || "hospital";

  if (!/^[a-z0-9_-]{1,50}$/.test(scope)) {
    return json({ success: false, message: "Scope không hợp lệ." }, 400);
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data: form, error: formError } = await supabase
      .from("survey_forms")
      .select("id, scope, title, version, greeting, thank_you")
      .eq("scope", scope)
      .eq("status", "active")
      .maybeSingle();

    if (formError) {
      const isAuthErr = /api.?key|invalid key|unauthorized/i.test(formError.message ?? "");
      console.error(
        "survey-forms/active GET failed:",
        isAuthErr
          ? "Supabase auth error — kiểm tra SUPABASE_SERVICE_ROLE_KEY trong .env.local"
          : formError.message
      );
      return json({ success: false, message: "Không thể tải bộ khảo sát." }, 500);
    }

    if (!form) {
      return json({ success: false, message: "Không có bộ khảo sát đang áp dụng." }, 404);
    }

    const { data: questions, error: qError } = await supabase
      .from("survey_questions")
      .select("id, type, title, description, required, order_index, criteria_key, weight_csat, config")
      .eq("form_id", form.id)
      .order("order_index", { ascending: true })
      .order("id", { ascending: true });

    if (qError) {
      console.error("survey_questions GET failed:", qError.message);
      return json({ success: false, message: "Không thể tải câu hỏi khảo sát." }, 500);
    }

    // Guard against duplicate rows from multiple seed runs (no unique constraint on order_index)
    const seen = new Set();
    const uniqueQuestions = (questions || []).filter((q) => {
      if (seen.has(q.order_index)) return false;
      seen.add(q.order_index);
      return true;
    });

    return json({ success: true, data: sanitizeForm(form, uniqueQuestions) });
  } catch (err) {
    console.error("GET /api/survey-forms/active failed:", err?.message || err);
    return json({ success: false, message: "Lỗi máy chủ." }, 500);
  }
}
