import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";
import { ProfileSettings } from "./profile-settings";

export const metadata: Metadata = {
  title: "Profile & Settings | KHVI",
  description: "Manage your KHVI profile and role-specific workspace settings.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profileResult = await getCurrentUserProfile(await createClient());
  if (!profileResult.profile) redirect("/#top");

  const accountDeletionConfigured = Boolean(
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return <ProfileSettings accountDeletionConfigured={accountDeletionConfigured} />;
}
