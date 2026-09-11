import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { RegisterForm } from "@/app/components/auth/register-form";

export const metadata: Metadata = {
  title: "สมัครสมาชิกผู้ใช้ใหม่ · KHVI Helper",
  description: "ลงทะเบียนบัญชีผู้ใช้ใหม่สำหรับขอความช่วยเหลือด้านภาษาจากล่ามจิตอาสา",
};

export default function RegisterPage() {
  return (
    <AppShell>
      <main id="main-content" className="flex-1 bg-[#f7f9fa] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-xl">
          <RegisterForm />
        </div>
      </main>
    </AppShell>
  );
}
