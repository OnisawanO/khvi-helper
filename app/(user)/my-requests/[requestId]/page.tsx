import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import type { UserRole } from "@/app/lib/mock-auth";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import { loadBookingById } from "@/app/lib/real-request-data";
import { createClient } from "@/utils/supabase/server";
import { RequestDetail } from "./request-detail";

export async function generateMetadata(props: PageProps<"/my-requests/[requestId]">): Promise<Metadata> {
  const { requestId } = await props.params;

  if (!/^\d+$/.test(requestId)) {
    return { title: "Request not found | K-HVI" };
  }

  return {
    title: `Request #${requestId} | K-HVI`,
    description: "Track the status of a help request and see interpreter contact details once the job is claimed.",
  };
}

export default async function RequestStatusPage(props: PageProps<"/my-requests/[requestId]">) {
  const { requestId } = await props.params;
  if (!/^\d+$/.test(requestId)) {
    notFound();
  }
  const supabase = await createClient();
  const [viewerResult, loaded] = await Promise.all([
    getCurrentUserProfile(supabase),
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

  return (
    <WorkspaceShell>
      <RequestDetail
        request={loaded.request}
        viewer={{ ...viewerResult.profile, role: viewerRole }}
        initialMissionLocations={loaded.locations}
      />
    </WorkspaceShell>
  );
}
