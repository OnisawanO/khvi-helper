import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { Locale } from "@/app/components/site-header";
import { getAuthCopy } from "@/app/lib/auth-copy";
import {
  getRedirectPathByRole,
  type AdminLevel,
  type UserProfile,
  type UserRole,
} from "@/app/lib/mock-auth";

export { getRedirectPathByRole };
export type { AdminLevel, UserProfile, UserRole };

export const PROFILE_COLUMNS = [
  "user_id",
  "first_name",
  "last_name",
  "phone",
  "date_of_birth",
  "preferred_ui_language",
  "role",
  "admin_level",
  "is_locked",
  "deleted_at",
  "created_at",
].join(",");

const LEGACY_PROFILE_COLUMNS = [
  "user_id",
  "first_name",
  "last_name",
  "phone",
  "date_of_birth",
  "preferred_ui_language",
  "role",
  "is_locked",
  "created_at",
].join(",");

type ProfileRow = {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  preferred_ui_language: string;
  role: string;
  admin_level: string | null;
  is_locked: boolean;
  deleted_at: string | null;
  created_at: string;
};

export type AuthProfileResult = {
  profile: UserProfile | null;
  authenticated: boolean;
  error: string | null;
  accountDeletionAvailable?: boolean;
};

const SUPPORTED_LOCALES: Locale[] = ["th", "en", "zh", "es", "ar"];
const SUPPORTED_ROLES: UserRole[] = ["User", "Interpreter", "Manager", "Admin"];

function toLocale(value: string): Locale {
  return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : "th";
}

function toRole(value: string): UserRole {
  return SUPPORTED_ROLES.includes(value as UserRole) ? (value as UserRole) : "User";
}

export function profileRowToUserProfile(row: ProfileRow, authUser: Pick<User, "id" | "email">): UserProfile {
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();

  return {
    userId: authUser.id,
    name: name || authUser.email?.split("@")[0] || "KHVI User",
    email: authUser.email || "",
    phone: row.phone || "",
    dateOfBirth: row.date_of_birth || "",
    role: toRole(row.role),
    adminLevel:
      row.role === "Admin" && (row.admin_level === "primary" || row.admin_level === "delegated")
        ? row.admin_level
        : undefined,
    isLocked: row.is_locked,
    preferredUiLanguage: toLocale(row.preferred_ui_language),
    createdAt: row.created_at,
  };
}

export async function getCurrentUserProfile(
  supabase: SupabaseClient = createClient(),
): Promise<AuthProfileResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { profile: null, authenticated: false, error: null };
  }

  let accountDeletionAvailable = true;
  let { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  // Keep sign-in and development Fast Login usable while a new migration is
  // being applied. The account deletion control remains unavailable until the
  // database has the deleted_at column.
  if (error && /deleted_at|column .* does not exist/i.test(error.message)) {
    accountDeletionAvailable = false;
    const legacyResult = await supabase
      .from("profiles")
      .select(LEGACY_PROFILE_COLUMNS)
      .eq("user_id", userData.user.id)
      .maybeSingle();
    data = legacyResult.data;
    error = legacyResult.error;
  }

  if (error) {
    return {
      profile: null,
      authenticated: true,
      error: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาตรวจสอบ migration ของ Supabase",
      accountDeletionAvailable,
    };
  }

  if (!data) {
    return {
      profile: null,
      authenticated: true,
      error: "บัญชีนี้ยังไม่มีข้อมูลโปรไฟล์ กรุณาตรวจสอบ trigger ของ Supabase",
      accountDeletionAvailable,
    };
  }

  if ((data as unknown as ProfileRow).deleted_at) {
    return {
      profile: null,
      authenticated: true,
      error: "บัญชีนี้ถูกลบแล้ว กรุณาติดต่อผู้ดูแลระบบหากต้องการความช่วยเหลือ",
      accountDeletionAvailable,
    };
  }

  const profile = profileRowToUserProfile(data as unknown as ProfileRow, userData.user);

  if (profile.isLocked) {
    return {
      profile: null,
      authenticated: true,
      error: "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      accountDeletionAvailable,
    };
  }

  return { profile, authenticated: true, error: null, accountDeletionAvailable };
}

export function splitFullName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "KHVI User",
    lastName: parts.slice(1).join(" "),
  };
}

type SupabaseAuthError = { code?: string; message?: string } | null;

export function getAuthErrorMessage(
  error: SupabaseAuthError,
  action: "login" | "register",
  locale: Locale = "th",
): string {
  const errorMessage = error?.message?.toLowerCase() || "";
  const copy = getAuthCopy(locale).errors;

  if (error?.code === "weak_password") {
    return copy.weakPassword;
  }

  if (action === "register" && (
    error?.code === "user_already_exists"
    || errorMessage.includes("already registered")
    || errorMessage.includes("already been registered")
  )) {
    return copy.emailExists;
  }

  if (action === "register" && (
    error?.code === "email_address_invalid"
    || errorMessage.includes("invalid email")
  )) {
    return copy.invalidEmail;
  }

  if (action === "login") {
    return copy.loginFallback;
  }

  return copy.registerFallback;
}
