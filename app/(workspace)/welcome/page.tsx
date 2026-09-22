import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";
import { getRedirectPathByRole } from "@/app/lib/mock-auth";
import {
  loadRequesterRequests,
  loadInterpreterAssignments,
  loadOpenInterpreterRequests,
  type OpenRequestsDiagnostic,
} from "@/app/lib/real-request-data";
import { loadReferenceCatalog } from "@/app/lib/real-reference-data";
import type { ReferenceCatalog } from "@/app/lib/reference-catalog";
import type { HelpRequest } from "@/app/lib/mock-requests";
import { Welcome } from "./welcome";

export const metadata: Metadata = { title: "Welcome | KHVI" };

export default async function WelcomePage() {
  const supabase = await createClient();
  const profileResult = await getCurrentUserProfile(supabase);
  const profile = profileResult.profile;

  if (!profile) {
    redirect("/#top");
  }

  if (profile.role === "Manager" || profile.role === "Admin") {
    redirect(getRedirectPathByRole(profile.role));
  }

  let openRequests: HelpRequest[] = [];
  let assignments: HelpRequest[] = [];
  let requesterRequests: HelpRequest[] = [];
  let diagnostic: OpenRequestsDiagnostic = { status: "success", message: "OK" };
  let referenceCatalog: ReferenceCatalog = { languages: [], categories: [] };

  if (profile.role === "Interpreter") {
    const [openRes, assignRes, reqRes, catalog] = await Promise.all([
      loadOpenInterpreterRequests(supabase),
      loadInterpreterAssignments(supabase),
      loadRequesterRequests(supabase),
      loadReferenceCatalog(supabase),
    ]);
    openRequests = openRes.requests;
    diagnostic = openRes.diagnostic;
    assignments = assignRes;
    requesterRequests = reqRes;
    referenceCatalog = catalog;
  } else {
    [requesterRequests, referenceCatalog] = await Promise.all([
      loadRequesterRequests(supabase),
      loadReferenceCatalog(supabase),
    ]);
  }

  return (
    <Welcome
      initialProfile={profile}
      initialOpenRequests={openRequests}
      initialAssignments={assignments}
      initialRequesterRequests={requesterRequests}
      initialDiagnostic={diagnostic}
      initialReferenceCatalog={referenceCatalog}
    />
  );
}
