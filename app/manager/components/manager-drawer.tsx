"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArchiveBoxXMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentCheckIcon,
  InboxStackIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ManagerNavSection } from "../types";
import { formatBadgeCount } from "../utils";
import type { ManagerTranslation } from "../locales";

interface ManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navSection: ManagerNavSection;
  setNavSection: (section: ManagerNavSection) => void;
  pendingCount: number;
  approvedCount: number;
  pendingProfileChangeCount: number;
  rejectedCount: number;
  pendingReportCount: number;
  activitiesCount: number;
  t: ManagerTranslation["navigation"];
}

export function ManagerDrawer({
  isOpen,
  onClose,
  navSection,
  setNavSection,
  pendingCount,
  approvedCount,
  pendingProfileChangeCount,
  rejectedCount,
  pendingReportCount,
  activitiesCount,
  t,
}: ManagerDrawerProps) {
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
        className={`relative z-10 flex h-full w-[290px] max-w-[85vw] flex-col justify-between bg-[#092f45] text-white p-4 shadow-2xl border-r border-[#16435c] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] select-none ${
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
              title="KHVI Home"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#087f80]/40 bg-[#0d3b55] shadow-xs group-hover:border-[#087f80]">
                <Image
                  src="/khvi-logo.jpg"
                  alt="KHVI logo"
                  fill
                  sizes="36px"
                  className="scale-[2.2] object-cover object-[50%_54%]"
                  priority
                />
              </div>
              <div>
                <span className="block text-sm font-black tracking-tight text-white">KHVI</span>
                <span className="block truncate text-[10px] font-bold text-[#4d8a93]">Operations Hub</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Close menu"
              title="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Group 1: Verification */}
          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t.verificationGroup}
            </p>
            <nav className="mt-1 space-y-1">
              {/* Application Queue */}
              <button
                onClick={() => {
                  setNavSection("queue");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  navSection === "queue"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <InboxStackIcon className="h-5 w-5 text-slate-300" />
                  <span>{t.queue}</span>
                </div>
                {pendingCount > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      navSection === "queue"
                        ? "bg-white/20 text-white"
                        : "bg-[#087f80] text-white"
                    }`}
                  >
                    {formatBadgeCount(pendingCount)}
                  </span>
                )}
              </button>

              {/* Approved Volunteers */}
              <button
                onClick={() => {
                  setNavSection("approved");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  navSection === "approved"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircleIcon className="h-5 w-5 text-slate-300" />
                  <span>{t.approved}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    navSection === "approved"
                      ? "bg-white/20 text-white"
                      : "bg-teal-900/60 text-teal-300 border border-teal-700/50"
                  }`}
                >
                  {formatBadgeCount(approvedCount)}
                </span>
              </button>

              {/* Profile Change Requests */}
              <button
                onClick={() => {
                  setNavSection("change-requests");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  navSection === "change-requests"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DocumentCheckIcon className="h-5 w-5 text-slate-300" />
                  <span>{t.changeRequests}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    navSection === "change-requests"
                      ? "bg-white/20 text-white"
                      : "bg-sky-900/60 text-sky-300 border border-sky-700/50"
                  }`}
                >
                  {formatBadgeCount(pendingProfileChangeCount)}
                </span>
              </button>

              {/* Rejected Archive */}
              <button
                onClick={() => {
                  setNavSection("rejected");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  navSection === "rejected"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ArchiveBoxXMarkIcon className="h-5 w-5 text-slate-300" />
                  <span>{t.rejected}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    navSection === "rejected"
                      ? "bg-white/20 text-white"
                      : "bg-red-900/50 text-red-300 border border-red-800/50"
                  }`}
                >
                  {formatBadgeCount(rejectedCount)}
                </span>
              </button>
            </nav>
          </div>

          {/* Group 2: Escalation & Operations */}
          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t.operationsGroup}
            </p>
            <nav className="mt-1 space-y-1">

              {/* System Reports */}
              <button
                onClick={() => {
                  setNavSection("reports");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  navSection === "reports"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldExclamationIcon className="h-5 w-5 text-slate-300" />
                  <span>{t.reports}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    navSection === "reports"
                      ? "bg-white/20 text-white"
                      : "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                  }`}
                >
                  {formatBadgeCount(pendingReportCount)}
                </span>
              </button>

              {/* Operations History */}
              <button
                onClick={() => {
                  setNavSection("history");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  navSection === "history"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClockIcon className="h-5 w-5 text-slate-300" />
                  <span>{t.history}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    navSection === "history"
                      ? "bg-white/20 text-white"
                      : "bg-slate-700/60 text-slate-300 border border-slate-600/50"
                  }`}
                >
                  {activitiesCount}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Section: Settings */}
        <div className="mt-auto pt-3 border-t border-[#16435c]">
          <button
            type="button"
            onClick={() => alert("Manager System Settings & Preferences")}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Manager Settings"
          >
            <Cog6ToothIcon className="h-5 w-5 shrink-0" />
            <span>Profile & Settings</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

