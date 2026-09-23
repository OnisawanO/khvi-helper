"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  LanguageIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { InterpreterApplicant, ManagerNavSection } from "../types";

interface ApplicantsTableProps {
  navSection: ManagerNavSection;
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
  onApprove: (id: string) => void;
}

export function ApplicantsTable({
  navSection,
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
  onApprove,
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
      {/* View Header with Search & Filter */}
      <div className="rounded-2xl border border-[#d8e3e7] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-[#112d3f] sm:text-xl">
              {navSection === "queue" && "Volunteer Interpreter Queue (Pending Review)"}
              {navSection === "approved" && "Approved Volunteer Interpreters"}
              {navSection === "rejected" && "Rejected Applicant Archive"}
              {navSection === "queue" && "Volunteer Interpreter Queue"}
              {navSection === "approved" && "Approved Interpreters"}
              {navSection === "rejected" && "Rejected Interpreters"}
            </h1>
            <p className="mt-1 text-xs text-[#637d8a]">
              {navSection === "queue" && "Click any row to inspect candidate credentials in centered dossier and make a decision."}
              {navSection === "approved" && "List of certified volunteers authorized to receive live mission broadcasts."}
              {navSection === "rejected" && "Historical record of rejected applicants and specified rejection reasons."}
            </p>
          </div>

          {/* Search and Combined Filter Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e97a3]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, language, category, ID..."
                className="w-48 sm:w-60 rounded-xl border border-[#ccdbe1] bg-[#f9fbfb] py-1.5 pl-8 pr-3 text-xs text-[#143141] placeholder-[#7d95a2] focus:border-[#087f80] focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            {/* Filter Button */}
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                  selectedLanguages.length > 0 || selectedCategories.length > 0
                    ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                    : "border-[#ccdbe1] bg-white text-[#254454] hover:bg-[#f7fafb]"
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Filter</span>
                {(selectedLanguages.length > 0 || selectedCategories.length > 0) && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[9px] font-black text-white">
                    {selectedLanguages.length + selectedCategories.length}
                  </span>
                )}
                <ChevronDownIcon className={`h-3 w-3 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Filter Popover Menu (Multi-Select) */}
              {filterMenuOpen && (
                <div className="absolute right-0 top-full mt-2 z-40 w-80 sm:w-96 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.14)] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                    <span className="text-xs font-black text-[#112d3f] flex items-center gap-1.5">
                      <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                      Multi-Select Filter
                    </span>
                    {(selectedLanguages.length > 0 || selectedCategories.length > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          resetLanguages();
                          resetCategories();
                        }}
                        className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
                      >
                        Clear all ({selectedLanguages.length + selectedCategories.length})
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
                          <label
                            key={lang.id}
                            onClick={() => toggleLanguage(lang.id)}
                            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
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
                          </label>
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
                          <label
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
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
                          </label>
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

            {/* Reset Button (Visible if active filter or search) */}
            {(searchQuery || selectedLanguages.length > 0 || selectedCategories.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  resetLanguages();
                  resetCategories();
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-[#d3e0e5] bg-[#f2f7f9] px-2.5 py-1.5 text-xs font-bold text-[#325263] hover:bg-[#e4eff2] cursor-pointer"
              >
                <ArrowPathIcon className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clean Table List with Grid Dividers */}
      <div className="min-h-[480px] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-5 pr-4 w-[26%]">Applicant & Location</th>
                <th className="px-3.5 py-3.5 w-[18%]">Languages</th>
                <th className="px-3.5 py-3.5 w-[22%]">Specialties</th>
                <th className="px-3.5 py-3.5 w-[13%] text-center">Background</th>
                <th className="px-3.5 py-3.5 w-[11%] text-center">Status</th>
                <th className="py-3.5 pr-5 pl-3 text-right w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedApplicants.length > 0 ? (
                paginatedApplicants.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplicant(app)}
                    className="group hover:bg-teal-50/40 transition-colors cursor-pointer"
                  >
                    {/* Applicant & Time */}
                    <td className="py-3.5 pl-5 pr-4">
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
                          +{app.spokenLanguages.length - 1} other language(s)
                        </p>
                      )}
                    </td>

                    {/* Specialty Domains */}
                    <td className="px-3.5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {app.specialtyCategories.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-md bg-[#edf7f5] px-2 py-0.5 text-[10px] font-bold text-[#087f80] border border-teal-200/50"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Background Check */}
                    <td className="px-3.5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center gap-1 min-w-[84px] rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          app.backgroundCheck === "Passed"
                            ? "bg-[#e8f5f1] text-[#087557] border-[#087557]/20"
                            : "bg-[#fef5e8] text-[#b56e18] border-[#b56e18]/20"
                        }`}
                      >
                        <ShieldCheckIcon className="h-3 w-3 shrink-0" />
                        <span>{app.backgroundCheck}</span>
                      </span>
                    </td>

                    {/* Status with Dot Indicator */}
                    <td className="px-3.5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center gap-1.5 min-w-[92px] rounded-full px-2.5 py-1 text-[10px] font-extrabold border ${
                          app.status === "Approved"
                            ? "bg-[#e7f5f0] text-[#087557] border-[#087557]/20"
                            : app.status === "Rejected"
                            ? "bg-[#fff1ef] text-[#d93829] border-[#d93829]/20"
                            : app.status === "Under Review"
                            ? "bg-[#e8f2f8] text-[#1a5b82] border-[#1a5b82]/20"
                            : "bg-[#fef4e8] text-[#b36916] border-[#b36916]/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            app.status === "Approved"
                              ? "bg-[#087557]"
                              : app.status === "Rejected"
                              ? "bg-[#d93829]"
                              : app.status === "Under Review"
                              ? "bg-[#1a5b82]"
                              : "bg-[#b36916]"
                          }`}
                        />
                        <span>{app.status}</span>
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 pr-5 pl-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {app.status !== "Approved" && (
                          <button
                            type="button"
                            title="Quick Approve"
                            onClick={() => onApprove(app.id)}
                            className="rounded-lg p-1.5 text-[#087557] hover:bg-[#e7f5f0] transition-colors cursor-pointer"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Contact Applicant"
                          onClick={() => alert(`Direct contact for ${app.name}: ${app.contactChannels}`)}
                          className="rounded-lg p-1.5 text-[#3e5b6a] hover:bg-[#edf3f6] transition-colors cursor-pointer"
                        >
                          <PhoneIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Inspect Dossier"
                          onClick={() => onSelectApplicant(app)}
                          className="rounded-lg p-1.5 text-[#3e5b6a] hover:bg-[#edf3f6] transition-colors cursor-pointer"
                        >
                          <EllipsisHorizontalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No applicants found matching this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-3 text-xs text-slate-500 select-none">
          <div>
            Showing{" "}
            <strong className="text-[#092f45]">
              {applicants.length > 0 ? (validCurrentPage - 1) * pageSize + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-[#092f45]">
              {Math.min(validCurrentPage * pageSize, applicants.length)}
            </strong>{" "}
            of <strong className="text-[#092f45]">{applicants.length}</strong> applicants
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous page"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            {/* Page Indicator Pills */}
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

            {/* Next Page Button */}
            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next page"
            >
              <span>Next</span>
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

