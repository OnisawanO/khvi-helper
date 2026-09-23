import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WelcomeWorkspaceClient } from "@/app/components/welcome/welcome-workspace-client";
import { getRedirectPathByRole } from "@/app/lib/mock-auth";
import { loadMyInterpreterRating } from "@/app/lib/real-interpreter-rating";
import { loadReferenceCatalog } from "@/app/lib/real-reference-data";
import {
  loadInterpreterAssignments,
  loadOpenInterpreterRequests,
  loadRequesterRequests,
} from "@/app/lib/real-request-data";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = { title: "Interpreter Welcome | KHVI" };

export default async function InterpreterWelcomePage() {
  const supabase = await createClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (!profile) redirect("/#top");
  if (profile.role !== "Interpreter") {
    redirect(getRedirectPathByRole(profile.role));
  }

  const [openResult, assignments, requesterRequests, referenceCatalog, interpreterRating] = await Promise.all([
    loadOpenInterpreterRequests(supabase),
    loadInterpreterAssignments(supabase),
    loadRequesterRequests(supabase),
    loadReferenceCatalog(supabase),
    loadMyInterpreterRating(supabase, profile.userId).catch(() => null),
  ]);

  return (
    <WelcomeWorkspaceClient
      viewRole="Interpreter"
      inlineInterpreterModes
      initialProfile={profile}
      initialOpenRequests={openResult.requests}
      initialAssignments={assignments}
      initialRequesterRequests={requesterRequests}
      initialDiagnostic={openResult.diagnostic}
      initialReferenceCatalog={referenceCatalog}
      initialInterpreterRating={interpreterRating}
    />
  );
}
