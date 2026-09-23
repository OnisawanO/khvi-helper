import type { Metadata } from "next";
import type { ReactNode } from "react";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { RequesterRequestsProvider } from "@/app/components/requests/requester-requests-context";
import { loadRequesterRequests } from "@/app/lib/real-request-data";
import { requireWorkspaceAccountRole } from "@/app/lib/workspace-auth";

export const metadata: Metadata = {
  title: "My requests | K-HVI",
  description: "Track every help request you created, from open pins waiting for an interpreter to completed jobs.",
};

export const dynamic = "force-dynamic";

export default async function MyRequestsLayout({ children }: { children: ReactNode }) {
  const { supabase } = await requireWorkspaceAccountRole("User");
  const requests = await loadRequesterRequests(supabase);

  return (
    <WorkspaceShell requiredRole="User" requiredAccountRole="User" alternatePath="/interpreter/my-assignments#main-content">
      <RequesterRequestsProvider initialRequests={requests}>{children}</RequesterRequestsProvider>
    </WorkspaceShell>
  );
}
