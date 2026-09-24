"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  AccountRestrictionType,
  AdminLevel,
  AdminUserRecord,
  AuditLogEntry,
  InterpreterApplicationStatus,
  InterpreterAccessStatus,
  SystemRole,
} from "../types";
import {
  formatReportId,
  getReportProfileName,
  loadReportRows,
  parseReportId,
  type ReportProfileRow,
  type ReportResolutionAction,
  type ReportRow,
} from "@/app/lib/report-data";
import type { AdminIncidentReport } from "../types";

export type AdminActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

type ProfileRow = {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  preferred_ui_language: string;
  role: string;
  admin_level: AdminLevel | null;
  is_locked: boolean;
  lock_reason: string | null;
  restriction_type: AccountRestrictionType | null;
  restriction_reason: string | null;
  restriction_at: string | null;
  restriction_by_user_id: string | null;
  interpreter_access_status: InterpreterAccessStatus | null;
  created_at: string;
  email: string | null;
  auth_created_at: string | null;
  last_sign_in_at: string | null;
};

type DirectoryProfile = ProfileRow;

type ApplicationRow = {
  application_id: number;
  user_id: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_user_id: string | null;
};

type ApplicationLanguageRow = {
  application_id: number;
  language_id: number;
  is_primary: boolean;
};

type ApplicationCategoryRow = {
  application_id: number;
  category_id: number;
};

type ReferenceLanguageRow = {
  language_id: number;
  language_name: string;
};

type ReferenceCategoryRow = {
  category_id: number;
  category_name: string;
};

type AuditLogRow = {
  audit_log_id: number;
  actor_name: string;
  actor_role: "Admin" | "Manager" | "System";
  action: string;
  target_user: string;
  severity: "info" | "warning" | "danger";
  details: string;
  created_at: string;
};

type AuditLogInput = Omit<AuditLogEntry, "id" | "timestamp" | "actor">;

function mapAuditLog(row: AuditLogRow): AuditLogEntry {
  return {
    id: `AUD-${String(row.audit_log_id).padStart(6, "0")}`,
    timestamp: row.created_at.slice(0, 19).replace("T", " "),
    actor: `${row.actor_name} (${row.actor_role})`,
    action: row.action,
    targetUser: row.target_user,
    severity: row.severity,
    details: row.details,
  };
}

async function insertAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  actorName: string,
  input: AuditLogInput,
) {
  const { data, error } = await supabase
    .from("system_audit_logs")
    .insert({
      actor_id: actorId,
      actor_name: actorName,
      actor_role: "Admin",
      action: input.action,
      target_user: input.targetUser,
      severity: input.severity,
      details: input.details,
    })
    .select("audit_log_id, actor_name, actor_role, action, target_user, severity, details, created_at")
    .single();

  if (error || !data) {
    console.error("Failed to persist Admin audit log:", error?.message || "No audit row returned");
    return null;
  }

  return mapAuditLog(data as AuditLogRow);
}

/**
 * Verifies that the active caller is an authenticated, active Admin.
 */
async function verifyAdminCaller() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { authorized: false, error: "Unauthorized: No active session found.", user: null, supabase, adminLevel: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, admin_level, is_locked, first_name, last_name")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { authorized: false, error: "Unauthorized: Unable to load profile.", user: null, supabase, adminLevel: null };
  }

  if (profile.role !== "Admin") {
    return { authorized: false, error: "Forbidden: Admin privileges required.", user: null, supabase, adminLevel: null };
  }

  if (profile.is_locked) {
    return { authorized: false, error: "Forbidden: Account is suspended.", user: null, supabase, adminLevel: null };
  }

  return {
    authorized: true,
    error: null,
    user: userData.user,
    supabase,
    adminLevel: profile.admin_level as AdminLevel,
    actorName: [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Admin",
  };
}

type AccountSecurityActionResult = AdminActionResult<{
  updated: boolean;
  restrictionType?: AccountRestrictionType;
  users?: DirectoryProfile[];
  role?: SystemRole;
  interpreterAccessStatus?: InterpreterAccessStatus;
  applicationId?: number;
  applicationStatus?: string;
}>;


