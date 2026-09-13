"use client";

import { useEffect, useRef } from "react";
import {
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  DocumentMagnifyingGlassIcon,
  LanguageIcon,
  LockClosedIcon,
  StarIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord, SystemRole } from "../types";
import { AVAILABLE_LANGUAGES, AVAILABLE_CATEGORIES } from "../mock-data";

interface UsersTableProps {
  users: AdminUserRecord[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRoles: SystemRole[];
  toggleRoleFilter: (role: SystemRole) => void;
  resetRoles: () => void;
  selectedStatusFilter: "All" | "Active" | "Locked";
  setSelectedStatusFilter: (status: "All" | "Active" | "Locked") => void;
  selectedLanguages: string[];
  toggleLanguageFilter: (lang: string) => void;
  resetLanguages: () => void;
  selectedCategories: string[];
  toggleCategoryFilter: (cat: string) => void;
  resetCategories: () => void;
  filterMenuOpen: boolean;
  setFilterMenuOpen: (open: boolean) => void;
  onSelectUser: (user: AdminUserRecord) => void;
}

export function UsersTable({
  users,
  searchQuery,
  setSearchQuery,
  selectedRoles,
  toggleRoleFilter,
  resetRoles,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedLanguages,
  toggleLanguageFilter,
  resetLanguages,
  selectedCategories,
  toggleCategoryFilter,
  resetCategories,
  filterMenuOpen,
  setFilterMenuOpen,
  onSelectUser,
}: UsersTableProps) {
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    if (filterMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterMenuOpen, setFilterMenuOpen]);

  const activeFiltersCount = selectedRoles.length + selectedLanguages.length + selectedCategories.length;

  return (
    <div className="space-y-4">
      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone or ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#087f80]"
          />
          <DocumentMagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls: Quick Status Select + Unified Multi-Select Filter Button */}
        <div className="flex items-center gap-2">
          {/* Quick Status Filter on Toolbar */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as "All" | "Active" | "Locked")}
              className="rounded-xl sm:rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </select>
          </div>

          {/* Unified Filter Button (Roles, Languages & Categories) */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className={`flex items-center justify-center gap-2 rounded-xl sm:rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                activeFiltersCount > 0
                  ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                  : "border-[#c9d8de] bg-white text-[#2d4957] hover:border-[#087f80] hover:bg-[#edf7f5]"
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[9px] font-black text-white">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDownIcon
                className={`h-3 w-3 text-[#5e7783] transition-transform ${
                  filterMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filter Popover Menu (Roles + Languages + Specialties) */}
            {filterMenuOpen && (
              <div className="fixed inset-x-4 top-24 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 z-50 sm:w-88 md:w-96 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.18)] space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                  <span className="text-xs font-black text-[#112d3f] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    Filter Options
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        resetRoles();
                        resetLanguages();
                        resetCategories();
                      }}
                      className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
                    >
                      Clear all ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Section 1: System Roles Multi-Select */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <UserCircleIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      Roles (เลือกได้มากกว่า 1 บทบาท)
                    </label>
                    {selectedRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={resetRoles}
                        className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                      >
                        Reset ({selectedRoles.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["User", "Interpreter", "Manager", "Admin"] as SystemRole[]).map((role) => {
                      const isChecked = selectedRoles.includes(role);
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() => toggleRoleFilter(role)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors text-left ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-[#b8cbd2] bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Languages */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <LanguageIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      Languages (ภาษาที่สื่อสารได้)
                    </label>
                    {selectedLanguages.length > 0 && (
                      <button
                        type="button"
                        onClick={resetLanguages}
                        className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                      >
                        Reset ({selectedLanguages.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {AVAILABLE_LANGUAGES.map((lang) => {
                      const isChecked = selectedLanguages.includes(lang);
                      return (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => toggleLanguageFilter(lang)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors text-left ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-[#b8cbd2] bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{lang}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Specialties / Categories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <BriefcaseIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      Specialty Categories
                    </label>
                    {selectedCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={resetCategories}
                        className="text-[10px] text-[#087f80] hover:underline cursor-pointer font-bold"
                      >
                        Reset ({selectedCategories.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {AVAILABLE_CATEGORIES.map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => toggleCategoryFilter(cat)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors text-left ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-[#b8cbd2] bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table with Clean Modern Borderless Look */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200/80 bg-slate-50/75 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-5 pr-4 w-[24%]">User & Contact</th>
                <th className="px-3.5 py-3.5 w-[11%] text-center">Role</th>
                <th className="px-3.5 py-3.5 w-[10%] text-center">Rating</th>
                <th className="px-3.5 py-3.5 w-[13%]">Primary Lang</th>
                <th className="px-3.5 py-3.5 w-[20%]">Spoken Languages</th>
                <th className="px-3.5 py-3.5 w-[11%] text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right w-[11%]">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/90">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UserCircleIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold">No users matching the filters</p>
                    <p className="text-xs text-slate-400">Try adjusting your search criteria or resetting filters.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`cursor-pointer transition-colors hover:bg-teal-50/40 ${
                      u.isLocked ? "bg-red-50/25 hover:bg-red-50/40" : ""
                    }`}
                  >
                    {/* User & Contact */}
                    <td className="py-3.5 pl-5 pr-4">
                      <div className="font-bold text-[#092f45]">{u.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ID: {u.id} • {u.phone}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-3.5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[78px] rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          u.role === "Admin"
                            ? "bg-purple-100 text-purple-700 border border-purple-200/60"
                            : u.role === "Manager"
                            ? "bg-blue-100 text-blue-700 border border-blue-200/60"
                            : u.role === "Interpreter"
                            ? "bg-teal-100 text-[#087f80] border border-teal-200/60"
                            : "bg-slate-100 text-slate-600 border border-slate-200/60"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="px-3.5 py-3.5 text-center">
                      {u.interpreterStats?.rating ? (
                        <span className="inline-flex items-center justify-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-700 border border-amber-200">
                          <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{u.interpreterStats.rating.toFixed(1)}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 font-semibold">-</span>
                      )}
                    </td>

                    {/* Primary Language */}
                    <td className="px-3.5 py-3.5 font-semibold text-[#092f45]">
                      <span className="inline-flex items-center gap-1">
                        {u.primaryLanguage}
                      </span>
                    </td>

                    {/* Spoken Languages */}
                    <td className="px-3.5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.spokenLanguages.map((lang) => (
                          <span
                            key={lang}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/50"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Security Status */}
                    <td className="px-3.5 py-3.5 text-center">
                      {u.isLocked ? (
                        <div className="inline-flex items-center justify-center gap-1 min-w-[72px] rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#f04f3e] border border-red-200/70">
                          <LockClosedIcon className="h-3 w-3 shrink-0" />
                          <span>Locked</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-1 min-w-[72px] rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/70">
                          <CheckCircleIcon className="h-3 w-3 shrink-0" />
                          <span>Active</span>
                        </div>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 pl-3 pr-5 text-right text-slate-500 text-[11px] font-medium whitespace-nowrap">
                      {u.lastActive}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

