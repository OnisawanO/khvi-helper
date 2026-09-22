"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { useStoredLocale } from "@/app/lib/locale";
import { authApi } from "@/app/lib/auth-client";

export function ResetPasswordForm() {
  const [locale] = useStoredLocale();
  const copy = getAuthCopy(locale);
  const passwordId = useId();
  const confirmPasswordId = useId();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(copy.validation.passwordMin);
      return;
    }
    if (password !== confirmPassword) {
      setError(copy.validation.passwordsMismatch);
      return;
    }

    setIsSubmitting(true);
    const result = await authApi.resetPassword(password, confirmPassword, locale);
    if (!result.ok) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }
    setIsUpdated(true);
    setIsSubmitting(false);
  }

  if (isUpdated) {
    return (
      <div className="rounded-2xl border border-[#a3d9c9] bg-[#eefaf6] p-6 text-center">
        <h1 className="text-xl font-extrabold text-[#095744]">{copy.login.successTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-[#186a55]">{copy.login.resetPasswordBack}</p>
        <Link href="/login" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#092f45] px-5 text-sm font-extrabold text-white hover:bg-[#0c4960]">{copy.login.resetPasswordBack}</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-[var(--khvi-ink)] sm:text-3xl">{copy.login.resetPasswordTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-[#5c727d]">{copy.login.resetPasswordDescription}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg border border-[#f3b5ad] bg-[#fdf2f0] p-3 text-xs font-bold text-[#b92b1b]">{error}</div>}
        {[
          [passwordId, copy.register.password, password, setPassword, showPassword, setShowPassword],
          [confirmPasswordId, copy.register.confirmPassword, confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword],
        ].map(([id, label, value, setValue, isVisible, setVisible], index) => (
          <div key={id as string}>
            <label htmlFor={id as string} className="block text-sm font-extrabold text-[#294554]">{label as string}</label>
            <div className="relative mt-1">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" aria-hidden="true" />
              <input
                id={id as string}
                type={isVisible ? "text" : "password"}
                required
                autoComplete={index === 0 ? "new-password" : "new-password"}
                value={value as string}
                onChange={(event) => (setValue as (value: string) => void)(event.target.value)}
                className="w-full rounded-lg border border-[#cbd7dc] bg-white py-3 pl-9 pr-10 text-sm font-semibold text-[var(--khvi-ink)] focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20"
              />
              <button type="button" onClick={() => (setVisible as (value: boolean) => void)(!(isVisible as boolean))} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#73848a] hover:text-[#294554]" aria-label={isVisible ? copy.login.hidePassword : copy.login.showPassword}>
                {isVisible ? <EyeSlashIcon className="h-4 w-4" aria-hidden="true" /> : <EyeIcon className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
        ))}
        <p className={`text-[11px] font-semibold ${password.length >= 8 ? "text-[#0a8264]" : "text-[#73848a]"}`}>{password.length >= 8 ? "✓" : "•"} {copy.validation.passwordMin}</p>
        <button type="submit" disabled={isSubmitting} className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#092f45] px-6 text-sm font-extrabold text-white hover:bg-[#0c4960] disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? copy.register.submitting : copy.register.submit}
        </button>
      </form>
    </div>
  );
}
