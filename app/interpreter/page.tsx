import type { Metadata } from "next";
import { WorkspaceHomePage } from "@/app/components/workspace-home-page";

export const metadata: Metadata = { title: "Welcome | KHVI" };

export default async function InterpreterHomePage() {
  return <WorkspaceHomePage requiredRole="Interpreter" />;
}
