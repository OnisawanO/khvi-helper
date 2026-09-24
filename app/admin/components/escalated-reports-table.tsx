"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LanguageIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { AdminIncidentReport } from "../types";
import { ReportStatusFilter } from "./reports-kpi-cards";
import { TablePagination } from "./table-pagination";
import { SystemReportResolutionDialog } from "./system-report-resolution-dialog";

interface EscalatedReportsTableProps {
  reports: AdminIncidentReport[];
  onResolveSystemReport: (reportId: string, note: string) => void;
  selectedStatusFilter?: ReportStatusFilter;
  onSelectStatusFilter?: (status: ReportStatusFilter) => void;
}

const severityWeight: Record<AdminIncidentReport["severity"], number> = {
  medium: 1,
  high: 2,
  critical: 3,
};

export function EscalatedReportsTable({
  reports,
  onResolveSystemReport,
  selectedStatusFilter = "All",
  onSelectStatusFilter,
}: EscalatedReportsTableProps) {
  const [filterSeverity, setFilterSeverity] = useState<"All" | "critical" | "high" | "medium">("All");
  const [selectedReporterRoles, setSelectedReporterRoles] = useState<string[]>([]);
  const [localStatusFilter, setLocalStatusFilter] = useState<ReportStatusFilter>(selectedStatusFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOriginalMap, setExpandedOriginalMap] = useState<Record<string, boolean>>({});
  const [selectedReportDetail, setSelectedReportDetail] = useState<AdminIncidentReport | null>(null);
  const [systemReportToResolve, setSystemReportToResolve] = useState<AdminIncidentReport | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  const activeStatusFilter = onSelectStatusFilter ? selectedStatusFilter : localStatusFilter;
  const handleStatusChange = (status: ReportStatusFilter) => {
    setLocalStatusFilter(status);
    onSelectStatusFilter?.(status);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!filterMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!filterMenuRef.current?.contains(event.target as Node)) setFilterMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterMenuOpen]);

  const toggleOriginal = (reportId: string) => {
    setExpandedOriginalMap((current) => ({ ...current, [reportId]: !current[reportId] }));
  };

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return reports
      .filter((report) => {
        if (filterSeverity !== "All" && report.severity !== filterSeverity) return false;
        if (activeStatusFilter === "Pending" && report.status !== "Escalated to Admin") return false;
        if (activeStatusFilter === "Resolved" && report.status !== "Resolved") return false;
        if (activeStatusFilter === "Dismissed" && report.status !== "Dismissed") return false;
        if (selectedReporterRoles.length > 0 && !selectedReporterRoles.includes(report.reporterRole)) return false;

        if (query) {
          const searchableText = [
            report.id,
            report.reporterName,
            report.reporterRole,
            report.bookingId,
            report.category,
            report.systemArea,
            report.reason,
            report.originalReason,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!searchableText.includes(query)) return false;
        }

        return true;
      })
      .sort((left, right) => {
        const severityDifference = severityWeight[right.severity] - severityWeight[left.severity];
        return severityDifference || right.createdAt.localeCompare(left.createdAt);
      });
  }, [activeStatusFilter, filterSeverity, reports, searchQuery, selectedReporterRoles]);

  const activeFiltersCount =
    (filterSeverity !== "All" ? 1 : 0) +
    (activeStatusFilter !== "All" ? 1 : 0) +
    selectedReporterRoles.length;
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedReports = filteredReports.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize,
  );

  const resetFilters = () => {
    setFilterSeverity("All");
    setSelectedReporterRoles([]);
    handleStatusChange("All");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <label htmlFor="admin-system-report-search" className="sr-only">
            Search system reports
          </label>
          <input
            id="admin-system-report-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search report ID, system area, booking or issue..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:outline-none focus:ring-1 focus:ring-[#087f80]"
          />
          <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              aria-label="Clear search"
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50/70 p-0.5">
            {(["All", "medium", "high", "critical"] as const).map((severity) => (
              <button
                key={severity}
                type="button"
                onClick={() => {
                  setFilterSeverity(severity);
                  setCurrentPage(1);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${filterSeverity === severity ? "border border-slate-200/80 bg-white text-[#092f45] shadow-xs" : "text-slate-600 hover:bg-white/50 hover:text-slate-900"}`}
              >
                {severity === "All" ? "All" : severity[0].toUpperCase() + severity.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={activeStatusFilter}
            onChange={(event) => handleStatusChange(event.target.value as ReportStatusFilter)}
            aria-label="Filter report status"
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none sm:rounded-lg"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending action only</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>

          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen((open) => !open)}
              aria-expanded={filterMenuOpen}
              aria-haspopup="dialog"
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors sm:rounded-lg ${activeFiltersCount > 0 ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <AdjustmentsHorizontalIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
              Filter
              {activeFiltersCount > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087f80] px-1 text-[9px] font-black text-white">{activeFiltersCount}</span>}
              <ChevronDownIcon aria-hidden="true" className={`h-3 w-3 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {filterMenuOpen && (
              <div role="dialog" aria-label="Filter system reports" className="absolute right-0 top-full z-30 mt-2 w-72 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#092f45]">
                    <AdjustmentsHorizontalIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
                    Report filters
                  </span>
                  {activeFiltersCount > 0 && <button type="button" onClick={resetFilters} className="text-[10px] font-bold text-red-600 hover:underline">Clear all ({activeFiltersCount})</button>}
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold text-slate-500">Reporter role</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["User", "Interpreter"] as const).map((role) => {
                      const selected = selectedReporterRoles.includes(role);
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() => {
                            setSelectedReporterRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]);
                            setCurrentPage(1);
                          }}
                          aria-pressed={selected}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold ${selected ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"}`}
                        >
                          <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${selected ? "border-[#087f80] bg-[#087f80] text-white" : "border-slate-300 bg-white"}`}>
                            {selected && <CheckIcon aria-hidden="true" className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <span>Found <strong className="text-[#092f45]">{filteredReports.length}</strong> report(s)</span>
                  <button type="button" onClick={() => setFilterMenuOpen(false)} className="rounded-lg bg-[#087f80] px-3 py-1.5 text-xs font-bold text-white">Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-y border-slate-200">
        <table className="w-full min-w-[980px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 pl-5 pr-3">Case ID / Date</th>
              <th className="px-3.5 py-3.5">System area</th>
              <th className="px-3.5 py-3.5">Reporter</th>
              <th className="px-3.5 py-3.5 text-center">Severity</th>
              <th className="px-3.5 py-3.5">System issue</th>
              <th className="px-3.5 py-3.5 text-center">Status</th>
              <th className="py-3.5 pl-3 pr-5 text-right">Administrative action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <CheckCircleIcon aria-hidden="true" className="mx-auto mb-1 h-8 w-8 text-slate-300" />
                  No system reports match your filters.
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => {
                const isResolved = report.status !== "Escalated to Admin";
                const isOriginalExpanded = expandedOriginalMap[report.id] ?? false;
                const systemArea = report.category || report.systemArea || "Platform";

                return (
                  <tr key={report.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-3">
                      <span className="font-mono font-bold text-[#092f45]">{report.id}</span>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-400">{report.createdAt}</div>
                      {report.bookingId && <span className="mt-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">Booking: {report.bookingId}</span>}
                    </td>
                    <td className="px-3.5 py-3.5 align-top">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-[11px] font-bold text-amber-700">!</span>
                        <div>
                          <div className="font-bold text-[#092f45]">System issue</div>
                          <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">{systemArea}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 align-top">
                      <div className="font-bold text-slate-700">{report.reporterName}</div>
                      <div className="text-[10px] text-slate-400">{report.reporterRole}</div>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 text-center align-top">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${report.severity === "critical" ? "border-red-200 bg-red-100 text-red-700" : report.severity === "high" ? "border-amber-200 bg-amber-100 text-amber-800" : "border-blue-200 bg-blue-100 text-blue-700"}`}>
                        {report.severity === "critical" ? <ExclamationCircleIcon aria-hidden="true" className="h-3 w-3 text-red-600" /> : <ExclamationTriangleIcon aria-hidden="true" className="h-3 w-3 text-amber-600" />}
                        {report.severity}
                      </span>
                    </td>
                    <td className="max-w-sm px-3.5 py-3.5 align-top">
                      {report.originalReason && report.originalLanguage && (
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                            <LanguageIcon aria-hidden="true" className="h-2.5 w-2.5 text-slate-500" />
                            {report.originalLanguage}
                          </span>
                          <button type="button" onClick={() => toggleOriginal(report.id)} className="text-[10px] font-bold text-[#087f80] hover:underline">
                            {isOriginalExpanded ? "Hide original" : "View original"}
                          </button>
                        </div>
                      )}
                      <p className="font-medium leading-relaxed text-slate-800" title={report.reason}>{report.reason}</p>
                      {isOriginalExpanded && report.originalReason && <p className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] italic text-slate-600">{report.originalReason}</p>}
                      {report.actionTaken && <p className="mt-1 line-clamp-1 text-[10px] italic text-slate-500">Resolution note: {report.actionTaken}</p>}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3.5 text-center align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${report.status === "Escalated to Admin" ? "animate-pulse border-red-200 bg-red-50 text-red-600" : report.status === "Dismissed" ? "border-slate-200 bg-slate-100 text-slate-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-3 pr-5 text-right align-top">
                      {isResolved ? (
                        <button type="button" onClick={() => setSelectedReportDetail(report)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                          <EyeIcon aria-hidden="true" className="h-3.5 w-3.5" /> View history
                        </button>
                      ) : (
                        <button type="button" onClick={() => setSystemReportToResolve(report)} className="inline-flex items-center gap-1 rounded-xl bg-[#087f80] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#066768]">
                          <CheckCircleIcon aria-hidden="true" className="h-3.5 w-3.5" /> Resolve system issue
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        totalItems={filteredReports.length}
        currentPage={validCurrentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        itemName="reports"
      />

      <SystemReportResolutionDialog
        report={systemReportToResolve}
        onClose={() => setSystemReportToResolve(null)}
        onConfirm={(reportId, note) => {
          onResolveSystemReport(reportId, note);
          setSystemReportToResolve(null);
        }}
      />

      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{selectedReportDetail.id}</span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">System report</span>
                </div>
                <h3 className="mt-1 text-lg font-extrabold text-[#092f45]">System report history</h3>
                <p className="text-xs text-slate-500">Logged: {selectedReportDetail.createdAt}{selectedReportDetail.bookingId ? ` · Booking: ${selectedReportDetail.bookingId}` : ""}</p>
              </div>
              <button type="button" onClick={() => setSelectedReportDetail(null)} aria-label="Close report history" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">System area</p>
                <p className="mt-1 text-sm font-bold text-[#092f45]">{selectedReportDetail.category || selectedReportDetail.systemArea || "Platform"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reported by</p>
                <p className="mt-1 text-sm font-bold text-[#092f45]">{selectedReportDetail.reporterName}</p>
                <p className="text-xs text-slate-500">{selectedReportDetail.reporterRole}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-800">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">System issue</p>
              {selectedReportDetail.reason}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Resolution note</p>
              <p className="mt-1 text-xs text-slate-700">{selectedReportDetail.actionTaken || "No resolution note recorded."}</p>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setSelectedReportDetail(null)} className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800">
                Close history
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