async function invokeAccountSecurityFunction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  body: Record<string, unknown>
): Promise<AccountSecurityActionResult> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    return {
      success: false,
      error: "Unauthorized: active session token unavailable.",
    };
  }

  const { data: functionResult, error: functionError } = await supabase.functions.invoke(
    "manage-account-security",
    {
      body,
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    }
  );

  if (functionError) {
    let functionDetail = functionError.message;
    const functionResponse = (functionError as { context?: unknown }).context;

    if (functionResponse instanceof Response) {
      try {
        const errorBody = (await functionResponse.clone().json()) as { error?: string };
        if (errorBody.error) functionDetail = errorBody.error;
      } catch {
        // Keep the SDK error when the function response is not JSON.
      }
    }

    return { success: false, error: functionDetail };
  }

  const result = functionResult as {
    success?: boolean;
    data?: {
      updated?: boolean;
      restrictionType?: AccountRestrictionType;
      users?: DirectoryProfile[];
      role?: SystemRole;
      interpreterAccessStatus?: InterpreterAccessStatus;
      applicationId?: number;
      applicationStatus?: string;
    };
    error?: string;
  } | null;

  if (!result?.success || !result.data?.updated) {
    return {
      success: false,
      error: result?.error || "Unable to update account security settings.",
    };
  }

  return {
    success: true,
    data: {
      updated: true,
      restrictionType: result.data.restrictionType,
      users: result.data.users,
      role: result.data.role,
      interpreterAccessStatus: result.data.interpreterAccessStatus,
      applicationId: result.data.applicationId,
      applicationStatus: result.data.applicationStatus,
    },
  };
}

/**
 * Fetches all user profiles from Supabase for the Admin dashboard.
 */
