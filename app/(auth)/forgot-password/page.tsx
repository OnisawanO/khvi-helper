import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { AuthUtilityPage } from "@/app/components/auth/auth-utility-page";

export const metadata: Metadata = {
  title: "ตั้งรหัสผ่านใหม่ · KHVI Helper",
  description: "ขอลิงก์สำหรับตั้งรหัสผ่านใหม่ของ KHVI Helper",
};

export default function ForgotPasswordPage() {
  return (
    <AppShell>
      <AuthUtilityPage variant="forgot" />
    </AppShell>
  );
}
