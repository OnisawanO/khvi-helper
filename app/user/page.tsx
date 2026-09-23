import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WelcomeWorkspaceClient } from "@/app/components/welcome/welcome-workspace-client";
import { getRedirectPathByRole } from "@/app/lib/mock-auth";
import { loadReferenceCatalog } from "@/app/lib/real-reference-data";
import { loadRequesterRequests } from "@/app/lib/real-request-data";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = { title: "User Welcome | KHVI" };

export default async function UserWelcomePage() {
  const supabase = await createClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (!profile) redirect("/#top");
  if (profile.role !== "User") {
    redirect(getRedirectPathByRole(profile.role));
  }

  const [requesterRequests, referenceCatalog] = await Promise.all([
    loadRequesterRequests(supabase),
    loadReferenceCatalog(supabase),
  ]);

  return (
    <WelcomeWorkspaceClient
      viewRole="User"
      initialProfile={profile}
      initialRequesterRequests={requesterRequests}
      initialReferenceCatalog={referenceCatalog}
    />
  );
}
