"use client";

import {
  Bars3Icon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { AdminActiveTab } from "../types";

interface AdminRailBarProps {
  onMenuClick: () => void;
  activeTab: AdminActiveTab;
  setActiveTab: (tab: AdminActiveTab) => void;
  totalUsersCount: number;
  totalInterpretersCount: number;
  auditLogsCount: number;
}

export function AdminRailBar({
  onMenuClick,
  activeTab,
  setActiveTab,
  totalUsersCount,
  totalInterpretersCount,
  auditLogsCount,
}: AdminRailBarProps) {
  return (
    <aside className="hidden md:flex flex-col w-[68px] shrink-0 items-center justify-between border-r border-[#16435c] bg-[#092f45] py-3.5 z-20 select-none shadow-[4px_0_16px_rgba(0,0,0,0.15)]">
      {/* Top: Section Quick Buttons with Notification Badges */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        {/* Menu Hamburger Button: Seamless top corner block level with Header */}
        <div className="flex h-9 w-full items-center justify-center">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-xs hover:bg-[#087f80] hover:border-[#087f80] transition-all focus:outline-none focus:ring-2 focus:ring-[#087f80]/40 cursor-pointer"
            aria-label="Toggle Navigation Drawer"
            title="Toggle Navigation Menu (เปิด/ปิด เมนูด้านข้าง)"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        <div className="h-px w-8 bg-[#16435c]" />

        {/* Navigation Tabs Group */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* 1. All Users Management */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("users");
            }}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-[#087f80] text-white shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title="User Management"
            aria-label="User Management"
          >
            <UserGroupIcon className="h-5 w-5" />
            {totalUsersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[9px] font-extrabold text-slate-200 ring-1 ring-[#092f45]">
                {totalUsersCount}
              </span>
            )}
          </button>

          {/* 2. Interpreter Quality & Index */}
          <button
            type="button"
            onClick={() => setActiveTab("interpreters")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              activeTab === "interpreters"
                ? "bg-[#087f80] text-white shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title="Interpreter Index & Quality"
            aria-label="Interpreter Index & Quality"
          >
            <SparklesIcon className="h-5 w-5" />
            {totalInterpretersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-900/80 px-1 text-[9px] font-extrabold text-teal-300 ring-1 ring-[#092f45] border border-teal-700/50">
                {totalInterpretersCount}
              </span>
            )}
          </button>

          {/* 3. Audit Trail Logs */}
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-[#087f80] text-white shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title="System Audit Trail"
            aria-label="System Audit Trail"
          >
            <DocumentMagnifyingGlassIcon className="h-5 w-5" />
            {auditLogsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[9px] font-extrabold text-slate-300 ring-1 ring-[#092f45]">
                {auditLogsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Rail Actions */}
      <div className="flex flex-col items-center w-full px-2">
        {/* Settings button */}
        <button
          type="button"
          onClick={() => alert("Admin System Settings & Security Configurations")}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="Profile & Settings"
          aria-label="Profile & Settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