export async function getAdminUsersAction(): Promise<AdminActionResult<AdminUserRecord[]>> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    // Auth emails are only available through the trusted Edge Function. The
    // profile table intentionally does not duplicate that identity field.
    const directoryResult = await invokeAccountSecurityFunction(authCheck.supabase, {
      action: "list_directory",
    });

    if (!directoryResult.success || !directoryResult.data?.users) {
      return {
        success: false,
        error: directoryResult.error || "Failed to fetch the authenticated user directory.",
      };
    }

    const profiles = directoryResult.data.users;
    const profileIds = profiles.map((profile) => profile.user_id);

    const { data: applications, error: applicationsError } = profileIds.length
      ? await authCheck.supabase
          .from("interpreter_applications")
          .select("application_id, user_id, status, submitted_at, reviewed_at, reviewed_by_user_id")
          .in("user_id", profileIds)
          .neq("status", "cancelled")
          .order("submitted_at", { ascending: false })
          .order("application_id", { ascending: false })
      : { data: [], error: null };

    if (applicationsError) {
      return { success: false, error: `Failed to fetch interpreter applications: ${applicationsError.message}` };
    }

    const applicationRows = (applications || []) as ApplicationRow[];
    const applicationIds = applicationRows.map((application) => application.application_id);

    const { data: applicationLanguages, error: applicationLanguagesError } = applicationIds.length
      ? await authCheck.supabase
          .from("interpreter_application_languages")
          .select("application_id, language_id, is_primary")
          .in("application_id", applicationIds)
      : { data: [], error: null };

    const { data: applicationCategories, error: applicationCategoriesError } = applicationIds.length
      ? await authCheck.supabase
          .from("interpreter_application_categories")
          .select("application_id, category_id")
          .in("application_id", applicationIds)
      : { data: [], error: null };

    const { data: languages, error: languagesError } = await authCheck.supabase
      .from("languages")
      .select("language_id, language_name")
      .eq("is_active", true);

    const { data: categories, error: categoriesError } = await authCheck.supabase
      .from("categories")
      .select("category_id, category_name")
      .eq("is_active", true);

    const { data: completedBookings, error: completedBookingsError } = profileIds.length
      ? await authCheck.supabase
          .from("bookings")
          .select("interpreter_id")
          .eq("status", "completed")
          .in("interpreter_id", profileIds)
      : { data: [], error: null };

    if (applicationLanguagesError || applicationCategoriesError || languagesError || categoriesError || completedBookingsError) {
      const detail = applicationLanguagesError?.message
        || applicationCategoriesError?.message
        || languagesError?.message
        || categoriesError?.message
        || completedBookingsError?.message;
      return { success: false, error: `Failed to load connected profile details: ${detail}` };
    }

    const applicationByUser = new Map<string, ApplicationRow>();
    for (const application of applicationRows) {
      if (!applicationByUser.has(application.user_id)) {
        applicationByUser.set(application.user_id, application);
      }
    }

    const applicationLanguagesById = new Map<number, ApplicationLanguageRow[]>();
    for (const row of (applicationLanguages || []) as ApplicationLanguageRow[]) {
      const current = applicationLanguagesById.get(row.application_id) || [];
      current.push(row);
      applicationLanguagesById.set(row.application_id, current);
    }

    const applicationCategoriesById = new Map<number, ApplicationCategoryRow[]>();
    for (const row of (applicationCategories || []) as ApplicationCategoryRow[]) {
      const current = applicationCategoriesById.get(row.application_id) || [];
      current.push(row);
      applicationCategoriesById.set(row.application_id, current);
    }

    const languageById = new Map(
      ((languages || []) as ReferenceLanguageRow[]).map((language) => [language.language_id, language.language_name]),
    );
    const categoryById = new Map(
      ((categories || []) as ReferenceCategoryRow[]).map((category) => [category.category_id, category.category_name]),
    );
    const completedMissionsByUser = new Map<string, number>();
    for (const booking of (completedBookings || []) as { interpreter_id: string | null }[]) {
      if (!booking.interpreter_id) continue;
      completedMissionsByUser.set(
        booking.interpreter_id,
        (completedMissionsByUser.get(booking.interpreter_id) || 0) + 1,
      );
    }
    const profileById = new Map(profiles.map((profile) => [profile.user_id, profile]));

    const langMap: Record<string, string> = {
      th: "Thai",
      en: "English",
      zh: "Mandarin Chinese",
      my: "Burmese",
      vi: "Vietnamese",
    };

    const formatTimestamp = (value: string | null | undefined) =>
      value ? value.slice(0, 16).replace("T", " ") : "Not available";

    const formatApplicationStatus = (value: string): InterpreterApplicationStatus => {
      const statusMap: Record<string, InterpreterApplicationStatus> = {
        pending: "Pending",
        under_review: "Under Review",
        needs_revision: "Needs Revision",
        approved: "Approved",
        rejected: "Rejected",
        cancelled: "Cancelled",
      };
      return statusMap[value] || "Pending";
    };

    const getApplicationDetails = (profile: DirectoryProfile) => {
      const application = applicationByUser.get(profile.user_id);
      if (!application) return undefined;

      const languageRows = [...(applicationLanguagesById.get(application.application_id) || [])]
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
      const languagesForApplication = languageRows
        .map((row) => languageById.get(row.language_id))
        .filter((language): language is string => Boolean(language));
      const categoriesForApplication = (applicationCategoriesById.get(application.application_id) || [])
        .map((row) => categoryById.get(row.category_id))
        .filter((category): category is string => Boolean(category));
      const reviewer = application.reviewed_by_user_id
        ? profileById.get(application.reviewed_by_user_id)
        : undefined;

      return {
        id: String(application.application_id),
        status: formatApplicationStatus(application.status),
        submittedAt: formatTimestamp(application.submitted_at),
        reviewedAt: application.reviewed_at ? formatTimestamp(application.reviewed_at) : undefined,
        reviewedBy: reviewer
          ? [reviewer.first_name, reviewer.last_name].filter(Boolean).join(" ").trim()
          : undefined,
        languages: [...new Set(languagesForApplication)],
        categories: [...new Set(categoriesForApplication)],
      };
    };

    const records: AdminUserRecord[] = profiles.map((p) => {
      const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || "KHVI User";
      const applicationSummary = getApplicationDetails(p);
      const preferredUiLanguage = langMap[p.preferred_ui_language] || p.preferred_ui_language || "Not available";
      const primLang = applicationSummary?.languages[0] || "Not recorded";
      const spokenLanguages = applicationSummary?.languages || [];

      const restrictionType: AccountRestrictionType = p.restriction_type || (
        p.lock_reason?.includes("[PERMANENT BAN]") ? "hard" : p.is_locked ? "soft" : "none"
      );

      return {
        id: p.user_id,
        name: fullName,
        email: p.email || "Not available",
        phone: p.phone || "Not provided",
        dateOfBirth: p.date_of_birth || undefined,
        preferredUiLanguage,
        primaryLanguage: primLang,
        spokenLanguages,
        role: (p.role as SystemRole) || "User",
        adminLevel: p.admin_level || undefined,
        isLocked: p.is_locked,
        lockReason: p.lock_reason || undefined,
        restrictionType,
        restrictionReason: p.restriction_reason || undefined,
        restrictionAt: p.restriction_at || undefined,
        restrictionByUserId: p.restriction_by_user_id || undefined,
        interpreterAccessStatus: p.interpreter_access_status || "active",
        accountStatus: restrictionType === "hard"
          ? "Banned"
          : restrictionType === "soft"
          ? "Locked"
          : "Active",
        registeredAt: formatTimestamp(p.auth_created_at || p.created_at),
        lastActive: p.last_sign_in_at ? formatTimestamp(p.last_sign_in_at) : "Not available",
        applicationSummary,
        ...((p.role === "Interpreter" || applicationSummary) && {
          interpreterStats: {
            verificationStatus: applicationSummary?.status || "Not Available",
            completedMissions: completedMissionsByUser.get(p.user_id) || 0,
            specialties: applicationSummary?.categories || [],
          },
        }),
      };
    });

    return { success: true, data: records };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: message };
  }
}

