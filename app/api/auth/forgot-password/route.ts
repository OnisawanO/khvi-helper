import { apiError, apiSuccess } from "@/app/lib/api/api-response";
import { isRecord, isValidEmail, normalizeEmail, normalizeLocale } from "@/app/lib/api/auth-utils";
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

  const email = normalizeEmail(body.email);
  const copy = getAuthCopy(normalizeLocale(body.locale));
  if (!isValidEmail(email)) {
    return apiError("invalid_email", copy.login.invalidEmail, 400);
  }

  const supabase = await createClient();
  const redirectTo = new URL("/reset-password", request.url).toString();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return apiError("reset_request_failed", copy.login.genericError, 500);
  }

  return apiSuccess({ sent: true });
}
