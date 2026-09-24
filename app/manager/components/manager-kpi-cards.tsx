"use client";

import {
  ArchiveBoxXMarkIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  InboxStackIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { ManagerNavSection } from "../types";
import type { ManagerTranslation } from "../locales";

interface ManagerKpiCardsProps {
  navSection: ManagerNavSection;
  setNavSection: (section: ManagerNavSection) => void;
  pendingCount: number;
  approvedCount: number;
  pendingProfileChangeCount: number;
  rejectedCount: number;
  pendingReportCount: number;
  t: ManagerTranslation["kpi"];
}

export function ManagerKpiCards({
  navSection,
  setNavSection,
  pendingCount,
  approvedCount,
  pendingProfileChangeCount,
  rejectedCount,
  pendingReportCount,
  t,
}: ManagerKpiCardsProps) {
  const isQueueActive = navSection === "queue";
  const isApprovedActive = navSection === "approved";
  const isChangeRequestsActive = navSection === "change-requests";
  const isRejectedActive = navSection === "rejected";
  const isReportsActive = navSection === "reports";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 shadow-2xs">
      <div className="grid grid-cols-2 gap-1 lg:grid-cols-3 xl:grid-cols-5">
        {/* 1. Pending Queue */}
        <button
          type="button"
          onClick={() => setNavSection("queue")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isQueueActive
              ? "bg-white border-teal-200 shadow-xs ring-1 ring-teal-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
          title={t.pending.label}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {t.pending.label}
            </p>
            <div
              className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
                isQueueActive ? "bg-teal-100 text-[#087f80]" : "bg-teal-50 text-[#087f80]"
              }`}
            >
              <InboxStackIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-[#092f45]">
              {pendingCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">{t.pending.countSuffix}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">{t.pending.footLabel}</span>
            <span className={`font-bold ${isQueueActive ? "text-[#087f80] underline" : "text-[#087f80] group-hover:underline"}`}>
              {isQueueActive ? t.pending.activeAction : t.pending.action}
            </span>
          </div>
        </button>

        {/* 2. Approved Volunteers */}
        <button
          type="button"
          onClick={() => setNavSection("approved")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isApprovedActive
              ? "bg-white border-emerald-200 shadow-xs ring-1 ring-emerald-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
          title={t.approved.label}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {t.approved.label}
            </p>
            <div
              className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
                isApprovedActive ? "bg-emerald-100 text-[#087557]" : "bg-emerald-50 text-[#087557]"
              }`}
            >
              <CheckCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-[#092f45]">
              {approvedCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">{t.approved.countSuffix}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">{t.approved.footLabel}</span>
            <span className={`font-bold ${isApprovedActive ? "text-[#087557] underline" : "text-[#087557] group-hover:underline"}`}>
              {isApprovedActive ? t.approved.activeAction : t.approved.action}
            </span>
          </div>
        </button>

        {/* 3. Profile Change Requests */}
        <button
          type="button"
          onClick={() => setNavSection("change-requests")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isChangeRequestsActive
              ? "bg-white border-sky-200 shadow-xs ring-1 ring-sky-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
          title={t.changeRequests.label}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {t.changeRequests.label}
            </p>
            <div
              className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
                isChangeRequestsActive ? "bg-sky-100 text-sky-700" : "bg-sky-50 text-sky-700"
              }`}
            >
              <DocumentCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className={`text-xl sm:text-2xl font-black ${pendingProfileChangeCount > 0 ? "text-sky-700" : "text-[#092f45]"}`}>
              {pendingProfileChangeCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">{t.changeRequests.countSuffix}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">{t.changeRequests.footLabel}</span>
            <span className={`font-bold ${isChangeRequestsActive ? "text-sky-700 underline" : "text-sky-700 group-hover:underline"}`}>
              {isChangeRequestsActive ? t.changeRequests.activeAction : t.changeRequests.action}
            </span>
          </div>
        </button>

        {/* 4. Rejected Archive */}
        <button
          type="button"
          onClick={() => setNavSection("rejected")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isRejectedActive
              ? "bg-white border-red-200 shadow-xs ring-1 ring-red-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
          title={t.rejected.label}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {t.rejected.label}
            </p>
            <div
              className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
                isRejectedActive ? "bg-red-100 text-red-600" : "bg-red-50 text-red-600"
              }`}
            >
              <ArchiveBoxXMarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-[#092f45]">
              {rejectedCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">{t.rejected.countSuffix}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">{t.rejected.footLabel}</span>
            <span className={`font-bold ${isRejectedActive ? "text-red-600 underline" : "text-red-600 group-hover:underline"}`}>
              {isRejectedActive ? t.rejected.activeAction : t.rejected.action}
            </span>
          </div>
        </button>

        {/* 5. Reports */}
        <button
          type="button"
          onClick={() => setNavSection("reports")}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isReportsActive
              ? "bg-white border-amber-200 shadow-xs ring-1 ring-amber-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
          title={t.reports.label}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {t.reports.label}
            </p>
            <div
              className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
                isReportsActive ? "bg-amber-100 text-amber-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              <ShieldExclamationIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p
              className={`text-xl sm:text-2xl font-black ${
                pendingReportCount > 0 ? "text-amber-600" : "text-[#092f45]"
              }`}
            >
              {pendingReportCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">{t.reports.countSuffix}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">{t.reports.footLabel}</span>
            <span className={`font-bold ${isReportsActive ? "text-amber-600 underline" : "text-amber-600 group-hover:underline"}`}>
              {isReportsActive ? t.reports.activeAction : t.reports.action}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
