import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { Locale } from "@/app/components/site-header";
import { getAuthCopy } from "@/app/lib/auth-copy";
import {
  getRedirectPathByRole,
  type UserProfile,
  type UserRole,
} from "@/app/lib/mock-auth";

export { getRedirectPathByRole };
export type { UserProfile, UserRole };

export const PROFILE_COLUMNS = [
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
  is_locked: boolean;
  created_at: string;
};

export type AuthProfileResult = {
  profile: UserProfile | null;
  authenticated: boolean;
  error: string | null;
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

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    return {
      profile: null,
      authenticated: true,
      error: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาตรวจสอบ migration ของ Supabase",
    };
  }

  if (!data) {
    return {
      profile: null,
      authenticated: true,
      error: "บัญชีนี้ยังไม่มีข้อมูลโปรไฟล์ กรุณาตรวจสอบ trigger ของ Supabase",
    };
  }

  const profile = profileRowToUserProfile(data as unknown as ProfileRow, userData.user);

  if (profile.isLocked) {
    return {
      profile: null,
      authenticated: true,
      error: "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
    };
  }

  return { profile, authenticated: true, error: null };
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
