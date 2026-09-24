import { redirect } from "next/navigation";
import { getRedirectPathByRole, type UserRole } from "@/app/lib/auth-types";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";

export async function requireWorkspaceAccountRole(requiredRole: Extract<UserRole, "User" | "Interpreter">) {
  const supabase = await createClient();
  const profileResult = await getCurrentUserProfile(supabase);
  const profile = profileResult.profile;

  if (!profile) {
    redirect("/#top");
  }

  if (profile.role !== requiredRole) {
    redirect(getRedirectPathByRole(profile.role));
  }

  return { profile, supabase };
}
