import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getRedirectPathByRole, type UserRole } from "@/app/lib/auth-types";
import AdminPageClient from "./admin-page-client";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/#top");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, is_locked")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error || !profile || profile.is_locked) {
    redirect("/#top");
  }

  if (profile.role !== "Admin") {
    redirect(getRedirectPathByRole(profile.role as UserRole));
  }

  return <AdminPageClient />;
}
