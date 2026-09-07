import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { filterRequests, resolveStatusFilter, STATUS_FILTERS } from "@/app/lib/mock-requests";
import { RequestList } from "./request-list";

export const metadata: Metadata = {
  title: "My requests | K-HVI",
  description: "Track every help request you created, from open pins waiting for an interpreter to completed jobs.",
};

export default async function MyRequestsPage(props: PageProps<"/my-requests">) {
  const { status } = await props.searchParams;
  const activeFilter = resolveStatusFilter(status);
  const requests = filterRequests(activeFilter);
  const counts = Object.fromEntries(STATUS_FILTERS.map((filter) => [filter.id, filterRequests(filter.id).length]));

  return (
    <AppShell>
      <RequestList requests={requests} activeFilter={activeFilter} counts={counts} />
    </AppShell>
  );
}
