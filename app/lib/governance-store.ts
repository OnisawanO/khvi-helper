"use client";

import { useSyncExternalStore } from "react";
import { AdminIncidentReport, AdminUserRecord, AuditLogEntry } from "../(admin)/admin/types";
import { initialUsers, initialAuditLogs, initialEscalatedReports } from "../(admin)/admin/mock-data";

const USERS_KEY = "khvi_governance_users";
const REPORTS_KEY = "khvi_governance_reports";
const AUDIT_KEY = "khvi_governance_audit_logs";

let memoryUsers: AdminUserRecord[] = [...initialUsers];
let memoryReports: AdminIncidentReport[] = [...initialEscalatedReports];
let memoryAuditLogs: AuditLogEntry[] = [...initialAuditLogs];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore quota or private browsing errors
  }
}

// Initialize from localStorage if present
if (typeof window !== "undefined") {
  memoryUsers = loadFromStorage<AdminUserRecord[]>(USERS_KEY, initialUsers);
  memoryReports = loadFromStorage<AdminIncidentReport[]>(REPORTS_KEY, initialEscalatedReports);
  memoryAuditLogs = loadFromStorage<AuditLogEntry[]>(AUDIT_KEY, initialAuditLogs);
}

export const governanceStore = {
  getUsers: (): AdminUserRecord[] => memoryUsers,
  getReports: (): AdminIncidentReport[] => memoryReports,
  getAuditLogs: (): AuditLogEntry[] => memoryAuditLogs,

  setUsers: (newUsers: AdminUserRecord[]) => {
    memoryUsers = newUsers;
    saveToStorage(USERS_KEY, memoryUsers);
    notify();
  },

  updateUser: (updatedUser: AdminUserRecord, auditAction?: string, auditDetails?: string, actor = "Super Admin (Admin)") => {
    memoryUsers = memoryUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    saveToStorage(USERS_KEY, memoryUsers);

    if (auditAction) {
      governanceStore.addAuditLog({
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        actor,
        action: auditAction,
        targetUser: `${updatedUser.name} (${updatedUser.id})`,
        severity: updatedUser.isLocked ? "danger" : "info",
        details: auditDetails || `Status updated for ${updatedUser.name}.`,
      });
    } else {
      notify();
    }
  },

  lockUser: (userId: string, reason: string, isHardBan = false, actor = "Super Admin (Admin)") => {
    const target = memoryUsers.find((u) => u.id === userId);
    if (!target) return;

    const updatedUser: AdminUserRecord = {
      ...target,
      isLocked: true,
      lockReason: reason,
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
    memoryAuditLogs = [log, ...memoryAuditLogs];
    saveToStorage(AUDIT_KEY, memoryAuditLogs);
    notify();
  },

  escalateReportToAdmin: (report: AdminIncidentReport, actor = "Manager Coordinator") => {
    // Avoid duplicate report id
    const exists = memoryReports.some((r) => r.id === report.id);
    if (exists) {
      memoryReports = memoryReports.map((r) => (r.id === report.id ? report : r));
    } else {
      memoryReports = [report, ...memoryReports];
    }
    saveToStorage(REPORTS_KEY, memoryReports);

    // Audit log
    governanceStore.addAuditLog({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      actor,
      action: "REPORT_ESCALATED",
      targetUser: `${report.reportedUserName} (${report.reportedUserId || report.bookingId})`,
      severity:
        report.severity === "critical"
          ? "danger"
          : report.severity === "high"
          ? "warning"
          : "info",
      details: `Escalated incident regarding "${report.reason}" from ${report.reporterName}.`,
    });
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
    saveToStorage(REPORTS_KEY, memoryReports);

    governanceStore.addAuditLog({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      actor,
      action: "REPORT_RESOLVED",
      targetUser: `${target.reportedUserName} (${target.id})`,
      severity: resolutionStatus.includes("Banned") ? "danger" : "info",
      details: `Incident marked as ${resolutionStatus}. Note: ${actionNote}`,
    });
  },

  reloadFromStorage: () => {
    if (typeof window !== "undefined") {
      memoryUsers = loadFromStorage<AdminUserRecord[]>(USERS_KEY, initialUsers);
      memoryReports = loadFromStorage<AdminIncidentReport[]>(REPORTS_KEY, initialEscalatedReports);
      memoryAuditLogs = loadFromStorage<AuditLogEntry[]>(AUDIT_KEY, initialAuditLogs);
      notify();
    }
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
  const users = useSyncExternalStore(governanceStore.subscribe, governanceStore.getUsers, () => initialUsers);
  const reports = useSyncExternalStore(governanceStore.subscribe, governanceStore.getReports, () => initialEscalatedReports);
  const auditLogs = useSyncExternalStore(governanceStore.subscribe, governanceStore.getAuditLogs, () => initialAuditLogs);

  return {
    users,
    reports,
    auditLogs,
    setUsers: governanceStore.setUsers,
    updateUser: governanceStore.updateUser,
    lockUser: governanceStore.lockUser,
    unlockUser: governanceStore.unlockUser,
    revokeInterpreter: governanceStore.revokeInterpreter,
    escalateReportToAdmin: governanceStore.escalateReportToAdmin,
    resolveReport: governanceStore.resolveReport,
    addAuditLog: governanceStore.addAuditLog,
    reloadFromStorage: governanceStore.reloadFromStorage,
  };
}

