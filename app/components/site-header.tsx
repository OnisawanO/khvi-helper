"use client";

import { Bars3Icon, CheckIcon, ChevronDownIcon, LanguageIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "./brand-mark";

export type Locale = "en" | "th" | "zh" | "my" | "vi";

type HeaderCopy = {
  brandSubtitle: string;
  languageLabel: string;
  signIn: string;
  primaryAction: string;
  nav: readonly (readonly [string, string])[];
};

type SiteHeaderProps = {
  copy: HeaderCopy;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onOpenRegister?: () => void;
  onOpenSignIn?: () => void;
};

const languageOptions = [
  { code: "en", label: "EN", name: "English", nativeName: "English" },
  { code: "th", label: "TH", name: "Thai", nativeName: "ไทย" },
  { code: "zh", label: "ZH", name: "Chinese", nativeName: "中文" },
  { code: "my", label: "MY", name: "Burmese", nativeName: "မြန်မာ" },
  { code: "vi", label: "VI", name: "Vietnamese", nativeName: "Tiếng Việt" },
] as const;

function getHashTarget(hash: string) {
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

function scrollToHashTarget(hash: string, behavior: ScrollBehavior = "smooth") {
  const target = getHashTarget(hash);

  if (!target) {
    return false;
  }

  const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const top = Math.max(targetTop - headerHeight - 24, 0);

  window.scrollTo({ top, behavior });
  return true;
}

function LanguageSwitcher({ copy, locale, onLocaleChange, compact = false }: SiteHeaderProps & { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languageOptions.find((option) => option.code === locale) ?? languageOptions[0];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={switcherRef} className={`relative ${compact ? "px-3 py-2" : "hidden sm:block"}`}>
      <button
        type="button"
        className={`flex h-10 items-center justify-between gap-2 rounded-lg border border-[#cbd7dc] bg-white px-3 text-xs font-extrabold text-[#425761] transition-colors hover:border-[#8fbfc1] hover:text-[#0d8587] ${
          compact ? "w-full" : "min-w-[7.5rem]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={copy.languageLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <LanguageIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{selectedLanguage.label}</span>
          <span className="hidden max-w-[5rem] truncate text-[#73848a] sm:inline">{selectedLanguage.nativeName}</span>
        </span>
        <ChevronDownIcon aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={copy.languageLabel}
          className={`absolute z-40 mt-2 overflow-hidden rounded-lg border border-[#d6e0e4] bg-white py-1 shadow-[0_18px_36px_rgba(19,52,68,0.16)] ${
            compact ? "left-3 right-3" : "right-0 w-56"
          }`}
        >
          {languageOptions.map((option) => {
            const isActive = option.code === locale;

            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive ? "bg-[#edf7f5] text-[#087f80]" : "text-[#294554] hover:bg-[#f4f8f4]"
                }`}
                onClick={() => {
                  onLocaleChange(option.code);
                  setOpen(false);
                }}
              >
                <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-md bg-[#eef4f1] text-xs font-extrabold text-[#173646]">{option.label}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{option.nativeName}</span>
                  <span className="block truncate text-xs text-[#73848a]">{option.name}</span>
                </span>
                {isActive && <CheckIcon aria-hidden="true" className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
function getRegisterLabel(locale: Locale) {
  switch (locale) {
    case "zh":
      return "注册";
    case "th":
      return "สมัครสมาชิก";
    case "my":
      return "စာရင်းသွင်းရန်";
    case "vi":
      return "Đăng ký";
    default:
      return "Sign up";
  }
}

export function SiteHeader({ copy, locale, onLocaleChange, onOpenRegister, onOpenSignIn }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashLinkClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");

      if (!link) {
        return;
      }

      const url = new URL(link.href);

      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) {
        return;
      }

      if (!getHashTarget(url.hash)) {
        return;
      }

      event.preventDefault();
      window.history.pushState(null, "", url.hash);
      scrollToHashTarget(url.hash);
    };

    const handleHashChange = () => {
      if (window.location.hash) {
        scrollToHashTarget(window.location.hash);
      }
    };

    document.addEventListener("click", handleHashLinkClick);
    window.addEventListener("hashchange", handleHashChange);

    const animationFrame = window.location.hash
      ? requestAnimationFrame(() => scrollToHashTarget(window.location.hash, "auto"))
      : null;
    const timeout = window.location.hash
      ? window.setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), 250)
      : null;

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (timeout) {
        window.clearTimeout(timeout);
      }

      document.removeEventListener("click", handleHashLinkClick);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const registerLabel = getRegisterLabel(locale);
  const primaryActionLabel = copy.primaryAction;

  return (
    <header className="sticky top-0 z-30 border-b border-[#dbe3e7] bg-[#fbfdfc]/95 shadow-[0_8px_24px_rgba(21,52,67,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:gap-6 lg:px-12">
        <BrandMark subtitle={copy.brandSubtitle} />
        <nav className="hidden items-center gap-7 text-[13px] font-extrabold text-[#39525d] lg:flex" aria-label="Primary navigation">
          {copy.nav.map(([label, href]) => (
            <a key={href} className="transition-colors hover:text-[#0d8587]" href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher copy={copy} locale={locale} onLocaleChange={onLocaleChange} />
          {onOpenRegister ? (
            <button
              type="button"
              onClick={onOpenRegister}
              className="hidden h-10 items-center rounded-lg border border-[#0d8587] bg-[#edf7f5] px-3.5 text-xs font-extrabold text-[#087f80] transition-colors hover:bg-[#d8efe9] sm:flex"
            >
              {registerLabel}
            </button>
          ) : (
            <a
              className="hidden h-10 items-center rounded-lg border border-[#0d8587] bg-[#edf7f5] px-3.5 text-xs font-extrabold text-[#087f80] transition-colors hover:bg-[#d8efe9] sm:flex"
              href="/register"
            >
              {registerLabel}
            </a>
          )}
          {onOpenSignIn ? (
            <button
              type="button"
              onClick={onOpenSignIn}
              className="hidden h-10 items-center rounded-lg border border-[#123b4f] px-4 text-xs font-extrabold text-[#123b4f] transition-colors hover:bg-[#edf3f1] sm:flex"
            >
              {copy.signIn}
            </button>
          ) : (
            <a className="hidden h-10 items-center rounded-lg border border-[#123b4f] px-4 text-xs font-extrabold text-[#123b4f] transition-colors hover:bg-[#edf3f1] sm:flex" href="/login">
              {copy.signIn}
            </a>
          )}
          <a className="flex h-10 items-center rounded-lg bg-[#092f45] px-4 text-xs font-extrabold text-white shadow-[0_6px_14px_rgba(9,47,69,0.16)] transition-colors hover:bg-[#0c4960] sm:px-5" href="/request-help">
            {primaryActionLabel}
          </a>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cbd7dc] bg-white text-lg text-[#123b4f] transition-colors hover:border-[#8fbfc1] hover:text-[#0d8587] lg:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <XMarkIcon aria-hidden="true" className="h-5 w-5" /> : <Bars3Icon aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-[#e3eaed] bg-white px-5 py-3 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1 sm:px-3">
            {copy.nav.map(([label, href]) => (
              <a key={href} className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]" href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <LanguageSwitcher copy={copy} locale={locale} onLocaleChange={onLocaleChange} compact />
            {onOpenRegister ? (
              <button
                type="button"
                className="rounded-lg px-3 py-3 text-left text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#eef5f7]"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenRegister();
                }}
              >
                {registerLabel}
              </button>
            ) : (
              <a
                className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#eef5f7]"
                href="/register"
                onClick={() => setMenuOpen(false)}
              >
                {registerLabel}
              </a>
            )}
            {onOpenSignIn ? (
              <button
                type="button"
                className="rounded-lg px-3 py-3 text-left text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSignIn();
                }}
              >
                {copy.signIn}
              </button>
            ) : (
              <a className="rounded-lg px-3 py-3 text-sm font-extrabold text-[#39525d] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587]" href="/login" onClick={() => setMenuOpen(false)}>
                {copy.signIn}
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
