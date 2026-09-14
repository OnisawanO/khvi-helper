"use client";

import {
  ListBulletIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { AuditLogEntry } from "../types";

interface AuditTrailTableProps {
  auditLogs: AuditLogEntry[];
  auditViewMode: "table" | "activity";
  setAuditViewMode: (mode: "table" | "activity") => void;
}

export function AuditTrailTable({
  auditLogs,
  auditViewMode,
  setAuditViewMode,
}: AuditTrailTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#092f45]">System Security Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Immutable historical event log tracking administrative authorization, role mutations, and account locks.
            </p>
          </div>

          {/* Toggle Button: View 1 (Table Grid) vs View 2 (Activity Cards Feed) */}
          <div className="flex items-center gap-1 self-start sm:self-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setAuditViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                auditViewMode === "table"
                  ? "bg-white text-[#087f80] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table Grid View"
            >
              <TableCellsIcon className="h-4 w-4" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setAuditViewMode("activity")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                auditViewMode === "activity"
                  ? "bg-white text-[#087f80] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Recent Activity Feed View"
            >
              <ListBulletIcon className="h-4 w-4" />
              <span>Activity Feed</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: DEDICATED TABLE VIEW */}
        {auditViewMode === "table" && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 pl-4 pr-2">Log ID & Time</th>
                  <th className="px-2 py-3 text-center">Severity</th>
                  <th className="px-2 py-3">Administrator</th>
                  <th className="px-2 py-3">Action</th>
                  <th className="px-2 py-3">Target Account</th>
                  <th className="py-3 pl-2 pr-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-4 pr-2 text-slate-500">
                      <span className="font-bold text-[#092f45]">{log.id}</span>
                      <div className="text-[10px] text-slate-400 font-sans">{log.timestamp}</div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                          log.severity === "danger"
                            ? "bg-red-100 text-[#f04f3e]"
                            : log.severity === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-teal-100 text-[#087f80]"
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-2 py-3 font-semibold text-[#092f45] font-sans">{log.actor}</td>
                    <td className="px-2 py-3 font-bold text-slate-700">{log.action}</td>
                    <td className="px-2 py-3 text-slate-600 font-sans">{log.targetUser}</td>
                    <td className="py-3 pl-2 pr-4 text-slate-500 font-sans text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: DEDICATED RECENT ACTIVITY FEED CARDS */}
        {auditViewMode === "activity" && (
          <div className="mt-4 space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 transition-all hover:bg-slate-100/80 hover:border-slate-300"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        log.severity === "danger"
                          ? "bg-red-100 text-[#f04f3e]"
                          : log.severity === "warning"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-teal-100 text-[#087f80]"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs font-black text-[#092f45]">
                      {log.targetUser}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      by <strong className="text-slate-600 font-semibold">{log.actor}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                  <span className="text-xs font-mono text-slate-400">
                    {log.timestamp}
                  </span>
                  <span className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-500">
                    {log.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
