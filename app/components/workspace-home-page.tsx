import { redirect } from "next/navigation";
import { getRedirectPathByRole, type UserRole } from "@/app/lib/auth-types";
import {
  loadInterpreterAssignments,
  loadOpenInterpreterRequests,
  loadRequesterRequests,
  type OpenRequestsDiagnostic,
} from "@/app/lib/real-request-data";
import { loadReferenceCatalog } from "@/app/lib/real-reference-data";
import { loadMyInterpreterRating, type InterpreterRating } from "@/app/lib/real-interpreter-rating";
import type { ReferenceCatalog } from "@/app/lib/reference-catalog";
import type { HelpRequest } from "@/app/lib/request-types";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { createClient } from "@/utils/supabase/server";
import { Welcome } from "./workspace-welcome";

export async function WorkspaceHomePage({ requiredRole }: { requiredRole: Extract<UserRole, "User" | "Interpreter"> }) {
  const supabase = await createClient();
  const profileResult = await getCurrentUserProfile(supabase);
  const profile = profileResult.profile;

  if (!profile) {
    redirect("/#top");
  }

  if (profile.role !== requiredRole) {
    redirect(getRedirectPathByRole(profile.role));
  }

  let openRequests: HelpRequest[] = [];
  let assignments: HelpRequest[] = [];
  let requesterRequests: HelpRequest[] = [];
  let diagnostic: OpenRequestsDiagnostic = { status: "success", message: "OK" };
  let referenceCatalog: ReferenceCatalog = { languages: [], categories: [] };
  let interpreterRating: InterpreterRating | null = null;

  if (profile.role === "Interpreter") {
    const [openRes, assignRes, requestRes, catalog, ratingResult] = await Promise.all([
      loadOpenInterpreterRequests(supabase, profile),
      loadInterpreterAssignments(supabase, { profile }),
      loadRequesterRequests(supabase, { profile }),
      loadReferenceCatalog(supabase),
      loadMyInterpreterRating(supabase, profile.userId).catch(() => null),
    ]);
    openRequests = openRes.requests;
    diagnostic = openRes.diagnostic;
    assignments = assignRes;
    requesterRequests = requestRes;
    referenceCatalog = catalog;
    interpreterRating = ratingResult;
  } else {
    [requesterRequests, referenceCatalog] = await Promise.all([
      loadRequesterRequests(supabase, { profile }),
      loadReferenceCatalog(supabase),
    ]);
  }

  return (
    <Welcome
      requiredRole={requiredRole}
      initialProfile={profile}
      initialOpenRequests={openRequests}
      initialAssignments={assignments}
      initialRequesterRequests={requesterRequests}
      initialDiagnostic={diagnostic}
      initialReferenceCatalog={referenceCatalog}
      initialInterpreterRating={interpreterRating}
    />
  );
}
