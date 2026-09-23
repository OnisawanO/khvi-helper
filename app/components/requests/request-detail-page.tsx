import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import type { UserRole } from "@/app/lib/auth-types";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { loadBookingById } from "@/app/lib/real-request-data";
import { createClient } from "@/utils/supabase/server";
import { requireWorkspaceAccountRole } from "@/app/lib/workspace-auth";
import { RequestDetail } from "./request-detail";

export async function RequestDetailPage({ requestId, withShell = true, requiredAccountRole }: { requestId: string; withShell?: boolean; requiredAccountRole?: "User" | "Interpreter" }) {
  if (!/^\d+$/.test(requestId)) {
    notFound();
  }

  const roleSession = requiredAccountRole ? await requireWorkspaceAccountRole(requiredAccountRole) : null;
  const supabase = roleSession?.supabase ?? await createClient();
  const [viewerResult, loaded] = await Promise.all([
    roleSession ? Promise.resolve({ profile: roleSession.profile }) : getCurrentUserProfile(supabase),
    loadBookingById(requestId, supabase),
  ]);

  if (!viewerResult.profile || !loaded) {
    notFound();
  }

  const viewerRole: UserRole = loaded.requesterId === viewerResult.profile.userId
    ? "User"
    : loaded.request.interpreterId === viewerResult.profile.userId
      ? "Interpreter"
      : viewerResult.profile.role;

  const detail = (
    <RequestDetail
      request={loaded.request}
      viewer={{ ...viewerResult.profile, role: viewerRole }}
      initialMissionLocations={loaded.locations}
    />
  );

  return withShell ? <WorkspaceShell requiredAccountRole={requiredAccountRole}>{detail}</WorkspaceShell> : detail;
}
