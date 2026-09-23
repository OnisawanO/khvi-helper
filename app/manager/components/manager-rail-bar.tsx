"use client";

import {
  ArchiveBoxXMarkIcon,
  Bars3Icon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  InboxStackIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { ManagerNavSection } from "../types";
import { formatBadgeCount } from "../utils";
import type { ManagerTranslation } from "../locales";

interface ManagerRailBarProps {
  onMenuClick: () => void;
  navSection: ManagerNavSection;
  setNavSection: (section: ManagerNavSection) => void;
  pendingCount: number;
  approvedCount: number;
  pendingProfileChangeCount: number;
  rejectedCount: number;
  pendingReportCount: number;
  t: ManagerTranslation["navigation"];
}

export function ManagerRailBar({
  onMenuClick,
  navSection,
  setNavSection,
  pendingCount,
  approvedCount,
  pendingProfileChangeCount,
  rejectedCount,
  pendingReportCount,
  t,
}: ManagerRailBarProps) {
  return (
    <aside className="hidden md:flex flex-col w-[68px] shrink-0 items-center justify-between border-r border-[#16435c] bg-[#092f45] py-3.5 z-20 select-none shadow-[4px_0_16px_rgba(0,0,0,0.15)]">
      {/* Top: Section Quick Buttons with Notification Badges */}
      <div className="flex flex-col items-center gap-3.5 w-full px-2">
        {/* Menu Hamburger Button */}
        <div className="flex h-9 w-full items-center justify-center">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-xs hover:bg-[#087f80] hover:border-[#087f80] transition-all focus:outline-none focus:ring-2 focus:ring-[#087f80]/40 cursor-pointer"
            aria-label="Toggle Navigation Drawer"
            title="Toggle Navigation Menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        <div className="h-px w-8 bg-[#16435c]" />

        {/* Group 1: Volunteer Onboarding & Verification */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* 1. Pending Queue */}
          <button
            type="button"
            onClick={() => setNavSection("queue")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "queue"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={t.queue}
            aria-label={t.queue}
          >
            <InboxStackIcon className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087f80] px-1 text-[9px] font-black text-white ring-2 ring-[#092f45]">
                {formatBadgeCount(pendingCount)}
              </span>
            )}
          </button>

          {/* 2. Approved Volunteers */}
          <button
            type="button"
            onClick={() => setNavSection("approved")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "approved"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={t.approved}
            aria-label={t.approved}
          >
            <CheckCircleIcon className="h-5 w-5" />
            {approvedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-900/80 px-1 text-[9px] font-extrabold text-teal-300 ring-1 ring-[#092f45] border border-teal-700/50">
                {formatBadgeCount(approvedCount)}
              </span>
            )}
          </button>

          {/* 3. Profile Change Requests */}
          <button
            type="button"
            onClick={() => setNavSection("change-requests")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "change-requests"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title="Profile Change Requests"
            aria-label="Profile Change Requests"
          >
            <DocumentCheckIcon className="h-5 w-5" />
            {pendingProfileChangeCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-black text-white ring-2 ring-[#092f45]">
                {formatBadgeCount(pendingProfileChangeCount)}
              </span>
            )}
          </button>

          {/* 4. Rejected Archive */}
          <button
            type="button"
            onClick={() => setNavSection("rejected")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "rejected"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={t.rejected}
            aria-label={t.rejected}
          >
            <ArchiveBoxXMarkIcon className="h-5 w-5" />
            {rejectedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-900/80 px-1 text-[9px] font-bold text-red-300 ring-1 ring-[#092f45] border border-red-800/50">
                {formatBadgeCount(rejectedCount)}
              </span>
            )}
          </button>
        </div>

        <div className="h-px w-8 bg-[#16435c]" />

        {/* Group 2: Live Operations & Escalations */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* 4. System Reports */}
          <button
            type="button"
            onClick={() => setNavSection("reports")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "reports"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={t.reports}
            aria-label={t.reports}
          >
            <ShieldExclamationIcon className="h-5 w-5" />
            {pendingReportCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white ring-2 ring-[#092f45]">
                {formatBadgeCount(pendingReportCount)}
              </span>
            )}
          </button>

          {/* 6. Operations History */}
          <button
            type="button"
            onClick={() => setNavSection("history")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "history"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={t.history}
            aria-label={t.history}
          >
            <ClockIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
