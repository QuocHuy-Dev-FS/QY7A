import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getQualityAdminFromRequest } from "@/lib/auth/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_TRANSITIONS = {
  draft: ["active", "archived"],
  active: ["archived"],
  archived: ["draft"],
};

function json(body, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function PATCH(request, { params }) {
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

  const newStatus = body?.status;
  if (!["draft", "active", "archived"].includes(newStatus))
    return json({ success: false, message: "Trạng thái không hợp lệ." }, 400);

  try {
    const supabase = createAdminSupabaseClient();

    const { data: existing, error: fetchErr } = await supabase
      .from("survey_forms")
      .select("id, scope, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) return json({ success: false, message: "Không thể tải bộ khảo sát." }, 500);
    if (!existing) return json({ success: false, message: "Không tìm thấy bộ khảo sát." }, 404);

    const allowed = ALLOWED_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      return json({
        success: false,
        message: `Không thể chuyển từ "${existing.status}" sang "${newStatus}".`,
      }, 400);
    }

    // Khi active: archive bộ đang active của cùng scope trước
    if (newStatus === "active") {
      await supabase
        .from("survey_forms")
        .update({ status: "archived" })
        .eq("scope", existing.scope)
        .eq("status", "active")
        .neq("id", id);
    }

    const { data: updated, error: updateErr } = await supabase
      .from("survey_forms")
      .update({ status: newStatus })
      .eq("id", id)
      .select("id, scope, status, version")
      .single();

    if (updateErr) {
      console.error("survey_forms status PATCH:", updateErr.message);
      return json({ success: false, message: "Không thể cập nhật trạng thái." }, 500);
    }

    return json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/admin/survey-forms/[id]/status:", err?.message);
    return json({ success: false, message: "Lỗi máy chủ." }, 500);
  }
}
