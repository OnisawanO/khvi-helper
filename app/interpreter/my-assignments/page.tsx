import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import type { ApplicationStatus } from "@/app/lib/interpreter-application";
import { loadMyInterpreterApplication } from "@/app/lib/real-interpreter-application-data";
import { loadInterpreterAssignments, loadOpenInterpreterRequests, loadWorkspaceActivity } from "@/app/lib/real-request-data";
import { resolveStatusFilter } from "@/app/lib/mock-requests";
import { requireWorkspaceAccountRole } from "@/app/lib/workspace-auth";
import { MyAssignmentsList } from "./my-assignments-list";

export const metadata: Metadata = {
  title: "My assignments | K-HVI",
  description: "Track language-help assignments claimed by a volunteer interpreter.",
};

export default async function MyAssignmentsPage(props: PageProps<"/interpreter/my-assignments">) {
  const { status } = await props.searchParams;
  const activeFilter = resolveStatusFilter(status);
  const { supabase } = await requireWorkspaceAccountRole("Interpreter");
  const [assignments, openRequestsResult, application, activity] = await Promise.all([
    loadInterpreterAssignments(supabase),
    loadOpenInterpreterRequests(supabase),
    loadMyInterpreterApplication(supabase),
    loadWorkspaceActivity(supabase),
  ]);
  const availableRequests = openRequestsResult.requests;
  const applicationStatus: ApplicationStatus | null = application?.status ?? null;

  return (
    <WorkspaceShell requiredRole="Interpreter" requiredAccountRole="Interpreter" alternatePath="/interpreter/my-requests#main-content">
      <MyAssignmentsList
        activeFilter={activeFilter}
        applicationStatus={applicationStatus}
        initialAssignments={assignments}
        initialAvailableRequests={availableRequests}
        workspaceBlocked={Boolean(activity.requester || activity.assignment)}
      />
    </WorkspaceShell>
  );
}
