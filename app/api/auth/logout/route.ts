import { apiError, apiSuccess } from "@/app/lib/api/auth-response";
import { createRouteHandlerClient } from "@/utils/supabase/server";

export async function POST() {
  const { supabase, applyToResponse } = await createRouteHandlerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    const response = apiError("logout_failed", "ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง", 500);
    return applyToResponse(response, { clearPersistence: true, recovery: false });
  }

  const response = apiSuccess({ signedOut: true });
  return applyToResponse(response, { clearPersistence: true, recovery: false });
}
