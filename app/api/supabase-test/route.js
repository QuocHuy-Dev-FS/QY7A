
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        success: false,
        message: "Endpoint chỉ dùng để kiểm tra nội bộ.",
      },
      { status: 404 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("departments")
      .select("code")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Truy vấn Supabase thất bại.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kết nối Supabase thành công.",
      departmentTableAccessible: true,
      sampleCount: data.length,
    });
  } catch (error) {
    console.error("Supabase configuration error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể khởi tạo kết nối Supabase.",
      },
      { status: 500 }
    );
  }
}
