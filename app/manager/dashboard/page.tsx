import { redirect } from "next/navigation";

/**
 * Compatibility route for the former Manager dashboard. The database-backed
 * Manager workspace now lives at /manager.
 */
export default function ManagerDashboardPage() {
  redirect("/manager");
}
