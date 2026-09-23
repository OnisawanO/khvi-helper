"use client";

import { useState } from "react";
import { BeakerIcon } from "@heroicons/react/24/outline";
import { getAuthCopy } from "@/app/lib/auth-copy";
import { useStoredLocale } from "@/app/lib/locale";
import { authApi } from "@/app/lib/auth-client";
import { getRedirectPathByRole, type UserProfile, type UserRole } from "@/app/lib/auth-types";

export function DevFastLoginPanel({ onSuccess, embedded = false }: { onSuccess?: (user: UserProfile) => void; embedded?: boolean }) {
  const [locale] = useStoredLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = getAuthCopy(locale);

  if (process.env.NODE_ENV === "production") return null;

  async function handleQuickLogin(role: UserRole) {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authApi.fastLogin(role);
      if (!result.ok) {
        setError(result.error.message || copy.login.fastLoginError);
        return;
      }

      if (result.data.user.role !== role) {
        setError(copy.login.fastLoginRoleMismatch);
        return;
      }

      if (onSuccess) {
        onSuccess(result.data.user);
      } else {
        window.location.assign(result.data.redirectPath || getRedirectPathByRole(result.data.user.role));
      }
    } catch {
      setError(copy.login.fastLoginError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <details className={`${embedded ? "mt-4" : "mx-auto mt-4 w-full max-w-5xl"} rounded-2xl border border-dashed border-[#b9cbd1] bg-white/70 px-4 py-3 text-[#52676f]`}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-extrabold text-[#52676f]">
        <BeakerIcon className="h-4 w-4 text-[#087f80]" aria-hidden="true" />
        {copy.login.fastLoginTitle}
      </summary>
      <div className="mt-3 border-t border-[#edf2f4] pt-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ["User", copy.roleLabels.User, "text-[#10283a]", "hover:border-[#087f80] hover:bg-[#edf7f5]"],
            ["Interpreter", copy.roleLabels.Interpreter, "text-[#087f80]", "hover:border-[#087f80] hover:bg-[#edf7f5]"],
            ["Manager", copy.roleLabels.Manager, "text-[#b5680b]", "hover:border-[#b5680b] hover:bg-[#fff9ef]"],
            ["Admin", copy.roleLabels.Admin, "text-[#f04f3e]", "hover:border-[#f04f3e] hover:bg-[#fef4f3]"],
          ] as const).map(([role, label, textColor, hoverColor]) => (
            <button
              key={role}
              type="button"
              onClick={() => handleQuickLogin(role)}
              disabled={isSubmitting}
              className={`flex min-h-12 flex-col items-center justify-center rounded-lg border border-[#cbd7dc] bg-[#f7f9fa] p-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80] ${hoverColor}`}
            >
              <span className={`text-[11px] font-black ${textColor}`}>{role}</span>
              <span className="text-[9px] text-[#73848a]">{label}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-4 text-[#73848a]">{copy.login.fastLoginNote}</p>
        {error && <p role="alert" className="mt-2 text-xs font-bold text-[#b92b1b]">{error}</p>}
      </div>
    </details>
  );
}