/** Fetches the persisted immutable audit trail for the Admin console. */
export async function getAdminAuditLogsAction(): Promise<AdminActionResult<AuditLogEntry[]>> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const { data, error } = await authCheck.supabase
      .from("system_audit_logs")
      .select("audit_log_id, actor_name, actor_role, action, target_user, severity, details, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) return { success: false, error: `Failed to fetch audit logs: ${error.message}` };
    return { success: true, data: ((data || []) as AuditLogRow[]).map(mapAuditLog) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load audit logs";
    return { success: false, error: message };
  }
}

/**
 * Updates a user's role, lock status, and lock reason in Supabase.
 */
export async function updateUserSecurityAction(
  targetUserId: string,
  newRole: SystemRole,
  isLocked: boolean,
  lockReason: string
): Promise<AdminActionResult<{ updated: boolean }>> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const isPrimaryAdmin = authCheck.adminLevel === "primary";
    const isDelegatedAdmin = authCheck.adminLevel === "delegated";

    if (!isPrimaryAdmin && !isDelegatedAdmin) {
      return {
        success: false,
        error: "Forbidden: This Admin account has no active governance level.",
      };
    }

    if (newRole === "Admin") {
      return {
        success: false,
        error: "Use the dedicated Grant Admin Access flow to promote a Manager to Admin.",
      };
    }

    // Check target current role to prevent accidental admin lockout
    const { data: targetProfile, error: targetError } = await authCheck.supabase
      .from("profiles")
      .select("role, admin_level, is_locked, lock_reason, restriction_type, interpreter_access_status")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return { success: false, error: "Target user not found in profiles." };
    }

    if (targetProfile.role === "Admin") {
      return {
        success: false,
        error: "Action blocked: Admin accounts cannot be demoted from User Directory.",
      };
    }

    if (newRole !== targetProfile.role) {
      return {
        success: false,
        error: "Role changes are controlled by application approval or interpreter revocation. Use the dedicated governance flow.",
      };
    }

    const targetRestrictionType: AccountRestrictionType = targetProfile.restriction_type || (
      targetProfile.lock_reason?.includes("[PERMANENT BAN]")
        ? "hard"
        : targetProfile.is_locked
        ? "soft"
        : "none"
    );

    if (targetRestrictionType === "hard") {
      return {
        success: false,
        error: "Legacy restricted accounts require the permanent account deletion review flow.",
      };
    }

    if (isLocked && !lockReason.trim()) {
      return {
        success: false,
        error: "A reason is required when suspending an account.",
      };
    }

    if (isDelegatedAdmin) {
      const delegatedRoles: SystemRole[] = ["User", "Interpreter"];

      if (!delegatedRoles.includes(targetProfile.role as SystemRole) || !delegatedRoles.includes(newRole)) {
        return {
          success: false,
          error: "Forbidden: Delegated Admin can manage only User and Interpreter accounts.",
        };
      }

    }

    if (newRole === "Interpreter" && targetProfile.role !== "Interpreter") {
      if (targetProfile.interpreter_access_status === "revoked") {
        return {
          success: false,
          error: "Interpreter access was revoked; Primary Admin review is required before restoring it.",
        };
      }

      const { data: approvedApplication, error: applicationError } = await authCheck.supabase
        .from("interpreter_applications")
        .select("application_id")
        .eq("user_id", targetUserId)
        .eq("status", "approved")
        .order("reviewed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (applicationError) {
        return {
          success: false,
          error: `Unable to verify interpreter approval: ${applicationError.message}`,
        };
      }

      if (!approvedApplication) {
        return {
          success: false,
          error: "Interpreter role requires an approved interpreter application.",
        };
      }
    }

    const result = await invokeAccountSecurityFunction(authCheck.supabase, {
      action: "update",
      targetUserId,
      newRole,
      isLocked,
      lockReason: lockReason.trim(),
    });

    if (!result.success) return result;

    await insertAuditLog(
      authCheck.supabase,
      authCheck.user?.id || "",
      authCheck.actorName || "Admin",
      {
        action: isLocked ? "ACCOUNT_SUSPEND" : "ACCOUNT_UPDATE",
        targetUser: targetUserId,
        severity: isLocked ? "warning" : "info",
        details: `Role set to ${newRole}. Locked: ${isLocked ? `Yes (${lockReason.trim()})` : "No"}.`,
      },
    );

    revalidatePath("/admin");
    return { success: true, data: { updated: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error during update";
    return { success: false, error: message };
  }
}

