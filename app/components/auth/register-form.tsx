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
  PhoneIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useStoredLocale } from "@/app/lib/locale";
import { getAuthCopy } from "@/app/lib/auth-copy";
import {
  calculateAge,
  validateRegisterInput,
  type RegisterInput,
  type ValidationErrors,
} from "@/app/lib/mock-auth";
import { authApi } from "@/app/lib/auth-client";
import { DatePicker, toDateInputValue } from "./date-picker";

export interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
  isEmbedded?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  onSwitchToSignIn?: () => void;
}

export function RegisterForm({
  onSuccess,
  onCancel,
  isModal = false,
  isEmbedded = false,
  onDirtyChange,
  onSwitchToSignIn,
}: RegisterFormProps) {
  const router = useRouter();
  const [currentLocale] = useStoredLocale();
  const copy = getAuthCopy(currentLocale);

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const phoneId = useId();
  const dobId = useId();

  const [formData, setFormData] = useState<RegisterInput>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    preferredUiLanguage: currentLocale,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    onDirtyChange?.(Object.values(formData).some(Boolean));
  }, [formData, onDirtyChange]);

  useEffect(() => {
    let disposed = false;
    queueMicrotask(() => {
      if (disposed) return;
      setFormData((previous) => ({ ...previous, preferredUiLanguage: currentLocale }));
    });

    return () => {
      disposed = true;
    };
  }, [currentLocale]);

  const calculatedAge = calculateAge(formData.dateOfBirth);
  const todayStr = toDateInputValue(new Date());

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
      const validationErrors = validateRegisterInput(formData, currentLocale);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        window.setTimeout(() => {
          document.querySelector<HTMLElement>("form [aria-invalid=\"true\"]")?.focus();
        }, 0);
        return;
      }

      const result = await authApi.register({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      });

      if (!result.ok) {
        const details = result.error.details;
        const fieldErrors = details && typeof details === "object"
          ? details as ValidationErrors
          : {};
        setErrors({ ...fieldErrors, general: result.error.message });
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/welcome#welcome-user");
        }
      }, 1000);
    } catch {
      setErrors({ general: copy.register.genericError });
      setIsSubmitting(false);
    }
  }

  const containerClasses = isModal || isEmbedded
    ? "w-full"
    : "rounded-2xl border border-[#d6e0e4] bg-white p-6 shadow-[var(--khvi-shadow-soft)] sm:p-10";
  const errorSummary = errors.general || Object.values(errors).find(Boolean);

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-[#eef5f7] px-3.5 py-1 text-xs font-bold text-[#0d8587]">
          <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
          <span>{copy.register.eyebrow}</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-[var(--khvi-ink)] sm:text-2xl">
          {copy.register.title}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#5c727d]">
          {copy.register.description}
        </p>
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
            {copy.register.successTitle}
          </h3>
          <p className="mt-1 text-xs text-[#186a55]">
            {copy.register.successBody}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errorSummary && (
            <div
              role="alert"
              className="rounded-lg border border-[#f3b5ad] bg-[#fdf2f0] p-3 text-xs font-bold text-[#b92b1b]"
            >
              {errorSummary}
            </div>
          )}

          {/* First and Last Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={firstNameId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
                {copy.register.firstName} <span className="text-[#e24432]">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                  <UserIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id={firstNameId}
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder={copy.register.firstNamePlaceholder}
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? `${firstNameId}-error` : undefined}
                  className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${
                    errors.firstName ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc] hover:border-[#8fbfc1]"
                  }`}
                />
              </div>
              {errors.firstName && (
                <p id={`${firstNameId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={lastNameId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
                {copy.register.lastName} <span className="text-[#e24432]">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                  <UserIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id={lastNameId}
                  type="text"
                  required
                  autoComplete="family-name"
                  placeholder={copy.register.lastNamePlaceholder}
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? `${lastNameId}-error` : undefined}
                  className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[var(--khvi-ink)] transition-colors focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${
                    errors.lastName ? "border-[#e24432] bg-[#fdf8f7]" : "border-[#cbd7dc] hover:border-[#8fbfc1]"
                  }`}
                />
              </div>
              {errors.lastName && (
                <p id={`${lastNameId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor={emailId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
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
                {copy.register.password} <span className="text-[#e24432]">*</span>
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
                  placeholder={copy.register.passwordPlaceholder}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={`${passwordId}-hint${errors.password ? ` ${passwordId}-error` : ""}`}
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
              <p id={`${passwordId}-hint`} className={`mt-1 text-[11px] font-semibold ${formData.password.length >= 8 ? "text-[#0a8264]" : "text-[#73848a]"}`}>
                {formData.password.length >= 8 ? "✓" : "•"} {copy.validation.passwordMin}
              </p>
              {errors.password && (
                <p id={`${passwordId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={confirmPasswordId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
                {copy.register.confirmPassword} <span className="text-[#e24432]">*</span>
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
                  placeholder={copy.register.confirmPasswordPlaceholder}
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
              {copy.register.phone} <span className="text-[11px] font-semibold text-[#73848a]">({copy.register.optional})</span>
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#73848a]">
                <PhoneIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id={phoneId}
                type="tel"
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
                {copy.register.phoneHint}
              </p>
            )}
          </div>
          {/* Date of Birth & Live Age Calculation */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor={dobId} className="block text-xs font-extrabold text-[#294554] sm:text-sm">
                {copy.register.dateOfBirth} <span className="text-[#e24432]">*</span>
              </label>
              {calculatedAge !== null && (
                <span className="inline-flex items-center rounded-md bg-[#edf7f5] px-2 py-0.5 text-[11px] font-extrabold text-[#087f80]">
                  {copy.register.age(calculatedAge)}
                </span>
              )}
            </div>
            <div className="mt-1">
              <DatePicker
                id={dobId}
                label={copy.register.dateOfBirth}
                locale={currentLocale}
                maxDate={todayStr}
                value={formData.dateOfBirth}
                onChange={(dateValue) => handleChange("dateOfBirth", dateValue)}
                invalid={Boolean(errors.dateOfBirth)}
              />
            </div>
            {errors.dateOfBirth && (
              <p id={`${dobId}-error`} className="mt-1 text-xs font-bold text-[#e24432]">
                {errors.dateOfBirth}
              </p>
            )}
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
                {copy.register.cancel}
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
                  {copy.register.submitting}
                </span>
              ) : (
                copy.register.submit
              )}
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <div className="mt-6 border-t border-[#edf2f4] pt-4 text-center text-xs text-[#5c727d]">
        <span>{copy.register.existingAccount} </span>
        {onSwitchToSignIn ? (
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-extrabold text-[#0d8587] transition-colors hover:text-[#092f45] hover:underline cursor-pointer"
          >
            {copy.register.signInHere}
          </button>
        ) : (
          <Link
            href="/login"
            className="font-extrabold text-[#0d8587] transition-colors hover:text-[#092f45] hover:underline"
          >
            {copy.register.signInHere}
          </Link>
        )}
      </div>
    </div>
  );
}
