"use client";

import { ArrowRightOnRectangleIcon, ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "@/app/lib/mock-auth";
import { useUiLocale } from "./app-shell";

const accountCopy = {
  en: { menu: "Open profile menu", profileSettings: "Profile & Settings", signOut: "Sign out" },
  th: { menu: "เปิดเมนูโปรไฟล์", profileSettings: "โปรไฟล์และการตั้งค่า", signOut: "ออกจากระบบ" },
  zh: { menu: "打开个人资料菜单", profileSettings: "个人资料与设置", signOut: "退出" },
  my: { menu: "ပရိုဖိုင်မီနူး ဖွင့်ရန်", profileSettings: "ပရိုဖိုင်နှင့် ဆက်တင်များ", signOut: "ထွက်ရန်" },
  vi: { menu: "Mở menu hồ sơ", profileSettings: "Hồ sơ và cài đặt", signOut: "Đăng xuất" },
} as const;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";

  return parts.slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();
}

export function WorkspaceAccountActions({ user, onSignOut }: { user: UserProfile; onSignOut: () => void }) {
  const locale = useUiLocale();
  const copy = accountCopy[locale];
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
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
    <div ref={profileMenuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setProfileMenuOpen((open) => !open)}
        className="flex h-11 items-center gap-2 rounded-(--khvi-radius-sm) border border-(--khvi-teal)/30 bg-(--khvi-surface) px-2 shadow-sm transition-colors hover:border-(--khvi-teal) hover:bg-(--khvi-paper) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun) sm:px-3"
        aria-label={copy.menu}
        aria-expanded={profileMenuOpen}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--khvi-navy) text-xs font-extrabold text-white">
          {getInitials(user.name)}
        </span>
        <span className="hidden min-w-0 text-left md:block">
          <span className="block max-w-36 truncate text-xs font-extrabold leading-tight text-(--khvi-ink)">{user.name}</span>
          <span className="mt-0.5 block text-[11px] font-semibold text-(--khvi-teal)">{user.role}</span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-(--khvi-ink)/60 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {profileMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-(--khvi-radius-md) border border-(--khvi-teal)/20 bg-(--khvi-surface) p-2 shadow-[0_18px_36px_rgba(19,52,68,0.16)]"
        >
          <div className="border-b border-(--khvi-teal)/15 px-3 py-2.5">
            <p className="truncate text-sm font-extrabold text-(--khvi-ink)">{user.name}</p>
            <p className="mt-0.5 truncate text-xs text-(--khvi-ink)/60">{user.email}</p>
            <span className="mt-2 inline-flex rounded-md bg-(--khvi-teal)/10 px-2 py-0.5 text-[11px] font-bold text-(--khvi-teal)">
              {user.role}
            </span>
          </div>
          <div className="py-1">
            <a
              href="#profile"
              role="menuitem"
              onClick={() => setProfileMenuOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-(--khvi-radius-sm) px-3 py-2 text-xs font-bold text-(--khvi-ink)/80 transition-colors hover:bg-(--khvi-paper) hover:text-(--khvi-teal) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--khvi-sun)"
            >
              <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
              {copy.profileSettings}
            </a>
          </div>
          <div className="border-t border-(--khvi-teal)/15 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setProfileMenuOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-(--khvi-radius-sm) px-3 py-2 text-left text-xs font-bold text-(--khvi-coral) transition-colors hover:bg-(--khvi-coral)/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--khvi-sun)"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
              {copy.signOut}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
