"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type AccountActionSuccess = { ok: true };
type AccountActionFailure = { ok: false; error: string };

export type AccountActionResult = AccountActionSuccess | AccountActionFailure;

function friendlyError(error: { message?: string } | null): string {
  const message = error?.message ?? "";
  const known: Record<string, string> = {
    not_authenticated: "Your session has expired. Please sign in again.",
    profile_not_found: "Your profile could not be found.",
    account_already_deleted: "This account has already been deleted.",
    account_not_active: "This account is no longer active.",
    active_bookings_exist: "Finish or cancel your active requests or assignments before deleting your account.",
  };

  for (const [code, copy] of Object.entries(known)) {
    if (message.includes(code)) return copy;
  }

  return "Could not delete your account. Please try again.";
}

export async function deleteOwnAccountAction(): Promise<AccountActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_my_account");

  if (error) return { ok: false, error: friendlyError(error) };

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/welcome");
  revalidatePath("/request-help");
  revalidatePath("/find-requests");
  revalidatePath("/my-requests");
  revalidatePath("/my-assignments");

  return { ok: true };
}
