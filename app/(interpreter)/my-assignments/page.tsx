import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import type { ApplicationStatus } from "@/app/lib/interpreter-application";
import { loadMyInterpreterApplication } from "@/app/lib/real-interpreter-application-data";
import { loadInterpreterAssignments, loadOpenInterpreterRequests } from "@/app/lib/real-request-data";
import { resolveStatusFilter } from "@/app/lib/mock-requests";
import { createClient } from "@/utils/supabase/server";
import { MyAssignmentsList } from "./my-assignments-list";

export const metadata: Metadata = {
  title: "My assignments | K-HVI",
  description: "Track language-help assignments claimed by a volunteer interpreter.",
};

export default async function MyAssignmentsPage(props: PageProps<"/my-assignments">) {
  const { status } = await props.searchParams;
  const activeFilter = resolveStatusFilter(status);
  const supabase = await createClient();
  const [assignments, openRequestsResult, application] = await Promise.all([
    loadInterpreterAssignments(supabase),
    loadOpenInterpreterRequests(supabase),
    loadMyInterpreterApplication(supabase),
  ]);
  const availableRequests = openRequestsResult.requests;
  const applicationStatus: ApplicationStatus | null = application?.status ?? null;

  return (
    <WorkspaceShell requiredRole="Interpreter" alternatePath="/my-requests#main-content">
      <MyAssignmentsList
        activeFilter={activeFilter}
        applicationStatus={applicationStatus}
        initialAssignments={assignments}
        initialAvailableRequests={availableRequests}
      />
    </WorkspaceShell>
  );
}
