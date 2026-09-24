"use client";

import { AppShell } from "@/app/components/app-shell";
import { AuthShell } from "@/app/components/auth/auth-shell";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { useStoredLocale } from "@/app/lib/locale";
import { LoginForm } from "./login-form";

export function DirectLoginPage() {
  const [locale] = useStoredLocale();
  const copy = getAuthCopy(locale);

  return (
    <AppShell hidePrimaryAction>
      <main id="main-content" className="flex-1 bg-[#f7f9fa] px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <AuthShell
            ariaLabel={copy.login.title}
            dir={locale === "ar" ? "rtl" : "ltr"}
            sideCopy={copy.side.login}
          >
            <LoginForm isEmbedded />
          </AuthShell>
        </div>
      </main>
    </AppShell>
  );
}
