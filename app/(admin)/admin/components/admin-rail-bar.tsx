"use client";

import Link from "next/link";
import {
  Bars3Icon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { AdminActiveTab } from "../types";

interface AdminRailBarProps {
  onMenuClick: () => void;
  activeTab: AdminActiveTab;
  setActiveTab: (tab: AdminActiveTab) => void;
  totalUsersCount: number;
  pendingReportsCount: number;
  auditLogsCount: number;
  onSettingsClick?: () => void;
}

export function AdminRailBar({
  onMenuClick,
  activeTab,
  setActiveTab,
  totalUsersCount,
  pendingReportsCount,
  auditLogsCount,
  onSettingsClick,
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
            title="User Management (จัดการผู้ใช้ทั้งหมด)"
            aria-label="User Management"
          >
            <UserGroupIcon className="h-5 w-5" />
            {totalUsersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[9px] font-extrabold text-slate-200 ring-1 ring-[#092f45]">
                {totalUsersCount}
              </span>
            )}
          </button>

          {/* 2. Escalated Incident Reports (from Manager) */}
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              activeTab === "reports"
                ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title="Escalated Incident Reports (รายงานพฤติกรรมไม่เหมาะสมจาก Manager)"
            aria-label="Escalated Incident Reports"
          >
            <ShieldExclamationIcon className="h-5 w-5" />
            {pendingReportsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-1 ring-[#092f45] animate-pulse">
                {pendingReportsCount}
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
            title="System Audit Trail (บันทึกความปลอดภัยและประวัติ)"
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
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {/* Switch to Operations Hub (Manager Mode) */}
        <Link
          href="/manager"
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-amber-300 hover:bg-amber-400/20 hover:text-amber-200 transition-colors cursor-pointer border border-amber-500/30"
          title="Switch to Operations Hub (Manager Mode) • ตรวจสอบงานหน้างาน"
          aria-label="Switch to Operations Hub"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Link>

        {/* Settings button */}
        <button
          type="button"
          onClick={onSettingsClick}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="System Policies & Configurations"
          aria-label="System Policies & Configurations"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
