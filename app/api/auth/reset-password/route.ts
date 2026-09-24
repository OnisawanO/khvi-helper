import { apiError, apiSuccess } from "@/app/lib/api/auth-response";
import { isRecord, normalizeLocale } from "@/app/lib/api/auth-utils";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { createRouteHandlerClient } from "@/utils/supabase/server";
import { AUTH_RECOVERY_COOKIE } from "@/utils/supabase/auth-persistence";
import { cookies } from "next/headers";

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

  const locale = normalizeLocale(body.locale);
  const copy = getAuthCopy(locale);
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (password.length < 8) {
    return apiError("invalid_password", copy.validation.passwordMin, 400);
  }
  if (password !== confirmPassword) {
    return apiError("passwords_mismatch", copy.validation.passwordsMismatch, 400);
  }

  const cookieStore = await cookies();
  const { supabase, applyToResponse } = await createRouteHandlerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || cookieStore.get(AUTH_RECOVERY_COOKIE)?.value !== "1") {
    const response = apiError("reset_session_required", copy.login.genericError, 401);
    return applyToResponse(response);
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    const response = apiError("reset_session_required", copy.login.genericError, 401);
    return applyToResponse(response);
  }

  await supabase.auth.signOut();
  const response = apiSuccess({ updated: true });
  return applyToResponse(response, { clearPersistence: true, recovery: false });
}
