import { apiError, apiSuccess } from "@/app/lib/api/auth-response";
import { isRecord, isValidEmail, normalizeEmail, normalizeLocale } from "@/app/lib/api/auth-utils";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { createRouteHandlerClient } from "@/utils/supabase/server";

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
  const copy = getAuthCopy(normalizeLocale(body.locale));
  if (!isValidEmail(email)) {
    return apiError("invalid_email", copy.login.invalidEmail, 400);
  }

  const { supabase, applyToResponse } = await createRouteHandlerClient();
  const redirectTo = new URL("/api/auth/callback?flow=recovery", request.url).toString();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    console.error("Password reset request failed", error.code ?? error.message);
  }

  const response = apiSuccess({ sent: true });
  return applyToResponse(response);
}
