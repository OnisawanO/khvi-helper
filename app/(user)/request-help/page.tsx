import type { Metadata } from "next";
import { WorkspaceShell } from "@/app/components/workspace-shell";
import { loadReferenceCatalog } from "@/app/lib/real-reference-data";
import { RequestHelpForm } from "./request-help-form";

export const metadata: Metadata = {
  title: "Create a help request | K-HVI",
  description:
    "Pin a language help request with one language, one category, and the place where help is needed. Approved interpreters nearby can claim it.",
};

export const dynamic = "force-dynamic";

export default async function RequestHelpPage() {
  const referenceCatalog = await loadReferenceCatalog();

  return (
    <WorkspaceShell requiredRole="User" alternatePath="/find-requests#main-content">
      <RequestHelpForm
        languageOptions={referenceCatalog.languages}
        categoryOptions={referenceCatalog.categories}
      />
    </WorkspaceShell>
  );
}
