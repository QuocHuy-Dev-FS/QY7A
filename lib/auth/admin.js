import { getSupabaseServerClient } from "@/lib/supabase/server";

export const ADMIN_SESSION_COOKIE = "quality_admin_access_token";

function getAllowedAdminEmails() {
  return (process.env.QUALITY_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

export function isQualityAdmin(user) {
  if (!user?.email) {
    return false;
  }

  const allowedEmails = getAllowedAdminEmails();

  return (
    allowedEmails.length > 0 &&
    allowedEmails.includes(user.email.trim().toLowerCase())
  );
}

export async function verifyQualityAdminAccessToken(accessToken) {
  if (!accessToken || typeof accessToken !== "string") {
    return null;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user) {
      if (error) {
        console.warn("verifyQualityAdminAccessToken: Supabase getUser failed:", error.message);
      }
      return null;
    }

    if (!isQualityAdmin(data.user)) {
      console.warn(
        `verifyQualityAdminAccessToken: User "${data.user.email}" not permitted by QUALITY_ADMIN_EMAILS.`
      );
      return null;
    }

    return data.user;
  } catch (err) {
    console.error("verifyQualityAdminAccessToken exception:", err?.message || err);
    return null;
  }
}

export async function getQualityAdminFromRequest(request) {
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
    return null;
  }

  let token = cookieValue;

  try {
    token = decodeURIComponent(cookieValue);
  } catch {
    return null;
  }

  return verifyQualityAdminAccessToken(token);
}