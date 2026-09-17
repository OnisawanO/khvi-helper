"use client";

import {
  ArchiveBoxXMarkIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  InboxStackIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { ManagerNavSection } from "../types";

interface ManagerKpiCardsProps {
  navSection: ManagerNavSection;
  setNavSection: (section: ManagerNavSection) => void;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  openTicketCount: number;
  pendingReportCount: number;
}

export function ManagerKpiCards({
  navSection,
  setNavSection,
  pendingCount,
  approvedCount,
  rejectedCount,
  openTicketCount,
  pendingReportCount,
}: ManagerKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-5">
      {/* 1. Pending Queue */}
      <button
        type="button"
        onClick={() => setNavSection("queue")}
        className={`rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
          navSection === "queue"
            ? "border-[#087f80] bg-white shadow-md ring-2 ring-[#087f80]/20"
            : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        }`}
        title="View pending applicants awaiting verification"
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Pending Queue
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#087f80]">
            <InboxStackIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-[#087f80]">
          {pendingCount}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          Awaiting review
        </p>
      </button>

      {/* 2. Approved Volunteers */}
      <button
        type="button"
        onClick={() => setNavSection("approved")}
        className={`rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
          navSection === "approved"
            ? "border-[#087557] bg-white shadow-md ring-2 ring-[#087557]/20"
            : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        }`}
        title="View active certified interpreters"
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Approved
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#087557]">
            <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-[#087557]">
          {approvedCount}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          Certified roster
        </p>
      </button>

      {/* 3. Rejected Archive */}
      <button
        type="button"
        onClick={() => setNavSection("rejected")}
        className={`rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
          navSection === "rejected"
            ? "border-red-500 bg-white shadow-md ring-2 ring-red-500/20"
            : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        }`}
        title="View rejected applications history"
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Rejected
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <ArchiveBoxXMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-red-600">
          {rejectedCount}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          Archived records
        </p>
      </button>

      {/* 4. Live Help Requests */}
      <button
        type="button"
        onClick={() => setNavSection("tickets")}
        className={`rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
          navSection === "tickets"
            ? "border-[#f04f3e] bg-white shadow-md ring-2 ring-[#f04f3e]/20"
            : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        }`}
        title="View live support tickets from missions"
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Help Tickets
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#f04f3e]">
            <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-[#f04f3e]">
          {openTicketCount}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          Active mission calls
        </p>
      </button>

      {/* 5. Incident Reports */}
      <button
        type="button"
        onClick={() => setNavSection("reports")}
        className={`col-span-2 lg:col-span-1 rounded-2xl border p-3.5 sm:p-5 text-left transition-all cursor-pointer ${
          navSection === "reports"
            ? "border-amber-500 bg-white shadow-md ring-2 ring-amber-500/20"
            : "border-slate-200 bg-white shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        }`}
        title="View incident reports and dispute disputes"
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Incidents
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <ShieldExclamationIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600">
          {pendingReportCount}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          Disputes / Escalations
        </p>
      </button>
    </div>
  );
}

