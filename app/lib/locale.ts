"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/app/components/site-header";

export const LOCALE_STORAGE_KEY = "khvi-locale";

export const localeLanguageTags: Record<Locale, string> = {
  en: "en",
  th: "th",
  zh: "zh-Hans",
  my: "my",
  vi: "vi",
};

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "th" || value === "zh" || value === "my" || value === "vi";
}

/** UI copy is authored in English and Chinese. Every other locale falls back to English. */
export type CopyLocale = "en" | "zh";

export function resolveCopyLocale(locale: Locale): CopyLocale {
  return locale === "zh" ? "zh" : "en";
}

/** Locale picked in the header, persisted so it survives navigation between routes. */
export function useStoredLocale(): [Locale, (locale: Locale) => void] {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    return isLocale(savedLocale) ? savedLocale : "en";
  });

  useEffect(() => {
    document.documentElement.lang = localeLanguageTags[locale];
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  return [locale, setLocale];
}
