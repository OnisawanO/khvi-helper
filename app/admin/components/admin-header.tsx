"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  CheckBadgeIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { BrandMark } from "@/app/components/brand-mark";
import { UserProfile } from "@/app/lib/auth-types";
import { useStoredLocale } from "@/app/lib/locale";
import { getAdminTranslation } from "../locales";

interface AdminHeaderProps {
  onMenuClick?: () => void;
  onSignOut: () => void;
  currentUser: UserProfile | null;
}

export function AdminHeader({
  onMenuClick,
  onSignOut,
  currentUser,
}: AdminHeaderProps) {
  const [locale, setLocale] = useStoredLocale();
  const t = getAdminTranslation(locale);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const userInitials = useMemo(() => {
    if (!currentUser?.name) return "IK";
    const parts = currentUser.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return currentUser.name.slice(0, 2).toUpperCase();
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#dbe3e7] bg-[#fbfdfc]/95 shadow-[0_8px_24px_rgba(21,52,67,0.06)] backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Mobile Drawer Button (Mobile only, desktop uses Rail Bar button) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-[#c9d8de] bg-white text-[#092f45] shadow-xs hover:border-[#087f80] hover:bg-[#edf7f5] hover:text-[#087f80] transition-colors focus:outline-none focus:ring-2 focus:ring-[#087f80]/30 cursor-pointer"
            aria-label={t.header.menu}
            title={t.header.menu}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <BrandMark subtitle={t.header.subtitle} href="/" ariaLabel={t.header.home} />
        </div>

        {/* Right Section: Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="sr-only" htmlFor="admin-interface-language">Interface language</label>
          <select
            id="admin-interface-language"
            value={locale}
            onChange={(event) => setLocale(event.target.value as typeof locale)}
            className="h-9 rounded-lg border border-[#c9d8de] bg-white px-2 text-xs font-bold text-[#294554]"
          >
            <option value="en">EN</option>
            <option value="th">TH</option>
            <option value="zh">ZH</option>
            <option value="es">ES</option>
            <option value="ar">AR</option>
          </select>
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl border border-[#c9d8de] bg-white px-3 py-1.5 shadow-2xs transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30 cursor-pointer"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#087f80] bg-[#092f45] text-xs font-black text-white">
                {userInitials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold leading-tight text-[#10283a]">
                  {currentUser?.name || "Ilham Khamsikeaw"}
                </p>
                <p className="text-[11px] font-semibold text-[#087f80]">
                  {currentUser?.role === "Admin"
                    ? currentUser.adminLevel === "primary"
                      ? t.header.primaryAdmin
                      : t.header.delegatedAdmin
                    : currentUser?.role || t.header.primaryAdmin}
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
                <div role="menu" aria-label={t.header.profile} className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#d6e0e4] bg-white p-2 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95 z-50">
                <div className="border-b border-[#eef3f5] px-3 py-2.5">
                  <p className="text-sm font-extrabold text-[#153447]">
                    {currentUser?.name || "Ilham Khamsikeaw"}
                  </p>
                  <p className="text-xs text-[#6a808a] truncate">
                    {currentUser?.email || "ilham.k@khvi-admin.org"}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#e6f4ef] px-2 py-0.5 text-[11px] font-bold text-[#087557]">
                    <CheckBadgeIcon className="h-3.5 w-3.5" />
                    {currentUser?.adminLevel === "primary" ? t.header.primaryAdmin : t.header.delegatedAdmin}
                  </span>
                </div>
                <div className="py-1 space-y-0.5">
                  <a
                    href="/profile#main-content"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#2d4957] transition-colors hover:bg-[#f2f7f9] hover:text-[#087f80] cursor-pointer"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    {t.header.profile}
                  </a>
                </div>
                <div className="border-t border-[#eef3f5] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onSignOut();
                    }}
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#d93829] transition-colors hover:bg-[#fff2f0] cursor-pointer"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    {t.header.signOut}
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
