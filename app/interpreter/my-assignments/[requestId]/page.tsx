import type { Metadata } from "next";
import { RequestDetailPage } from "@/app/components/requests/request-detail-page";

export async function generateMetadata(props: PageProps<"/interpreter/my-assignments/[requestId]">): Promise<Metadata> {
  const { requestId } = await props.params;
  return /^\d+$/.test(requestId)
    ? { title: "Assignment details | K-HVI", description: "Track the status and mission details for a claimed language-help assignment." }
    : { title: "Assignment not found | K-HVI" };
}

export default async function AssignmentStatusPage(props: PageProps<"/interpreter/my-assignments/[requestId]">) {
  const { requestId } = await props.params;
  return <RequestDetailPage requestId={requestId} requiredAccountRole="Interpreter" />;
}
