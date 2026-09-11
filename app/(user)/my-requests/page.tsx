import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { resolveStatusFilter } from "@/app/lib/mock-requests";
import { RequestList } from "./request-list";

export const metadata: Metadata = {
  title: "My requests | K-HVI",
  description: "Track every help request you created, from open pins waiting for an interpreter to completed jobs.",
};

export default async function MyRequestsPage(props: PageProps<"/my-requests">) {
  const { status } = await props.searchParams;
  const activeFilter = resolveStatusFilter(status);

  return (
    <WorkspaceShell requiredRole="User" alternatePath="/my-assignments#main-content">
      <RequestList activeFilter={activeFilter} />
    </WorkspaceShell>
  );
}
