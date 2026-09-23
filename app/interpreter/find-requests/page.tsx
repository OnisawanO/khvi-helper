import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { loadOpenInterpreterRequests, loadWorkspaceActivity } from "@/app/lib/real-request-data";
import { requireWorkspaceAccountRole } from "@/app/lib/workspace-auth";
import { FindRequestsList } from "./find-requests-list";

export const metadata: Metadata = {
  title: "Find requests | K-HVI",
  description: "Review open language-help requests as a volunteer interpreter.",
};

export default async function FindRequestsPage() {
  const { supabase } = await requireWorkspaceAccountRole("Interpreter");
  const [{ requests, diagnostic }, activity] = await Promise.all([
    loadOpenInterpreterRequests(supabase),
    loadWorkspaceActivity(supabase),
  ]);

  return (
    <WorkspaceShell requiredRole="Interpreter" requiredAccountRole="Interpreter" alternatePath="/interpreter/request-help#main-content">
      <FindRequestsList
        initialRequests={requests}
        diagnostic={diagnostic}
        workspaceBlocked={Boolean(activity.requester || activity.assignment)}
      />
    </WorkspaceShell>
  );
}
