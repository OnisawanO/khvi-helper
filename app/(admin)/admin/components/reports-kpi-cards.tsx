"use client";

import {
  ExclamationCircleIcon,
  LockClosedIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export type ReportStatusFilter =
  | "All"
  | "Pending"
  | "Locked"
  | "Hard Banned"
  | "Dismissed";

interface ReportsKpiCardsProps {
  totalReportsCount: number;
  pendingReportsCount: number;
  lockedReportsCount: number;
  hardBannedReportsCount: number;
  selectedStatusFilter: ReportStatusFilter;
  onSelectStatusFilter: (status: ReportStatusFilter) => void;
}

export function ReportsKpiCards({
  totalReportsCount,
  pendingReportsCount,
  lockedReportsCount,
  hardBannedReportsCount,
  selectedStatusFilter,
  onSelectStatusFilter,
}: ReportsKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      {/* 1. All Reports Card */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter("All")}
        className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
          selectedStatusFilter === "All"
            ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm"
            : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Total Incident Reports
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
            <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-black text-[#092f45]">
            {totalReportsCount}
          </p>
          <span className="text-[11px] font-semibold text-slate-400">cases</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-slate-500">
          <span>Escalated Base</span>
          <span className="font-bold text-blue-600">View All</span>
        </div>
      </button>

      {/* 2. Pending Escalated Reports Card */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter("Pending")}
        className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
          selectedStatusFilter === "Pending"
            ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-sm"
            : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Pending Review
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
            <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p
            className={`text-2xl sm:text-3xl font-black ${
              pendingReportsCount > 0 ? "text-amber-600" : "text-slate-700"
            }`}
          >
            {pendingReportsCount}
          </p>
          <span className="text-[11px] font-semibold text-amber-600/80">awaiting</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-slate-500">
          <span>Urgency Status</span>
          <span
            className={`font-bold ${
              pendingReportsCount > 0 ? "text-amber-600 animate-pulse" : "text-slate-500"
            }`}
          >
            {pendingReportsCount > 0 ? "Action Required" : "All Clear"}
          </span>
        </div>
      </button>

      {/* 3. Soft Locked Reports Card */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter("Locked")}
        className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
          selectedStatusFilter === "Locked"
            ? "border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-sm"
            : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Soft-Locked
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-transform group-hover:scale-110">
            <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-black text-orange-600">
            {lockedReportsCount}
          </p>
          <span className="text-[11px] font-semibold text-slate-400">suspended</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-slate-500">
          <span>Enforcement Tier</span>
          <span className="font-bold text-orange-600">Filter Soft-Locked</span>
        </div>
      </button>

      {/* 4. Hard Banned Reports Card */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter("Hard Banned")}
        className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
          selectedStatusFilter === "Hard Banned"
            ? "border-red-600 bg-red-50/40 ring-2 ring-red-600/20 shadow-sm"
            : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Permanently Hard Banned
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-transform group-hover:scale-110">
            <NoSymbolIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-black text-red-600">
            {hardBannedReportsCount}
          </p>
          <span className="text-[11px] font-semibold text-red-600/80">hard ban ⚠️</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-slate-500">
          <span>Final Disposition</span>
          <span className="font-bold text-red-600">Filter Hard Banned</span>
        </div>
      </button>
    </div>
  );
}

