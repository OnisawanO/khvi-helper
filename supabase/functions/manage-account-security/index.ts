import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SecurityAction = "list_directory" | "update" | "suspend" | "unlock" | "delete_account" | "revoke_interpreter";
type SystemRole = "User" | "Interpreter" | "Manager" | "Admin";
type RestrictionType = "none" | "soft" | "hard";

type SecurityInput = {
  action: SecurityAction;
  targetUserId?: string;
  newRole?: SystemRole;
  isLocked?: boolean;
  lockReason?: string;
  reason?: string;
};

type FunctionResult = {
  success: boolean;
  data?: {
    updated?: boolean;
    restrictionType?: RestrictionType;
    users?: DirectoryProfile[];
    role?: SystemRole;
    interpreterAccessStatus?: "active" | "revoked";
    applicationId?: number;
    applicationStatus?: string;
  };
  error?: string;
};

type DirectoryProfile = {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  preferred_ui_language: string;
  role: string;
  admin_level: string | null;
  is_locked: boolean;
  lock_reason: string | null;
  restriction_type: RestrictionType | null;
  restriction_reason: string | null;
  restriction_at: string | null;
  restriction_by_user_id: string | null;
  interpreter_access_status: "active" | "revoked" | null;
  created_at: string;
  auth_created_at: string | null;
  last_sign_in_at: string | null;
  email: string | null;
};

const json = (body: FunctionResult, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const validRoles: SystemRole[] = ["User", "Interpreter", "Manager", "Admin"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const longAuthBan = "876000h";
const certificateBucket = "interpreter-certificates";
const storagePageSize = 100;

const cleanReason = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 1000) : "");

const inferRestrictionType = (profile: {
  restriction_type?: string | null;
  is_locked?: boolean | null;
  lock_reason?: string | null;
}): RestrictionType => {
  if (profile.restriction_type === "hard") return "hard";
  if (profile.restriction_type === "soft") return "soft";
  if (profile.lock_reason?.startsWith("[PERMANENT BAN]")) return "hard";
  return profile.is_locked ? "soft" : "none";
};

async function removeInterpreterCertificates(
  adminSupabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const bucket = adminSupabase.storage.from(certificateBucket);
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit: storagePageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw new Error(`certificate_cleanup_failed: ${error.message}`);

    const entries = data ?? [];
    for (const entry of entries) {
      if (entry.id) paths.push(`${userId}/${entry.name}`);
    }

    if (entries.length < storagePageSize) break;
    offset += entries.length;
  }

  for (let index = 0; index < paths.length; index += storagePageSize) {
    const { error } = await bucket.remove(paths.slice(index, index + storagePageSize));
    if (error) throw new Error(`certificate_cleanup_failed: ${error.message}`);
  }
}

