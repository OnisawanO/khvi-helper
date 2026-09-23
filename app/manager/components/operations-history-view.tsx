"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  ShieldExclamationIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ManagerActivity } from "../types";
import { parseManagerTimestamp } from "../utils";

interface OperationsHistoryViewProps {
  activities: ManagerActivity[];
}

export function OperationsHistoryView({
  activities,
}: OperationsHistoryViewProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [currentTime] = useState(() => Date.now());
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Close filter menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

  const resetAllFilters = () => {
    setSelectedTypes([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const activeFilterCount = selectedTypes.length;

  const activityTypeOptions = [
    { id: "approval", label: "Approvals" },
    { id: "rejection", label: "Rejections" },
    { id: "change_request", label: "Requested Changes" },
    { id: "report_escalation", label: "Admin Escalations" },
    { id: "report_resolved", label: "Resolved Incidents" },
  ];

  const filteredActivities = useMemo(() => {
    const filtered = activities.filter((act) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTarget = act.targetName.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        const matchesType = act.type.toLowerCase().includes(q);
        const matchesTime = act.timestamp.toLowerCase().includes(q);

        if (!matchesTarget && !matchesDesc && !matchesType && !matchesTime) {
          return false;
        }
      }

      // 2. Type Filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(act.type)) {
        return false;
      }

      return true;
    });

    return filtered.sort(
      (left, right) =>
        parseManagerTimestamp(right.timestamp, currentTime) -
        parseManagerTimestamp(left.timestamp, currentTime),
    );
  }, [activities, searchQuery, selectedTypes, currentTime]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedActivities = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredActivities.slice(startIndex, startIndex + pageSize);
  }, [filteredActivities, validCurrentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Flat Canvas Search & Filter Controls Bar (Admin Style) */}
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
            placeholder="Search activity by target, action or description..."
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
                activeFilterCount > 0
                  ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[9px] font-black text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDownIcon
                className={`h-3 w-3 text-[#5e7783] transition-transform ${
                  filterMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filter Popover Dropdown */}
            {filterMenuOpen && (
              <div className="fixed inset-x-4 top-28 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 z-50 sm:w-80 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.18)] space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                  <span className="text-xs font-black text-[#112d3f] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    Filter Activity History
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        resetAllFilters();
                        setCurrentPage(1);
                      }}
                      className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
                    >
                      Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* Action Type */}
                <div>
                  <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1 mb-2">
                    <TagIcon className="h-3.5 w-3.5 text-[#087f80]" />
                    Action Type
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {activityTypeOptions.map((t) => {
                      const isChecked = selectedTypes.includes(t.id);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            toggleType(t.id);
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
                          <span className="truncate">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset All Filters Button */}
          {(searchQuery || activeFilterCount > 0) && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#f04f3e] hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Flat Canvas Activity Table (Admin Style) */}
      <div className="border-y border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 pl-3 pr-3 w-[25%]">Target & Timestamp</th>
                <th className="py-3.5 px-3 w-[18%]">Action Type</th>
                <th className="py-3.5 px-3 w-[45%]">Operational Description</th>
                <th className="py-3.5 pr-3 pl-3 text-center w-[12%]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((act) => {
                  let badgeBg = "bg-[#f0f9f5] text-[#087557] border-[#bfe5d7]";
                  let typeLabel = "Approval";
                  let IconComponent = CheckCircleIcon;

                  if (act.type === "rejection") {
                    badgeBg = "bg-[#fff1ef] text-[#d93829] border-[#fecac6]";
                    typeLabel = "Rejection";
                    IconComponent = XMarkIcon;
                  } else if (act.type === "change_request") {
                    badgeBg = "bg-[#fff8e8] text-[#b56e18] border-[#f5d89a]";
                    typeLabel = "Changes Requested";
                    IconComponent = ArrowPathIcon;
                  } else if (act.type === "report_escalation") {
                    badgeBg = "bg-[#fffbeb] text-[#d97706] border-[#fde68a]";
                    typeLabel = "Escalated to Admin";
                    IconComponent = ShieldExclamationIcon;
                  } else if (act.type === "report_resolved") {
                    badgeBg = "bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]";
                    typeLabel = "Incident Resolved";
                    IconComponent = CheckCircleIcon;
                  }

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Target & Timestamp */}
                      <td className="py-3.5 pl-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${badgeBg}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{act.targetName}</p>
                            <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {act.timestamp}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Action Type */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badgeBg}`}
                        >
                          {typeLabel}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-3">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {act.description}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 pr-3 pl-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                          <CheckCircleIcon className="h-3 w-3 text-emerald-600" />
                          Recorded
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <ClockIcon className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-500">No activity records found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {activities.length === 0
                          ? "Actions taken by managers will be logged here."
                          : "No activity matches your search or filter criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer (Admin Standard) */}
        {filteredActivities.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 select-none">
            <div>
              Showing{" "}
              <strong className="text-[#092f45]">
                {(validCurrentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-[#092f45]">
                {Math.min(validCurrentPage * pageSize, filteredActivities.length)}
              </strong>{" "}
              of <strong className="text-[#092f45]">{filteredActivities.length}</strong> activity action(s)
              {filteredActivities.length !== activities.length && (
                <span className="text-slate-400 ml-1">
                  (filtered from {activities.length})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
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
                title="Next page"
              >
                <span>Next</span>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
