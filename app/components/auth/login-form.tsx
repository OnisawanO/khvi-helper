"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { DevFastLoginPanel } from "./dev-fast-login-panel";
import { useStoredLocale } from "@/app/lib/locale";
import { authApi } from "@/app/lib/auth-client";
import { getRedirectPathByRole, type UserProfile } from "@/app/lib/auth-types";

export interface LoginFormProps {
  onSuccess?: (user: UserProfile) => void;
  onSwitchToRegister?: () => void;
  isModal?: boolean;
  isEmbedded?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister, isModal = false, isEmbedded = false, onDirtyChange }: LoginFormProps) {
  const router = useRouter();
  const [currentLocale, setStoredLocale] = useStoredLocale();
  const copy = getAuthCopy(currentLocale);

  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    onDirtyChange?.(Boolean(email || password));
  }, [email, onDirtyChange, password]);

  function handleLoginSuccess(user: UserProfile) {
    setIsSuccess(true);
    setSuccessUser(user);
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(user);
      } else {
        router.push(getRedirectPathByRole(user.role));
      }
    }, 300);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        const message = copy.login.emptyEmail;
        setFieldErrors({ email: message });
        setError(message);
        setIsSubmitting(false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        const message = copy.login.invalidEmail;
        setFieldErrors({ email: message });
        setError(message);
        setIsSubmitting(false);
        return;
      }
      if (!password) {
        const message = copy.login.emptyPassword;
        setFieldErrors({ password: message });
        setError(message);
        setIsSubmitting(false);
        return;
      }

      const result = await authApi.login({
        email: trimmedEmail,
        password,
        locale: currentLocale,
        rememberMe,
      });

      if (!result.ok) {
        setError(result.error.message);
        setIsSubmitting(false);
        return;
      }

      setStoredLocale(result.data.user.preferredUiLanguage);
      handleLoginSuccess(result.data.user);
    } catch {
      setError(copy.login.genericError);
      setIsSubmitting(false);
    }
  }

  const containerClasses = isModal || isEmbedded
    ? "w-full"
    : "rounded-2xl border border-[#d6e0e4] bg-white p-6 shadow-[var(--khvi-shadow-soft)] sm:p-10";

  return (
    <div className={containerClasses}>
      {/* Slogan & Title Header (Fastwork style) */}
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-[var(--khvi-ink)] sm:text-3xl">
          {copy.login.title}
          <span className="block text-[#087f80]">{copy.login.accent}</span>
        </h2>
        <p className="mt-1.5 text-xs text-[#5c727d]">
          {copy.login.description}
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
            {copy.login.successTitle}
          </h3>
          <p className="mt-1 text-xs text-[#186a55]">
            {copy.login.successBody(successUser.name, copy.roleLabels[successUser.role])}
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
                {copy.register.email} <span className="text-[#e24432]">*</span>
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((previous) => ({ ...previous, email: undefined }));
                  }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
                className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-[var(--khvi-ink)] transition-colors hover:border-[#8fbfc1] focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${fieldErrors.email ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc]"}`}
                />
              </div>
              {fieldErrors.email && <p id={`${emailId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor={passwordId} className="block text-xs font-extrabold text-[#294554]">
                  {copy.register.password} <span className="text-[#e24432]">*</span>
                </label>
                <Link href="/forgot-password" className="text-[11px] font-bold text-[#087f80] underline underline-offset-2 hover:text-[#092f45]">
                  {copy.login.forgotPassword}
                </Link>
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
                  placeholder={copy.login.passwordPlaceholder}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((previous) => ({ ...previous, password: undefined }));
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? `${passwordId}-error` : undefined}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-9 text-xs font-semibold text-[var(--khvi-ink)] transition-colors hover:border-[#8fbfc1] focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${fieldErrors.password ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#73848a] hover:text-[#294554]"
                  aria-label={showPassword ? copy.login.hidePassword : copy.login.showPassword}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {fieldErrors.password && <p id={`${passwordId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">{fieldErrors.password}</p>}
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
                <span>{copy.login.rememberMe}</span>
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
                    {copy.login.submitting}
                  </span>
                ) : (
                  copy.login.submit
                )}
              </button>
            </div>
          </form>

          <DevFastLoginPanel embedded />

          {/* Switch to Register */}
          <div className="border-t border-[#edf2f4] pt-3 text-center text-xs text-[#5c727d]">
            <span>{copy.login.noAccount} </span>
            {onSwitchToRegister ? (
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-extrabold text-[#0d8587] transition-colors hover:text-[#092f45] hover:underline"
              >
                {copy.login.signUp}
              </button>
            ) : (
              <Link
                href="/register"
                className="font-extrabold text-[#0d8587] transition-colors hover:text-[#092f45] hover:underline"
              >
                {copy.login.signUp}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
