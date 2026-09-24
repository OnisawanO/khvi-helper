"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { loadManagerInterpreterApplications } from "@/app/lib/real-interpreter-application-data";
import { loadManagerProfileChangeRequests } from "@/app/lib/real-profile-change-request-data";
import {
  formatReportId,
  getReportProfileName,
  loadReportRows,
  parseReportId,
  type ReportProfileRow,
  type ReportRow,
} from "@/app/lib/report-data";
import type { IncidentReport, InterpreterApplicant, ManagerActivity, ProfileChangeRequest } from "../types";
import type { AuditLogEntry } from "@/app/admin/types";

export type ManagerActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function insertManagerAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  actorName: string,
  actorRole: "Manager" | "Admin",
  input: Omit<AuditLogEntry, "id" | "timestamp" | "actor">,
) {
  const { error } = await supabase.from("system_audit_logs").insert({
    actor_id: actorId,
    actor_name: actorName,
    actor_role: actorRole,
    action: input.action,
    target_user: input.targetUser,
    severity: input.severity,
    details: input.details,
  });

  if (error) console.error("Failed to persist Manager audit log:", error.message);
}

type ManagerAuditLogRow = {
  audit_log_id: number;
  actor_name: string;
  actor_role: "Admin" | "Manager" | "System";
  action: string;
  target_user: string;
  details: string;
  created_at: string;
};

function getManagerActivityType(action: string): ManagerActivity["type"] {
  const normalizedAction = action.toUpperCase();

  if (normalizedAction.includes("APPROVED") || normalizedAction === "ADMIN_ACCESS_GRANTED") {
    return "approval";
  }
  if (normalizedAction.includes("REJECTED")) {
    return "rejection";
  }
  if (normalizedAction.includes("REVISION_REQUESTED") || normalizedAction.includes("CHANGE_REQUESTED")) {
    return "change_request";
  }
  if (normalizedAction === "REPORT_ESCALATED") {
    return "report_escalation";
  }
  if (normalizedAction === "REPORT_RESOLVED") {
    return "report_resolved";
  }

  return "system_action";
}

function formatManagerActivityAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function mapManagerAuditLog(row: ManagerAuditLogRow): ManagerActivity {
  const actor = `${row.actor_name} (${row.actor_role})`;
  const actionLabel = formatManagerActivityAction(row.action);

  return {
    id: `AUD-${String(row.audit_log_id).padStart(6, "0")}`,
    timestamp: row.created_at.slice(0, 19).replace("T", " "),
    type: getManagerActivityType(row.action),
    targetName: row.target_user,
    description: `${actionLabel} by ${actor}. ${row.details}`,
  };
}

/**
 * Verifies that the active caller is an authenticated Manager or Admin.
 */
async function verifyManagerCaller() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { authorized: false, error: "Unauthorized: No active session found.", user: null, supabase };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_locked, first_name, last_name")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { authorized: false, error: "Unauthorized: Unable to load profile.", user: null, supabase };
  }

  if (profile.role !== "Manager" && profile.role !== "Admin") {
    return { authorized: false, error: "Forbidden: Manager or Admin privileges required.", user: null, supabase };
  }

  if (profile.is_locked) {
    return { authorized: false, error: "Forbidden: Account is suspended.", user: null, supabase };
  }

  return {
    authorized: true,
    error: null,
    user: userData.user,
    profile,
    supabase,
    actorName: [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Manager",
  };
}

/**
 * Fetches all interpreter applications from Supabase for Manager / Admin.
 */
export async function getManagerApplicationsAction(): Promise<ManagerActionResult<InterpreterApplicant[]>> {
  try {
    const authCheck = await verifyManagerCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const applications = await loadManagerInterpreterApplications(authCheck.supabase);
    return { success: true, data: applications };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load interpreter applications";
    return { success: false, error: message };
  }
}

/** Fetches persisted profile change requests for Manager / Admin. */
export async function getManagerProfileChangeRequestsAction(): Promise<ManagerActionResult<ProfileChangeRequest[]>> {
  try {
    const authCheck = await verifyManagerCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const requests = await loadManagerProfileChangeRequests(authCheck.supabase);
    return { success: true, data: requests };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile change requests";
    return { success: false, error: message };
  }
}

