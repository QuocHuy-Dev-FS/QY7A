import { getSupabaseServerClient } from "@/lib/supabase/server";

export const ADMIN_SESSION_COOKIE = "quality_admin_access_token";

function getAllowedAdminEmails() {
  return (process.env.QUALITY_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
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

    if (error || !data?.user || !isQualityAdmin(data.user)) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
}

export async function getQualityAdminFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  if (!cookie) {
    return null;
  }

  const accessToken = cookie.slice(
    ADMIN_SESSION_COOKIE.length + 1
  );

  let token = accessToken;

  try {
    token = decodeURIComponent(accessToken);
  } catch {
    return null;
  }

  return verifyQualityAdminAccessToken(token);
}