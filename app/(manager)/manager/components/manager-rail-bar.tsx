"use client";

import {
  ArchiveBoxXMarkIcon,
  Bars3Icon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  InboxStackIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { ManagerNavSection } from "../types";
import { formatBadgeCount } from "../mock-data";

interface ManagerRailBarProps {
  onMenuClick: () => void;
  navSection: ManagerNavSection;
  setNavSection: (section: ManagerNavSection) => void;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  openTicketCount: number;
  pendingReportCount: number;
}

export function ManagerRailBar({
  onMenuClick,
  navSection,
  setNavSection,
  pendingCount,
  approvedCount,
  rejectedCount,
  openTicketCount,
  pendingReportCount,
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
            title="Application Queue (Pending Review)"
            aria-label="Application Queue"
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
            title="Approved Volunteer Interpreters"
            aria-label="Approved Volunteer Interpreters"
          >
            <CheckCircleIcon className="h-5 w-5" />
            {approvedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-900/80 px-1 text-[9px] font-extrabold text-teal-300 ring-1 ring-[#092f45] border border-teal-700/50">
                {formatBadgeCount(approvedCount)}
              </span>
            )}
          </button>

          {/* 3. Rejected Archive */}
          <button
            type="button"
            onClick={() => setNavSection("rejected")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "rejected"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title="Rejected Applicant Archive"
            aria-label="Rejected Applicant Archive"
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
          {/* 4. Live Help Requests */}
          <button
            type="button"
            onClick={() => setNavSection("tickets")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "tickets"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title="Live Help Requests & Support Desk"
            aria-label="Live Help Requests"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            {openTicketCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f04f3e] px-1 text-[9px] font-black text-white ring-2 ring-[#092f45] animate-pulse">
                {formatBadgeCount(openTicketCount)}
              </span>
            )}
          </button>

          {/* 5. Incident Reports */}
          <button
            type="button"
            onClick={() => setNavSection("reports")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              navSection === "reports"
                ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title="Incident Reports & Disputes"
            aria-label="Incident Reports"
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
            title="Operations Activity History"
            aria-label="Operations History"
          >
            <ClockIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bottom Rail Actions: Settings */}
      <div className="flex flex-col items-center w-full px-2">
        <button
          type="button"
          onClick={() => alert("Manager System Settings & Regional Preferences")}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="Settings & Preferences"
          aria-label="Settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
