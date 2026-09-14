"use client";

import { useRef } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentMagnifyingGlassIcon,
  LanguageIcon,
  LockClosedIcon,
  StarIcon,
  TagIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord, SystemRole } from "../types";
import { AVAILABLE_LANGUAGES, AVAILABLE_CATEGORIES } from "../mock-data";

interface UsersTableProps {
  users: AdminUserRecord[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRoleFilter: SystemRole | "All";
  setSelectedRoleFilter: (role: SystemRole | "All") => void;
  selectedStatusFilter: "All" | "Active" | "Locked";
  setSelectedStatusFilter: (status: "All" | "Active" | "Locked") => void;
  selectedLanguages: string[];
  toggleLanguageFilter: (lang: string) => void;
  resetLanguages: () => void;
  isLanguageDropdownOpen: boolean;
  setIsLanguageDropdownOpen: (open: boolean) => void;
  selectedCategories: string[];
  toggleCategoryFilter: (cat: string) => void;
  resetCategories: () => void;
  isCategoryDropdownOpen: boolean;
  setIsCategoryDropdownOpen: (open: boolean) => void;
  onSelectUser: (user: AdminUserRecord) => void;
}

export function UsersTable({
  users,
  searchQuery,
  setSearchQuery,
  selectedRoleFilter,
  setSelectedRoleFilter,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedLanguages,
  toggleLanguageFilter,
  resetLanguages,
  isLanguageDropdownOpen,
  setIsLanguageDropdownOpen,
  selectedCategories,
  toggleCategoryFilter,
  resetCategories,
  isCategoryDropdownOpen,
  setIsCategoryDropdownOpen,
  onSelectUser,
}: UsersTableProps) {
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

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

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Role:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value as SystemRole | "All")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="User">User</option>
              <option value="Interpreter">Interpreter</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as "All" | "Active" | "Locked")}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active (Normal)</option>
              <option value="Locked">Locked / Suspended</option>
            </select>
          </div>

          {/* Language Filter Dropdown */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-[#c9d8de] bg-white px-3 py-1.5 text-xs font-bold text-[#2d4957] shadow-sm transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30"
            >
              <LanguageIcon className="h-4 w-4 text-[#087f80]" />
              <span>Languages</span>
              {selectedLanguages.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[10px] font-extrabold text-white">
                  {selectedLanguages.length}
                </span>
              )}
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[#5e7783] transition-transform ${
                  isLanguageDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute right-0 z-40 mt-1 w-60 rounded-xl border border-[#d6e0e4] bg-white p-2.5 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95">
                <div className="mb-2 flex items-center justify-between border-b border-[#eef3f5] px-1 pb-1.5 text-[11px] font-extrabold text-[#153447] uppercase">
                  <span>Filter Languages</span>
                  {selectedLanguages.length > 0 && (
                    <button
                      onClick={resetLanguages}
                      className="text-[10px] font-bold text-[#d93829] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isChecked = selectedLanguages.includes(lang);
                    return (
                      <label
                        key={lang}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                          isChecked
                            ? "bg-[#edf7f5] text-[#087557]"
                            : "text-[#2d4957] hover:bg-[#f2f7f9]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleLanguageFilter(lang)}
                            className="h-3.5 w-3.5 rounded border-[#c9d8de] text-[#087f80] focus:ring-[#087f80]"
                          />
                          <span>{lang}</span>
                        </div>
                        {isChecked && <span className="h-1.5 w-1.5 rounded-full bg-[#087f80]" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Category Specialty Multi-Select Dropdown */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-[#c9d8de] bg-white px-3 py-1.5 text-xs font-bold text-[#2d4957] shadow-sm transition-all hover:border-[#087f80] hover:bg-[#edf7f5] focus:outline-none focus:ring-2 focus:ring-[#087f80]/30"
            >
              <TagIcon className="h-4 w-4 text-[#087f80]" />
              <span>Categories</span>
              {selectedCategories.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[10px] font-extrabold text-white">
                  {selectedCategories.length}
                </span>
              )}
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[#5e7783] transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute right-0 z-40 mt-1 w-64 rounded-xl border border-[#d6e0e4] bg-white p-2.5 shadow-[0_18px_36px_rgba(19,52,68,0.16)] animate-in fade-in zoom-in-95">
                <div className="mb-2 flex items-center justify-between border-b border-[#eef3f5] px-1 pb-1.5 text-[11px] font-extrabold text-[#153447] uppercase">
                  <span>Filter Specialties</span>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={resetCategories}
                      className="text-[10px] font-bold text-[#d93829] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                          isChecked
                            ? "bg-[#edf7f5] text-[#087557]"
                            : "text-[#2d4957] hover:bg-[#f2f7f9]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategoryFilter(cat)}
                            className="h-3.5 w-3.5 rounded border-[#c9d8de] text-[#087f80] focus:ring-[#087f80]"
                          />
                          <span>{cat}</span>
                        </div>
                        {isChecked && <span className="h-1.5 w-1.5 rounded-full bg-[#087f80]" />}
                      </label>
                    );
                  })}
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