/**
 * Permanently revokes interpreter accreditation. This is separate from the
 * reversible Interpreter -> User role change so an approved application can
 * still restore interpreter access when the role was only temporarily removed.
 */
export async function revokeInterpreterAccessAction(
  targetUserId: string,
  reason: string
): Promise<AdminActionResult<{ updated: boolean }>> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    if (authCheck.adminLevel !== "primary") {
      return {
        success: false,
        error: "Forbidden: Only the Primary Admin can revoke interpreter accreditation.",
      };
    }

    if (!reason.trim()) {
      return { success: false, error: "A reason is required to revoke interpreter accreditation." };
    }

    const result = await invokeAccountSecurityFunction(authCheck.supabase, {
      action: "revoke_interpreter",
      targetUserId,
      reason: reason.trim(),
    });

    if (!result.success) return result;

    const applicationId = result.data?.applicationId;
    if (!applicationId) {
      return {
        success: false,
        error: "Revoke response did not include the updated application. Deploy the latest account-security function.",
      };
    }

    const [profileVerification, applicationVerification] = await Promise.all([
      authCheck.supabase
        .from("profiles")
        .select("role, interpreter_access_status")
        .eq("user_id", targetUserId)
        .maybeSingle(),
      authCheck.supabase
        .from("interpreter_applications")
        .select("application_id, status")
        .eq("application_id", applicationId)
        .maybeSingle(),
    ]);

    if (
      profileVerification.error ||
      applicationVerification.error ||
      !profileVerification.data ||
      !applicationVerification.data ||
      profileVerification.data.role !== "User" ||
      profileVerification.data.interpreter_access_status !== "revoked" ||
      applicationVerification.data.status !== "rejected"
    ) {
      return {
        success: false,
        error: "Revoke completed with an inconsistent database state. Refresh the record and inspect the account-security invocation.",
      };
    }

    await insertAuditLog(
      authCheck.supabase,
      authCheck.user?.id || "",
      authCheck.actorName || "Admin",
      {
        action: "INTERPRETER_REVOKED",
        targetUser: targetUserId,
        severity: "danger",
        details: `Interpreter accreditation revoked: ${reason.trim()}.`,
      },
    );
    revalidatePath("/admin");
    return { success: true, data: { updated: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error while revoking interpreter accreditation";
    return { success: false, error: message };
  }
}

export type AccountRestrictionAction = "suspend" | "unlock" | "delete_account";

/**
 * Applies an account restriction through the trusted Supabase Edge Function.
 * The service role stays inside Supabase and the Auth ban is coordinated with
 * the profile restriction state in one server-side flow.
 */
export async function enforceAccountRestrictionAction(
  targetUserId: string,
  action: AccountRestrictionAction,
  reason: string
): Promise<AccountSecurityActionResult> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    if (action === "delete_account" && authCheck.adminLevel !== "primary") {
      return {
        success: false,
        error: "Forbidden: Only the Primary Admin can permanently delete an account.",
      };
    }

    if (action !== "unlock" && !reason.trim()) {
      return { success: false, error: "A reason is required for this security action." };
    }

    const result = await invokeAccountSecurityFunction(authCheck.supabase, {
      action,
      targetUserId,
      reason: reason.trim(),
    });

    if (result.success) {
      await insertAuditLog(
        authCheck.supabase,
        authCheck.user?.id || "",
        authCheck.actorName || "Admin",
        {
          action: action === "delete_account" ? "ACCOUNT_PERMANENTLY_DELETED" : action === "suspend" ? "ACCOUNT_SUSPEND" : "ACCOUNT_UNLOCKED",
          targetUser: targetUserId,
          severity: action === "unlock" ? "info" : "danger",
          details: action === "delete_account"
            ? `Account permanently deleted. Reason: ${reason.trim() || "not provided"}.`
            : `${action} account restriction. Reason: ${reason.trim() || "not provided"}.`,
        },
      );
      revalidatePath("/admin");
    }
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error during account security action";
    return { success: false, error: message };
  }
}

