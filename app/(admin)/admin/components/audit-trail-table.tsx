"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ChevronDownIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AuditLogEntry } from "../types";
import { TablePagination } from "./table-pagination";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedActorRoles, setSelectedActorRoles] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Pagination state (10 records per page)
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

  // Unique actions list for filter
  const availableActions = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => set.add(l.action));
    return Array.from(set).sort();
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return auditLogs.filter((log) => {
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(log.severity)) {
        return false;
      }
      if (selectedActions.length > 0 && !selectedActions.includes(log.action)) {
        return false;
      }
      if (selectedActorRoles.length > 0) {
        const actorLower = log.actor.toLowerCase();
        const matchesActor = selectedActorRoles.some((role) => {
          if (role === "Admin") return actorLower.includes("admin");
          if (role === "Manager") return actorLower.includes("manager");
          if (role === "System") return actorLower.includes("system");
          return false;
        });
        if (!matchesActor) return false;
      }
      if (q) {
        const matchId = log.id.toLowerCase().includes(q);
        const matchActor = log.actor.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchTarget = log.targetUser.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        if (!matchId && !matchActor && !matchAction && !matchTarget && !matchDetails) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, selectedSeverities, selectedActions, selectedActorRoles, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, validCurrentPage, pageSize]);

  const activeFiltersCount =
    selectedSeverities.length + selectedActions.length + selectedActorRoles.length;

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

        {/* Search and Audit Filter Toolbar */}
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 shadow-2xs md:flex-row md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by log ID, actor, action type, target account or detail..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#087f80] focus:outline-none focus:ring-1 focus:ring-[#087f80]"
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

          {/* Combined Filter Popover */}
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
              <span>Event Filter</span>
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
              <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl space-y-3.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-[#092f45] flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#087f80]" />
                    Audit Event Filters
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSeverities([]);
                        setSelectedActions([]);
                        setSelectedActorRoles([]);
                      }}
                      className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Reset All ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Section 1: Actor Type */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Actor (ผู้ดำเนินการ)
                    </label>
                    {selectedActorRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedActorRoles([])}
                        className="text-[10px] font-bold text-[#087f80] hover:underline cursor-pointer"
                      >
                        Reset ({selectedActorRoles.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["Admin", "Manager", "System"] as const).map((actorType) => {
                      const isChecked = selectedActorRoles.includes(actorType);
                      return (
                        <button
                          type="button"
                          key={actorType}
                          onClick={() =>
                            setSelectedActorRoles((prev) =>
                              prev.includes(actorType)
                                ? prev.filter((a) => a !== actorType)
                                : [...prev, actorType]
                            )
                          }
                          className={`flex items-center justify-between rounded-lg border px-2 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                          }`}
                        >
                          <span className="truncate">{actorType}</span>
                          <span
                            className={`flex h-3 w-3 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? "border-[#087f80] bg-[#087f80] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2 w-2 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Severity Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Severity
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(["danger", "warning", "info"] as const).map((sev) => {
                      const isChecked = selectedSeverities.includes(sev);
                      return (
                        <button
                          type="button"
                          key={sev}
                          onClick={() =>
                            setSelectedSeverities((prev) =>
                              prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
                            )
                          }
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? sev === "danger"
                                ? "border-red-300 bg-red-50 text-red-700"
                                : sev === "warning"
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-teal-300 bg-teal-50 text-[#087f80]"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-3 w-3 items-center justify-center rounded border ${
                              isChecked
                                ? "border-current bg-current text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckIcon className="h-2 w-2 stroke-[3] text-white" />}
                          </span>
                          <span className="capitalize">{sev}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Action Type */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Action Type
                    </label>
                    {selectedActions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedActions([])}
                        className="text-[10px] font-bold text-[#087f80] hover:underline cursor-pointer"
                      >
                        Reset ({selectedActions.length})
                      </button>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {availableActions.map((action) => {
                      const isChecked = selectedActions.includes(action);
                      return (
                        <button
                          type="button"
                          key={action}
                          onClick={() =>
                            setSelectedActions((prev) =>
                              prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#087f80] bg-[#edf7f5] text-[#087f80]"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                          }`}
                        >
                          <span className="truncate">{action}</span>
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
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
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                      No audit events match your search/filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: DEDICATED RECENT ACTIVITY FEED CARDS */}
        {auditViewMode === "activity" && (
          <div className="mt-4 space-y-3">
            {paginatedLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No audit events match your search/filter criteria.
              </div>
            ) : (
              paginatedLogs.map((log) => (
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
              ))
            )}
          </div>
        )}

        {/* Table Pagination Footer */}
        <TablePagination
          totalItems={filteredLogs.length}
          currentPage={validCurrentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="audit log events"
        />
      </div>
    </div>
  );
}
