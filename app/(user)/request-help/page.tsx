import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { RequestHelpForm } from "./request-help-form";

export const metadata: Metadata = {
  title: "Create a help request | K-HVI",
  description:
    "Pin a language help request with one language, one category, and the place where help is needed. Approved interpreters nearby can claim it.",
};

export default function RequestHelpPage() {
  return (
    <WorkspaceShell requiredRole="User" alternatePath="/find-requests#main-content">
      <RequestHelpForm />
    </WorkspaceShell>
  );
}
