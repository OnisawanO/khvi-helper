"use client";

import { ArrowLeftOnRectangleIcon, CheckBadgeIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "@/app/lib/mock-auth";
import { useCopyLocale } from "./app-shell";

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "KH";
}

export function WorkspaceAccountActions({ user, onSignOut }: { user: UserProfile; onSignOut: () => void }) {
  const zh = useCopyLocale() === "zh";
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

  const statusLabel = user.isLocked ? "Locked account" : "Active account";

  return (
    <div ref={profileMenuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setProfileMenuOpen((open) => !open)}
        className="flex items-center gap-2.5 rounded-lg border border-[#c9d8de] bg-white px-3 py-1.5 shadow-sm transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30"
        aria-expanded={profileMenuOpen}
        aria-haspopup="menu"
      >
        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#087f80] bg-[#092f45] text-xs font-extrabold text-white">
          {getInitials(user.name)}
        </div>
        <div className="hidden text-left sm:block">
          <p className="max-w-44 truncate text-xs font-extrabold leading-tight text-[#10283a]">{user.name}</p>
          <p className="text-[11px] font-semibold text-[#087f80]">{user.role}</p>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 text-[#5e7783] transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {profileMenuOpen && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-[#d6e0e4] bg-white p-2 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95">
          <div className="border-b border-[#eef3f5] px-3 py-2.5">
            <p className="text-sm font-extrabold text-[#153447]">{user.name}</p>
            <p className="text-xs text-[#6a808a]">{user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#e6f4ef] px-2 py-0.5 text-[11px] font-bold text-[#087557]">
              <CheckBadgeIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {statusLabel}
            </span>
          </div>
          <div className="border-t border-[#eef3f5] pt-1">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold text-[#d93829] transition-colors hover:bg-[#fff2f0]"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
              {zh ? "退出" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
