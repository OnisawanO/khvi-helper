"use client";

import { AuthShell } from "./auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";
import { ResetPasswordForm } from "./reset-password-form";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { useStoredLocale } from "@/app/lib/locale";

export function AuthUtilityPage({ variant }: { variant: "forgot" | "reset" }) {
  const [locale] = useStoredLocale();
  const copy = getAuthCopy(locale);
  const isArabic = locale === "ar";

  return (
    <main
      id="main-content"
      className={`flex-1 bg-[#f7f9fa] px-4 sm:px-8 lg:px-12 ${
        variant === "reset"
          ? "pb-8 pt-4 sm:pb-12 sm:pt-8 lg:pb-16 lg:pt-10"
          : "py-8 sm:py-12 lg:py-16"
      }`}
    >
      <AuthShell
        ariaLabel={copy.login.resetPasswordTitle}
        dir={isArabic ? "rtl" : "ltr"}
        mode="page"
        sideCopy={copy.side.login}
      >
        {variant === "forgot" ? <ForgotPasswordForm /> : <ResetPasswordForm />}
      </AuthShell>
    </main>
  );
}
