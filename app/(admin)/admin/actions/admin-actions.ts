"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { AdminUserRecord, SystemRole } from "../types";

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
  is_locked: boolean;
  lock_reason: string | null;
  created_at: string;
};

/**
 * Verifies that the active caller is an authenticated, active Admin.
 */
async function verifyAdminCaller() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { authorized: false, error: "Unauthorized: No active session found.", user: null, supabase };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_locked")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { authorized: false, error: "Unauthorized: Unable to load profile.", user: null, supabase };
  }

  if (profile.role !== "Admin") {
    return { authorized: false, error: "Forbidden: Admin privileges required.", user: null, supabase };
  }

  if (profile.is_locked) {
    return { authorized: false, error: "Forbidden: Account is suspended.", user: null, supabase };
  }

  return { authorized: true, error: null, user: userData.user, supabase };
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

    const { data: profiles, error } = await authCheck.supabase
      .from("profiles")
      .select("user_id, first_name, last_name, phone, preferred_ui_language, role, is_locked, lock_reason, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: `Failed to fetch users: ${error.message}` };
    }

    const records: AdminUserRecord[] = (profiles as ProfileRow[]).map((p) => {
      const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || "KHVI User";
      const regDate = p.created_at ? p.created_at.slice(0, 16).replace("T", " ") : "Recently";
      
      const langMap: Record<string, string> = {
        th: "Thai",
        en: "English",
        zh: "Mandarin Chinese",
        my: "Burmese",
        vi: "Vietnamese",
      };
      const primLang = langMap[p.preferred_ui_language] || "Thai";

      return {
        id: p.user_id,
        name: fullName,
        email: `${fullName.toLowerCase().replace(/\s+/g, ".")}@user.khvi`, // Profile table doesn't duplicate email; email is in auth.users
        phone: p.phone || "Not provided",
        primaryLanguage: primLang,
        spokenLanguages: [primLang],
        role: (p.role as SystemRole) || "User",
        isLocked: p.is_locked,
        lockReason: p.lock_reason || undefined,
        accountStatus: p.lock_reason?.includes("[PERMANENT BAN]")
          ? "Banned"
          : p.is_locked
          ? "Locked"
          : "Active",
        registeredAt: regDate,
        lastActive: "Active today",
        ...(p.role === "Interpreter" && {
          interpreterStats: {
            verificationStatus: "Approved",
            completedMissions: 0,
            rating: 5.0,
            specialties: ["General", "Emergency"],
            responseTimeAvg: "2.5 mins",
            feedbackHighlights: ["Account ready for volunteer assignments."],
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

    // Business Rule Check: Admins cannot be locked
    if (newRole === "Admin" && isLocked) {
      return {
        success: false,
        error: "System Policy Violation: Administrator accounts cannot be suspended.",
      };
    }

    // Check target current role to prevent accidental admin lockout
    const { data: targetProfile, error: targetError } = await authCheck.supabase
      .from("profiles")
      .select("role")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return { success: false, error: "Target user not found in profiles." };
    }

    if (targetProfile.role === "Admin" && isLocked) {
      return {
        success: false,
        error: "Action Blocked: Target user is an Admin. Demote role before suspension.",
      };
    }

    const { error: updateError } = await authCheck.supabase
      .from("profiles")
      .update({
        role: newRole,
        is_locked: isLocked,
        lock_reason: isLocked ? lockReason.trim() || "Administrative suspension" : null,
      })
      .eq("user_id", targetUserId);

    if (updateError) {
      return { success: false, error: `Database update failed: ${updateError.message}` };
    }

    revalidatePath("/admin");
    return { success: true, data: { updated: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error during update";
    return { success: false, error: message };
  }
}

