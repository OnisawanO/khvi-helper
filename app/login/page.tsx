import type { Metadata } from "next";
import { DirectLoginPage } from "@/app/components/auth/direct-login-page";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ · KHVI Helper",
  description: "เข้าสู่ระบบ KHVI Helper เพื่อเชื่อมต่อกับล่ามจิตอาสา",
};

export default function LoginPage() {
  return <DirectLoginPage />;
}
