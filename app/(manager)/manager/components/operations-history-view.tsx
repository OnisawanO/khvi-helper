"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShieldExclamationIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { ManagerActivity } from "../types";

interface OperationsHistoryViewProps {
  activities: ManagerActivity[];
}

export function OperationsHistoryView({
  activities,
}: OperationsHistoryViewProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
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
  };

  const activeFilterCount = selectedTypes.length;

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTarget = act.targetName.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        const matchesType = act.type.toLowerCase().includes(q);
        const matchesTime = act.timestamp.toLowerCase().includes(q);
        if (!matchesTarget && !matchesDesc && !matchesType && !matchesTime) {
          return false;
        }
      }

      // 2. Action Type Filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(act.type)) {
        return false;
      }

      return true;
    });
  }, [activities, searchQuery, selectedTypes]);

  // Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedActivities = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredActivities.slice(startIndex, startIndex + pageSize);
  }, [filteredActivities, validCurrentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* View Header with Search & Filter Box */}
      <div className="rounded-2xl border border-[#d8e3e7] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-extrabold text-[#112d3f] sm:text-xl">
              Operations Activity History
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f8] px-2.5 py-0.5 text-xs font-bold text-[#2d4b5b] border border-[#dce6ed]">
              <ClockIcon className="h-3.5 w-3.5 text-[#087f80]" />
              Total: {activities.length}
            </span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e97a3]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search target, action, timestamp..."
                className="w-48 sm:w-60 rounded-xl border border-[#ccdbe1] bg-[#f9fbfb] py-1.5 pl-8 pr-3 text-xs text-[#143141] placeholder-[#7d95a2] focus:border-[#087f80] focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            {/* Filter Popover Button */}
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                  activeFilterCount > 0
                    ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                    : "border-[#ccdbe1] bg-white text-[#254454] hover:bg-[#f7fafb]"
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#087f80] text-[9px] font-black text-white">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDownIcon
                  className={`h-3 w-3 transition-transform ${
                    filterMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Filter Popover Dropdown */}
              {filterMenuOpen && (
                <div className="absolute right-0 top-full mt-2 z-40 w-72 sm:w-80 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.14)] space-y-4 animate-in fade-in">
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

                  {/* 1. Action Type */}
                  <div>
                    <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1 mb-2">
                      <TagIcon className="h-3.5 w-3.5 text-[#087f80]" />
                      Operational Action Type
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: "approval", label: "Interpreter Approval" },
                        { id: "rejection", label: "Interpreter Rejection" },
                        { id: "ticket_reply", label: "Ticket Reply" },
                        { id: "report_escalation", label: "Admin Escalation" },
                      ].map((t) => {
                        const isChecked = selectedTypes.includes(t.id);
                        return (
                          <label
                            key={t.id}
                            onClick={() => {
                              toggleType(t.id);
                              setCurrentPage(1);
                            }}
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
                            <span className="truncate">{t.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table Container */}
      <div className="min-h-[480px] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-[#516f80] border-b border-slate-200">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Target & Timestamp</th>
                <th className="py-3.5 px-3">Action Type</th>
                <th className="py-3.5 px-3">Operational Description</th>
                <th className="py-3.5 pr-5 pl-3 text-center">Status</th>
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
                  } else if (act.type === "ticket_reply") {
                    badgeBg = "bg-[#f0f7ff] text-[#0284c7] border-[#bae6fd]";
                    typeLabel = "Ticket Reply";
                    IconComponent = ChatBubbleLeftRightIcon;
                  } else if (act.type === "report_escalation") {
                    badgeBg = "bg-[#fffbeb] text-[#d97706] border-[#fde68a]";
                    typeLabel = "Escalated to Admin";
                    IconComponent = ShieldExclamationIcon;
                  }

                  return (
                    <tr key={act.id} className="hover:bg-[#fbfcfd] transition-colors">
                      {/* Target & Timestamp */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${badgeBg}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-extrabold text-xs text-[#092f45]">
                              {act.targetName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {act.timestamp}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Type */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${badgeBg}`}
                        >
                          {typeLabel}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-3 max-w-md">
                        <p className="text-xs text-[#3b5463] leading-relaxed line-clamp-2">
                          {act.description}
                        </p>
                      </td>

                      {/* Logged Status */}
                      <td className="py-3.5 pr-5 pl-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#edf7f5] px-2 py-0.5 text-[10px] font-bold text-[#087f80]">
                          <CheckCircleIcon className="h-3 w-3" />
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

        {/* Pagination Footer */}
        {filteredActivities.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 p-4 text-xs text-slate-500 select-none">
            <div>
              Showing{" "}
              <strong className="text-[#092f45]">
                {(validCurrentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-[#092f45]">
                {Math.min(validCurrentPage * pageSize, filteredActivities.length)}
              </strong>{" "}
              of <strong className="text-[#092f45]">{filteredActivities.length}</strong> activity actions
              {filteredActivities.length !== activities.length && (
                <span className="text-[#647f8d] ml-1">
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
