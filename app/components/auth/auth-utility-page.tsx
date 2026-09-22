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
    <main id="main-content" className="flex-1 bg-[#f7f9fa] px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
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
