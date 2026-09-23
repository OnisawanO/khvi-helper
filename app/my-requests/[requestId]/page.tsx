import { redirect } from "next/navigation";

export default async function RequestDetailCompatibilityPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  redirect(`/user/my-requests/${encodeURIComponent(requestId)}`);
}
