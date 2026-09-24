"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  CheckIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentMagnifyingGlassIcon,
  LanguageIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { IncidentReport, IncidentSeverity } from "../types";
import { parseManagerTimestamp } from "../utils";
import { EscalateReportModal } from "./escalate-report-modal";
import { ResolveReportModal } from "./resolve-report-modal";

interface IncidentReportsViewProps {
  reports: IncidentReport[];
  onEscalate: (
    reportId: string,
    severity: IncidentSeverity,
    assessmentNote: string,
  ) => void;
  onResolve: (reportId: string, resolutionNote: string) => void;
}

const severityBadgeConfig: Record<
  IncidentSeverity,
  { bg: string; text: string; border: string; label: string }
> = {
  critical: {
    bg: "bg-[#fee2e2]",
    text: "text-[#b91c1c]",
    border: "border-[#f87171]",
    label: "Critical",
  },
  high: {
    bg: "bg-[#ffedd5]",
    text: "text-[#c2410c]",
    border: "border-[#fb923c]",
    label: "High",
  },
  medium: {
    bg: "bg-[#fef9c3]",
    text: "text-[#854d0e]",
    border: "border-[#facc15]",
    label: "Medium",
  },
};

const severityFilterOptions: Array<{ id: IncidentSeverity; label: string }> = [
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical" },
];

const statusOptions = [
  { id: "Pending Investigation", label: "Pending" },
  { id: "Escalated to Admin", label: "Escalated" },
  { id: "Resolved", label: "Resolved" },
] as const;

