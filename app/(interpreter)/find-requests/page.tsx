import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { FindRequestsList } from "./find-requests-list";

export const metadata: Metadata = {
  title: "Find requests | K-HVI",
  description: "Review open language-help requests as a volunteer interpreter.",
};

export default function FindRequestsPage() {
  return (
    <WorkspaceShell requiredRole="Interpreter" alternatePath="/request-help#main-content">
      <FindRequestsList />
    </WorkspaceShell>
  );
}
