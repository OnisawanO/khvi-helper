import { apiError, apiSuccess } from "@/app/lib/api/auth-response";
import { normalizeEmail, normalizeLocale, isRecord } from "@/app/lib/api/auth-utils";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { getRedirectPathByRole } from "@/app/lib/auth-types";
import { getAuthErrorMessage, getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("invalid_request", "คำขอไม่ถูกต้อง", 400);
  }

  if (!isRecord(body)) {
    return apiError("invalid_request", "คำขอไม่ถูกต้อง", 400);
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const locale = normalizeLocale(body.locale);
  const copy = getAuthCopy(locale);

  if (!email || !password) {
    return apiError("invalid_credentials", copy.login.genericError, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError("invalid_credentials", copy.login.genericError, 401);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return apiError("invalid_credentials", getAuthErrorMessage(error, "login", locale), 401);
  }

  const profileResult = await getCurrentUserProfile(supabase);
  if (!profileResult.profile) {
    await supabase.auth.signOut();
    return apiError("profile_unavailable", copy.login.profileError, 403);
  }

  return apiSuccess({
    user: profileResult.profile,
    redirectPath: getRedirectPathByRole(profileResult.profile.role),
  });
}
