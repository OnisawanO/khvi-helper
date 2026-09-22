"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { IncidentReport } from "../types";

interface IncidentReportsViewProps {
  reports: IncidentReport[];
  onEscalate: (reportId: string) => void;
}

export function IncidentReportsView({
  reports,
  onEscalate,
}: IncidentReportsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedReporterRoles, setSelectedReporterRoles] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter popover on outside click
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

  const toggleStatus = (st: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const toggleReporterRole = (role: string) => {
    setSelectedReporterRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const resetAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedReporterRoles([]);
  };

  const activeFilterCount =
    selectedStatuses.length + selectedReporterRoles.length;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchBooking = r.bookingId.toLowerCase().includes(q);
        const matchReporter = r.reporterName.toLowerCase().includes(q);
        const matchReported = r.reportedUserName.toLowerCase().includes(q);
        const matchReason = r.reason.toLowerCase().includes(q);
        const matchAction = r.actionTaken?.toLowerCase().includes(q) ?? false;
        if (
          !matchId &&
          !matchBooking &&
          !matchReporter &&
          !matchReported &&
          !matchReason &&
          !matchAction
        ) {
          return false;
        }
      }

      // 2. Status filter
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(r.status)
      ) {
        return false;
      }

      // 3. Reporter role filter
      if (
        selectedReporterRoles.length > 0 &&
        !selectedReporterRoles.includes(r.reporterRole)
      ) {
        return false;
      }

      return true;
    });
  }, [reports, searchQuery, selectedStatuses, selectedReporterRoles]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedReports = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredReports.slice(startIndex, startIndex + pageSize);
  }, [filteredReports, validCurrentPage, pageSize]);

  const pendingCount = reports.filter(
    (r) => r.status === "Pending Investigation"
  ).length;

  return (
    <div className="space-y-4">
      {/* View Header with Search & Filter */}
      <div className="rounded-2xl border border-[#d8e3e7] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-extrabold text-[#112d3f] sm:text-xl">
              Incident Reports & Disputes
            </h1>
            <span className="rounded-full bg-[#fef5e8] px-2.5 py-0.5 text-xs font-bold text-[#b56e18]">
              Pending: {pendingCount}
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
              placeholder="Search ref ID, reporter, user..."
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
              <div className="absolute right-0 top-full mt-2 z-40 w-80 sm:w-88 rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.14)] space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                  <span className="text-xs font-black text-[#112d3f] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    Filter Incident Reports
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

                {/* 1. Investigation Status */}
                <div>
                  <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1 mb-2">
                    <BellAlertIcon className="h-3.5 w-3.5 text-[#087f80]" />
                    Investigation Status
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: "Pending Investigation", label: "Pending Investigation" },
                      { id: "Escalated to Admin", label: "Escalated to Admin Portal" },
                      { id: "Resolved", label: "Resolved" },
                    ].map((st) => {
                      const isChecked = selectedStatuses.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          onClick={() => {
                            toggleStatus(st.id);
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
                          <span className="truncate">{st.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Reporter Role */}
                <div>
                  <label className="text-[11px] font-bold text-[#557180] flex items-center gap-1 mb-2">
                    <UserIcon className="h-3.5 w-3.5 text-[#087f80]" />
                    Filed by Role
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "User", label: "Client User" },
                      { id: "Interpreter", label: "Interpreter" },
                    ].map((role) => {
                      const isChecked = selectedReporterRoles.includes(role.id);
                      return (
                        <label
                          key={role.id}
                          onClick={() => {
                            toggleReporterRole(role.id);
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
                          <span className="truncate">{role.label}</span>
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

      {/* Reports List Container */}
      <div className="min-h-[480px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-3">
        {paginatedReports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {reports.length === 0
              ? "No incident reports found."
              : "No incident reports matching your search or filter criteria."}
          </div>
        ) : (
          paginatedReports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-[#dbe6ec] p-4 transition-colors hover:border-[#087f80] bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1ef] text-[#d93829] mt-0.5">
                    <ShieldExclamationIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-[#143242]">
                        Incident #{report.id}
                      </h3>
                      <span className="text-xs text-[#6b8491]">
                        Booking Ref:{" "}
                        <strong className="text-[#087f80]">
                          {report.bookingId}
                        </strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6b8491] mt-0.5">
                      Reported by:{" "}
                      <strong className="text-[#102938]">
                        {report.reporterName}
                      </strong>{" "}
                      ({report.reporterRole}) · Against:{" "}
                      <strong className="text-[#c0392b]">
                        {report.reportedUserName}
                      </strong>{" "}
                      ({report.reportedUserRole}) · {report.createdAt}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                    report.status === "Resolved"
                      ? "bg-[#e8f5f1] text-[#087557]"
                      : report.status === "Escalated to Admin"
                      ? "bg-[#eef2f6] text-[#2c4755]"
                      : "bg-[#fef4e8] text-[#b36916]"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="mt-3 rounded-lg border border-[#e4ecf0] bg-[#f8fbfc] p-3 text-xs leading-relaxed text-[#355261]">
                <p className="font-bold text-[#143141]">Reported Issue:</p>
                <p className="mt-0.5">{report.reason}</p>
              </div>

              {report.actionTaken && (
                <div className="mt-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-xs text-[#334155]">
                  <strong className="font-bold text-[#0f172a]">
                    Action Status:
                  </strong>{" "}
                  {report.actionTaken}
                </div>
              )}

              {/* Action buttons */}
              {report.status === "Pending Investigation" && (
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#edf2f5] pt-3">
                  <button
                    type="button"
                    onClick={() => onEscalate(report.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#092f45] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#12425e] cursor-pointer"
                  >
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-[#f59e0b]" />
                    Escalate to Admin Portal (Lock Account FR-78)
                    Escalate to Admin Portal
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {filteredReports.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 select-none">
          <div>
            Showing{" "}
            <strong className="text-[#092f45]">
              {(validCurrentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-[#092f45]">
              {Math.min(validCurrentPage * pageSize, filteredReports.length)}
            </strong>{" "}
            of <strong className="text-[#092f45]">{filteredReports.length}</strong> incident reports
            {filteredReports.length !== reports.length && (
              <span className="text-[#647f8d] ml-1">
                (filtered from {reports.length})
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
    </div>
  );
}
