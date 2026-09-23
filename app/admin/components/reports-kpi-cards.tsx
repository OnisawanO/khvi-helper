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
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 shadow-2xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
        {/* 1. All Reports Card */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter("All")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            selectedStatusFilter === "All"
              ? "bg-white border-blue-200 shadow-xs ring-1 ring-blue-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Total Incident Reports
            </p>
            <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
              selectedStatusFilter === "All" ? "bg-blue-100 text-blue-700" : "bg-blue-50 text-blue-600"
            }`}>
              <ShieldCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-[#092f45]">
              {totalReportsCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">cases</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Escalated Base</span>
            <span className={`font-bold ${selectedStatusFilter === "All" ? "text-blue-700 underline" : "text-blue-600 group-hover:underline"}`}>
              {selectedStatusFilter === "All" ? "Active Filter" : "Filter All"}
            </span>
          </div>
        </button>

        {/* 2. Pending Escalated Reports Card */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter("Pending")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            selectedStatusFilter === "Pending"
              ? "bg-white border-amber-200 shadow-xs ring-1 ring-amber-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Pending Review
            </p>
            <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
              selectedStatusFilter === "Pending" ? "bg-amber-100 text-amber-700" : "bg-amber-50 text-amber-600"
            }`}>
              <ExclamationCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p
              className={`text-xl sm:text-2xl font-black ${
                pendingReportsCount > 0 ? "text-amber-600" : "text-slate-700"
              }`}
            >
              {pendingReportsCount}
            </p>
            <span className="text-[11px] font-semibold text-amber-600/80">awaiting</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Urgency Status</span>
            <span
              className={`font-bold ${
                pendingReportsCount > 0 ? "text-amber-600" : "text-slate-500"
              } ${selectedStatusFilter === "Pending" ? "underline" : "group-hover:underline"}`}
            >
              {pendingReportsCount > 0 ? "Action Required" : "All Clear"}
            </span>
          </div>
        </button>

        {/* 3. Soft Locked Reports Card */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter("Locked")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            selectedStatusFilter === "Locked"
              ? "bg-white border-orange-200 shadow-xs ring-1 ring-orange-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Soft-Locked
            </p>
            <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
              selectedStatusFilter === "Locked" ? "bg-orange-100 text-orange-700" : "bg-orange-50 text-orange-600"
            }`}>
              <LockClosedIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-orange-600">
              {lockedReportsCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">suspended</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Enforcement Tier</span>
            <span className={`font-bold text-orange-600 ${selectedStatusFilter === "Locked" ? "underline" : "group-hover:underline"}`}>
              {selectedStatusFilter === "Locked" ? "Active Filter" : "Filter Soft-Locked"}
            </span>
          </div>
        </button>

        {/* 4. Hard Banned Reports Card */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter("Hard Banned")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            selectedStatusFilter === "Hard Banned"
              ? "bg-white border-red-200 shadow-xs ring-1 ring-red-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Permanently Hard Banned
            </p>
            <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
              selectedStatusFilter === "Hard Banned" ? "bg-red-100 text-red-700" : "bg-red-50 text-red-600"
            }`}>
              <NoSymbolIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-red-600">
              {hardBannedReportsCount}
            </p>
            <span className="text-[11px] font-semibold text-red-600/80">hard ban ⚠️</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Final Disposition</span>
            <span className={`font-bold text-red-600 ${selectedStatusFilter === "Hard Banned" ? "underline" : "group-hover:underline"}`}>
              {selectedStatusFilter === "Hard Banned" ? "Active Filter" : "Filter Hard Banned"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

