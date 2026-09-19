import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { UserRole } from "@/app/lib/mock-auth";

const FAST_LOGIN_ROLES: UserRole[] = ["User", "Interpreter", "Manager", "Admin"];

const credentialsByRole: Record<UserRole, { email: string | undefined; password: string | undefined }> = {
  User: {
    email: process.env.FAST_LOGIN_USER_EMAIL,
    password: process.env.FAST_LOGIN_USER_PASSWORD,
  },
  Interpreter: {
    email: process.env.FAST_LOGIN_INTERPRETER_EMAIL,
    password: process.env.FAST_LOGIN_INTERPRETER_PASSWORD,
  },
  Manager: {
    email: process.env.FAST_LOGIN_MANAGER_EMAIL,
    password: process.env.FAST_LOGIN_MANAGER_PASSWORD,
  },
  Admin: {
    email: process.env.FAST_LOGIN_ADMIN_EMAIL,
    password: process.env.FAST_LOGIN_ADMIN_PASSWORD,
  },
};

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let role: UserRole | undefined;
  try {
    const body = (await request.json()) as { role?: string };
    if (FAST_LOGIN_ROLES.includes(body.role as UserRole)) {
      role = body.role as UserRole;
    }
  } catch {
    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 400 });
  }

  if (!role) {
    return NextResponse.json({ error: "ไม่พบบทบาทสำหรับ Fast Login" }, { status: 400 });
  }

  const credentials = credentialsByRole[role];
  if (!credentials.email || !credentials.password) {
    return NextResponse.json(
      { error: `ยังไม่ได้ตั้งค่าบัญชีทดสอบสำหรับ role ${role} ใน .env.local` },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return NextResponse.json(
      { error: "ไม่สามารถเข้าสู่ระบบด่วนได้ กรุณาตรวจสอบบัญชีทดสอบใน Supabase Auth" },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true, role }, { headers: { "Cache-Control": "no-store" } });
}
