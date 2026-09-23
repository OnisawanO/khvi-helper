import type { ReactNode } from "react";
import { requireWorkspaceAccountRole } from "@/app/lib/workspace-auth";

export const dynamic = "force-dynamic";

export default async function VolunteerStatusLayout({ children }: { children: ReactNode }) {
  await requireWorkspaceAccountRole("User");
  return children;
}
