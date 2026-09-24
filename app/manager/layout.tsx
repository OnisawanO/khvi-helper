import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getRedirectPathByRole } from "@/app/lib/auth-types";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function ManagerLayout({ children }: { children: ReactNode }) {
  const profileResult = await getCurrentUserProfile(await createClient());
  const profile = profileResult.profile;

  if (!profile) redirect("/#top");
  if (profile.role !== "Manager" && profile.role !== "Admin") {
    redirect(getRedirectPathByRole(profile.role));
  }

  return children;
}
