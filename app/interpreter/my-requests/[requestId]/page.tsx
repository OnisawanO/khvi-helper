import type { Metadata } from "next";
import { RequestDetailPage } from "@/app/components/requests/request-detail-page";

export async function generateMetadata(props: PageProps<"/interpreter/my-requests/[requestId]">): Promise<Metadata> {
  const { requestId } = await props.params;
  return /^\d+$/.test(requestId)
    ? { title: "Request details | K-HVI", description: "Track the status of a help request and see interpreter contact details once the job is claimed." }
    : { title: "Request not found | K-HVI" };
}

export default async function InterpreterRequestStatusPage(props: PageProps<"/interpreter/my-requests/[requestId]">) {
  const { requestId } = await props.params;
  return <RequestDetailPage requestId={requestId} withShell={false} />;
}
