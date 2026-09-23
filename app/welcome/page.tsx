import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";
import { getRedirectPathByRole } from "@/app/lib/mock-auth";

export const metadata: Metadata = { title: "Redirecting | KHVI" };

export default async function WelcomePage() {
  const supabase = await createClient();
  const profileResult = await getCurrentUserProfile(supabase);
  const profile = profileResult.profile;

  if (!profile) redirect("/#top");
  redirect(getRedirectPathByRole(profile.role));
}
