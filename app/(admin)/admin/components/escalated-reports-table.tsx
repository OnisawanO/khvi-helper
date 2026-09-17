"use client";

import { useState } from "react";
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  EyeIcon,
  LockOpenIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { AdminIncidentReport, AdminUserRecord } from "../types";
import { ReportStatusFilter } from "./reports-kpi-cards";

interface EscalatedReportsTableProps {
  reports: AdminIncidentReport[];
  users: AdminUserRecord[];
  onTakeAction: (targetUser: AdminUserRecord, reportId: string) => void;
  onOpenUserDetail: (user: AdminUserRecord) => void;
  onUnlockUser: (userId: string, reportId?: string) => void;
  selectedStatusFilter?: ReportStatusFilter;
  onSelectStatusFilter?: (status: ReportStatusFilter) => void;
}

export function EscalatedReportsTable({
  reports,
  users,
  onTakeAction,
  onOpenUserDetail,
  onUnlockUser,
  selectedStatusFilter = "All",
}: EscalatedReportsTableProps) {
  const [filterSeverity, setFilterSeverity] = useState<"All" | "critical" | "high" | "medium">("All");
  const [selectedReportDetail, setSelectedReportDetail] = useState<AdminIncidentReport | null>(null);

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

  const severityWeight: Record<AdminIncidentReport["severity"], number> = {
    medium: 1,
    high: 2,
    critical: 3,
  };

  const filteredReports = reports
    .filter((r) => {
      if (filterSeverity !== "All" && r.severity !== filterSeverity) return false;

      if (selectedStatusFilter === "Pending" && r.status !== "Escalated to Admin") return false;
      if (selectedStatusFilter === "Locked" && r.status !== "Resolved (Locked)") return false;
      if (selectedStatusFilter === "Hard Banned" && r.status !== "Resolved (Hard Banned)") return false;
      if (selectedStatusFilter === "Dismissed" && r.status !== "Dismissed") return false;

      return true;
    })
    .sort((a, b) => {
      // Sort from lowest severity to highest severity (medium -> high -> critical)
      const diff = severityWeight[a.severity] - severityWeight[b.severity];
      if (diff !== 0) return diff;
      return b.createdAt.localeCompare(a.createdAt);
    });

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
                <th className="px-3.5 py-3.5">Incident Reason & Auto-Translation</th>
                <th className="px-3.5 py-3.5 text-center">Case Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Enforcement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircleIcon className="mx-auto h-8 w-8 text-emerald-500 mb-1" />
                    <p className="font-bold text-[#092f45]">No incident reports matching current criteria</p>
                    <p className="text-[11px] text-slate-500">All community safety cases are resolved and healthy.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const targetUserObj = users.find((u) => u.id === report.reportedUserId);
                  const isResolved = report.status !== "Escalated to Admin";
                  const isTargetLocked = targetUserObj?.isLocked ?? false;
                  const isTargetBanned = targetUserObj?.accountStatus === "Banned" || targetUserObj?.lockReason?.includes("[PERMANENT BAN]");
                  const isOriginalExpanded = !!expandedOriginalMap[report.id];

                  return (
                    <tr
                      key={report.id}
                      onClick={(e) => {
                        // Prevent row click if an interactive element inside was clicked
                        if ((e.target as HTMLElement).closest("button")) return;
                        if (targetUserObj) {
                          onOpenUserDetail(targetUserObj);
                        } else {
                          alert("Target user not found in the current system database.");
                        }
                      }}
                      className={`cursor-pointer transition-colors hover:bg-teal-50/40 ${
                        isTargetLocked ? "bg-red-50/20 hover:bg-red-50/35" : "hover:bg-slate-50/80"
                      }`}
                      title="Click anywhere to inspect target user profile & governance controls"
                    >
                      {/* ID & Date */}
                      <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                        <span className="font-black text-[#092f45]">{report.id}</span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {report.createdAt}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {report.bookingId}
                        </span>
                      </td>

                      {/* Reported User */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-extrabold text-[#092f45]">
                          <span>{report.reportedUserName}</span>
                          <UserCircleIcon className="h-3.5 w-3.5 opacity-60 text-slate-400" />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {report.reportedUserId} • {report.reportedUserRole}
                        </div>
                      </td>

                      {/* Reporter */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-700">
                          {report.reporterName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {report.reporterRole}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black ${
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
                          {report.severity.toUpperCase()}
                        </span>
                      </td>

                      {/* Reason with Auto-Translation and Original Toggle */}
                      <td className="px-3.5 py-3.5 max-w-xs sm:max-w-md">
                        {/* Auto-translate header badge if original language exists */}
                        {report.originalLanguage && report.originalLanguage !== "English" && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/80">
                              <LanguageIcon className="h-3 w-3 text-blue-600" />
                              Auto-translated from {report.originalLanguage}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => toggleOriginal(report.id, e)}
                              className="text-[10px] font-bold text-[#087f80] hover:underline cursor-pointer"
                            >
                              {isOriginalExpanded ? "Hide Original" : "View Original"}
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

                      {/* Action buttons */}
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
