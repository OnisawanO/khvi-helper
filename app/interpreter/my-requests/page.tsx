import { RequesterRequestsPage } from "@/app/components/requests/requester-requests-page";

export default function InterpreterMyRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  return <RequesterRequestsPage searchParams={searchParams} />;
}
