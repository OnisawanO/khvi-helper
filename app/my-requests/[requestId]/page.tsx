import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { findRequest, isValidRequestId } from "@/app/lib/mock-requests";
import { RequestDetail } from "./request-detail";

export async function generateMetadata(props: PageProps<"/my-requests/[requestId]">): Promise<Metadata> {
  const { requestId } = await props.params;

  if (!isValidRequestId(requestId)) {
    return { title: "Request not found | K-HVI" };
  }

  return {
    title: `Request #${requestId} | K-HVI`,
    description: "Track the status of a help request and see interpreter contact details once the job is claimed.",
  };
}

export default async function RequestStatusPage(props: PageProps<"/my-requests/[requestId]">) {
  const { requestId } = await props.params;
  const request = findRequest(requestId);

  if (!request) {
    notFound();
  }

  return (
    <AppShell>
      <RequestDetail request={request} />
    </AppShell>
  );
}
