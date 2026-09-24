import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { AuthUtilityPage } from "@/app/components/auth/auth-utility-page";

export const metadata: Metadata = {
  title: "ตั้งรหัสผ่านใหม่ · KHVI Helper",
  description: "ตั้งรหัสผ่านใหม่สำหรับบัญชี KHVI Helper",
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <AppShell>
      <AuthUtilityPage variant="reset" recoveryError={params.error === "invalid-link"} />
    </AppShell>
  );
}
