import { apiError, apiSuccess } from "@/app/lib/api/auth-response";
import { createRouteHandlerClient } from "@/utils/supabase/server";
import { getRedirectPathByRole, type UserRole } from "@/app/lib/auth-types";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";

const FAST_LOGIN_ROLES: UserRole[] = ["User", "Interpreter", "Manager", "Admin"];

const credentialsByRole: Record<UserRole, { email: string | undefined; password: string | undefined }> = {
  User: {
    email: process.env.FAST_LOGIN_USER_EMAIL,
    password: process.env.FAST_LOGIN_USER_PASSWORD,
  },
  Interpreter: {
    email: process.env.FAST_LOGIN_INTERPRETER_EMAIL,
    password: process.env.FAST_LOGIN_INTERPRETER_PASSWORD,
  },
  Manager: {
    email: process.env.FAST_LOGIN_MANAGER_EMAIL,
    password: process.env.FAST_LOGIN_MANAGER_PASSWORD,
  },
  Admin: {
    email: process.env.FAST_LOGIN_ADMIN_EMAIL,
    password: process.env.FAST_LOGIN_ADMIN_PASSWORD,
  },
};

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return apiError("not_found", "Not found", 404);
  }

  let role: UserRole | undefined;
  try {
    const body = (await request.json()) as { role?: string };
    if (FAST_LOGIN_ROLES.includes(body.role as UserRole)) {
      role = body.role as UserRole;
    }
  } catch {
    return apiError("invalid_request", "คำขอไม่ถูกต้อง", 400);
  }

  if (!role) {
    return apiError("invalid_role", "ไม่พบบทบาทสำหรับ Fast Login", 400);
  }

  const credentials = credentialsByRole[role];
  if (!credentials.email || !credentials.password) {
    return apiError(
      "fast_login_not_configured",
      "ยังไม่ได้ตั้งค่าบัญชีทดสอบสำหรับ role " + role + " ใน .env.local",
      503,
    );
  }

  const { supabase, applyToResponse } = await createRouteHandlerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return apiError("fast_login_failed", "ไม่สามารถเข้าสู่ระบบด่วนได้ กรุณาตรวจสอบบัญชีทดสอบใน Supabase Auth", 401);
  }

  const profileResult = await getCurrentUserProfile(supabase);
  if (!profileResult.profile) {
    await supabase.auth.signOut();
    const response = apiError("profile_unavailable", profileResult.error || "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้", 403);
    return applyToResponse(response, { clearPersistence: true, recovery: false });
  }

  if (profileResult.profile.role !== role) {
    await supabase.auth.signOut();
    const response = apiError("role_mismatch", "บัญชีทดสอบนี้ไม่ตรงกับ role ที่เลือก", 403);
    return applyToResponse(response, { clearPersistence: true, recovery: false });
  }

  const response = apiSuccess({
    user: profileResult.profile,
    role,
    redirectPath: getRedirectPathByRole(role),
  });
  return applyToResponse(response, { persistence: "persistent", recovery: false });
}
