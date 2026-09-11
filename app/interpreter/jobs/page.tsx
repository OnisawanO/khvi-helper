import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { MOCK_REQUESTS } from "@/app/lib/mock-requests";
import { InterpreterJobList } from "./interpreter-job-list";

export const metadata: Metadata = {
  title: "Interpreter jobs | K-HVI",
  description: "Browse available interpretation requests and accept or decline jobs.",
};

export default function InterpreterJobsPage() {
  return (
    <AppShell>
      <InterpreterJobList requests={[...MOCK_REQUESTS]} />
    </AppShell>
  );
}
