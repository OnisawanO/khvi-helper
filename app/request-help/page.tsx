import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { RequestHelpForm } from "./request-help-form";

export const metadata: Metadata = {
  title: "Create a help request | K-HVI",
  description:
    "Pin a language help request with one language, one category, and the place where help is needed. Approved interpreters nearby can claim it.",
};

export default function RequestHelpPage() {
  return (
    <AppShell>
      <RequestHelpForm />
    </AppShell>
  );
}
