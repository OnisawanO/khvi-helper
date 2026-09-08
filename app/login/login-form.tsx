"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  loginMockUser,
  quickLoginAsRole,
  type UserProfile,
  type UserRole,
} from "@/app/lib/mock-auth";

export interface LoginFormProps {
  onSuccess?: (user: UserProfile) => void;
  onSwitchToRegister?: () => void;
  isModal?: boolean;
}

export function LoginForm({ onSuccess, onSwitchToRegister, isModal = false }: LoginFormProps) {
  const router = useRouter();

  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  function handleLoginSuccess(user: UserProfile) {
    setIsSuccess(true);
    setSuccessUser(user);
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(user);
      } else {
        router.push("/welcome");
      }
    }, 900);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await loginMockUser(email, password);
      if (!result.success || !result.user) {
        const errorMsg =
          result.errors?.general ||
          result.errors?.email ||
          result.errors?.password ||
          "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }
      handleLoginSuccess(result.user);
    } catch {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
      setIsSubmitting(false);
    }
  }

  function handleQuickLogin(role: UserRole) {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = quickLoginAsRole(role);
      handleLoginSuccess(user);
    } catch {
      setError("ไม่สามารถเข้าสู่ระบบจำลองได้");
      setIsSubmitting(false);
    }
  }

  const containerClasses = isModal
    ? "w-full"
    : "rounded-2xl border border-[#d6e0e4] bg-white p-6 shadow-[var(--khvi-shadow-soft)] sm:p-10";

  return (
    <div className={containerClasses}>
      {/* Slogan & Title Header (Fastwork style) */}
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-[var(--khvi-ink)] sm:text-3xl">
          ยินดีต้อนรับกลับมา
          <span className="block text-[#087f80]">สู่ KHVI Helper</span>
        </h2>
        <p className="mt-1.5 text-xs text-[#5c727d]">
          เข้าสู่ระบบเพื่อติดตามงาน ปักหมุดขอความช่วยเหลือ หรือปฏิบัติหน้าที่ล่าม
        </p>
      </div>

      {/* Success Alert */}
      {isSuccess && successUser ? (
        <div
          role="status"
          aria-live="polite"
          className="my-6 rounded-2xl border border-[#a3d9c9] bg-[#eefaf6] p-6 text-center"
        >
          <CheckCircleIcon className="mx-auto h-12 w-12 text-[#0a8264]" aria-hidden="true" />
          <h3 className="mt-3 text-base font-extrabold text-[#095744]">
            เข้าสู่ระบบสำเร็จ
          </h3>
          <p className="mt-1 text-xs text-[#186a55]">
            ยินดีต้อนรับคุณ {successUser.name} (บทบาท: {successUser.role}) กำลังนำทาง...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-[#f3b5ad] bg-[#fdf2f0] p-3 text-xs font-bold text-[#b92b1b]"
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor={emailId} className="block text-xs font-extrabold text-[#294554]">
                อีเมล <span className="text-[#e24432]">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                  <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id={emailId}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="เช่น user@khvi.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#cbd7dc] bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-[var(--khvi-ink)] transition-colors hover:border-[#8fbfc1] focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor={passwordId} className="block text-xs font-extrabold text-[#294554]">
                  รหัสผ่าน <span className="text-[#e24432]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("ระบบ Mock อยู่ในระหว่างพัฒนา: สามารถใช้รหัสผ่านใดก็ได้ หรือใช้ปุ่ม Quick Login ด้านล่าง")}
                  className="text-[11px] font-bold text-[#0d8587] hover:underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                  <LockClosedIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#cbd7dc] bg-white py-2.5 pl-9 pr-9 text-xs font-semibold text-[var(--khvi-ink)] transition-colors hover:border-[#8fbfc1] focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#73848a] hover:text-[#294554]"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-xs text-[#52676f] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#cbd7dc] text-[#087f80] focus:ring-[#087f80]"
                />
                <span>จดจำการเข้าสู่ระบบไว้</span>
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-[#092f45] px-6 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(9,47,69,0.18)] transition-all hover:bg-[#0c4960] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
            </div>
          </form>

          {/* Quick Role Login Buttons for Easy Testing */}
          <div className="pt-2 border-t border-[#edf2f4]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold text-[#73848a] flex items-center gap-1">
                <SparklesIcon className="h-3.5 w-3.5 text-[#0d8587]" />
                ทดสอบเข้าสู่ระบบด่วนตามสิทธิ์ (Quick Login):
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => handleQuickLogin("User")}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center rounded-lg border border-[#cbd7dc] bg-[#f7f9fa] p-2 text-center transition-colors hover:border-[#087f80] hover:bg-[#edf7f5]"
              >
                <span className="text-[11px] font-black text-[#10283a]">User</span>
                <span className="text-[9px] text-[#73848a]">ผู้ขอรับบริการ</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("Interpreter")}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center rounded-lg border border-[#cbd7dc] bg-[#f7f9fa] p-2 text-center transition-colors hover:border-[#087f80] hover:bg-[#edf7f5]"
              >
                <span className="text-[11px] font-black text-[#087f80]">Interpreter</span>
                <span className="text-[9px] text-[#73848a]">ล่ามจิตอาสา</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("Manager")}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center rounded-lg border border-[#cbd7dc] bg-[#f7f9fa] p-2 text-center transition-colors hover:border-[#b5680b] hover:bg-[#fff9ef]"
              >
                <span className="text-[11px] font-black text-[#b5680b]">Manager</span>
                <span className="text-[9px] text-[#73848a]">ผู้จัดการ</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("Admin")}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center rounded-lg border border-[#cbd7dc] bg-[#f7f9fa] p-2 text-center transition-colors hover:border-[#f04f3e] hover:bg-[#fef4f3]"
              >
                <span className="text-[11px] font-black text-[#f04f3e]">Admin</span>
                <span className="text-[9px] text-[#73848a]">ผู้ดูแลระบบ</span>
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div className="border-t border-[#edf2f4] pt-3 text-center text-xs text-[#5c727d]">
            <span>ยังไม่มีบัญชีผู้ใช้? </span>
            {onSwitchToRegister ? (
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-extrabold text-[#0d8587] transition-colors hover:text-[#092f45] hover:underline"
              >
                สมัครสมาชิกที่นี่
              </button>
            ) : (
              <Link
                href="/register"
                className="font-extrabold text-[#0d8587] transition-colors hover:text-[#092f45] hover:underline"
              >
                สมัครสมาชิกที่นี่
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
