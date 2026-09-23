import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { RegisterForm } from "@/app/components/auth/register-form";

import Link from "next/link";

export const metadata: Metadata = {
  title: "สมัครสมาชิกผู้ใช้ใหม่ · KHVI Helper",
  description: "ลงทะเบียนบัญชีผู้ใช้ใหม่สำหรับขอความช่วยเหลือด้านภาษาจากล่ามจิตอาสา",
};

export default function RegisterPage() {
  return (
    <AppShell hidePrimaryAction>
      <main id="main-content" className="flex-1 bg-[#f7f9fa] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-xl">
          <div className="mb-4 rounded-xl border border-[#b9d9d6] bg-[#edf7f5] p-3.5 text-center text-xs text-[#087557] flex items-center justify-between gap-2 shadow-xs">
            <span>ต้องการสมัครเป็นล่ามจิตอาสาใช่หรือไม่?</span>
            <Link
              href="/register/interpreter"
              className="rounded-lg bg-[#087f80] px-3 py-1 text-xs font-extrabold text-white hover:bg-[#0c6b6c] transition-colors"
            >
              ลงทะเบียนล่ามที่นี่ →
            </Link>
          </div>
          <RegisterForm />
        </div>
      </main>
    </AppShell>
  );
}
