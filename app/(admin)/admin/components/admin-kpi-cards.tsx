"use client";

import {
  CheckBadgeIcon,
  KeyIcon,
  LockClosedIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface AdminKpiCardsProps {
  totalUsersCount: number;
  totalInterpretersCount: number;
  lockedUsersCount: number;
  totalAdminsCount: number;
  selectedStatusFilter: "All" | "Active" | "Locked";
  setSelectedStatusFilter: (status: "All" | "Active" | "Locked") => void;
  selectedRoles: string[];
  toggleRoleFilter: (role: "User" | "Interpreter" | "Manager" | "Admin") => void;
  resetRoles: () => void;
}

export function AdminKpiCards({
  totalUsersCount,
  totalInterpretersCount,
  lockedUsersCount,
  totalAdminsCount,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedRoles,
  toggleRoleFilter,
  resetRoles,
}: AdminKpiCardsProps) {
  const isAllUsersActive =
    selectedStatusFilter === "All" && selectedRoles.length === 0;
  const isInterpretersActive =
    selectedRoles.length === 1 && selectedRoles.includes("Interpreter");
  const isSuspendedActive = selectedStatusFilter === "Locked";
  const isStaffActive =
    selectedRoles.length === 2 &&
    selectedRoles.includes("Admin") &&
    selectedRoles.includes("Manager");

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      {/* 1. Total Accounts Card */}
      <button
        type="button"
        onClick={() => {
          setSelectedStatusFilter("All");
          resetRoles();
        }}
        className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
          isAllUsersActive
            ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm"
            : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Total Accounts
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
            <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-black text-[#092f45]">
            {totalUsersCount}
          </p>
          <span className="text-[11px] font-semibold text-slate-400">profiles</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-slate-500">
          <span>Registered Base</span>
          <span className="font-bold text-blue-600">View All</span>
        </div>
      </button>

      {/* 2. Interpreters Card */}
      <button
        type="button"
        onClick={() => {
          setSelectedStatusFilter("All");
          resetRoles();
          toggleRoleFilter("Interpreter");
        }}
        className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
          isInterpretersActive
            ? "border-[#087f80] bg-teal-50/40 ring-2 ring-[#087f80]/20 shadow-sm"
            : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Interpreters
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#087f80] transition-transform group-hover:scale-110">
            <CheckBadgeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-black text-[#087f80]">
            {totalInterpretersCount}
          </p>
          <span className="text-[11px] font-semibold text-[#087f80]/70">volunteers</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-slate-500">
          <span>Pool Capacity</span>
          <span className="font-bold text-[#087f80]">
            {totalUsersCount > 0
              ? `${Math.round((totalInterpretersCount / totalUsersCount) * 100)}% Filter Interpreters`
              : "Filter Interpreters"}
          </span>
        </div>
      </button>

      {/* 3. Suspended & Restricted Accounts */}
      <button
        type="button"
        onClick={() => {
          resetRoles();
          setSelectedStatusFilter(isSuspendedActive ? "All" : "Locked");
        }}
        className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
          isSuspendedActive
            ? "border-red-500 bg-red-50/40 ring-2 ring-red-500/20 shadow-sm"
            : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            Suspended
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#f04f3e] transition-transform group-hover:scale-110">
            <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p
            className={`text-2xl sm:text-3xl font-black ${
              lockedUsersCount > 0 ? "text-[#f04f3e]" : "text-slate-700"
            }`}
          >
            {lockedUsersCount}
          </p>
          <span className="text-[11px] font-semibold text-slate-400">accounts</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-slate-500">
          <span>Security Status</span>
          <span
            className={`font-bold ${
              lockedUsersCount > 0 ? "text-[#f04f3e]" : "text-slate-500"
            }`}
          >
            {lockedUsersCount > 0 ? "Filter Suspended" : "Healthy Base"}
          </span>
        </div>
      </button>

      {/* 4. Staff & Administrators */}
      <button
        type="button"
        onClick={() => {
          setSelectedStatusFilter("All");
          resetRoles();
          toggleRoleFilter("Admin");
          toggleRoleFilter("Manager");
        }}
        className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
          isStaffActive
            ? "border-purple-500 bg-purple-50/40 ring-2 ring-purple-500/20 shadow-sm"
            : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
            System Staff
          </p>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
            <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-black text-purple-700">
            {totalAdminsCount}
          </p>
          <span className="text-[11px] font-semibold text-purple-600/70">members</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-slate-500">
          <span>Governance Tier</span>
          <span className="font-bold text-purple-700">Filter Staff</span>
        </div>
      </button>
    </div>
  );
}

