"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LanguageIcon,
  LockClosedIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import type { Locale } from "@/app/components/site-header";
import { useStoredLocale } from "@/app/lib/locale";
import {
  calculateAge,
  registerMockUser,
  type RegisterInput,
  type ValidationErrors,
} from "@/app/lib/mock-auth";

const UI_LANGUAGE_OPTIONS: { code: Locale; label: string; nativeName: string }[] = [
  { code: "th", label: "ไทย (Thai)", nativeName: "ภาษาไทย" },
  { code: "en", label: "English", nativeName: "English" },
  { code: "zh", label: "中文 (Chinese)", nativeName: "中文" },
  { code: "my", label: "မြန်မာ (Burmese)", nativeName: "မြန်မာစာ" },
  { code: "vi", label: "Tiếng Việt (Vietnamese)", nativeName: "Tiếng Việt" },
];

export interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
  onSwitchToSignIn?: () => void;
}

export function RegisterForm({
  onSuccess,
  onCancel,
  isModal = false,
  onSwitchToSignIn,
}: RegisterFormProps) {
  const router = useRouter();
  const [currentLocale] = useStoredLocale();

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const phoneId = useId();
  const dobId = useId();
  const languageId = useId();

  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    preferredUiLanguage: currentLocale === "zh" ? "zh" : "th",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const calculatedAge = calculateAge(formData.dateOfBirth);
  const todayStr = new Date().toISOString().split("T")[0];

  function handleChange(field: keyof RegisterInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof ValidationErrors];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await registerMockUser(formData);

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/request-help");
        }
      }, 1000);
    } catch {
      setErrors({ general: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง" });
      setIsSubmitting(false);
    }
  }

  const containerClasses = isModal
    ? "w-full"
    : "rounded-2xl border border-[#d6e0e4] bg-white p-6 shadow-[var(--khvi-shadow-soft)] sm:p-10";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-[#eef5f7] px-3.5 py-1 text-xs font-bold text-[#0d8587]">
          <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
          <span>สร้างบัญชีผู้ใช้ใหม่ · New Account</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-[var(--khvi-ink)] sm:text-2xl">
          สมัครสมาชิก
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#5c727d]">
          กรอกข้อมูลเพื่อเริ่มต้นใช้งานและขอความช่วยเหลือด้านภาษากับล่ามจิตอาสา
        </p>
      </div>

      {/* Role & Privacy Callout */}
      <div className="mb-6 rounded-xl border border-[#d2e4e8] bg-[#f2f8f9] p-3.5 text-xs leading-relaxed text-[#2c4e5b]">
        <div className="flex items-start gap-2.5">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0d8587]" aria-hidden="true" />
          <div>
            <p className="font-bold text-[#143d4d]">
              บทบาทเริ่มต้น: ผู้ขอรับบริการ (User)
            </p>
            <p className="mt-0.5 text-[#486b77]">
              ข้อมูลติดต่อจะถูกปกป้องและแสดงเฉพาะเมื่อมีล่ามกดรับงานแล้วเท่านั้น (BR-04)
            </p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {isSuccess ? (
        <div
          role="status"
          aria-live="polite"
          className="my-6 rounded-xl border border-[#a3d9c9] bg-[#eefaf6] p-6 text-center"
        >
          <CheckCircleIcon className="mx-auto h-10 w-10 text-[#0a8264]" aria-hidden="true" />
          <h3 className="mt-3 text-base font-extrabold text-[#095744]">
            สมัครสมาชิกสำเร็จ
          </h3>
          <p className="mt-1 text-xs text-[#186a55]">
            ระบบกำลังเข้าสู่ระบบและนำท่านไปยังหน้าส่งคำขอความช่วยเหลือ...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errors.general && (
            <div
              role="alert"
              className="rounded-lg border border-[#f3b5ad] bg-[#fdf2f0] p-3 text-xs font-bold text-[#b92b1b]"
            >
              {errors.general}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor={nameId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
              ชื่อ-นามสกุล <span className="text-[#e24432]">*</span>
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                <UserIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id={nameId}
                type="text"
                required
                autoComplete="name"
                placeholder="เช่น สมชาย ใจดี หรือ John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${nameId}-error` : undefined}
                className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${
                  errors.name ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc] hover:border-[#8fbfc1]"
                }`}
              />
            </div>
            {errors.name && (
              <p id={`${nameId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor={emailId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
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
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${emailId}-error` : undefined}
                className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${
                  errors.email ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc] hover:border-[#8fbfc1]"
                }`}
              />
            </div>
            {errors.email && (
              <p id={`${emailId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={passwordId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
                รหัสผ่าน <span className="text-[#e24432]">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                  <LockClosedIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? `${passwordId}-error` : undefined}
                  className={`w-full rounded-lg border bg-white py-2 pl-9 pr-9 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${
                    errors.password ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc] hover:border-[#8fbfc1]"
                  }`}
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
              {errors.password && (
                <p id={`${passwordId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={confirmPasswordId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
                ยืนยันรหัสผ่าน <span className="text-[#e24432]">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                  <LockClosedIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id={confirmPasswordId}
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? `${confirmPasswordId}-error` : undefined}
                  className={`w-full rounded-lg border bg-white py-2 pl-9 pr-9 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${
                    errors.confirmPassword
                      ? "border-[#e24432] bg-[#fdf8f7]"
                      : "border-[#cbd7dc] hover:border-[#8fbfc1]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#73848a] hover:text-[#294554]"
                  aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id={`${confirmPasswordId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor={phoneId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
              เบอร์โทรศัพท์ <span className="text-[#e24432]">*</span>
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                <PhoneIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id={phoneId}
                type="tel"
                required
                autoComplete="tel"
                placeholder="0812345678"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? `${phoneId}-error` : `${phoneId}-hint`}
                className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${
                  errors.phone ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc] hover:border-[#8fbfc1]"
                }`}
              />
            </div>
            {errors.phone ? (
              <p id={`${phoneId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                {errors.phone}
              </p>
            ) : (
              <p id={`${phoneId}-hint`} className="mt-1 text-[11px] text-[#73848a]">
                สำหรับติดต่อเมื่อมีล่ามกดรับงานแล้ว
              </p>
            )}
          </div>

          {/* Date of Birth & Live Age Calculation */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor={dobId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
                วันเดือนปีเกิด <span className="text-[#e24432]">*</span>
              </label>
              {calculatedAge !== null && (
                <span className="inline-flex items-center rounded-md bg-[#edf7f5] px-2 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                  อายุ {calculatedAge} ปี
                </span>
              )}
            </div>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                <CalendarDaysIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id={dobId}
                type="date"
                required
                max={todayStr}
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                aria-invalid={Boolean(errors.dateOfBirth)}
                aria-describedby={errors.dateOfBirth ? `${dobId}-error` : undefined}
                className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${
                  errors.dateOfBirth ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc] hover:border-[#8fbfc1]"
                }`}
              />
            </div>
            {errors.dateOfBirth && (
              <p id={`${dobId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          {/* Preferred UI Language */}
          <div>
            <label htmlFor={languageId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
              ภาษาหน้าจอที่ต้องการ (UI Language)
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                <LanguageIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <select
                id={languageId}
                value={formData.preferredUiLanguage}
                onChange={(e) => handleChange("preferredUiLanguage", e.target.value as Locale)}
                className="w-full rounded-lg border border-[#cbd7dc] bg-white py-2 pl-9 pr-8 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors hover:border-[#8fbfc1] focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20"
              >
                {UI_LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label} ({opt.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {isModal && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="h-10 flex-1 rounded-lg border border-[#cbd7dc] bg-white text-xs sm:text-sm font-extrabold text-[#425761] transition-colors hover:bg-[#f4f7f8] disabled:opacity-50"
              >
                ยกเลิก
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex h-10 ${
                isModal && onCancel ? "flex-[2]" : "w-full"
              } items-center justify-center rounded-lg bg-[var(--khvi-navy)] px-5 text-xs sm:text-sm font-extrabold text-white shadow-[0_6px_14px_rgba(9,47,69,0.16)] transition-colors hover:bg-[#0c4960] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--khvi-teal)] disabled:cursor-not-allowed disabled:opacity-60`}
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
                  กำลังสร้างบัญชี...
                </span>
              ) : (
                "สมัครสมาชิก"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <div className="mt-6 border-t border-[#edf2f4] pt-4 text-center text-xs text-[#5c727d]">
        <span>มีบัญชีอยู่แล้ว? </span>
        {onSwitchToSignIn ? (
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-extrabold text-[#0d8587] transition-colors hover:text-[#092f45] hover:underline cursor-pointer"
          >
            เข้าสู่ระบบที่นี่
          </button>
        ) : (
          <Link
            href="/login"
            className="font-extrabold text-[#0d8587] transition-colors hover:text-[#092f45] hover:underline"
          >
            เข้าสู่ระบบที่นี่
          </Link>
        )}
      </div>
    </div>
  );
}
