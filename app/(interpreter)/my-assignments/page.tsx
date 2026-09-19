import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { loadInterpreterAssignments } from "@/app/lib/real-request-data";
import { resolveStatusFilter } from "@/app/lib/mock-requests";
import { MyAssignmentsList } from "./my-assignments-list";

export const metadata: Metadata = {
  title: "My assignments | K-HVI",
  description: "Track language-help assignments claimed by a volunteer interpreter.",
};

export default async function MyAssignmentsPage(props: PageProps<"/my-assignments">) {
  const { status } = await props.searchParams;
  const activeFilter = resolveStatusFilter(status);
  const assignments = await loadInterpreterAssignments();

  return (
    <WorkspaceShell requiredRole="Interpreter" alternatePath="/my-requests#main-content">
      <MyAssignmentsList activeFilter={activeFilter} initialAssignments={assignments} />
    </WorkspaceShell>
  );
}