async function findActiveBookings(
  adminSupabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const [requesterBookings, interpreterBookings] = await Promise.all([
    adminSupabase
      .from("bookings")
      .select("booking_id, status, expires_at")
      .eq("user_id", userId)
      .in("status", ["open", "claimed", "in_progress"])
      .limit(100),
    adminSupabase
      .from("bookings")
      .select("booking_id, status, expires_at")
      .eq("interpreter_id", userId)
      .in("status", ["open", "claimed", "in_progress"])
      .limit(100),
  ]);

  const error = requesterBookings.error || interpreterBookings.error;
  if (error) throw new Error(`active_booking_check_failed: ${error.message}`);

  const now = Date.now();
  const activeBookings = [
    ...(requesterBookings.data || []),
    ...(interpreterBookings.data || []),
  ].filter((booking) =>
    booking.status !== "open"
      || (typeof booking.expires_at === "string" && new Date(booking.expires_at).getTime() > now)
  );

  return activeBookings.length > 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "").trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!accessToken || !supabaseUrl || !serviceRoleKey) {
    return json({ success: false, error: "Trusted account security service is not configured." }, 503);
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authUser, error: authError } = await adminSupabase.auth.getUser(accessToken);
  if (authError || !authUser.user) {
    return json({ success: false, error: "Unauthorized session." }, 401);
  }

  const { data: callerProfile, error: callerError } = await adminSupabase
    .from("profiles")
    .select("role, admin_level, is_locked")
    .eq("user_id", authUser.user.id)
    .maybeSingle();

  if (callerError || !callerProfile) {
    return json({ success: false, error: `Unable to load the caller profile: ${callerError?.message || "profile not found"}` }, 403);
  }

  const callerRole = String(callerProfile.role ?? "").trim();
  const callerAdminLevel = String(callerProfile.admin_level ?? "").trim().toLowerCase();
  const isPrimaryAdmin = callerRole === "Admin" && callerAdminLevel === "primary";
  const isDelegatedAdmin = callerRole === "Admin" && callerAdminLevel === "delegated";

  if (!isPrimaryAdmin && !isDelegatedAdmin) {
    return json({ success: false, error: "Only an active Admin can manage account security." }, 403);
  }

  if (callerProfile.is_locked) {
    return json({ success: false, error: "The Admin account is suspended." }, 403);
  }

  let input: SecurityInput;
  try {
    input = (await request.json()) as SecurityInput;
  } catch {
    return json({ success: false, error: "Invalid request body." }, 400);
  }

  if (!input || !["list_directory", "update", "suspend", "unlock", "delete_account", "revoke_interpreter"].includes(input.action)) {
    return json({ success: false, error: "Unsupported account security action." }, 400);
  }

  if (input.action === "list_directory") {
    const { data: profiles, error: profilesError } = await adminSupabase
      .from("profiles")
      .select("user_id, first_name, last_name, phone, date_of_birth, preferred_ui_language, role, admin_level, is_locked, lock_reason, restriction_type, restriction_reason, restriction_at, restriction_by_user_id, interpreter_access_status, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return json({ success: false, error: `Unable to load the user directory: ${profilesError.message}` }, 500);
    }

    const { data: authUsers, error: authUsersError } = await adminSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authUsersError) {
      return json({ success: false, error: `Unable to load account emails: ${authUsersError.message}` }, 500);
    }

    const emailByUserId = new Map(
      (authUsers.users || []).map((user) => [user.id, user.email || null]),
    );
    const authDetailsByUserId = new Map(
      (authUsers.users || []).map((user) => [user.id, {
        created_at: user.created_at || null,
        last_sign_in_at: user.last_sign_in_at || null,
      }]),
    );
    const users = (profiles || []).map((profile) => ({
      ...profile,
      auth_created_at: authDetailsByUserId.get(profile.user_id)?.created_at || null,
      last_sign_in_at: authDetailsByUserId.get(profile.user_id)?.last_sign_in_at || null,
      email: emailByUserId.get(profile.user_id) || null,
    })) as DirectoryProfile[];

    return json({ success: true, data: { updated: true, users } });
  }

  if (!input.targetUserId || !uuidPattern.test(input.targetUserId)) {
    return json({ success: false, error: "Invalid target user ID." }, 400);
  }

  const { data: targetProfile, error: targetError } = await adminSupabase
    .from("profiles")
    .select("role, admin_level, is_locked, lock_reason, restriction_type, interpreter_access_status")
    .eq("user_id", input.targetUserId)
    .maybeSingle();

  if (targetError || !targetProfile) {
    return json({ success: false, error: `Target user not found: ${targetError?.message || "profile not found"}` }, 404);
  }

  const currentRole = targetProfile.role as SystemRole;
  const currentRestriction = inferRestrictionType(targetProfile);
  const reason = cleanReason(input.reason ?? input.lockReason);
  const requestedRole = input.action === "update"
    ? input.newRole
    : input.action === "revoke_interpreter"
    ? "User"
    : currentRole;

  if (!validRoles.includes(currentRole)) {
    return json({ success: false, error: "Target profile has an unsupported role." }, 400);
  }

  if (currentRole === "Admin") {
    return json({ success: false, error: "Admin accounts are protected from User Directory security actions." }, 403);
  }

  if (input.action === "delete_account" && !isPrimaryAdmin) {
    return json({ success: false, error: "Only the Primary Admin can permanently delete an account." }, 403);
  }

  if (input.action === "revoke_interpreter" && !isPrimaryAdmin) {
    return json({ success: false, error: "Only the Primary Admin can revoke interpreter accreditation." }, 403);
  }

  if (input.action === "revoke_interpreter" && currentRole !== "Interpreter") {
    return json({ success: false, error: "Only an active Interpreter can have accreditation revoked." }, 400);
  }

  if (input.action === "update") {
    if (!requestedRole || !validRoles.includes(requestedRole)) {
      return json({ success: false, error: "Select a valid account role." }, 400);
    }

    if (requestedRole !== currentRole) {
      return json({ success: false, error: "Role changes are controlled by application approval or interpreter revocation. Use the dedicated governance flow." }, 403);
    }

    if (requestedRole === "Admin") {
      return json({ success: false, error: "Use the dedicated Grant Admin Access flow to promote a Manager to Admin." }, 403);
    }

    if (requestedRole === "Manager" && currentRole !== "Manager") {
      return json({ success: false, error: "Create a Manager through the dedicated staff provisioning flow." }, 403);
    }

    if (currentRole === "Manager" && requestedRole !== "Manager") {
      return json({ success: false, error: "Manager role changes require a dedicated staff governance flow." }, 403);
    }

    if (typeof input.isLocked !== "boolean") {
      return json({ success: false, error: "Account suspension state is required." }, 400);
    }

    if (input.isLocked && !reason) {
      return json({ success: false, error: "A reason is required when suspending an account." }, 400);
    }

    if (currentRestriction === "hard") {
      return json({ success: false, error: "Legacy restricted accounts require the permanent account deletion review flow." }, 403);
    }

    if (requestedRole === "Interpreter" && targetProfile.interpreter_access_status === "revoked") {
      return json({ success: false, error: "Interpreter access was revoked; Primary Admin review is required before restoring it." }, 403);
    }
  }

  if (isDelegatedAdmin) {
    const allowedRoles: SystemRole[] = ["User", "Interpreter"];
    if (!allowedRoles.includes(currentRole) || !allowedRoles.includes(requestedRole as SystemRole)) {
      return json({ success: false, error: "Delegated Admin can manage only User and Interpreter accounts." }, 403);
    }
  }

  if (input.action === "delete_account" && !reason) {
    return json({ success: false, error: "A reason is required for permanent account deletion." }, 400);
  }

  if (input.action === "suspend" && !reason) {
    return json({ success: false, error: "A reason is required for an account suspension." }, 400);
  }

  if (input.action === "revoke_interpreter" && !reason) {
    return json({ success: false, error: "A reason is required to revoke interpreter accreditation." }, 400);
  }

  if (input.action === "unlock" && currentRestriction === "hard") {
    return json({ success: false, error: "Legacy permanent restrictions cannot be lifted through the standard unlock action." }, 403);
  }

  if (requestedRole === "Interpreter" && currentRole !== "Interpreter") {
    const { data: approvedApplication, error: applicationError } = await adminSupabase
      .from("interpreter_applications")
      .select("application_id")
      .eq("user_id", input.targetUserId)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (applicationError) {
      return json({ success: false, error: `Unable to verify interpreter approval: ${applicationError.message}` }, 500);
    }

    if (!approvedApplication) {
      return json({ success: false, error: "Interpreter role requires an approved interpreter application." }, 400);
    }
  }

  if (input.action === "delete_account") {
    if (input.targetUserId === authUser.user.id) {
      return json({ success: false, error: "An Admin cannot delete their own account through this flow." }, 403);
    }

    const now = new Date().toISOString();
    const { error: expireError } = await adminSupabase
      .from("bookings")
      .update({
        status: "expired",
        cancelled_by: "system",
        cancel_reason: "Request expired before permanent account deletion.",
      })
      .eq("user_id", input.targetUserId)
      .eq("status", "open")
      .lte("expires_at", now);

    if (expireError) {
      return json({ success: false, error: `Unable to prepare the account for deletion: ${expireError.message}` }, 500);
    }

    let hasActiveBooking = false;
    try {
      hasActiveBooking = await findActiveBookings(adminSupabase, input.targetUserId);
    } catch (error) {
      return json({
        success: false,
        error: error instanceof Error ? error.message : "active_booking_check_failed",
      }, 500);
    }

    if (hasActiveBooking) {
      return json({
        success: false,
        error: "active_bookings_exist: Finish or cancel active requests or assignments before deleting this account.",
      }, 409);
    }

    const [requesterBookings, interpreterBookings] = await Promise.all([
      adminSupabase
        .from("bookings")
        .select("booking_id")
        .eq("user_id", input.targetUserId),
      adminSupabase
        .from("bookings")
        .select("booking_id")
        .eq("interpreter_id", input.targetUserId),
    ]);
    const bookingHistoryError = requesterBookings.error || interpreterBookings.error;

    if (bookingHistoryError) {
      return json({ success: false, error: `Unable to prepare booking history for deletion: ${bookingHistoryError.message}` }, 500);
    }

    const bookingIds = [
      ...(requesterBookings.data || []).map((booking) => booking.booking_id),
      ...(interpreterBookings.data || []).map((booking) => booking.booking_id),
    ];

    try {
      await removeInterpreterCertificates(adminSupabase, input.targetUserId);
    } catch (error) {
      return json({
        success: false,
        error: error instanceof Error ? error.message : "certificate_cleanup_failed",
      }, 500);
    }

    const { error: reporterCleanupError } = await adminSupabase
      .from("reports")
      .update({ reporter_id: null })
      .eq("reporter_id", input.targetUserId);

    if (reporterCleanupError) {
      return json({ success: false, error: `Unable to preserve report history before deletion: ${reporterCleanupError.message}` }, 500);
    }

    if (bookingIds.length > 0) {
      const { error: reportBookingCleanupError } = await adminSupabase
        .from("reports")
        .update({ booking_id: null })
        .in("booking_id", [...new Set(bookingIds)]);

      if (reportBookingCleanupError) {
        return json({ success: false, error: `Unable to detach report history from deleted bookings: ${reportBookingCleanupError.message}` }, 500);
      }
    }

    const { error: accountDeletionError } = await adminSupabase.auth.admin.deleteUser(input.targetUserId, false);
    if (accountDeletionError) {
      return json({ success: false, error: `permanent_account_deletion_failed: ${accountDeletionError.message}` }, 500);
    }

    return json({ success: true, data: { updated: true, restrictionType: "none" } });
  }

  const previousWasLocked = Boolean(targetProfile.is_locked);
  const isRevokeInterpreter = input.action === "revoke_interpreter";
  const shouldLock = input.action === "suspend"
    || (input.action === "update" && input.isLocked === true)
    || (isRevokeInterpreter && previousWasLocked);
  const restrictionType: RestrictionType = isRevokeInterpreter
    ? currentRestriction
    : shouldLock
    ? "soft"
    : "none";
  const nextReason = isRevokeInterpreter
    ? targetProfile.lock_reason
    : shouldLock
    ? reason || "Administrative suspension"
    : null;

  const { error: authUpdateError } = await adminSupabase.auth.admin.updateUserById(input.targetUserId, {
    ban_duration: shouldLock ? longAuthBan : "none",
  });

  if (authUpdateError) {
    return json({ success: false, error: `Authentication restriction failed: ${authUpdateError.message}` }, 400);
  }

  if (isRevokeInterpreter) {
    const { data: revocationData, error: revocationError } = await adminSupabase.rpc("revoke_interpreter_access",
      {
        p_actor_user_id: authUser.user.id,
        p_target_user_id: input.targetUserId,
        p_reason: reason,
      },
    );

    const revocation = revocationData as {
      user_id?: string;
      role?: SystemRole;
      interpreter_access_status?: "active" | "revoked";
      application_id?: number;
      application_status?: string;
    } | null;

    const revocationSucceeded =
      !revocationError &&
      revocation?.user_id === input.targetUserId &&
      revocation.role === "User" &&
      revocation.interpreter_access_status === "revoked" &&
      typeof revocation.application_id === "number" &&
      revocation.application_status === "rejected";

    if (!revocationSucceeded) {
      await adminSupabase.auth.admin.updateUserById(input.targetUserId, {
        ban_duration: previousWasLocked ? longAuthBan : "none",
      });

      return json({
        success: false,
        error: `Interpreter accreditation was not revoked: ${revocationError?.message || "Database post-condition verification failed"}`,
      }, 500);
    }

    return json({
      success: true,
      data: {
        updated: true,
        restrictionType,
        role: revocation.role,
        interpreterAccessStatus: revocation.interpreter_access_status,
        applicationId: revocation.application_id,
        applicationStatus: revocation.application_status,
      },
    });
  }

  const profileUpdate: Record<string, unknown> = {
    is_locked: shouldLock,
    lock_reason: nextReason,
    restriction_type: restrictionType,
    restriction_reason: nextReason,
    restriction_at: shouldLock ? new Date().toISOString() : null,
    restriction_by_user_id: shouldLock ? authUser.user.id : null,
  };

  if (input.action === "update") {
    profileUpdate.role = requestedRole;
    profileUpdate.admin_level = null;
  }

  const { data: updatedProfile, error: profileUpdateError } = await adminSupabase
    .from("profiles")
    .update(profileUpdate)
    .eq("user_id", input.targetUserId)
    .select("user_id, role, is_locked, restriction_type")
    .maybeSingle();

  if (profileUpdateError || !updatedProfile) {
    await adminSupabase.auth.admin.updateUserById(input.targetUserId, {
      ban_duration: previousWasLocked ? longAuthBan : "none",
    });
    return json({ success: false, error: `Account restriction was not saved: ${profileUpdateError?.message || "profile not updated"}` }, 500);
  }

  return json({ success: true, data: { updated: true, restrictionType } });
});
