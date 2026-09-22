import { apiError, apiSuccess } from "@/app/lib/api/api-response";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return apiError("logout_failed", "ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง", 500);
  }

  return apiSuccess({ signedOut: true });
}
