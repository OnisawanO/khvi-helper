import { redirect } from "next/navigation";
import { withCompatibilitySearchParams, type CompatibilitySearchParams } from "@/app/lib/compat-route";

export default async function MyAssignmentsCompatibilityPage({ searchParams }: { searchParams: Promise<CompatibilitySearchParams> }) {
  redirect(withCompatibilitySearchParams("/interpreter/my-assignments", await searchParams));
}
