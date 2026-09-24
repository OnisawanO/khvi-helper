"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentUserProfile } from "@/app/lib/supabase-auth";
import type { Locale } from "@/app/components/site-header";
import type { UserProfile } from "@/app/lib/auth-types";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_PATH_PATTERN = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.jpg$/i;

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

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { preferred_ui_language: input.preferredUiLanguage },
  });
  if (metadataError) return { ok: false, error: "Unable to save your interface language. Please try again." };

  const result = await getCurrentUserProfile(supabase);
  if (!result.profile) return { ok: false, error: result.error ?? "Unable to reload your profile." };
  return { ok: true, profile: result.profile };
}

export async function updateProfileAvatarAction(formData: FormData | null): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { ok: false, error: "Your session has expired. Please sign in again." };

  const currentAvatarPath = typeof authData.user.user_metadata?.avatar_path === "string"
    ? authData.user.user_metadata.avatar_path
    : null;
  const file = formData?.get("file") ?? null;

  if (file !== null && !(file instanceof File)) {
    return { ok: false, error: "Profile photo upload is invalid." };
  }

  if (file instanceof File) {
    if (file.size <= 0 || file.size > MAX_AVATAR_SIZE) {
      return { ok: false, error: "Profile photo is too large." };
    }

    if (file.type !== "image/jpeg") {
      return { ok: false, error: "Profile photo must be a JPEG image." };
    }

    const header = new Uint8Array(await file.slice(0, 3).arrayBuffer());
    if (header.length < 3 || header[0] !== 0xff || header[1] !== 0xd8 || header[2] !== 0xff) {
      return { ok: false, error: "Profile photo is not a valid JPEG image." };
    }

    const avatarPath = `${authData.user.id}/${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(avatarPath, file, {
        cacheControl: "31536000",
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) return { ok: false, error: "Unable to upload your profile photo. Please try again." };

    const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath);
    const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl, avatar_path: avatarPath },
    });

    if (metadataError) {
      await supabase.storage.from(AVATAR_BUCKET).remove([avatarPath]);
      return { ok: false, error: "Unable to save your profile photo. Please try again." };
    }

    if (currentAvatarPath && AVATAR_PATH_PATTERN.test(currentAvatarPath) && currentAvatarPath !== avatarPath) {
      await supabase.storage.from(AVATAR_BUCKET).remove([currentAvatarPath]);
    }
  } else {
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { avatar_url: null, avatar_path: null },
    });
    if (metadataError) return { ok: false, error: "Unable to remove your profile photo. Please try again." };

    if (currentAvatarPath && AVATAR_PATH_PATTERN.test(currentAvatarPath)) {
      await supabase.storage.from(AVATAR_BUCKET).remove([currentAvatarPath]);
    }
  }

  const result = await getCurrentUserProfile(supabase);
  if (!result.profile) return { ok: false, error: result.error ?? "Unable to reload your profile." };
  return { ok: true, profile: result.profile };
}
