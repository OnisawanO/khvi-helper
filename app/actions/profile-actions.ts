"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import type { Locale } from "@/app/components/site-header";
import type { UserProfile } from "@/app/lib/auth-types";

type ProfileUpdateInput = {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  preferredUiLanguage: Locale;
};

type ProfileActionResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; error: string };

function invalidProfileInput(input: ProfileUpdateInput): string | null {
  if (input.firstName.trim().length < 2) return "First name is required.";
  if (input.lastName.trim().length < 2) return "Last name is required.";
  if (!/^0\d{8,9}$/.test(input.phone.replace(/[\s-]/g, ""))) return "Phone number is invalid.";
  if (!input.dateOfBirth) return "Date of birth is required.";
  return null;
}

export async function updateProfileAction(input: ProfileUpdateInput): Promise<ProfileActionResult> {
  const validationError = invalidProfileInput(input);
  if (validationError) return { ok: false, error: validationError };

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { ok: false, error: "Your session has expired. Please sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      phone: input.phone.trim(),
      date_of_birth: input.dateOfBirth,
      preferred_ui_language: input.preferredUiLanguage,
    })
    .eq("user_id", authData.user.id);

  if (error) return { ok: false, error: "Unable to save your profile. Please try again." };

  const result = await getCurrentUserProfile(supabase);
  if (!result.profile) return { ok: false, error: result.error ?? "Unable to reload your profile." };
  return { ok: true, profile: result.profile };
}

export async function updateProfileAvatarAction(avatarUrl: string | null): Promise<ProfileActionResult> {
  if (avatarUrl && (!avatarUrl.startsWith("data:image/") || avatarUrl.length > 300_000)) {
    return { ok: false, error: "Profile photo is too large." };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { ok: false, error: "Your session has expired. Please sign in again." };

  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });
  if (error) return { ok: false, error: "Unable to save your profile photo. Please try again." };

  const result = await getCurrentUserProfile(supabase);
  if (!result.profile) return { ok: false, error: result.error ?? "Unable to reload your profile." };
  return { ok: true, profile: result.profile };
}
