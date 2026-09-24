import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { loadWorkspaceActivity } from "@/app/lib/real-request-data";
import { loadReferenceCatalog } from "@/app/lib/real-reference-data";
import { requireWorkspaceAccountRole } from "@/app/lib/workspace-auth";
import { RequestHelpForm } from "@/app/components/requests/request-help/request-help-form";

export const metadata: Metadata = {
  title: "Create a help request | K-HVI",
  description:
    "Pin a language help request with one language, one category, and the place where help is needed. Approved interpreters nearby can claim it.",
};

export const dynamic = "force-dynamic";

export default async function RequestHelpPage() {
  const { profile, supabase } = await requireWorkspaceAccountRole("User");
  const [referenceCatalog, activity] = await Promise.all([
    loadReferenceCatalog(supabase),
    loadWorkspaceActivity(supabase, profile),
  ]);
  const blockingTask = activity.requester ?? activity.assignment;

  return (
    <WorkspaceShell initialUser={profile} requiredRole="User" requiredAccountRole="User" alternatePath="/interpreter/find-requests#main-content">
      <RequestHelpForm
        languageOptions={referenceCatalog.languages}
        categoryOptions={referenceCatalog.categories}
        blockingTask={blockingTask ? { requestId: blockingTask.requestId, kind: activity.requester ? "request" : "assignment" } : null}
      />
    </WorkspaceShell>
  );
}
