"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { EnvelopeIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { useStoredLocale } from "@/app/lib/locale";
import { authApi } from "@/app/lib/auth-client";

export function ForgotPasswordForm() {
  const [locale] = useStoredLocale();
  const copy = getAuthCopy(locale);
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError(copy.login.emptyEmail);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(copy.login.invalidEmail);
      return;
    }

    setIsSubmitting(true);
    const result = await authApi.requestPasswordReset(trimmedEmail, locale);
    if (!result.ok) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    setIsSent(true);
    setIsSubmitting(false);
  }

  if (isSent) {
    return (
      <div className="rounded-2xl border border-[#a3d9c9] bg-[#eefaf6] p-6 text-center">
        <PaperAirplaneIcon className="mx-auto h-10 w-10 text-[#0a8264]" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-extrabold text-[#095744]">{copy.login.resetPasswordSuccess}</h1>
        <p className="mt-2 text-sm leading-6 text-[#186a55]">{email}</p>
        <Link href="/login" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#092f45] px-5 text-sm font-extrabold text-white hover:bg-[#0c4960]">
          {copy.login.resetPasswordBack}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-[var(--khvi-ink)] sm:text-3xl">{copy.login.resetPasswordTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-[#5c727d]">{copy.login.resetPasswordDescription}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && <div role="alert" className="rounded-lg border border-[#f3b5ad] bg-[#fdf2f0] p-3 text-xs font-bold text-[#b92b1b]">{error}</div>}
        <div>
          <label htmlFor={emailId} className="block text-sm font-extrabold text-[#294554]">{copy.register.email}</label>
          <div className="relative mt-1">
            <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73848a]" aria-hidden="true" />
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              className={`w-full rounded-lg border bg-white py-3 pl-9 pr-3 text-sm font-semibold text-[var(--khvi-ink)] focus:border-[#0d8587] focus:outline-none focus:ring-2 focus:ring-[#0d8587]/20 ${error ? "border-[#e24432]" : "border-[#cbd7dc]"}`}
            />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#092f45] px-6 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(9,47,69,0.18)] hover:bg-[#0c4960] disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? copy.login.resetPasswordSubmitting : copy.login.resetPasswordSubmit}
        </button>
        <div className="border-t border-[#edf2f4] pt-4 text-center text-sm text-[#5c727d]">
          <Link href="/login" className="font-extrabold text-[#087f80] underline underline-offset-2 hover:text-[#092f45]">{copy.login.resetPasswordBack}</Link>
        </div>
      </form>
    </div>
  );
}
