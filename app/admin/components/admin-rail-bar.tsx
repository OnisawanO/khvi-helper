"use client";

import {
  ArchiveBoxXMarkIcon,
  Bars3Icon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  InboxStackIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { AdminActiveTab } from "../types";
import type { ManagerNavSection } from "@/app/manager/types";
import { formatBadgeCount } from "@/app/manager/utils";
import { useStoredLocale } from "@/app/lib/locale";
import { getAdminTranslation } from "../locales";

interface AdminRailBarProps {
  onMenuClick: () => void;
  activeTab: AdminActiveTab;
  setActiveTab: (tab: AdminActiveTab) => void;
  totalUsersCount: number;
  pendingReportsCount: number;
  auditLogsCount: number;
  managerSection: ManagerNavSection;
  setManagerSection: (section: ManagerNavSection) => void;
  pendingApplicantCount: number;
  approvedApplicantCount: number;
  pendingProfileChangeCount: number;
  rejectedApplicantCount: number;
  pendingManagerReportCount: number;
  managerActivitiesCount: number;
}

export function AdminRailBar({
  onMenuClick,
  activeTab,
  setActiveTab,
  totalUsersCount,
  pendingReportsCount,
  auditLogsCount,
  managerSection,
  setManagerSection,
  pendingApplicantCount,
  approvedApplicantCount,
  pendingProfileChangeCount,
  rejectedApplicantCount,
  pendingManagerReportCount,
  managerActivitiesCount,
}: AdminRailBarProps) {
  const [locale] = useStoredLocale();
  const t = getAdminTranslation(locale);
  const openManagerSection = (section: ManagerNavSection) => {
    setManagerSection(section);
    setActiveTab("manager-operations");
  };

  const managerButtonClass = (section: ManagerNavSection) =>
    `relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/70 ${
      activeTab === "manager-operations" && managerSection === section
        ? "bg-[#087f80] text-white shadow-md ring-2 ring-[#087f80]/30"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="hidden md:flex max-h-screen flex-col w-[68px] shrink-0 items-center justify-between overflow-y-auto border-r border-[#16435c] bg-[#092f45] py-3.5 z-20 select-none shadow-[4px_0_16px_rgba(0,0,0,0.15)]">
      {/* Top: Section Quick Buttons with Notification Badges */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        {/* Menu Hamburger Button: Seamless top corner block level with Header */}
        <div className="flex h-9 w-full items-center justify-center">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-xs hover:bg-[#087f80] hover:border-[#087f80] transition-all focus:outline-none focus:ring-2 focus:ring-[#087f80]/40 cursor-pointer"
            aria-label={t.header.menu}
            title={t.header.menu}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        <div className="h-px w-8 bg-[#16435c]" />

        {/* Navigation Tabs Group */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* 0. Overview & Analytics */}
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#087f80] text-white shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={t.navigation.overview}
            aria-label={t.navigation.overview}
            aria-pressed={activeTab === "overview"}
          >
            <ChartBarSquareIcon className="h-5 w-5" />
          </button>

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
            title={t.navigation.users}
            aria-label={t.navigation.users}
            aria-pressed={activeTab === "users"}
          >
            <UserGroupIcon className="h-5 w-5" />
            {totalUsersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[9px] font-extrabold text-slate-200 ring-1 ring-[#092f45]">
                {totalUsersCount}
              </span>
            )}
          </button>

          {/* 2. System Reports */}
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer ${
              activeTab === "reports"
                ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={t.navigation.reports}
            aria-label={t.navigation.reports}
            aria-pressed={activeTab === "reports"}
          >
            <ShieldExclamationIcon className="h-5 w-5" />
            {pendingReportsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-1 ring-[#092f45]">
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
            title={t.navigation.audit}
            aria-label={t.navigation.audit}
            aria-pressed={activeTab === "audit"}
          >
            <DocumentMagnifyingGlassIcon className="h-5 w-5" />
            {auditLogsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[9px] font-extrabold text-slate-300 ring-1 ring-[#092f45]">
                {auditLogsCount}
              </span>
            )}
          </button>

        </div>

        <div className="h-px w-8 bg-[#16435c]" />

        {/* Manager operations group */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <button
            type="button"
            onClick={() => openManagerSection("queue")}
            className={managerButtonClass("queue")}
            title={t.navigation.queue}
            aria-label={t.navigation.queue}
            aria-pressed={activeTab === "manager-operations" && managerSection === "queue"}
          >
            <InboxStackIcon className="h-5 w-5" />
            {pendingApplicantCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087f80] px-1 text-[9px] font-black text-white ring-2 ring-[#092f45]">
                {formatBadgeCount(pendingApplicantCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openManagerSection("approved")}
            className={managerButtonClass("approved")}
            title={t.navigation.approved}
            aria-label={t.navigation.approved}
            aria-pressed={activeTab === "manager-operations" && managerSection === "approved"}
          >
            <CheckCircleIcon className="h-5 w-5" />
            {approvedApplicantCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-900/80 px-1 text-[9px] font-extrabold text-teal-300 ring-1 ring-[#092f45] border border-teal-700/50">
                {formatBadgeCount(approvedApplicantCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openManagerSection("change-requests")}
            className={managerButtonClass("change-requests")}
            title={t.navigation.changeRequests}
            aria-label={t.navigation.changeRequests}
            aria-pressed={activeTab === "manager-operations" && managerSection === "change-requests"}
          >
            <DocumentCheckIcon className="h-5 w-5" />
            {pendingProfileChangeCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-black text-white ring-2 ring-[#092f45]">
                {formatBadgeCount(pendingProfileChangeCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openManagerSection("rejected")}
            className={managerButtonClass("rejected")}
            title={t.navigation.rejected}
            aria-label={t.navigation.rejected}
            aria-pressed={activeTab === "manager-operations" && managerSection === "rejected"}
          >
            <ArchiveBoxXMarkIcon className="h-5 w-5" />
            {rejectedApplicantCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-900/80 px-1 text-[9px] font-bold text-red-300 ring-1 ring-[#092f45] border border-red-800/50">
                {formatBadgeCount(rejectedApplicantCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openManagerSection("reports")}
            className={managerButtonClass("reports")}
            title={t.navigation.reports}
            aria-label={t.navigation.reports}
            aria-pressed={activeTab === "manager-operations" && managerSection === "reports"}
          >
            <ShieldExclamationIcon className="h-5 w-5" />
            {pendingManagerReportCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white ring-2 ring-[#092f45]">
                {formatBadgeCount(pendingManagerReportCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openManagerSection("history")}
            className={managerButtonClass("history")}
            title={t.navigation.history}
            aria-label={t.navigation.history}
            aria-pressed={activeTab === "manager-operations" && managerSection === "history"}
          >
            <ClockIcon className="h-5 w-5" />
            {managerActivitiesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[9px] font-black text-slate-200 ring-2 ring-[#092f45]">
                {formatBadgeCount(managerActivitiesCount)}
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
