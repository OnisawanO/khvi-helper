import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { loadOpenInterpreterRequests } from "@/app/lib/real-request-data";
import { FindRequestsList } from "./find-requests-list";

export const metadata: Metadata = {
  title: "Find requests | K-HVI",
  description: "Review open language-help requests as a volunteer interpreter.",
};

export default async function FindRequestsPage() {
  const { requests, diagnostic } = await loadOpenInterpreterRequests();

  return (
    <WorkspaceShell requiredRole="Interpreter" alternatePath="/request-help#main-content">
      <FindRequestsList initialRequests={requests} diagnostic={diagnostic} />
    </WorkspaceShell>
  );
}
