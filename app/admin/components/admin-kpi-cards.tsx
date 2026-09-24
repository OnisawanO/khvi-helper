"use client";

import {
  CheckBadgeIcon,
  LockClosedIcon,
  NoSymbolIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { UserStatusFilter } from "../types";
import { useStoredLocale } from "@/app/lib/locale";
import { getAdminTranslation } from "../locales";

interface AdminKpiCardsProps {
  totalUsersCount: number;
  totalInterpretersCount: number;
  lockedUsersCount: number;
  legacyRestrictedUsersCount: number;
  selectedStatusFilter: UserStatusFilter;
  setSelectedStatusFilter: (status: UserStatusFilter) => void;
  selectedRoles: string[];
  toggleRoleFilter: (role: "User" | "Interpreter" | "Manager" | "Admin") => void;
  resetRoles: () => void;
}

export function AdminKpiCards({
  totalUsersCount,
  totalInterpretersCount,
  lockedUsersCount,
  legacyRestrictedUsersCount,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedRoles,
  toggleRoleFilter,
  resetRoles,
}: AdminKpiCardsProps) {
  const [locale] = useStoredLocale();
  const t = getAdminTranslation(locale).kpi;
  const isAllUsersActive =
    selectedStatusFilter === "All" && selectedRoles.length === 0;
  const isInterpretersActive =
    selectedRoles.length === 1 && selectedRoles.includes("Interpreter");
  const isSuspendedActive = selectedStatusFilter === "SoftSuspended";
  const isLegacyRestrictedActive = selectedStatusFilter === "LegacyRestricted";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 shadow-2xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
        {/* 1. Total Accounts Card */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatusFilter("All");
            resetRoles();
          }}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isAllUsersActive
              ? "bg-white border-blue-200 shadow-xs ring-1 ring-blue-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Total Accounts
            </p>
            <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
              isAllUsersActive ? "bg-blue-100 text-blue-700" : "bg-blue-50 text-blue-600"
            }`}>
              <UserGroupIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-[#092f45]">
              {totalUsersCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">{t.users}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Global Directory</span>
            <span className={`font-bold ${isAllUsersActive ? "text-blue-700 underline" : "text-blue-600 group-hover:underline"}`}>
              {isAllUsersActive ? t.activeFilter : t.filterAll}
            </span>
          </div>
        </button>

        {/* 2. Interpreters Roster */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatusFilter("All");
            resetRoles();
            toggleRoleFilter("Interpreter");
          }}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isInterpretersActive
              ? "bg-white border-teal-200 shadow-xs ring-1 ring-teal-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Volunteer Interpreters
            </p>
            <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
              isInterpretersActive ? "bg-teal-100 text-teal-700" : "bg-teal-50 text-[#087f80]"
            }`}>
              <CheckBadgeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-[#087f80]">
              {totalInterpretersCount}
            </p>
            <span className="text-[11px] font-semibold text-teal-600/70">{t.interpreters}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Field Capacity</span>
            <span className={`font-bold ${isInterpretersActive ? "text-teal-800 underline" : "text-[#087f80] group-hover:underline"}`}>
              {isInterpretersActive ? t.activeFilter : t.filterInterpreters}
            </span>
          </div>
        </button>

        {/* 3. Suspended / Locked Accounts */}
        <button
          type="button"
          onClick={() => {
            resetRoles();
            setSelectedStatusFilter("SoftSuspended");
          }}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isSuspendedActive
              ? "bg-white border-red-200 shadow-xs ring-1 ring-red-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Soft Suspended
            </p>
            <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
              isSuspendedActive ? "bg-red-100 text-[#f04f3e]" : "bg-red-50 text-[#f04f3e]"
            }`}>
              <LockClosedIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p
              className={`text-xl sm:text-2xl font-black ${
                lockedUsersCount > 0 ? "text-[#f04f3e]" : "text-slate-700"
              }`}
            >
              {lockedUsersCount}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">{t.softSuspended}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Security Actions</span>
            <span
              className={`font-bold ${
                lockedUsersCount > 0 ? "text-[#f04f3e]" : "text-slate-500"
              } ${isSuspendedActive ? "underline" : "group-hover:underline"}`}
            >
              {lockedUsersCount > 0 ? t.filterSoftSuspended : t.healthyBase}
            </span>
          </div>
        </button>

        {/* 4. Legacy Restrictions */}
        <button
          type="button"
          onClick={() => {
            setSelectedStatusFilter("LegacyRestricted");
            resetRoles();
          }}
          className={`group text-left rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer border ${
            isLegacyRestrictedActive
              ? "bg-white border-red-200 shadow-xs ring-1 ring-red-500/20"
              : "bg-white/60 hover:bg-white border-transparent hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Legacy Restricted
            </p>
            <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md ${
              isLegacyRestrictedActive ? "bg-red-100 text-red-700" : "bg-red-50 text-red-600"
            }`}>
              <NoSymbolIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className={`text-xl sm:text-2xl font-black ${legacyRestrictedUsersCount > 0 ? "text-red-700" : "text-slate-700"}`}>
              {legacyRestrictedUsersCount}
            </p>
            <span className="text-[11px] font-semibold text-red-600/70">restricted</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
            <span className="text-slate-400">Security Actions</span>
            <span className={`font-bold ${isLegacyRestrictedActive ? "text-red-900 underline" : "text-red-700 group-hover:underline"}`}>
              {isLegacyRestrictedActive ? "Active Filter" : "Filter Legacy Records"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
