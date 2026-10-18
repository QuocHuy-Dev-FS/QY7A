import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyQualityAdminAccessToken,
} from "@/lib/auth/admin";

function createResponse(body, status = 200) {
  const response = NextResponse.json(body, { status });

  response.headers.set("Cache-Control", "no-store");

  return response;
}

function clearSessionCookie(response) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET(request) {
  const cookieValue =
    request?.cookies?.get?.(ADMIN_SESSION_COOKIE)?.value ||
    (() => {
      const cookieHeader = request?.headers?.get?.("cookie") || "";
      const cookie = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
      return cookie ? cookie.slice(ADMIN_SESSION_COOKIE.length + 1) : null;
    })();

  if (!cookieValue) {
    return createResponse(
      { success: false, authenticated: false },
      401
    );
  }

  let accessToken;

  try {
    accessToken = decodeURIComponent(cookieValue);
  } catch {
    return clearSessionCookie(
      createResponse(
        { success: false, authenticated: false },
        401
      )
    );
  }

  const user = await verifyQualityAdminAccessToken(accessToken);

  if (!user) {
    return clearSessionCookie(
      createResponse(
        { success: false, authenticated: false },
        401
      )
    );
  }

  return createResponse({
    success: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return createResponse(
      { success: false, message: "Dữ liệu gửi lên không hợp lệ." },
      400
    );
  }

  if (body?.action === "logout") {
    return clearSessionCookie(
      createResponse({
        success: true,
        message: "Đã đăng xuất.",
      })
    );
  }

  const accessToken = body?.accessToken;

  if (
    typeof accessToken !== "string" ||
    accessToken.length === 0 ||
    accessToken.length > 10000
  ) {
    return createResponse(
      { success: false, message: "Token đăng nhập không hợp lệ." },
      400
    );
  }

  const user = await verifyQualityAdminAccessToken(accessToken);

  if (!user) {
    return clearSessionCookie(
      createResponse(
        {
          success: false,
          message:
            "Tài khoản chưa được cấp quyền quản trị hoặc phiên đăng nhập không hợp lệ.",
        },
        403
      )
    );
  }

  const response = createResponse({
    success: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}