export function IncidentReportsView({
  reports,
  onEscalate,
  onResolve,
}: IncidentReportsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedReporterRoles, setSelectedReporterRoles] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<IncidentSeverity[]>([]);
  const [currentTime] = useState(() => Date.now());
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [escalatingReport, setEscalatingReport] = useState<IncidentReport | null>(null);
  const [resolvingReport, setResolvingReport] = useState<IncidentReport | null>(null);
  const [expandedOriginalMap, setExpandedOriginalMap] = useState<Record<string, boolean>>({});
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOriginal = (id: string) => {
    setExpandedOriginalMap((current) => ({ ...current, [id]: !current[id] }));
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
    setCurrentPage(1);
  };

  const toggleReporterRole = (role: string) => {
    setSelectedReporterRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
    setCurrentPage(1);
  };

  const toggleSeverity = (severity: IncidentSeverity) => {
    setSelectedSeverities((current) =>
      current.includes(severity)
        ? current.filter((item) => item !== severity)
        : [...current, severity],
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedReporterRoles([]);
    setSelectedSeverities([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const activeFilterCount =
    selectedStatuses.length + selectedReporterRoles.length + selectedSeverities.length;

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = reports.filter((report) => {
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

      if (selectedStatuses.length > 0 && !selectedStatuses.includes(report.status)) {
        return false;
      }

      if (
        selectedReporterRoles.length > 0 &&
        !selectedReporterRoles.includes(report.reporterRole)
      ) {
        return false;
      }

      if (
        selectedSeverities.length > 0 &&
        (!report.severity || !selectedSeverities.includes(report.severity))
      ) {
        return false;
      }

      return true;
    });

    return filtered.sort(
      (left, right) =>
        parseManagerTimestamp(right.createdAt, currentTime) -
        parseManagerTimestamp(left.createdAt, currentTime),
    );
  }, [reports, searchQuery, selectedReporterRoles, selectedSeverities, selectedStatuses, currentTime]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReports = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, validCurrentPage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <label htmlFor="system-report-search" className="sr-only">
            Search system reports
          </label>
          <input
            id="system-report-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search report ID, reporter, booking or system issue..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:outline-none focus:ring-1 focus:ring-[#087f80]"
          />
          <DocumentMagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400"
          />
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

        <div className="relative shrink-0" ref={filterMenuRef}>
          <button
            type="button"
            onClick={() => setFilterMenuOpen((open) => !open)}
            aria-expanded={filterMenuOpen}
            aria-haspopup="dialog"
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors sm:rounded-lg ${
              activeFilterCount > 0
                ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <AdjustmentsHorizontalIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#087f80] px-1 text-[9px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
            <ChevronDownIcon
              aria-hidden="true"
              className={`h-3 w-3 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {filterMenuOpen && (
            <div
              role="dialog"
              aria-label="Filter system reports"
              className="fixed inset-x-4 top-28 z-50 max-h-[80vh] space-y-4 overflow-y-auto rounded-2xl border border-[#d3dfe3] bg-white p-4 shadow-[0_16px_40px_rgba(9,47,69,0.18)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
            >
              <div className="flex items-center justify-between border-b border-[#edf2f5] pb-2.5">
                <span className="flex items-center gap-1.5 text-xs font-black text-[#112d3f]">
                  <AdjustmentsHorizontalIcon aria-hidden="true" className="h-4 w-4 text-[#087f80]" />
                  Filter system reports
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[11px] font-bold text-[#f04f3e] hover:underline"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1 text-[11px] font-bold text-[#557180]">
                  <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#087f80]" />
                  Resolution status
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  {statusOptions.map((option) => {
                    const selected = selectedStatuses.includes(option.id);
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => toggleStatus(option.id)}
                        aria-pressed={selected}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold ${
                          selected
                            ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                            : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                        }`}
                      >
                        <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${selected ? "border-[#087f80] bg-[#087f80] text-white" : "border-[#b8cbd2] bg-white"}`}>
                          {selected && <CheckIcon aria-hidden="true" className="h-2.5 w-2.5 stroke-[3]" />}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1 text-[11px] font-bold text-[#557180]">
                  <UserIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#087f80]" />
                  Reporter role
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["User", "Interpreter"] as const).map((role) => {
                    const selected = selectedReporterRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleReporterRole(role)}
                        aria-pressed={selected}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold ${
                          selected
                            ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                            : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                        }`}
                      >
                        <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${selected ? "border-[#087f80] bg-[#087f80] text-white" : "border-[#b8cbd2] bg-white"}`}>
                          {selected && <CheckIcon aria-hidden="true" className="h-2.5 w-2.5 stroke-[3]" />}
                        </span>
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1 text-[11px] font-bold text-[#557180]">
                  <ShieldExclamationIcon aria-hidden="true" className="h-3.5 w-3.5 text-[#087f80]" />
                  Severity
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {severityFilterOptions.map((option) => {
                    const selected = selectedSeverities.includes(option.id);
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => toggleSeverity(option.id)}
                        aria-pressed={selected}
                        className={`flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                          selected
                            ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                            : "border-[#e0eaee] bg-[#f9fbfb] text-[#244253] hover:bg-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#edf2f5] pt-3 text-[11px] text-[#698492]">
                <span>
                  Found <strong className="text-[#102938]">{filteredReports.length}</strong> report(s)
                </span>
                <button
                  type="button"
                  onClick={() => setFilterMenuOpen(false)}
                  className="rounded-lg bg-[#087f80] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#066a6a]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-y border-slate-200">
        <div className="divide-y divide-slate-100">
          {paginatedReports.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <DocumentMagnifyingGlassIcon aria-hidden="true" className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm font-semibold">No system reports found</p>
              <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
            </div>
          ) : (
            paginatedReports.map((report) => {
              const systemArea = report.category || report.systemArea || "Platform";
              return (
                <article key={report.id} className="px-2 py-4 transition-colors hover:bg-slate-50/70 sm:px-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600">
                        <ShieldExclamationIcon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[#092f45]">Report #{report.id}</h3>
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            System report
                          </span>
                          {report.bookingId && (
                            <span className="font-mono text-xs text-slate-500">
                              Booking: <strong className="text-[#087f80]">{report.bookingId}</strong>
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Reported by <strong className="text-slate-700">{report.reporterName}</strong>{" "}
                          ({report.reporterRole}) · {report.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {systemArea}
                      </span>
                      {report.severity ? (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${severityBadgeConfig[report.severity].bg} ${severityBadgeConfig[report.severity].text} ${severityBadgeConfig[report.severity].border}`}>
                          {severityBadgeConfig[report.severity].label}
                        </span>
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          Unassessed
                        </span>
                      )}
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${report.status === "Resolved" ? "border-emerald-200 bg-emerald-50 text-[#087557]" : report.status === "Escalated to Admin" ? "border-slate-200 bg-slate-100 text-slate-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-700">
                    <p className="font-bold text-[#092f45]">System issue</p>
                    <p className="mt-0.5">{report.reason}</p>
                    {report.originalReason && report.originalLanguage && (
                      <div className="mt-2 border-t border-slate-200/60 pt-2">
                        <button
                          type="button"
                          onClick={() => toggleOriginal(report.id)}
                          aria-expanded={Boolean(expandedOriginalMap[report.id])}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#087f80] hover:underline"
                        >
                          <LanguageIcon aria-hidden="true" className="h-3.5 w-3.5" />
                          {expandedOriginalMap[report.id] ? "Hide original text" : `View original (${report.originalLanguage})`}
                        </button>
                        {expandedOriginalMap[report.id] && (
                          <p className="mt-1 rounded-lg border border-slate-200/80 bg-white p-2 text-[11px] italic text-slate-600">
                            {report.originalReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {report.actionTaken && (
                    <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-xs text-slate-600">
                      <strong className="font-bold text-slate-800">Action status:</strong>{" "}
                      {report.actionTaken}
                    </div>
                  )}

                  {report.status === "Pending Investigation" && (
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setResolvingReport(report)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#087557] transition-colors hover:bg-emerald-100"
                      >
                        <CheckCircleIcon aria-hidden="true" className="h-3.5 w-3.5" />
                        Resolve system issue
                      </button>
                      <button
                        type="button"
                        onClick={() => setEscalatingReport(report)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#092f45] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#12425e]"
                      >
                        <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-amber-400" />
                        Escalate to Admin
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {filteredReports.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:flex-row">
            <div>
              Showing <strong className="text-[#092f45]">{(validCurrentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-[#092f45]">{Math.min(validCurrentPage * pageSize, filteredReports.length)}</strong> of{" "}
              <strong className="text-[#092f45]">{filteredReports.length}</strong> report(s)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="min-w-14 text-center text-xs font-bold text-slate-600">
                {validCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#092f45] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <EscalateReportModal
        report={escalatingReport}
        isOpen={Boolean(escalatingReport)}
        onClose={() => setEscalatingReport(null)}
        onConfirm={onEscalate}
      />
      <ResolveReportModal
        report={resolvingReport}
        isOpen={Boolean(resolvingReport)}
        onClose={() => setResolvingReport(null)}
        onConfirm={onResolve}
      />
    </div>
  );
}
