"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/client";

export const LOCALE_STORAGE_KEY = "khvi-locale";
export const LOCALE_USER_SELECTED_KEY = "khvi-locale-user-selected";
export const LOCALE_CHANGE_EVENT = "khvi-locale-change";
// Keep the client default aligned with public.profiles.preferred_ui_language.
const DEFAULT_LOCALE: Locale = "th";

export const localeLanguageTags: Record<Locale, string> = {
  en: "en",
  th: "th",
  zh: "zh-Hans",
  es: "es",
  ar: "ar",
};

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "th" || value === "zh" || value === "es" || value === "ar";
}

/** Localized UI copy follows the selected interface locale. */
export type CopyLocale = Locale;

export function resolveCopyLocale(locale: Locale): CopyLocale {
  return locale;
}

function applyLocaleToDocument(locale: Locale) {
  document.documentElement.lang = localeLanguageTags[locale];
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

/** Persist the signed-in user's UI preference without exposing privileged keys. */
export async function persistPreferredUiLanguage(locale: Locale): Promise<void> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { error } = await supabase
    .from("profiles")
    .update({ preferred_ui_language: locale })
    .eq("user_id", userData.user.id);

  if (error) {
    const details = [
      typeof error.code === "string" ? `code=${error.code}` : null,
      typeof error.message === "string" ? error.message : null,
      typeof error.details === "string" ? error.details : null,
      typeof error.hint === "string" ? `hint=${error.hint}` : null,
    ].filter(Boolean).join("; ");
    throw new Error(details || "Supabase rejected the preferred UI language update.");
  }
}

/** Locale picked in the header, persisted so it survives navigation between routes. */
export function useStoredLocale(): [Locale, (locale: Locale) => void] {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  const updateLocale = useCallback((nextLocale: Locale) => {
    setLocale(nextLocale);

    if (typeof window === "undefined") return;

    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    window.localStorage.setItem(LOCALE_USER_SELECTED_KEY, "true");
    applyLocaleToDocument(nextLocale);
    window.dispatchEvent(new CustomEvent<Locale>(LOCALE_CHANGE_EVENT, { detail: nextLocale }));
  }, []);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(savedLocale)) {
      queueMicrotask(() => setLocale(savedLocale));
      applyLocaleToDocument(savedLocale);
    } else {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, DEFAULT_LOCALE);
      applyLocaleToDocument(DEFAULT_LOCALE);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== LOCALE_STORAGE_KEY) return;
      if (isLocale(event.newValue)) {
        setLocale(event.newValue);
        applyLocaleToDocument(event.newValue);
      }
    };

    const handleLocaleChange = (event: Event) => {
      const nextLocale = (event as CustomEvent<Locale>).detail;
      if (!isLocale(nextLocale)) return;
      setLocale(nextLocale);
      applyLocaleToDocument(nextLocale);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange);
    };
  }, []);

  useEffect(() => {
    applyLocaleToDocument(locale);
  }, [locale]);

  return [locale, updateLocale];
}
