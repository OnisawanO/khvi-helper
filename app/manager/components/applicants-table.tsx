"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentMagnifyingGlassIcon,
  LanguageIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { InterpreterApplicant } from "../types";
import type { ManagerTranslation } from "../locales";

interface ApplicantsTableProps {
  applicants: InterpreterApplicant[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLanguages: string[];
  toggleLanguage: (lang: string) => void;
  resetLanguages: () => void;
  selectedCategories: string[];
  toggleCategory: (cat: string) => void;
  resetCategories: () => void;
  filterMenuOpen: boolean;
  setFilterMenuOpen: (open: boolean) => void;
  onSelectApplicant: (applicant: InterpreterApplicant) => void;
  t: ManagerTranslation["table"];
}

export function ApplicantsTable({
  applicants,
  searchQuery,
  setSearchQuery,
  selectedLanguages,
  toggleLanguage,
  resetLanguages,
  selectedCategories,
  toggleCategory,
  resetCategories,
  filterMenuOpen,
  setFilterMenuOpen,
  onSelectApplicant,
  t,
}: ApplicantsTableProps) {
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.max(1, Math.ceil(applicants.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedApplicants = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return applicants.slice(startIndex, startIndex + pageSize);
  }, [applicants, validCurrentPage, pageSize]);

  const activeFiltersCount = selectedLanguages.length + selectedCategories.length;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [setFilterMenuOpen]);

  return (
    <div className="space-y-4">
      {/* 2. Search, Multi-Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#087f80]"
          />
          <DocumentMagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls: Unified Multi-Select Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className={`flex items-center justify-center gap-2 rounded-xl sm:rounded-lg border px-3 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                activeFiltersCount > 0
                  ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
              <span>{t.filterButton}</span>
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

            {/* Filter Popover Menu (Languages & Specialties) */}
            {filterMenuOpen && (
              <div className="fixed inset-x-4 top-28 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 z-50 sm:w-88 md:w-96 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.18)] space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                  <span className="text-xs font-black text-[#112d3f] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    Filter Candidate Options
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        resetLanguages();
                        resetCategories();
                        setCurrentPage(1);
                      }}
                      className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
                    >
                      Clear all ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* 1. Multi-Select Languages */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <LanguageIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      Spoken Languages
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
                    {[
                      { id: "Thai", label: "Thai (ไทย)" },
                      { id: "Burmese", label: "Burmese (พม่า)" },
                      { id: "Mandarin", label: "Mandarin (จีนกลาง)" },
                      { id: "English", label: "English (อังกฤษ)" },
                      { id: "Vietnamese", label: "Vietnamese (เวียดนาม)" },
                      { id: "Japanese", label: "Japanese (ญี่ปุ่น)" },
                      { id: "Russian", label: "Russian (รัสเซีย)" },
                    ].map((lang) => {
                      const isChecked = selectedLanguages.includes(lang.id);
                      return (
                        <button
                          type="button"
                          key={lang.id}
                          onClick={() => {
                            toggleLanguage(lang.id);
                            setCurrentPage(1);
                          }}
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
                          <span className="truncate">{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Multi-Select Categories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1">
                      <BriefcaseIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      Specialty Domains
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
                    {[
                      { id: "Medical", label: "Medical" },
                      { id: "Tourism", label: "Tourism" },
                      { id: "Police station", label: "Police Station" },
                      { id: "Legal Documentation", label: "Legal Document" },
                      { id: "Labour Assistance", label: "Labour Help" },
                    ].map((cat) => {
                      const isChecked = selectedCategories.includes(cat.id);
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => {
                            toggleCategory(cat.id);
                            setCurrentPage(1);
                          }}
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
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Filter Summary and Apply */}
                <div className="border-t border-[#edf2f5] pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-[#698492]">
                    Found: <strong className="text-[#102938]">{applicants.length}</strong> candidate(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterMenuOpen(false)}
                    className="rounded-lg bg-[#087f80] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#066a6a] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset All Filters Button */}
          {(searchQuery || activeFiltersCount > 0) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                resetLanguages();
                resetCategories();
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#f04f3e] hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Flat Canvas Table with Hairline Grid (Admin Style) */}
      <div className="border-y border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-3 pr-4 w-[34%]">{t.columns.applicant}</th>
                <th className="px-3.5 py-3.5 w-[24%]">{t.columns.languages}</th>
                <th className="px-3.5 py-3.5 w-[26%]">{t.columns.specialties}</th>
                <th className="py-3.5 pr-4 pl-3.5 text-right w-[16%]">{t.columns.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedApplicants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <DocumentMagnifyingGlassIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold">{t.emptyTitle}</p>
                    <p className="text-xs text-slate-400">{t.emptySubtitle}</p>
                  </td>
                </tr>
              ) : (
                paginatedApplicants.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplicant(app)}
                    className="group hover:bg-teal-50/40 transition-colors cursor-pointer"
                  >
                    {/* Applicant & Time */}
                    <td className="py-3.5 pl-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#092f45] text-xs font-black text-white shadow-2xs">
                          {app.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#092f45] group-hover:text-[#087f80] transition-colors">
                            {app.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {app.appliedDate.split(" ")[1] || app.appliedDate} · {app.country}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Primary Pair */}
                    <td className="px-3.5 py-3.5">
                      <span className="font-bold text-[#092f45]">
                        {app.primaryLanguage}
                      </span>
                      {app.spokenLanguages.length > 1 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          +{app.spokenLanguages.length - 1} {t.otherLanguagesCount}
                        </p>
                      )}
                    </td>

                    {/* Specialty Domains - Clean text without bulky boxes */}
                    <td className="px-3.5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
                        {app.specialtyCategories.slice(0, 2).map((spec, idx) => (
                          <span key={spec} className="inline-flex items-center">
                            {idx > 0 && <span className="mr-1.5 text-slate-300">·</span>}
                            <span className="font-medium text-[#2d4957]">{spec}</span>
                          </span>
                        ))}
                        {app.specialtyCategories.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{app.specialtyCategories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Review Status - Clean Right Aligned */}
                    <td className="py-3.5 pr-4 pl-3.5 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          app.status === "Approved"
                            ? "bg-[#e8f5e9] text-[#2e7d32]"
                            : app.status === "Rejected"
                            ? "bg-[#ffebee] text-[#c62828]"
                            : app.status === "Under Review"
                            ? "bg-[#e0f2fe] text-[#0284c7]"
                            : "bg-[#fff8e1] text-[#f57f17]"
                        }`}
                      >
                        {app.status === "Approved"
                          ? t.approvedStatus
                          : app.status === "Rejected"
                          ? t.rejectedStatus
                          : app.status === "Under Review"
                          ? t.underReviewStatus
                          : t.pendingStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer (Admin Standard) */}
        {applicants.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 select-none">
            <div>
              {t.paginationShowing}{" "}
              <strong className="text-[#092f45]">
                {(validCurrentPage - 1) * pageSize + 1}
              </strong>{" "}
              {t.paginationOf}{" "}
              <strong className="text-[#092f45]">
                {Math.min(validCurrentPage * pageSize, applicants.length)}
              </strong>{" "}
              {t.paginationOf} <strong className="text-[#092f45]">{applicants.length}</strong> {t.paginationCandidates}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title={t.paginationPrev}
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
                <span>{t.paginationPrev}</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      validCurrentPage === pageNum
                        ? "bg-[#087f80] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title={t.paginationNext}
              >
                <span>{t.paginationNext}</span>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
