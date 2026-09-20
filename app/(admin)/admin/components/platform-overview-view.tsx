"use client";

import { useMemo } from "react";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  SignalIcon,
  LanguageIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { AdminUserRecord, AdminIncidentReport, AuditLogEntry } from "../types";

interface PlatformOverviewViewProps {
  users: AdminUserRecord[];
  reports: AdminIncidentReport[];
  auditLogs: AuditLogEntry[];
  onNavigateTab: (tab: "users" | "reports" | "audit" | "policies") => void;
}

export function PlatformOverviewView({
  users,
  reports,
  auditLogs,
  onNavigateTab,
}: PlatformOverviewViewProps) {
  // 1. Role & Account Distribution
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const interpreters = users.filter((u) => u.role === "Interpreter");
    const activeInterpreters = interpreters.filter(
      (u) => !u.isLocked && u.interpreterStats?.verificationStatus === "Approved"
    );
    const standardUsers = users.filter((u) => u.role === "User");
    const managers = users.filter((u) => u.role === "Manager");
    const admins = users.filter((u) => u.role === "Admin");
    const lockedOrBanned = users.filter(
      (u) => u.isLocked || u.accountStatus === "Locked" || u.accountStatus === "Banned"
    );

    // Reports Breakdown
    const pendingReports = reports.filter((r) => r.status === "Escalated to Admin");
    const criticalReports = reports.filter((r) => r.severity === "critical");
    const highReports = reports.filter((r) => r.severity === "high");
    const resolvedReports = reports.filter(
      (r) => r.status === "Resolved (Locked)" || r.status === "Resolved (Hard Banned)"
    );

    // Language Coverage breakdown from Interpreters
    const languageCounts: Record<string, number> = {};
    interpreters.forEach((interp) => {
      interp.spokenLanguages?.forEach((lang) => {
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
      standardUsersCount: standardUsers.length,
      staffCount: managers.length + admins.length,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Executive Summary Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#f4faf9] to-[#edf7f5] p-6 shadow-xs">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#087f80] text-white shadow-md shadow-[#087f80]/20">
            <SparklesIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#092f45]">
                KHVI System & Operations Overview
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live State
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Macro governance dashboard summarizing user distribution, volunteer coverage, emergency incidents, and security posture.
            </p>
          </div>
        </div>

        {/* Quick Navigate Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab("reports")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-all cursor-pointer shadow-2xs"
          >
            <ExclamationTriangleIcon className="h-3.5 w-3.5 text-red-600" />
            <span>{metrics.pendingReportsCount} Escalated Incidents</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab("users")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#087f80]/30 bg-white px-3.5 py-2 text-xs font-bold text-[#087f80] hover:bg-[#edf7f5] transition-all cursor-pointer shadow-2xs"
          >
            <UserGroupIcon className="h-3.5 w-3.5 text-[#087f80]" />
            <span>Manage {metrics.totalUsers} Accounts</span>
          </button>
        </div>
      </div>

      {/* 2. Top-level Summary Stat Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Block 1: Active Interpreter Readiness */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Interpreter Supply</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-[#087f80]">
              <CheckBadgeIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#092f45]">
              {metrics.activeInterpretersCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / {metrics.interpretersCount} total
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>Operational & Verified</span>
          </div>
        </div>

        {/* Block 2: Critical Incident Pressure */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Escalated Priority</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">
              {metrics.criticalReportsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              critical cases
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {metrics.pendingReportsCount} pending Admin resolution
          </div>
        </div>

        {/* Block 3: Security & Soft-Lock */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disciplined Users</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheckIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">
              {metrics.lockedOrBannedCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              locked / banned
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {metrics.enforcementCount} disciplinary audit events
          </div>
        </div>

        {/* Block 4: Platform Security Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platform Health</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ArrowTrendingUpIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#087f80]">98.4%</span>
            <span className="text-xs font-semibold text-slate-500">SLA Index</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Avg emergency response: 2.3m
          </div>
        </div>
      </div>

      {/* 3. Main Analytical Graphs (Charts Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: Volunteer Supply by Language (Horizontal Bar Chart) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#087f80]">
                <LanguageIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#092f45]">
                  Volunteer Interpreter Coverage by Language
                </h3>
                <p className="text-[11px] text-slate-400">
                  Distribution of qualified bilingual volunteers ready for dispatch
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("policies")}
              className="text-[11px] font-bold text-[#087f80] hover:underline cursor-pointer"
            >
              Taxonomies →
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {metrics.sortedLanguages.map(([language, count]) => {
              const percentage = Math.round((count / maxLanguageSupply) * 100);
              return (
                <div key={language} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{language}</span>
                    <span className="font-extrabold text-[#087f80]">
                      {count} {count === 1 ? "volunteer" : "volunteers"}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#087f80] to-teal-400 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>💡 Tip: English and Thai have highest coverage. Chinese and Japanese are high-demand.</span>
          </div>
        </div>

        {/* GRAPH 2: Incident Severity & Case Resolution Pipeline */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#092f45]">
                  Escalated Reports & Safety Pipeline
                </h3>
                <p className="text-[11px] text-slate-400">
                  Breakdown of incident urgency requiring Super Admin adjudication
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("reports")}
              className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
            >
              View Cases →
            </button>
          </div>

          {/* Severity Breakdown Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Urgency Distribution</span>
              <span className="text-[11px] text-slate-400">{reports.length} total filed</span>
            </div>
            <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100 p-0.5 gap-0.5">
              {metrics.criticalReportsCount > 0 && (
                <div
                  className="h-full rounded-l-full bg-red-500 transition-all"
                  style={{ width: `${(metrics.criticalReportsCount / reports.length) * 100}%` }}
                  title={`${metrics.criticalReportsCount} Critical`}
                />
              )}
              {metrics.highReportsCount > 0 && (
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(metrics.highReportsCount / reports.length) * 100}%` }}
                  title={`${metrics.highReportsCount} High`}
                />
              )}
              {reports.length - metrics.criticalReportsCount - metrics.highReportsCount > 0 && (
                <div
                  className="h-full rounded-r-full bg-blue-400 transition-all"
                  style={{
                    width: `${
                      ((reports.length - metrics.criticalReportsCount - metrics.highReportsCount) /
                        reports.length) *
                      100
                    }%`,
                  }}
                  title="Medium"
                />
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Critical ({metrics.criticalReportsCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>High ({metrics.highReportsCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>Medium ({reports.length - metrics.criticalReportsCount - metrics.highReportsCount})</span>
              </div>
            </div>
          </div>

          {/* Resolution Status Pipeline */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">Adjudication Status</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  Needs Attention
                </span>
                <p className="text-lg font-black text-red-700 mt-0.5">
                  {metrics.pendingReportsCount} Cases
                </p>
                <p className="text-[10px] text-red-500">Awaiting Super Admin decree</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Enforced / Resolved
                </span>
                <p className="text-lg font-black text-emerald-800 mt-0.5">
                  {metrics.resolvedReportsCount} Cases
                </p>
                <p className="text-[10px] text-emerald-600">Ban / Soft-Lock executed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: User Role Balance & Recent Security Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Platform User Composition (Donut / Composition Bar) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserGroupIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#092f45]">
                Account Composition
              </h3>
              <p className="text-[11px] text-slate-400">Total: {metrics.totalUsers} accounts registered</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Standard Tourists / Users
              </span>
              <span className="text-slate-900">{metrics.standardUsersCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#087f80]" />
                Volunteer Interpreters
              </span>
              <span className="text-slate-900">{metrics.interpretersCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Staff (Managers & Admins)
              </span>
              <span className="text-slate-900">{metrics.staffCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Suspended / Soft-Locked
              </span>
              <span className="text-red-600">{metrics.lockedOrBannedCount}</span>
            </div>
          </div>
        </div>

        {/* Card 2 & 3: Recent Audit Enforcement Feed */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <SignalIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#092f45]">
                  Recent Platform Security & Enforcement Feed
                </h3>
                <p className="text-[11px] text-slate-400">
                  Latest administrative entries logged into immutable Audit Trail
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("audit")}
              className="text-[11px] font-bold text-[#087f80] hover:underline cursor-pointer"
            >
              Full Trail →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase ${
                        log.severity === "danger"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : log.severity === "warning"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-teal-50 text-[#087f80] border border-teal-200"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">{log.targetUser}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{log.details}</p>
                </div>
                <div className="text-right shrink-0 text-[10px] text-slate-400 font-medium">
                  {log.timestamp.slice(11, 19)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

