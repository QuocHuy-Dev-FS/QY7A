import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getQualityAdminFromRequest } from "@/lib/auth/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request, { params }) {
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

    if (fErr || qErr) return json({ success: false, message: "Không thể tải bộ khảo sát gốc." }, 500);
    if (!form) return json({ success: false, message: "Không tìm thấy bộ khảo sát." }, 404);

    const { data: newForm, error: insertErr } = await supabase
      .from("survey_forms")
      .insert({
        scope: form.scope,
        title: `${form.title} (bản sao)`,
        greeting: form.greeting,
        thank_you: form.thank_you,
        status: "draft",
        version: 1,
        created_by: user.id,
      })
      .select("id, title, status")
      .single();

    if (insertErr) return json({ success: false, message: "Không thể nhân bản bộ khảo sát." }, 500);

    if (questions && questions.length > 0) {
      const rows = questions.map(({ id: _id, created_at: _ca, form_id: _fi, ...q }) => ({
        ...q,
        form_id: newForm.id,
      }));
      const { error: qInsertErr } = await supabase.from("survey_questions").insert(rows);
      if (qInsertErr) {
        await supabase.from("survey_forms").delete().eq("id", newForm.id);
        return json({ success: false, message: "Không thể sao chép câu hỏi." }, 500);
      }
    }

    return json({ success: true, data: newForm }, 201);
  } catch (err) {
    console.error("POST /api/admin/survey-forms/[id]/clone:", err?.message);
    return json({ success: false, message: "Lỗi máy chủ." }, 500);
  }
}
