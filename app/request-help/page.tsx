import { redirect } from "next/navigation";
import { withCompatibilitySearchParams, type CompatibilitySearchParams } from "@/app/lib/compat-route";

export default async function RequestHelpCompatibilityPage({ searchParams }: { searchParams: Promise<CompatibilitySearchParams> }) {
  redirect(withCompatibilitySearchParams("/user/request-help", await searchParams));
}
