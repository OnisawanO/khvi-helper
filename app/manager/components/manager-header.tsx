"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  CheckBadgeIcon,
  CheckIcon,
  ChevronDownIcon,
  LanguageIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { BrandMark } from "@/app/components/brand-mark";
import { UserProfile } from "@/app/lib/auth-types";
import { useStoredLocale } from "@/app/lib/locale";
import { getManagerTranslation } from "../locales";

const languageOptions = [
  { code: "en", label: "EN", name: "English", nativeName: "English" },
  { code: "th", label: "TH", name: "Thai", nativeName: "ไทย" },
  { code: "zh", label: "ZH", name: "Chinese", nativeName: "中文" },
  { code: "es", label: "ES", name: "Spanish", nativeName: "Español" },
  { code: "ar", label: "AR", name: "Arabic", nativeName: "العربية" },
] as const;

interface ManagerHeaderProps {
  onMenuClick?: () => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
}

export function ManagerHeader({
  onMenuClick,
  currentUser,
  onSignOut,
}: ManagerHeaderProps) {
  const [locale, setLocale] = useStoredLocale();
  const t = getManagerTranslation(locale).header;
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const selectedLang = languageOptions.find((o) => o.code === locale) || languageOptions[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitials = useMemo(() => {
    if (!currentUser?.name) return "VP";
    const parts = currentUser.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return currentUser.name.slice(0, 2).toUpperCase();
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#dbe3e7] bg-[#fbfdfc]/95 shadow-[0_8px_24px_rgba(21,52,67,0.06)] backdrop-blur select-none">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Sidebar Toggle Button (Mobile only, desktop uses Rail Bar button) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-[#c9d8de] bg-white text-[#092f45] shadow-xs hover:border-[#087f80] hover:bg-[#edf7f5] hover:text-[#087f80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#087f80]/30 cursor-pointer"
            aria-label={t.toggleMenu}
            title={t.toggleMenu}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Brand Mark with Subtitle */}
          <BrandMark
            subtitle={t.hubSubtitle}
            href="/"
            ariaLabel={t.profile}
          />
        </div>

        {/* Right Section: Language Switcher + Profile Card */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div ref={langMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen((prev) => !prev)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#c9d8de] bg-white px-2.5 sm:px-3 text-xs font-bold text-[#344d59] shadow-2xs hover:border-[#087f80] hover:bg-[#edf7f5] hover:text-[#087f80] transition-colors cursor-pointer"
              aria-label={t.interfaceLanguage}
              aria-expanded={langMenuOpen}
            >
              <LanguageIcon className="h-4 w-4 text-[#087f80] shrink-0" />
              <span>{selectedLang.label}</span>
              <span className="hidden sm:inline text-[#7a939e] text-[11px]">({selectedLang.nativeName})</span>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[#7a939e] transition-transform ${
                  langMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Language Menu */}
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#d6e0e4] bg-white p-1.5 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95 z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#7a939e] border-b border-slate-100 mb-1">
                  {t.interfaceLanguage}
                </div>
                {languageOptions.map((opt) => {
                  const isCurrent = opt.code === locale;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLocale(opt.code);
                        setLangMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors cursor-pointer text-left ${
                        isCurrent
                          ? "bg-[#edf7f5] text-[#087f80]"
                          : "text-[#2d4957] hover:bg-[#f2f7f9] hover:text-[#087f80]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700">
                          {opt.label}
                        </span>
                        <span>{opt.nativeName}</span>
                      </div>
                      {isCurrent && <CheckIcon className="h-3.5 w-3.5 text-[#087f80]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile Card with Dropdown Menu */}
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl border border-[#c9d8de] bg-white px-3 py-1.5 shadow-2xs transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30 cursor-pointer"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              {/* Round Initial Avatar */}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#087f80] bg-[#092f45] text-xs font-black text-white">
                {userInitials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold leading-tight text-[#10283a]">
                  {currentUser?.name || "Wipha Inspector"}
                </p>
                <p className="text-[11px] font-semibold text-[#087f80]">
                  {currentUser?.role === "Manager" ? t.roleManager : currentUser?.role || t.roleManager}
                </p>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-[#5e7783] transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#d6e0e4] bg-white p-2 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95 z-50">
                <div className="border-b border-[#eef3f5] px-3 py-2.5">
                  <p className="text-sm font-extrabold text-[#153447]">
                    {currentUser?.name || "Wipha Inspector"}
                  </p>
                  <p className="text-xs text-[#6a808a] truncate">
                    {currentUser?.email || "manager@khvi.org"}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#e6f4ef] px-2 py-0.5 text-[11px] font-bold text-[#087557]">
                    <CheckBadgeIcon className="h-3.5 w-3.5" />
                    {t.verifiedManager}
                  </span>
                </div>
                <div className="py-1 space-y-0.5">
                  <a
                    href="/profile#main-content"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#2d4957] transition-colors hover:bg-[#f2f7f9] hover:text-[#087f80] cursor-pointer"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    {t.profile}
                  </a>
                </div>
                <div className="border-t border-[#eef3f5] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#d93829] transition-colors hover:bg-[#fff2f0] cursor-pointer"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    {t.signOut}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