/**
 * Promotes an active Manager to a delegated Admin.
 *
 * This is intentionally separate from the generic User Directory editor so
 * that Admin elevation has its own authorization and confirmation flow.
 */
export async function grantAdminAccessAction(
  targetUserId: string
): Promise<AdminActionResult<{ updated: boolean }>> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    if (authCheck.adminLevel !== "primary") {
      return {
        success: false,
        error: "Forbidden: Only the primary Admin can grant Admin access.",
      };
    }

    const { data: targetProfile, error: targetError } = await authCheck.supabase
      .from("profiles")
      .select("role, admin_level, is_locked")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return { success: false, error: "Target user not found in profiles." };
    }

    if (targetProfile.role !== "Manager") {
      return {
        success: false,
        error: "Only an active Manager can receive delegated Admin access.",
      };
    }

    if (targetProfile.is_locked) {
      return {
        success: false,
        error: "Unlock the Manager account before granting Admin access.",
      };
    }

    const { data: updatedProfile, error: updateError } = await authCheck.supabase
      .from("profiles")
      .update({
        role: "Admin",
        admin_level: "delegated",
        is_locked: false,
        lock_reason: null,
      })
      .eq("user_id", targetUserId)
      .select("user_id, role, admin_level")
      .maybeSingle();

    if (updateError) {
      return { success: false, error: `Admin access update failed: ${updateError.message}` };
    }

    if (!updatedProfile || updatedProfile.role !== "Admin" || updatedProfile.admin_level !== "delegated") {
      return {
        success: false,
        error: "No profile was updated. Apply migration 20260923000600 so only the Primary Admin can grant Admin access.",
      };
    }

    await insertAuditLog(
      authCheck.supabase,
      authCheck.user?.id || "",
      authCheck.actorName || "Admin",
      {
        action: "ADMIN_ACCESS_GRANTED",
        targetUser: targetUserId,
        severity: "warning",
        details: "Manager promoted to delegated Admin. Primary Admin privileges were not granted.",
      },
    );

    revalidatePath("/admin");
    return { success: true, data: { updated: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error while granting Admin access";
    return { success: false, error: message };
  }
}

export type CreateManagerAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  preferredUiLanguage: "th" | "en" | "zh" | "my" | "vi";
  temporaryPassword: string;
};

/**
 * Creates a Manager through the trusted Supabase Edge Function. The service
 * role key remains inside Supabase and is never exposed to Next.js or the UI.
 */
export async function createManagerAccountAction(
  input: CreateManagerAccountInput
): Promise<AdminActionResult<{ userId: string }>> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    if (authCheck.adminLevel !== "primary") {
      return {
        success: false,
        error: "Forbidden: Only the primary Admin can create staff accounts.",
      };
    }

    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.replace(/\D/g, "");

    if (!firstName || !lastName || !email || !input.dateOfBirth || !phone) {
      return { success: false, error: "Complete all required staff account fields." };
    }

    if (!/^0\d{9}$/.test(phone)) {
      return { success: false, error: "Phone number must contain 10 digits and start with 0." };
    }

    if (input.temporaryPassword.length < 8) {
      return { success: false, error: "Temporary password must be at least 8 characters." };
    }

    const { data: sessionData, error: sessionError } = await authCheck.supabase.auth.getSession();
    if (sessionError || !sessionData.session?.access_token) {
      return { success: false, error: "Unauthorized: active session token unavailable." };
    }

    const { data: functionResult, error: functionError } = await authCheck.supabase.functions.invoke(
      "create-manager-account",
      {
        body: { ...input, phone },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      }
    );

    if (functionError) {
      let functionDetail = functionError.message;
      const functionResponse = (functionError as { context?: unknown }).context;

      if (functionResponse instanceof Response) {
        try {
          const errorBody = (await functionResponse.clone().json()) as { error?: string };
          if (errorBody.error) functionDetail = errorBody.error;
        } catch {
          // Keep the SDK error when the function response is not JSON.
        }
      }

      return {
        success: false,
        error: `Staff provisioning failed: ${functionDetail}`,
      };
    }

    const result = functionResult as {
      success?: boolean;
      data?: { userId?: string };
      error?: string;
    } | null;

    if (!result?.success || !result.data?.userId) {
      return {
        success: false,
        error: result?.error || "Unable to create the Manager account.",
      };
    }

    await insertAuditLog(
      authCheck.supabase,
      authCheck.user?.id || "",
      authCheck.actorName || "Admin",
      {
        action: "STAFF_ACCOUNT_CREATED",
        targetUser: result.data.userId,
        severity: "info",
        details: `Manager staff account created for ${email}.`,
      },
    );

    revalidatePath("/admin");
    return { success: true, data: { userId: result.data.userId } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error while creating staff account";
    return { success: false, error: message };
  }
}

