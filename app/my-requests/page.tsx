import { redirect } from "next/navigation";
import {
  withCompatibilitySearchParams,
  type CompatibilitySearchParams,
} from "@/app/lib/compat-route";

export default async function MyRequestsCompatibilityPage({
  searchParams,
}: {
  searchParams: Promise<CompatibilitySearchParams>;
}) {
  redirect(withCompatibilitySearchParams("/user/my-requests", await searchParams));
}
