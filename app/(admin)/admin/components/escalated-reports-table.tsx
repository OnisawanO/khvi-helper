"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LanguageIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AdminIncidentReport, AdminUserRecord } from "../types";
import { ReportStatusFilter } from "./reports-kpi-cards";
import { TablePagination } from "./table-pagination";

interface EscalatedReportsTableProps {
  reports: AdminIncidentReport[];
  users: AdminUserRecord[];
  onTakeAction: (targetUser: AdminUserRecord, reportId: string) => void;
  onOpenUserDetail: (user: AdminUserRecord) => void;
  onUnlockUser: (userId: string, reportId?: string) => void;
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
  users,
  onTakeAction,
  onOpenUserDetail,
  onUnlockUser,
  selectedStatusFilter = "All",
  onSelectStatusFilter,
}: EscalatedReportsTableProps) {
  const [filterSeverity, setFilterSeverity] = useState<"All" | "critical" | "high" | "medium">("All");
  const [selectedReportDetail, setSelectedReportDetail] = useState<AdminIncidentReport | null>(null);

  // Search & Detailed Filter Popover State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedReporterRoles, setSelectedReporterRoles] = useState<string[]>([]);
  const [localStatusFilter, setLocalStatusFilter] = useState<ReportStatusFilter>(selectedStatusFilter);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Sync status filter state
  const activeStatusFilter = onSelectStatusFilter ? selectedStatusFilter : localStatusFilter;
  const handleStatusChange = (status: ReportStatusFilter) => {
    setLocalStatusFilter(status);
    if (onSelectStatusFilter) {
      onSelectStatusFilter(status);
    }
  };

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Close filter popover on outside click
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
  }, [filterMenuOpen]);

  // Track toggled expanded view for original language per report
  const [expandedOriginalMap, setExpandedOriginalMap] = useState<Record<string, boolean>>({});

  const toggleOriginal = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOriginalMap((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  // Safety confirmation dialog state for Unlock
  const [unlockConfirmTarget, setUnlockConfirmTarget] = useState<{
    user: AdminUserRecord;
    reportId?: string;
  } | null>(null);

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reports
      .filter((r) => {
        if (filterSeverity !== "All" && r.severity !== filterSeverity) return false;

        if (activeStatusFilter === "Pending" && r.status !== "Escalated to Admin") return false;
        if (activeStatusFilter === "Locked" && r.status !== "Resolved (Locked)") return false;
        if (activeStatusFilter === "Hard Banned" && r.status !== "Resolved (Hard Banned)") return false;
        if (activeStatusFilter === "Dismissed" && r.status !== "Dismissed") return false;

        if (selectedRoles.length > 0 && !selectedRoles.includes(r.reportedUserRole)) return false;
        if (selectedReporterRoles.length > 0 && !selectedReporterRoles.includes(r.reporterRole)) return false;

        if (q) {
          const matchId = r.id.toLowerCase().includes(q);
          const matchTarget = r.reportedUserName.toLowerCase().includes(q) || r.reportedUserId.toLowerCase().includes(q);
          const matchReporter = r.reporterName.toLowerCase().includes(q);
          const matchBooking = r.bookingId.toLowerCase().includes(q);
          const matchReason = r.reason.toLowerCase().includes(q) || (r.originalReason?.toLowerCase().includes(q) ?? false);
          if (!matchId && !matchTarget && !matchReporter && !matchBooking && !matchReason) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const diff = severityWeight[a.severity] - severityWeight[b.severity];
        if (diff !== 0) return diff;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [reports, filterSeverity, activeStatusFilter, selectedRoles, selectedReporterRoles, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedReports = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, validCurrentPage, pageSize]);

  const activeFiltersCount =
    (filterSeverity !== "All" ? 1 : 0) +
    (activeStatusFilter !== "All" ? 1 : 0) +
    selectedRoles.length +
    selectedReporterRoles.length;
  const pendingReportsCount = reports.filter((r) => r.status === "Escalated to Admin").length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Overview Banner & Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-red-200 bg-red-50/40 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <ShieldExclamationIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-[#092f45]">
                Escalated Incident Reports
              </h2>
              {pendingReportsCount > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white animate-pulse">
                  {pendingReportsCount} Pending Action
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Critical platform misconduct cases escalated by Field Managers requiring Hard Ban or Security Lock decisions.
            </p>
          </div>
        </div>

        {/* Severity Filter Pills: Sorted from low to high */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white/80 p-1 rounded-xl border border-slate-200">
          {(["All", "medium", "high", "critical"] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterSeverity === sev
                  ? "bg-[#092f45] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {sev === "All"
                ? "All Severities"
                : sev === "medium"
                ? "Medium"
                : sev === "high"
                ? "High"
                : "Critical"}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Advanced Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases by ID, user, volunteer, booking or incident reason..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#087f80]"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls: Quick Status Select + Popover */}
        <div className="flex items-center gap-2">
          {/* Quick Status Filter on Toolbar */}
          <div className="flex items-center gap-1.5">
            <select
              value={activeStatusFilter}
              onChange={(e) => handleStatusChange(e.target.value as ReportStatusFilter)}
              className="rounded-xl sm:rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#087f80] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Action Only</option>
              <option value="Locked">Resolved (Locked)</option>
              <option value="Hard Banned">Resolved (Hard Banned)</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>

          {/* Filter Popover Button */}
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

            {/* Filter Popover Dropdown */}
            {filterMenuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-[#092f45] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    Incident Filters
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoles([]);
                        setSelectedReporterRoles([]);
                        handleStatusChange("All");
                        setFilterSeverity("All");
                      }}
                      className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Reset All ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Section 1: Target (Reported) Role */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Target Role (ผู้ถูกร้องเรียน)
                    </label>
                    {selectedRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedRoles([])}
                        className="text-[10px] font-bold text-[#087f80] hover:underline cursor-pointer"
                      >
                        Reset ({selectedRoles.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["User", "Interpreter"] as const).map((role) => {
                      const isChecked = selectedRoles.includes(role);
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() =>
                            setSelectedRoles((prev) =>
                              prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
                            )
                          }
                          className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                          }`}
                        >
                          <span>{role}</span>
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Reporter Role */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Reporter Role (ผู้แจ้งเรื่อง)
                    </label>
                    {selectedReporterRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedReporterRoles([])}
                        className="text-[10px] font-bold text-[#087f80] hover:underline cursor-pointer"
                      >
                        Reset ({selectedReporterRoles.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["User", "Interpreter"] as const).map((role) => {
                      const isChecked = selectedReporterRoles.includes(role);
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() =>
                            setSelectedReporterRoles((prev) =>
                              prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
                            )
                          }
                          className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                          }`}
                        >
                          <span>{role}</span>
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
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

      {/* Reports Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-5 pr-3">Case ID / Date</th>
                <th className="px-3.5 py-3.5">Reported Target</th>
                <th className="px-3.5 py-3.5">Reporter</th>
                <th className="px-3.5 py-3.5 text-center">Severity</th>
                <th className="px-3.5 py-3.5">Misconduct Description (Translated)</th>
                <th className="px-3.5 py-3.5 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircleIcon className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                    No incident reports match your current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => {
                  const targetUserObj: AdminUserRecord = users.find((u) => u.id === report.reportedUserId)
                    || users.find((u) => u.name.toLowerCase() === report.reportedUserName.toLowerCase())
                    || {
                        id: report.reportedUserId || `USR-${report.id}`,
                        name: report.reportedUserName,
                        email: `${report.reportedUserName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`,
                        phone: "081-000-0000",
                        primaryLanguage: report.originalLanguage || "English",
                        spokenLanguages: [report.originalLanguage || "English"],
                        role: report.reportedUserRole,
                        isLocked: report.status.includes("Locked") || report.status.includes("Hard Banned"),
                        accountStatus: report.status.includes("Hard Banned")
                          ? "Banned"
                          : report.status.includes("Locked")
                          ? "Locked"
                          : "Active",
                        registeredAt: report.createdAt,
                        lastActive: "Recent",
                        interpreterStats:
                          report.reportedUserRole === "Interpreter"
                            ? {
                                verificationStatus: "Approved",
                                completedMissions: 15,
                                rating: 4.2,
                                specialties: ["General Help"],
                                responseTimeAvg: "3.5 mins",
                                feedbackHighlights: ["Under administrative review for reported incident."],
                              }
                            : undefined,
                      };
                  const isTargetLocked = targetUserObj.isLocked ?? false;
                  const isTargetBanned = targetUserObj.accountStatus === "Banned";
                  const isResolved =
                    report.status === "Resolved (Hard Banned)" ||
                    report.status === "Resolved (Locked)" ||
                    report.status === "Dismissed";
                  const isOriginalExpanded = expandedOriginalMap[report.id] ?? false;

                  const reporterUserObj = users.find((u) => u.name.toLowerCase() === report.reporterName.toLowerCase());

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* ID & Date */}
                      <td className="py-3.5 pl-5 pr-3 whitespace-nowrap font-sans">
                        <div className="font-mono font-bold text-[#092f45]">{report.id}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {report.createdAt}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {report.bookingId}
                        </span>
                      </td>

                      {/* Reported User / Interpreter */}
                      <td className="px-3.5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#092f45] text-[11px] font-bold">
                            {report.reportedUserName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (targetUserObj) {
                                    onOpenUserDetail(targetUserObj);
                                  }
                                }}
                                className="font-bold text-[#092f45] hover:text-[#087f80] hover:underline cursor-pointer text-left"
                                title="View User Security Profile"
                              >
                                {report.reportedUserName}
                              </button>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                  report.reportedUserRole === "Interpreter"
                                    ? "bg-teal-50 text-[#087f80] border border-teal-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {report.reportedUserRole}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {report.reportedUserId || "N/A"} • Booking: {report.bookingId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reporter */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-700">
                          {report.reporterName}
                        </div>
                        {reporterUserObj ? (
                          <button
                            type="button"
                            onClick={() => onOpenUserDetail(reporterUserObj)}
                            className="font-bold text-slate-700 hover:text-[#087f80] hover:underline cursor-pointer text-left block"
                            title="View Reporter User Profile"
                          >
                            {report.reporterName}
                          </button>
                        ) : (
                          <div className="font-bold text-slate-700">
                            {report.reporterName}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          {report.reporterRole}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                            report.severity === "critical"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : report.severity === "high"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {report.severity === "critical" ? (
                            <ExclamationCircleIcon className="h-3 w-3 text-red-600" />
                          ) : (
                            <ExclamationTriangleIcon className="h-3 w-3 text-amber-600" />
                          )}
                          {report.severity}
                        </span>
                      </td>

                      {/* Multilingual Reason & Collapsible Original Text */}
                      <td className="px-3.5 py-3.5 max-w-sm">
                        {/* Reporter & Language Pill */}
                        {report.originalReason && report.originalLanguage && (
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200/60">
                              <LanguageIcon className="h-2.5 w-2.5 text-slate-500" />
                              Translated from {report.originalLanguage}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => toggleOriginal(report.id, e)}
                              className="text-[10px] font-bold text-[#087f80] hover:underline cursor-pointer"
                            >
                              {isOriginalExpanded ? "Hide original text" : "View original language"}
                            </button>
                          </div>
                        )}

                        {/* English Translated Reason */}
                        <p className="text-xs text-slate-800 font-medium leading-relaxed" title={report.reason}>
                          {report.reason}
                        </p>

                        {/* Collapsible Original Text */}
                        {isOriginalExpanded && report.originalReason && (
                          <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600 italic">
                            <span className="font-bold not-italic text-slate-700">Original ({report.originalLanguage}):</span> &ldquo;{report.originalReason}&rdquo;
                          </div>
                        )}

                        {report.actionTaken && (
                          <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">
                            Resolution Note: {report.actionTaken}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            report.status === "Escalated to Admin"
                              ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                              : report.status === "Resolved (Hard Banned)"
                              ? "bg-slate-900 text-red-300 border border-slate-700"
                              : report.status === "Resolved (Locked)"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1. If user is currently soft-locked, offer Unlock button with safety confirmation */}
                          {isTargetLocked && !isTargetBanned && (
                            <button
                              type="button"
                              onClick={() => {
                                if (targetUserObj) {
                                  setUnlockConfirmTarget({ user: targetUserObj, reportId: report.id });
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                              title="Unlock account with verification"
                            >
                              <LockOpenIcon className="h-3.5 w-3.5 text-emerald-600" />
                              Unlock Account
                            </button>
                          )}

                          {/* 2. Take Action button (Lock / Hard Ban safety dialog) */}
                          {!isResolved ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (targetUserObj) {
                                  onTakeAction(targetUserObj, report.id);
                                } else {
                                  alert("Target user not found in the current system database.");
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
                              title="Open Safety Enforcement Dialog (Soft Lock or Hard Ban)"
                            >
                              <NoSymbolIcon className="h-3.5 w-3.5" />
                              Take Action
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedReportDetail(report)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                              View History
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <TablePagination
          totalItems={filteredReports.length}
          currentPage={validCurrentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="incident reports"
        />
      </div>

      {/* Safety Confirmation Dialog for Unlocking User Account */}
      {unlockConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#092f45]">
                    Confirm Account Unlock
                  </h3>
                  <p className="text-xs text-slate-500">Security Unlock Confirmation & Audit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUnlockConfirmTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="px-6 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#092f45] text-xs font-black text-white">
                  {unlockConfirmTarget.user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#092f45]">{unlockConfirmTarget.user.name}</p>
                  <p className="text-[11px] text-slate-500">{unlockConfirmTarget.user.email} • {unlockConfirmTarget.user.role}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to <strong>lift the temporary suspension (Soft-Lock)</strong> for this user? Once confirmed, their platform privileges will be restored immediately and recorded in the immutable Audit Trail.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setUnlockConfirmTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUnlockUser(unlockConfirmTarget.user.id, unlockConfirmTarget.reportId);
                  setUnlockConfirmTarget(null);
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white shadow-xs cursor-pointer transition-colors"
              >
                Confirm Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Resolution Detail Modal */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#092f45]">
                Case History & Details • {selectedReportDetail.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReportDetail(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Reported User:</strong> {selectedReportDetail.reportedUserName} ({selectedReportDetail.reportedUserId})</p>
              <p><strong>Escalated by:</strong> {selectedReportDetail.reporterName} ({selectedReportDetail.reporterRole})</p>
              <p><strong>Reason (English):</strong> {selectedReportDetail.reason}</p>
              {selectedReportDetail.originalReason && (
                <p><strong>Original Reason ({selectedReportDetail.originalLanguage}):</strong> {selectedReportDetail.originalReason}</p>
              )}
              <p><strong>Enforcement Status:</strong> {selectedReportDetail.status}</p>
              <p><strong>Action Log Note:</strong> {selectedReportDetail.actionTaken || "-"}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportDetail(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
