import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { AuthUtilityPage } from "@/app/components/auth/auth-utility-page";

export const metadata: Metadata = {
  title: "ตั้งรหัสผ่านใหม่ · KHVI Helper",
  description: "ตั้งรหัสผ่านใหม่สำหรับบัญชี KHVI Helper",
};

export default function ResetPasswordPage() {
  return (
    <AppShell>
      <AuthUtilityPage variant="reset" />
    </AppShell>
  );
}
