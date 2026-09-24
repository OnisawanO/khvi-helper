import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getRedirectPathByRole } from "@/app/lib/auth-types";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import AdminPageClient from "./admin-page-client";

export default async function AdminPage() {
  const supabase = await createClient();
  const profileResult = await getCurrentUserProfile(supabase);
  const profile = profileResult.profile;

  if (!profile) {
    redirect("/#top");
  }

  if (profile.role !== "Admin") {
    redirect(getRedirectPathByRole(profile.role));
  }

  return <AdminPageClient initialUser={{ ...profile, role: "Admin" }} />;
}
