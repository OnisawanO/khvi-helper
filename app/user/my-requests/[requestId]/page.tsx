import type { Metadata } from "next";
import { RequestDetailPage } from "@/app/components/requests/request-detail-page";

export async function generateMetadata(props: PageProps<"/user/my-requests/[requestId]">): Promise<Metadata> {
  const { requestId } = await props.params;

  if (!/^\d+$/.test(requestId)) {
    return { title: "Request not found | K-HVI" };
  }

  return {
    title: "Request details | K-HVI",
    description: "Track the status of a help request and see interpreter contact details once the job is claimed.",
  };
}

export default async function RequestStatusPage(props: PageProps<"/user/my-requests/[requestId]">) {
  const { requestId } = await props.params;
  return <RequestDetailPage requestId={requestId} withShell={false} />;
}
