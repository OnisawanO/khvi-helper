"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  LockClosedIcon,
  SparklesIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminActiveTab } from "../types";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AdminActiveTab;
  setActiveTab: (tab: AdminActiveTab) => void;
  selectedStatusFilter: "All" | "Active" | "Locked";
  setSelectedStatusFilter: (status: "All" | "Active" | "Locked") => void;
  totalUsersCount: number;
  lockedUsersCount: number;
  totalInterpretersCount: number;
  auditLogsCount: number;
}

export function AdminDrawer({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  selectedStatusFilter,
  setSelectedStatusFilter,
  totalUsersCount,
  lockedUsersCount,
  totalInterpretersCount,
  auditLogsCount,
}: AdminDrawerProps) {
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
              title="KHVI Home (กลับสู่หน้าหลัก)"
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
              Identity & Access
            </p>
            <nav className="mt-1 space-y-1">
              <button
                onClick={() => {
                  setActiveTab("users");
                  if (selectedStatusFilter === "Locked") setSelectedStatusFilter("All");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "users" && selectedStatusFilter !== "Locked"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserGroupIcon className="h-5 w-5 text-slate-300" />
                  <span>All Users & Roles</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === "users" && selectedStatusFilter !== "Locked"
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {totalUsersCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("users");
                  setSelectedStatusFilter("Locked");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "users" && selectedStatusFilter === "Locked"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LockClosedIcon className="h-5 w-5 text-slate-300" />
                  <span>Suspended & Locked</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === "users" && selectedStatusFilter === "Locked"
                      ? "bg-white/20 text-white"
                      : "bg-red-900/60 text-red-300 border border-red-800/50"
                  }`}
                >
                  {lockedUsersCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("interpreters");
                  onClose();
                }}
                className={`flex w-full h-10 items-center justify-between rounded-2xl px-3 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "interpreters"
                    ? "bg-[#087f80] text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SparklesIcon className="h-5 w-5 text-slate-300" />
                  <span>Interpreter Index</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === "interpreters"
                      ? "bg-white/20 text-white"
                      : "bg-teal-900/60 text-teal-300 border border-teal-700/50"
                  }`}
                >
                  {totalInterpretersCount}
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
                  setActiveTab("audit");
                  onClose();
                }}
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
            </nav>
          </div>
        </div>

        {/* Bottom Section in Drawer: Settings */}
        <div className="mt-auto pt-3 border-t border-[#16435c]">
          <button
            type="button"
            onClick={() => alert("Admin System Settings & Security Configurations")}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Admin Settings"
          >
            <Cog6ToothIcon className="h-5 w-5 shrink-0" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

