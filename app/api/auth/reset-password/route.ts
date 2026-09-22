import { apiError, apiSuccess } from "@/app/lib/api/api-response";
import { isRecord, normalizeLocale } from "@/app/lib/api/auth-utils";
import { getAuthCopy } from "@/app/lib/auth-copy";
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

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return apiError("reset_session_required", copy.login.genericError, 401);
  }

  return apiSuccess({ updated: true });
}