/** Fetches the persisted operational history shared by Manager and Admin. */
export async function getManagerAuditLogsAction(): Promise<ManagerActionResult<ManagerActivity[]>> {
  try {
    const authCheck = await verifyManagerCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const { data, error } = await authCheck.supabase
      .from("system_audit_logs")
      .select("audit_log_id, actor_name, actor_role, action, target_user, details, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) return { success: false, error: `Failed to fetch operations history: ${error.message}` };
    return { success: true, data: ((data || []) as ManagerAuditLogRow[]).map(mapManagerAuditLog) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load operations history";
    return { success: false, error: message };
  }
}

/**
 * Reviews an interpreter application via Supabase RPC `review_interpreter_application`.
 */
export async function reviewApplicationAction(
  applicationId: string,
  decision: "approved" | "rejected" | "needs_revision",
  note?: string
): Promise<ManagerActionResult> {
  try {
    const authCheck = await verifyManagerCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const numericId = parseInt(applicationId, 10);
    if (isNaN(numericId)) {
      return { success: false, error: "Invalid application ID format" };
    }

    const { error: rpcError } = await authCheck.supabase.rpc("review_interpreter_application", {
      p_application_id: numericId,
      p_decision: decision,
      p_note: note?.trim() || null,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    await insertManagerAuditLog(
      authCheck.supabase,
      authCheck.user?.id || "",
      authCheck.actorName || "Manager",
      authCheck.profile?.role === "Admin" ? "Admin" : "Manager",
      {
        action: decision === "approved" ? "INTERPRETER_APPLICATION_APPROVED" : decision === "rejected" ? "INTERPRETER_APPLICATION_REJECTED" : "INTERPRETER_APPLICATION_REVISION_REQUESTED",
        targetUser: applicationId,
        severity: decision === "rejected" ? "warning" : "info",
        details: note?.trim() || `Interpreter application decision: ${decision}.`,
      },
    );

    revalidatePath("/manager");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to review application";
    return { success: false, error: message };
  }
}

function parseProfileChangeRequestId(value: string) {
  const match = /^PCR-(\d+)$/i.exec(value.trim());
  if (!match) return null;
  const numericId = Number(match[1]);
  return Number.isSafeInteger(numericId) && numericId > 0 ? numericId : null;
}

/** Reviews a persisted profile change request and applies approved skills atomically. */
export async function reviewProfileChangeRequestAction(
  requestId: string,
  decision: "approved" | "changes_requested" | "rejected",
  note?: string,
): Promise<ManagerActionResult> {
  try {
    const authCheck = await verifyManagerCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const numericId = parseProfileChangeRequestId(requestId);
    if (numericId === null) {
      return { success: false, error: "Invalid profile change request ID format" };
    }

    const { error: rpcError } = await authCheck.supabase.rpc("review_interpreter_profile_change_request", {
      p_request_id: numericId,
      p_decision: decision,
      p_note: note?.trim() || null,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    await insertManagerAuditLog(
      authCheck.supabase,
      authCheck.user?.id || "",
      authCheck.actorName || "Manager",
      authCheck.profile?.role === "Admin" ? "Admin" : "Manager",
      {
        action: decision === "approved" ? "PROFILE_CHANGE_APPROVED" : decision === "rejected" ? "PROFILE_CHANGE_REJECTED" : "PROFILE_CHANGE_REQUESTED",
        targetUser: requestId,
        severity: decision === "rejected" ? "warning" : "info",
        details: note?.trim() || `Profile change decision: ${decision}.`,
      },
    );

    revalidatePath("/manager");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to review profile change request";
    return { success: false, error: message };
  }
}

function getProfileMap(profiles: ReportProfileRow[]) {
  return new Map(profiles.map((profile) => [profile.user_id, profile]));
}

function mapManagerReport(row: ReportRow, profiles: ReportProfileRow[]): IncidentReport {
  const profileMap = getProfileMap(profiles);
  const reporter = row.reporter_id ? profileMap.get(row.reporter_id) : undefined;
  const reason = row.description?.trim() || row.title?.trim() || row.category?.trim() || "No report description provided.";
  const dbStatus = row.status;

  return {
    id: formatReportId(row.report_id),
    title: row.title?.trim() || "Untitled report",
    reporterName: getReportProfileName(reporter),
    reporterRole: reporter?.role === "Interpreter" ? "Interpreter" : "User",
    bookingId: row.booking_id === null || row.booking_id === undefined ? undefined : String(row.booking_id),
    category: row.category ?? undefined,
    systemArea: row.category ?? undefined,
    reason,
    severity: row.severity,
    createdAt: row.created_at ? row.created_at.slice(0, 16).replace("T", " ") : "Recently",
    updatedAt: (row.resolved_at || row.updated_at || row.created_at)?.slice(0, 16).replace("T", " "),
    status: dbStatus === "escalated" ? "Escalated to Admin" : dbStatus === "resolved" || dbStatus === "dismissed" ? "Resolved" : "Pending Investigation",
    actionTaken: row.resolution_note ?? undefined,
  };
}

/** Fetches report cases for the Manager/Admin operations workspace. */
export async function getManagerReportsAction(): Promise<ManagerActionResult<IncidentReport[]>> {
  try {
    const authCheck = await verifyManagerCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const result = await loadReportRows(authCheck.supabase);
    if (result.error) {
      return { success: false, error: `Failed to fetch reports: ${result.error.message}` };
    }

    return { success: true, data: result.rows.map((row) => mapManagerReport(row, result.profiles)) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reports";
    return { success: false, error: message };
  }
}

/** Updates a report after Manager triage without allowing arbitrary status changes. */
export async function updateManagerReportAction(
  reportId: string,
  update: { mode: "escalate"; severity: IncidentReport["severity"]; note: string } | { mode: "resolve"; note: string }
): Promise<ManagerActionResult> {
  try {
    const authCheck = await verifyManagerCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const numericId = parseReportId(reportId);
    if (numericId === null) return { success: false, error: "Invalid report ID format" };

    const payload = update.mode === "escalate"
      ? {
          severity: update.severity,
          status: "escalated",
          escalated_at: new Date().toISOString(),
          escalated_by: authCheck.user?.id || null,
          resolution_action: "none",
          resolution_note: update.note.trim() || null,
          updated_at: new Date().toISOString(),
        }
      : {
          status: "resolved",
          resolution_action: "fixed",
          resolution_note: update.note.trim() || null,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    const { error } = await authCheck.supabase.from("reports").update(payload).eq("report_id", numericId);
    if (error) return { success: false, error: `Failed to update report: ${error.message}` };

    await insertManagerAuditLog(
      authCheck.supabase,
      authCheck.user?.id || "",
      authCheck.actorName || "Manager",
      authCheck.profile?.role === "Admin" ? "Admin" : "Manager",
      {
        action: update.mode === "escalate" ? "REPORT_ESCALATED" : "REPORT_RESOLVED",
        targetUser: reportId,
        severity: update.mode === "escalate" && update.severity === "critical" ? "danger" : "info",
        details: update.note.trim() || `Report ${update.mode === "escalate" ? "escalated" : "resolved"}.`,
      },
    );

    revalidatePath("/manager");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update report";
    return { success: false, error: message };
  }
}