function getProfileMap(profiles: ReportProfileRow[]) {
  return new Map(profiles.map((profile) => [profile.user_id, profile]));
}

function mapAdminReport(row: ReportRow, profiles: ReportProfileRow[]): AdminIncidentReport {
  const profileMap = getProfileMap(profiles);
  const reporter = row.reporter_id ? profileMap.get(row.reporter_id) : undefined;
  const resolvedStatus: AdminIncidentReport["status"] = row.status === "dismissed" ? "Dismissed" : "Resolved";
  const reason = row.description?.trim() || row.title?.trim() || row.category?.trim() || "No report description provided.";

  return {
    id: formatReportId(row.report_id),
    title: row.title?.trim() || "Untitled report",
    reporterName: getReportProfileName(reporter),
    reporterRole: reporter?.role === "Interpreter" ? "Interpreter" : "User",
    bookingId: row.booking_id === null || row.booking_id === undefined ? undefined : String(row.booking_id),
    category: row.category ?? undefined,
    systemArea: row.category ?? undefined,
    reason,
    originalReason: undefined,
    severity: row.severity,
    createdAt: row.created_at ? row.created_at.slice(0, 16).replace("T", " ") : "Recently",
    status: row.status === "resolved" || row.status === "dismissed" ? resolvedStatus : "Escalated to Admin",
    actionTaken: row.resolution_note ?? undefined,
  };
}

/** Fetches all report cases visible to the Admin enforcement workspace. */
export async function getAdminReportsAction(): Promise<AdminActionResult<AdminIncidentReport[]>> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const result = await loadReportRows(authCheck.supabase, { escalatedOnly: true });
    if (result.error) {
      return { success: false, error: `Failed to fetch reports: ${result.error.message}` };
    }

    return { success: true, data: result.rows.map((row) => mapAdminReport(row, result.profiles)) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reports";
    return { success: false, error: message };
  }
}

/** Records the Admin outcome for a system report. */
export async function resolveAdminReportAction(
  reportId: string,
  resolutionAction: Exclude<ReportResolutionAction, "none">,
  resolutionNote: string
): Promise<AdminActionResult> {
  try {
    const authCheck = await verifyAdminCaller();
    if (!authCheck.authorized || !authCheck.supabase) {
      return { success: false, error: authCheck.error || "Access denied" };
    }

    const numericId = parseReportId(reportId);
    if (numericId === null) return { success: false, error: "Invalid report ID format" };

    const now = new Date().toISOString();
    const status = "resolved" as const;
    const { error } = await authCheck.supabase
      .from("reports")
      .update({
        status,
        resolution_action: resolutionAction,
        resolution_note: resolutionNote.trim() || null,
        resolved_at: now,
        updated_at: now,
      })
      .eq("report_id", numericId);

    if (error) return { success: false, error: `Failed to resolve report: ${error.message}` };

    await insertAuditLog(
      authCheck.supabase,
      authCheck.user?.id || "",
      authCheck.actorName || "Admin",
      {
        action: "REPORT_RESOLVED",
        targetUser: reportId,
        severity: resolutionAction === "warned" ? "warning" : "info",
        details: resolutionNote.trim() || `Report resolved with action ${resolutionAction}.`,
      },
    );

    revalidatePath("/admin");
    revalidatePath("/manager");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resolve report";
    return { success: false, error: message };
  }
}

