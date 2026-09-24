"use client";

import { useSyncExternalStore } from "react";
import { AdminIncidentReport, AdminUserRecord, AuditLogEntry } from "../admin/types";

// This store is only an in-memory projection of records loaded from Supabase.
// It intentionally has no seed data and no localStorage fallback.
let memoryUsers: AdminUserRecord[] = [];
let memoryReports: AdminIncidentReport[] = [];
let memoryAuditLogs: AuditLogEntry[] = [];

// Server snapshots must keep a stable reference. Returning a new [] from the
// getServerSnapshot callback makes useSyncExternalStore detect a change on
// every render.
const EMPTY_USERS: AdminUserRecord[] = [];
const EMPTY_REPORTS: AdminIncidentReport[] = [];
const EMPTY_AUDIT_LOGS: AuditLogEntry[] = [];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const governanceStore = {
  getUsers: (): AdminUserRecord[] => memoryUsers,
  getReports: (): AdminIncidentReport[] => memoryReports,
  getAuditLogs: (): AuditLogEntry[] => memoryAuditLogs,

  setUsers: (newUsers: AdminUserRecord[]) => {
    memoryUsers = newUsers;
    notify();
  },

  setReports: (newReports: AdminIncidentReport[]) => {
    memoryReports = newReports;
    notify();
  },

  setAuditLogs: (newAuditLogs: AuditLogEntry[]) => {
    memoryAuditLogs = newAuditLogs;
    notify();
  },

  updateUser: (updatedUser: AdminUserRecord, auditAction?: string, auditDetails?: string, actor = "Super Admin (Admin)") => {
    memoryUsers = memoryUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    // Audit records are persisted by server actions. This store must never
    // fabricate a local audit entry when the database write is unavailable.
    void auditAction;
    void auditDetails;
    void actor;
    notify();
  },

  lockUser: (userId: string, reason: string, isHardBan = false, actor = "Super Admin (Admin)") => {
    const target = memoryUsers.find((u) => u.id === userId);
    if (!target) return;

    const updatedUser: AdminUserRecord = {
      ...target,
      isLocked: true,
      lockReason: reason,
      restrictionType: isHardBan ? "hard" : "soft",
      restrictionReason: reason,
      restrictionAt: new Date().toISOString(),
      accountStatus: isHardBan ? "Banned" : "Locked",
    };

    governanceStore.updateUser(
      updatedUser,
      isHardBan ? "ACCOUNT_HARD_BANNED" : "ACCOUNT_SUSPEND",
      `Reason: ${reason}`,
      actor
    );
  },

  unlockUser: (userId: string, actor = "Super Admin (Admin)") => {
    const target = memoryUsers.find((u) => u.id === userId);
    if (!target) return;

    const updatedUser: AdminUserRecord = {
      ...target,
      isLocked: false,
      lockReason: undefined,
      restrictionType: "none",
      restrictionReason: undefined,
      restrictionAt: undefined,
      restrictionByUserId: undefined,
      accountStatus: "Active",
    };

    governanceStore.updateUser(
      updatedUser,
      "ACCOUNT_UNLOCKED",
      "Restriction lifted. Account restored to Active.",
      actor
    );
  },

  revokeInterpreter: (userId: string, reason: string, actor = "Super Admin (Admin)") => {
    const target = memoryUsers.find((u) => u.id === userId);
    if (!target) return;

    const updatedUser: AdminUserRecord = {
      ...target,
      role: "User",
      interpreterAccessStatus: "revoked",
      interpreterStats: target.interpreterStats
        ? { ...target.interpreterStats, verificationStatus: "Suspended" }
        : undefined,
    };

    governanceStore.updateUser(
      updatedUser,
      "INTERPRETER_REVOKED",
      `Accreditation revoked: ${reason}. Demoted to standard User.`,
      actor
    );
  },

  addAuditLog: (log: AuditLogEntry) => {
    // Kept for backwards compatibility with existing callers. New audit rows
    // must be written through a server action and loaded from Supabase.
    void log;
  },

  escalateReportToAdmin: (report: AdminIncidentReport, actor = "Manager Coordinator") => {
    // Avoid duplicate report id
    const exists = memoryReports.some((r) => r.id === report.id);
    if (exists) {
      memoryReports = memoryReports.map((r) => (r.id === report.id ? report : r));
    } else {
      memoryReports = [report, ...memoryReports];
    }
    void actor;
    notify();
  },

  resolveReport: (reportId: string, resolutionStatus: AdminIncidentReport["status"], actionNote: string, actor = "Super Admin (Admin)") => {
    const target = memoryReports.find((r) => r.id === reportId);
    if (!target) return;

    const updatedReport: AdminIncidentReport = {
      ...target,
      status: resolutionStatus,
      actionTaken: actionNote,
    };

    memoryReports = memoryReports.map((r) => (r.id === reportId ? updatedReport : r));
    void actor;
    void actionNote;
    notify();
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

// React hook for synchronized state consumption
export function useGovernanceStore() {
  const users = useSyncExternalStore(governanceStore.subscribe, governanceStore.getUsers, () => EMPTY_USERS);
  const reports = useSyncExternalStore(governanceStore.subscribe, governanceStore.getReports, () => EMPTY_REPORTS);
  const auditLogs = useSyncExternalStore(governanceStore.subscribe, governanceStore.getAuditLogs, () => EMPTY_AUDIT_LOGS);

  return {
    users,
    reports,
    auditLogs,
    setUsers: governanceStore.setUsers,
    setReports: governanceStore.setReports,
    setAuditLogs: governanceStore.setAuditLogs,
    updateUser: governanceStore.updateUser,
    lockUser: governanceStore.lockUser,
    unlockUser: governanceStore.unlockUser,
    revokeInterpreter: governanceStore.revokeInterpreter,
    escalateReportToAdmin: governanceStore.escalateReportToAdmin,
    resolveReport: governanceStore.resolveReport,
    addAuditLog: governanceStore.addAuditLog,
  };
}

