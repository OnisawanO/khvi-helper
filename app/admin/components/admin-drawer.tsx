"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArchiveBoxXMarkIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  InboxStackIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminActiveTab } from "../types";
import type { ManagerNavSection } from "@/app/manager/types";
import { formatBadgeCount } from "@/app/manager/utils";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export function AdminDrawer({
  isOpen,
  onClose,
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
}: AdminDrawerProps) {
  const openManagerSection = (section: ManagerNavSection) => {
    setManagerSection(section);
    setActiveTab("manager-operations");
    onClose();
  };

  const managerItemClass = (section: ManagerNavSection) =>
    `flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087f80]/70 ${
      activeTab === "manager-operations" && managerSection === section
        ? "bg-[#087f80] text-white shadow-md"
        : "text-slate-200 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen
          ? "visible pointer-events-auto"
          : "invisible pointer-events-none delay-300"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer content sliding smoothly from left (Navy Dark Theme) */}
      <aside
        className={`relative z-10 flex h-full w-[290px] max-w-[85vw] flex-col justify-between overflow-y-auto bg-[#092f45] text-white p-4 shadow-2xl border-r border-[#16435c] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-4">
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between border-b border-[#16435c] pb-3">
            <Link
              href="/"
              onClick={onClose}
              className="group flex items-center gap-3 rounded-2xl transition-transform hover:scale-105"
              title="KHVI Home (กลับสู่หน้าหลัก)"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#087f80]/40 bg-[#0d3b55] shadow-xs group-hover:border-[#087f80]">
                <Image
                  src="/khvi-logo.png"
                  alt="KHVI logo"
                  fill
                  sizes="36px"
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div>
                <span className="block text-sm font-black tracking-tight text-white">KHVI</span>
                <span className="block truncate text-[10px] font-bold text-[#4d8a93]">Admin Console</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Close menu"
              title="Close menu (ปิดเมนู)"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Overview
            </p>
            <nav className="mt-1 space-y-1">
              <button
                onClick={() => {
                  setActiveTab("overview");
                  onClose();
                }}
                type="button"
                aria-current={activeTab === "overview" ? "page" : undefined}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ChartBarSquareIcon className="h-5 w-5 text-slate-300" />
                  <span>Platform Overview</span>
                </div>
              </button>
            </nav>
          </div>

          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Identity & Access
            </p>
            <nav className="mt-1 space-y-1">
              <button
                onClick={() => {
                  setActiveTab("users");
                  onClose();
                }}
                type="button"
                aria-current={activeTab === "users" ? "page" : undefined}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserGroupIcon className="h-5 w-5 text-slate-300" />
                  <span>User Management</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === "users"
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {totalUsersCount}
                </span>
              </button>
            </nav>
          </div>

          {/* Group 2: Governance & Security */}
          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Governance & Security
            </p>
            <nav className="mt-1 space-y-1">
              <button
                onClick={() => {
                  setActiveTab("reports");
                  onClose();
                }}
                type="button"
                aria-current={activeTab === "reports" ? "page" : undefined}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "reports"
                    ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldExclamationIcon className="h-5 w-5 text-slate-300" />
                  <span>System Reports</span>
                </div>
                {pendingReportsCount > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white ring-1 ring-white/20">
                    {pendingReportsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("audit");
                  onClose();
                }}
                type="button"
                aria-current={activeTab === "audit" ? "page" : undefined}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "audit"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DocumentMagnifyingGlassIcon className="h-5 w-5 text-slate-300" />
                  <span>Audit Trail</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === "audit"
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {auditLogsCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("policies");
                  onClose();
                }}
                type="button"
                aria-current={activeTab === "policies" ? "page" : undefined}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "policies"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cog6ToothIcon className="h-5 w-5 text-slate-300" />
                  <span>Platform Policies</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                    activeTab === "policies"
                      ? "bg-white/20 text-white"
                      : "bg-teal-900/60 text-teal-300"
                  }`}
                >
                  Active
                </span>
              </button>
            </nav>
          </div>

          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Manager Operations
            </p>
            <nav className="mt-1 space-y-1">
              <button type="button" onClick={() => openManagerSection("queue")} aria-current={activeTab === "manager-operations" && managerSection === "queue" ? "page" : undefined} className={managerItemClass("queue")}>
                <span className="flex items-center gap-2.5"><InboxStackIcon className="h-5 w-5 text-slate-300" />Application Queue</span>
                {pendingApplicantCount > 0 && <span className="rounded-full bg-[#087f80] px-2 py-0.5 text-[10px] font-extrabold text-white">{formatBadgeCount(pendingApplicantCount)}</span>}
              </button>
              <button type="button" onClick={() => openManagerSection("approved")} aria-current={activeTab === "manager-operations" && managerSection === "approved" ? "page" : undefined} className={managerItemClass("approved")}>
                <span className="flex items-center gap-2.5"><CheckCircleIcon className="h-5 w-5 text-slate-300" />Approved Volunteers</span>
                {approvedApplicantCount > 0 && <span className="rounded-full bg-teal-900/60 px-2 py-0.5 text-[10px] font-extrabold text-teal-300 border border-teal-700/50">{formatBadgeCount(approvedApplicantCount)}</span>}
              </button>
              <button type="button" onClick={() => openManagerSection("change-requests")} aria-current={activeTab === "manager-operations" && managerSection === "change-requests" ? "page" : undefined} className={managerItemClass("change-requests")}>
                <span className="flex items-center gap-2.5"><DocumentCheckIcon className="h-5 w-5 text-slate-300" />Profile Change Requests</span>
                {pendingProfileChangeCount > 0 && <span className="rounded-full bg-sky-900/60 px-2 py-0.5 text-[10px] font-extrabold text-sky-300 border border-sky-700/50">{formatBadgeCount(pendingProfileChangeCount)}</span>}
              </button>
              <button type="button" onClick={() => openManagerSection("rejected")} aria-current={activeTab === "manager-operations" && managerSection === "rejected" ? "page" : undefined} className={managerItemClass("rejected")}>
                <span className="flex items-center gap-2.5"><ArchiveBoxXMarkIcon className="h-5 w-5 text-slate-300" />Rejected Archive</span>
                {rejectedApplicantCount > 0 && <span className="rounded-full bg-red-900/60 px-2 py-0.5 text-[10px] font-extrabold text-red-300 border border-red-800/50">{formatBadgeCount(rejectedApplicantCount)}</span>}
              </button>
              <button type="button" onClick={() => openManagerSection("reports")} aria-current={activeTab === "manager-operations" && managerSection === "reports" ? "page" : undefined} className={managerItemClass("reports")}>
                <span className="flex items-center gap-2.5"><ShieldExclamationIcon className="h-5 w-5 text-slate-300" />System Reports</span>
                {pendingManagerReportCount > 0 && <span className="rounded-full bg-amber-900/60 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-700/50">{formatBadgeCount(pendingManagerReportCount)}</span>}
              </button>
              <button type="button" onClick={() => openManagerSection("history")} aria-current={activeTab === "manager-operations" && managerSection === "history" ? "page" : undefined} className={managerItemClass("history")}>
                <span className="flex items-center gap-2.5"><ClockIcon className="h-5 w-5 text-slate-300" />Operations History</span>
                {managerActivitiesCount > 0 && <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] font-extrabold text-slate-300 border border-slate-600/50">{formatBadgeCount(managerActivitiesCount)}</span>}
              </button>
            </nav>
          </div>
        </div>

      </aside>
    </div>
  );
}
