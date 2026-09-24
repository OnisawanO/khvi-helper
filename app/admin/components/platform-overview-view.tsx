"use client";

import { useState, useMemo } from "react";
import {
  ArrowPathIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord, AdminIncidentReport, AuditLogEntry } from "../types";

interface PlatformOverviewViewProps {
  users: AdminUserRecord[];
  reports: AdminIncidentReport[];
  auditLogs: AuditLogEntry[];
  onNavigateTab: (tab: "users" | "reports" | "audit" | "policies") => void;
  onRefresh?: () => void;
}

export function PlatformOverviewView({
  users,
  reports,
  auditLogs,
  onNavigateTab,
  onRefresh,
}: PlatformOverviewViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };
  // 1. Role & Account Distribution
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const interpreters = users.filter((u) => u.role === "Interpreter");
    const isInactive = (u: AdminUserRecord) =>
      u.isLocked || u.accountStatus === "Locked" || u.accountStatus === "Banned";
    const activeInterpreters = interpreters.filter(
      (u) => !isInactive(u) && u.interpreterStats?.verificationStatus === "Approved"
    );
    const pendingInterpreters = interpreters.filter(
      (u) =>
        u.interpreterStats?.verificationStatus === "Pending" ||
        u.interpreterStats?.verificationStatus === "Under Review"
    );
    const standardUsers = users.filter((u) => u.role === "User");
    const managers = users.filter((u) => u.role === "Manager");
    const admins = users.filter((u) => u.role === "Admin");
    const lockedOrBanned = users.filter(isInactive);
    const activeStandardUsersCount = standardUsers.filter((u) => !isInactive(u)).length;
    const activeInterpreterAccountsCount = interpreters.filter((u) => !isInactive(u)).length;
    const activeStaffCount = [...managers, ...admins].filter((u) => !isInactive(u)).length;
    const activeAccountsCount = users.filter((u) => !isInactive(u)).length;

    // Reports Breakdown
    const pendingReports = reports.filter((r) => r.status === "Escalated to Admin");
    const criticalReports = pendingReports.filter((r) => r.severity === "critical");
    const highReports = pendingReports.filter((r) => r.severity === "high");
    const resolvedReports = reports.filter((r) => r.status === "Resolved");

    // Language Coverage breakdown from Interpreters
    const languageCounts: Record<string, number> = {};
    activeInterpreters.forEach((interp) => {
      const languages = new Set(
        interp.spokenLanguages?.length
          ? interp.spokenLanguages
          : interp.primaryLanguage
            ? [interp.primaryLanguage]
            : []
      );
      languages.forEach((lang) => {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });
    });

    const sortedLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Incident by original language requested
    const incidentLangCounts: Record<string, number> = {};
    reports.forEach((rep) => {
      const l = rep.originalLanguage || "English";
      incidentLangCounts[l] = (incidentLangCounts[l] || 0) + 1;
    });

    // Governance Actions in Audit Logs
    const enforcementCount = auditLogs.filter(
      (l) => l.action.includes("SUSPEND") || l.action.includes("BAN") || l.action.includes("LOCKED")
    ).length;

    return {
      totalUsers,
      interpretersCount: interpreters.length,
      activeInterpretersCount: activeInterpreters.length,
      pendingInterpretersCount: pendingInterpreters.length,
      activeStandardUsersCount,
      activeInterpreterAccountsCount,
      activeStaffCount,
      activeAccountsCount,
      lockedOrBannedCount: lockedOrBanned.length,
      pendingReportsCount: pendingReports.length,
      criticalReportsCount: criticalReports.length,
      highReportsCount: highReports.length,
      resolvedReportsCount: resolvedReports.length,
      sortedLanguages,
      incidentLangCounts,
      enforcementCount,
    };
  }, [users, reports, auditLogs]);

  // Max value for language bar scale
  const maxLanguageSupply = Math.max(1, ...metrics.sortedLanguages.map(([, count]) => count));

  // Calculations for Donut 1 (Escalated Reports)
  const totalReports = metrics.pendingReportsCount || 1;
  const criticalPct = metrics.criticalReportsCount / totalReports;
  const highPct = metrics.highReportsCount / totalReports;
  const mediumPct = Math.max(0, 1 - criticalPct - highPct);
  const C = 439.82; // 2 * PI * 70
  const strokeCrit = criticalPct * C;
  const strokeHigh = highPct * C;
  const strokeMed = mediumPct * C;
  const offsetCrit = 0;
  const offsetHigh = -strokeCrit;
  const offsetMed = -(strokeCrit + strokeHigh);

  // Calculations for Donut 2 (Platform Account Composition)
  const totalAcc = metrics.activeAccountsCount || 1;
  const standardPct = metrics.activeStandardUsersCount / totalAcc;
  const interpPct = metrics.activeInterpreterAccountsCount / totalAcc;
  const staffPct = metrics.activeStaffCount / totalAcc;
  const strokeUsers = standardPct * C;
  const strokeInterp = interpPct * C;
  const strokeStaff = staffPct * C;
  const offsetUsers = 0;
  const offsetInterp = -strokeUsers;
  const offsetStaff = -(strokeUsers + strokeInterp);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Executive Summary Welcome Header (Clean Pure Minimalist) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#092f45]">
            Platform Overview
          </h2>
        </div>

        {/* Header Action Controls: Alert Status & Quick Refresh Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Refresh Button (Text followed by Icon) */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer disabled:opacity-60"
            title="Refresh platform overview data"
          >
            <span>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </span>
            <ArrowPathIcon
              className={`h-3.5 w-3.5 text-[#087f80] ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* System Alert Status */}
          <button
            type="button"
            onClick={() => onNavigateTab("reports")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              metrics.criticalReportsCount > 0
                ? "bg-red-50 text-[#f04f3e] hover:bg-red-100 border border-red-200"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            <span>
              {metrics.criticalReportsCount > 0
                ? `${metrics.criticalReportsCount} Critical Cases Pending Decree`
                : "All Incidents Handled"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Top-level Summary KPI Cards (Original Operational Metrics in Segmented Box Container) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-1 shadow-2xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {/* Card 1: Total Accounts */}
          <div className="rounded-lg bg-white border border-slate-100 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                Total Accounts
              </p>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <UserGroupIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-black text-[#092f45]">
                {metrics.totalUsers}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">users</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="text-slate-400">Platform Directory</span>
              <span className="font-bold text-blue-600">
                {metrics.activeAccountsCount} active now
              </span>
            </div>
          </div>

          {/* Card 2: Escalated Cases */}
          <div className="rounded-lg bg-white border border-slate-100 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                Escalated Cases
              </p>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-[#f04f3e]">
                <ExclamationTriangleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p
                className={`text-xl sm:text-2xl font-black ${
                  metrics.criticalReportsCount > 0 ? "text-[#f04f3e]" : "text-[#10283a]"
                }`}
              >
                {metrics.criticalReportsCount}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">critical</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="text-slate-400">Awaiting Decision</span>
              <span
                className={`font-bold ${
                  metrics.pendingReportsCount > 0 ? "text-[#f04f3e]" : "text-slate-500"
                }`}
              >
                {metrics.pendingReportsCount} pending
              </span>
            </div>
          </div>

          {/* Card 3: Disciplined Users */}
          <div className="rounded-lg bg-white border border-slate-100 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                Disciplined Users
              </p>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-amber-50 text-[#f0a35f]">
                <LockClosedIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-black text-[#10283a]">
                {metrics.lockedOrBannedCount}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">locked / banned</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="text-slate-400">Audit Enforcements</span>
              <span className="font-bold text-[#f0a35f]">
                {metrics.enforcementCount} actions logged
              </span>
            </div>
          </div>

          {/* Card 4: Pending Approvals */}
          <div className="rounded-lg bg-white border border-slate-100 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                Pending Approvals
              </p>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[#087f80]">
                <CheckBadgeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p
                className={`text-xl sm:text-2xl font-black ${
                  metrics.pendingInterpretersCount > 0 ? "text-[#087f80]" : "text-[#10283a]"
                }`}
              >
                {metrics.pendingInterpretersCount}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">volunteers</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="text-slate-400">Backlog Queue</span>
              <span
                className={`font-bold ${
                  metrics.pendingInterpretersCount > 0 ? "text-[#087f80]" : "text-slate-500"
                }`}
              >
                {metrics.pendingInterpretersCount > 0 ? "Awaiting Review" : "Queue Clean"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Emergency & Readiness Row (Donut 1 + Language Bar with Vertical Divider) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6 border-b border-slate-200 items-stretch">
        {/* LEFT: Incident Urgency & Resolution Pipeline (Big Donut Chart) */}
        <div className="flex flex-col justify-between space-y-5 lg:pr-8 lg:border-r lg:border-slate-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#10283a]">
                  Escalated Reports & Urgency Pipeline
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Severity of incidents awaiting Admin review
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("reports")}
                className="text-[11px] font-bold text-[#f04f3e] hover:underline cursor-pointer"
              >
                View Cases →
              </button>
            </div>

            {/* Big Donut Chart & Breakdown */}
            <div className="pt-5 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Big SVG Donut */}
              <div className="relative flex items-center justify-center shrink-0 w-44 h-44 sm:w-48 sm:h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                  />
                  {metrics.criticalReportsCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#f04f3e"
                      strokeWidth="16"
                      strokeDasharray={`${strokeCrit} ${C - strokeCrit}`}
                      strokeDashoffset={offsetCrit}
                      className="transition-all duration-500"
                    />
                  )}
                  {metrics.highReportsCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#f0a35f"
                      strokeWidth="16"
                      strokeDasharray={`${strokeHigh} ${C - strokeHigh}`}
                      strokeDashoffset={offsetHigh}
                      className="transition-all duration-500"
                    />
                  )}
                  {metrics.pendingReportsCount - metrics.criticalReportsCount - metrics.highReportsCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#759284"
                      strokeWidth="16"
                      strokeDasharray={`${strokeMed} ${C - strokeMed}`}
                      strokeDashoffset={offsetMed}
                      className="transition-all duration-500"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-black text-[#10283a] leading-none">
                    {metrics.pendingReportsCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    Pending incidents
                  </span>
                </div>
              </div>

              {/* Donut Legend (Clean Minimal List) */}
              <div className="flex-1 w-full divide-y divide-slate-100">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#f04f3e] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Critical Priority</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#f04f3e]">
                      {metrics.criticalReportsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(criticalPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#f0a35f] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">High Urgency</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#10283a]">
                      {metrics.highReportsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(highPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#759284] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Standard / Medium</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#10283a]">
                      {metrics.pendingReportsCount - metrics.criticalReportsCount - metrics.highReportsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(mediumPct * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adjudication Status Mini Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Awaiting decision: <strong className="text-[#f04f3e]">{metrics.pendingReportsCount}</strong> cases
            </span>
            <span>
              Resolved / Enforced: <strong className="text-[#4d8a93]">{metrics.resolvedReportsCount}</strong> cases
            </span>
          </div>
        </div>

        {/* RIGHT: Volunteer Supply by Language (Horizontal Bar Chart) */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#10283a]">
                  Volunteer Interpreter Coverage by Language
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Distribution of verified volunteers ready for dispatch
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("policies")}
                className="text-[11px] font-bold text-[#4d8a93] hover:underline cursor-pointer"
              >
                Taxonomies →
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {metrics.sortedLanguages.map(([language, count]) => {
                const percentage = Math.round((count / maxLanguageSupply) * 100);
                return (
                  <div key={language} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{language}</span>
                      <span className="font-bold text-[#4d8a93]">
                        {count} {count === 1 ? "volunteer" : "volunteers"}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4d8a93] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Macro Governance & Security Log Row (Donut 2 + Audit Feed with Vertical Divider) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6 items-stretch">
        {/* LEFT: Platform Account Composition (Big Donut Chart) */}
        <div className="flex flex-col justify-between space-y-5 lg:pr-8 lg:border-r lg:border-slate-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#10283a]">
                  Active Account Composition
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Active role balance; suspended accounts shown separately
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("users")}
                className="text-[11px] font-bold text-[#4d8a93] hover:underline cursor-pointer"
              >
                Directory →
              </button>
            </div>

            {/* Big Donut Chart & Breakdown */}
            <div className="pt-5 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Big SVG Donut */}
              <div className="relative flex items-center justify-center shrink-0 w-44 h-44 sm:w-48 sm:h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                  />
                  {metrics.activeStandardUsersCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#092f45"
                      strokeWidth="16"
                      strokeDasharray={`${strokeUsers} ${C - strokeUsers}`}
                      strokeDashoffset={offsetUsers}
                      className="transition-all duration-500"
                    />
                  )}
                  {metrics.activeInterpreterAccountsCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#4d8a93"
                      strokeWidth="16"
                      strokeDasharray={`${strokeInterp} ${C - strokeInterp}`}
                      strokeDashoffset={offsetInterp}
                      className="transition-all duration-500"
                    />
                  )}
                  {metrics.activeStaffCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="transparent"
                      stroke="#f0a35f"
                      strokeWidth="16"
                      strokeDasharray={`${strokeStaff} ${C - strokeStaff}`}
                      strokeDashoffset={offsetStaff}
                      className="transition-all duration-500"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-black text-[#10283a] leading-none">
                    {metrics.activeAccountsCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    Active accounts
                  </span>
                </div>
              </div>

              {/* Donut Legend (Clean Minimal List) */}
              <div className="flex-1 w-full divide-y divide-slate-100">
                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#092f45] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Users</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#10283a]">
                      {metrics.activeStandardUsersCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(standardPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#4d8a93] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Interpreters</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#4d8a93]">
                      {metrics.activeInterpreterAccountsCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(interpPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#f0a35f] shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Staff</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#10283a]">
                      {metrics.activeStaffCount}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({Math.round(staffPct * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Suspended</span>
                  <span className="font-mono text-xs font-bold text-[#f04f3e]">
                    {metrics.lockedOrBannedCount} accounts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active ratio note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Health Index: <strong className="text-[#4d8a93]">{Math.round(((metrics.totalUsers - metrics.lockedOrBannedCount) / (metrics.totalUsers || 1)) * 100)}%</strong> verified active
            </span>
            <span className="text-slate-400">
              Role-based access enforced
            </span>
          </div>
        </div>

        {/* RIGHT: Recent Platform Security & Enforcement Feed */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#10283a]">
                  Security Enforcement Feed
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Latest administrative actions recorded in Audit Trail
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("audit")}
                className="text-[11px] font-bold text-[#4d8a93] hover:underline cursor-pointer"
              >
                Full Trail →
              </button>
            </div>

            <div className="divide-y divide-slate-100 pt-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          log.severity === "danger"
                            ? "bg-red-50 text-[#f04f3e]"
                            : log.severity === "warning"
                            ? "bg-amber-50 text-[#f0a35f]"
                            : "bg-slate-100 text-[#10283a]"
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="font-semibold text-[#10283a] truncate">{log.targetUser}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0 text-[10px] text-slate-400 font-mono">
                    {log.timestamp.slice(11, 19)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            Tamper-evident system log recorded in real-time
          </p>
        </div>
      </div>
    </div>
  );
}
