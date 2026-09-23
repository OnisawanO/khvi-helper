import { redirect } from "next/navigation";
import { withCompatibilitySearchParams, type CompatibilitySearchParams } from "@/app/lib/compat-route";

export default async function FindRequestsCompatibilityPage({ searchParams }: { searchParams: Promise<CompatibilitySearchParams> }) {
  redirect(withCompatibilitySearchParams("/interpreter/find-requests", await searchParams));
}
