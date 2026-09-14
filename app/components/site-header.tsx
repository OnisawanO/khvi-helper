"use client";

import { Bars3Icon, CheckIcon, ChevronDownIcon, LanguageIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  accountActions?: ReactNode;
  workspaceRole?: "User" | "Interpreter";
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

export function SiteHeader({ copy, locale, onLocaleChange, onOpenRegister, onOpenSignIn, accountActions, workspaceRole }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isRequestWorkspacePage =
    pathname === "/request-help" ||
    pathname.startsWith("/my-requests") ||
    pathname === "/find-requests" ||
    pathname.startsWith("/my-assignments");
  const navItems = isRequestWorkspacePage ? copy.nav.slice(0, 2) : copy.nav;

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

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const triggerButton = menuButtonRef.current;
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleDesktopChange);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleDesktopChange);
      triggerButton?.focus();
    };
  }, [menuOpen]);

  const registerLabel = getRegisterLabel(locale);
  const primaryActionLabel = copy.primaryAction;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#dbe3e7] bg-[#fbfdfc]/95 shadow-[0_8px_24px_rgba(21,52,67,0.06)] backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:gap-6 lg:px-12">
        <BrandMark
          subtitle={copy.brandSubtitle}
          href={workspaceRole ? "/welcome" : "/#top"}
          ariaLabel={workspaceRole ? "KHVI welcome" : "KHVI home"}
        />
        <nav className="hidden items-center gap-7 text-[13px] font-extrabold text-[#39525d] lg:flex" aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <a key={href} className="transition-colors hover:text-[#0d8587]" href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher copy={copy} locale={locale} onLocaleChange={onLocaleChange} />
          {accountActions ?? <>{onOpenRegister ? (
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
          {!isLandingPage && !isRequestWorkspacePage && (
            <a className="flex h-10 items-center rounded-lg bg-[#092f45] px-4 text-xs font-extrabold text-white shadow-[0_6px_14px_rgba(9,47,69,0.16)] transition-colors hover:bg-[#0c4960] sm:px-5" href="/request-help#main-content">
              {primaryActionLabel}
            </a>
          )}
          </>}
          <button
            ref={menuButtonRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#cbd7dc] bg-white text-lg text-[#123b4f] transition-colors hover:border-[#8fbfc1] hover:text-[#0d8587] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80] lg:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default bg-[#092f45]/45 backdrop-blur-[2px] animate-in fade-in duration-200"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            ref={drawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 flex h-dvh w-[min(88vw,360px)] flex-col overflow-hidden bg-white shadow-[-18px_0_45px_rgba(9,47,69,0.24)] animate-in slide-in-from-right duration-200 motion-reduce:animate-none"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#e1e9ec] px-5 py-4">
              <BrandMark subtitle={copy.brandSubtitle} href={workspaceRole ? "/welcome" : "/#top"} ariaLabel={workspaceRole ? "KHVI welcome" : "KHVI home"} />
              <button
                ref={closeButtonRef}
                type="button"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[#cbd7dc] text-[#123b4f] transition-colors hover:border-[#8fbfc1] hover:bg-[#eef7f5] hover:text-[#087f80] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
                aria-label="Close navigation menu"
                onClick={() => setMenuOpen(false)}
              >
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map(([label, href]) => (
                  <a key={href} className="flex min-h-12 items-center rounded-xl px-4 py-3 text-base font-extrabold text-[#294554] transition-colors hover:bg-[#eef5f7] hover:text-[#0d8587] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#087f80]" href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
              </nav>

              <div className="my-4 border-t border-[#e1e9ec]" />
              <p className="px-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#78909a]">{copy.languageLabel}</p>
              <LanguageSwitcher copy={copy} locale={locale} onLocaleChange={onLocaleChange} compact />
            </div>

            {!accountActions && (
              <div className="grid gap-2 border-t border-[#e1e9ec] bg-[#f7faf9] p-4">
                {onOpenRegister ? (
              <button
                type="button"
                    className="flex min-h-12 items-center justify-center rounded-xl border border-[#0d8587] bg-[#edf7f5] px-4 py-3 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#d8efe9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenRegister();
                }}
              >
                {registerLabel}
              </button>
            ) : (
              <a
                    className="flex min-h-12 items-center justify-center rounded-xl border border-[#0d8587] bg-[#edf7f5] px-4 py-3 text-sm font-extrabold text-[#087f80] transition-colors hover:bg-[#d8efe9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
                href="/register"
                onClick={() => setMenuOpen(false)}
              >
                {registerLabel}
              </a>
            )}
            {onOpenSignIn ? (
              <button
                type="button"
                    className="flex min-h-12 items-center justify-center rounded-xl border border-[#123b4f] bg-white px-4 py-3 text-sm font-extrabold text-[#123b4f] transition-colors hover:bg-[#edf3f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123b4f]"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSignIn();
                }}
              >
                {copy.signIn}
              </button>
            ) : (
                  <a className="flex min-h-12 items-center justify-center rounded-xl border border-[#123b4f] bg-white px-4 py-3 text-sm font-extrabold text-[#123b4f] transition-colors hover:bg-[#edf3f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123b4f]" href="/login" onClick={() => setMenuOpen(false)}>
                {copy.signIn}
              </a>
            )}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
